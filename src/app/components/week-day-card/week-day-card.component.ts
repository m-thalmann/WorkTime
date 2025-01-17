import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  distinctUntilChanged,
  EMPTY,
  fromEvent,
  interval,
  map,
  merge,
  of,
  startWith,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import DateHelpers from 'src/app/core/helpers/DateHelpers';
import { DaysOfWeek } from 'src/app/core/models/day-of-week.model';
import { TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import {
  HolidayEntry,
  WorkDayEntry,
  WorkEntry,
  WorkEntryHelper,
  isWorkDayEntry,
} from 'src/app/core/models/work-entry.model';
import { WeekDayIdentifier } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataWorkEntriesActions } from 'src/app/core/state/data/data.actions';
import { selectHoursPerDay } from 'src/app/core/state/data/data.selectors';
import { CardComponent } from '../card/card.component';
import { WeekDayCardPausesComponent } from './components/week-day-card-pauses/week-day-card-pauses.component';
import { WeekDayCardTimeInputWrapperComponent } from './components/week-day-card-time-input-wrapper/week-day-card-time-input-wrapper.component';

@Component({
  selector: 'app-week-day-card',
  templateUrl: './week-day-card.component.html',
  styleUrls: ['./week-day-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HoursPipe,
    WeekDayCardPausesComponent,
    WeekDayCardTimeInputWrapperComponent,
    CardComponent,
    FormsModule,
  ],
})
export class WeekDayCardComponent implements OnInit {
  private readonly store = inject(Store);

  private readonly destroyRef = inject(DestroyRef);

  readonly weekDayIdentifier = input.required<WeekDayIdentifier>();
  readonly workEntry = input.required<WorkEntry | null>();

  readonly workDayStart = model<string | null>(null);
  readonly workDayEnd = model<string | null>(null);

  readonly hoursPerDay = toSignal(this.store.select(selectHoursPerDay), { requireSync: true });

  readonly hasChanges = computed(() => {
    const workEntry = this.workEntry();
    if (workEntry === null || !isWorkDayEntry(workEntry)) {
      return false;
    }

    const workDayStart = this.workDayStart();
    const workDayEnd = this.workDayEnd();

    const newStart = workDayStart !== null ? TimeRangeHelper.getHoursFromString(workDayStart) : null;
    const newEnd = workDayEnd !== null ? TimeRangeHelper.getHoursFromString(workDayEnd) : null;

    return workEntry.timeRange.startHours !== newStart || workEntry.timeRange.endHours !== newEnd;
  });

  readonly week = computed(() => this.weekDayIdentifier().week);
  readonly weekDay = computed(() => this.weekDayIdentifier().weekDay);
  readonly weekStart = computed(() => WeekIdentifierHelper.getStartOfWeek(this.week()));

  readonly date = computed(() => {
    const weekDayIdentifier = this.weekDayIdentifier();

    const dayIndex = DaysOfWeek.indexOf(weekDayIdentifier.weekDay);

    const date = new Date(WeekIdentifierHelper.getStartOfWeek(weekDayIdentifier.week));
    date.setDate(date.getDate() + dayIndex);

    return date;
  });

  readonly dayDateString = computed(() => DateHelpers.getDayDateString(this.date()));

  readonly workDay = computed(() => {
    const workEntry = this.workEntry();

    if (workEntry && isWorkDayEntry(workEntry)) {
      return workEntry;
    }

    return null;
  });

  readonly workHours = computed(() => {
    const workEntry = this.workEntry();

    if (workEntry !== null) {
      return WorkEntryHelper.getWorkHours(workEntry);
    }

    return 0;
  });

  readonly isDayToday = computed(() => DateHelpers.isToday(this.date()));
  readonly isDayInFuture = computed(() => DateHelpers.isInFuture(this.date()));

  readonly dayWorkHoursDiff = computed(() => {
    return TimeRangeHelper.getHoursDiff({ startHours: this.hoursPerDay() || 0, endHours: this.workHours() });
  });

  readonly isDayWorkHoursReached = computed(() => {
    return this.dayWorkHoursDiff() >= 0;
  });

  readonly dayProgressWorkedHours = signal(0);

  readonly dayProgressIndicatorOffset = computed(() => {
    // fixed rem values to calculate exact offset of indicator
    const lineHeight = 1.75;
    const prePauseGap = 2;
    const innerPauseHeight = 1;
    const pauseGap = 1.5;
    const afterPauseGap = 2 + 1.5 + 1.5;

    const startOffset = lineHeight / 2;

    const getOffset = (rem: number) => `${Math.max(rem, startOffset)}rem`;

    const workEntry = this.workEntry();

    if (!workEntry || !isWorkDayEntry(workEntry)) {
      return getOffset(startOffset);
    }

    const workDayStart = this.workDayStart();
    const workDayEnd = this.workDayEnd();

    if (!this.isDayToday() || workDayStart === null || workDayEnd === null) {
      return getOffset(startOffset);
    }

    const workedHours = this.dayProgressWorkedHours();

    const pauses = workEntry.pauses;

    let rangeStart = workDayStart;
    let rangeStartOffset = startOffset;
    let rangeEnd = workDayEnd;
    let rangeEndOffset =
      lineHeight +
      prePauseGap +
      pauses.length * (2 * lineHeight + innerPauseHeight) +
      (pauses.length - 1) * pauseGap +
      afterPauseGap +
      startOffset;

    if (pauses.length > 0) {
      rangeStartOffset += lineHeight + prePauseGap;
    }

    for (let i = 0; i < pauses.length; i++) {
      const pause = pauses[i];

      if (workedHours < pause.startHours) {
        if (i > 0) {
          rangeStart = TimeRangeHelper.getTimeString(pauses[i - 1].endHours);
        }
        rangeEnd = TimeRangeHelper.getTimeString(pause.startHours);

        if (i > 0) {
          rangeStartOffset -= pauseGap + lineHeight;
        } else {
          rangeStartOffset = startOffset;
        }
        rangeEndOffset = rangeStartOffset + pauseGap + lineHeight;

        break;
      } else if (workedHours <= pause.endHours) {
        rangeStart = TimeRangeHelper.getTimeString(pause.startHours);
        rangeEnd = TimeRangeHelper.getTimeString(pause.endHours);

        rangeEndOffset = rangeStartOffset + lineHeight + innerPauseHeight;

        break;
      }

      rangeStartOffset += lineHeight + innerPauseHeight;

      if (i < pauses.length - 1) {
        rangeStartOffset += pauseGap + lineHeight;
      }
    }

    if (pauses.length > 0 && workedHours > pauses[pauses.length - 1].endHours) {
      rangeStart = TimeRangeHelper.getTimeString(pauses[pauses.length - 1].endHours);
    }

    const timeRange = TimeRangeHelper.fromTime(rangeStart, rangeEnd);

    const workedTime = TimeRangeHelper.getHoursDiff({ startHours: timeRange.startHours, endHours: workedHours });
    const totalTime = TimeRangeHelper.getHoursDiff(timeRange);

    const progress = Math.min(1, workedTime / totalTime);

    return getOffset(rangeStartOffset + (rangeEndOffset - rangeStartOffset) * progress);
  });

  constructor() {
    effect(() => {
      const workEntry = this.workEntry();

      if (workEntry && isWorkDayEntry(workEntry)) {
        this.workDayStart.set(TimeRangeHelper.getTimeString(workEntry.timeRange.startHours));
        this.workDayEnd.set(TimeRangeHelper.getTimeString(workEntry.timeRange.endHours));
      } else {
        this.workDayStart.set(null);
        this.workDayEnd.set(null);
      }
    });

    effect(() => {
      const workDayStart = this.workDayStart();
      const workDayEnd = this.workDayEnd();

      untracked(() => {
        this.updateWorkDayEntry(workDayStart, workDayEnd);
      });
    });
  }

  ngOnInit() {
    // TODO: improve by only registering this for the current day
    merge(fromEvent(window, 'focus'), fromEvent(window, 'blur'))
      .pipe(
        map((event) => event.type),
        startWith(document.hasFocus() ? 'focus' : 'blur'),
        switchMap((type) => {
          if (type === 'focus') {
            const now = new Date();

            return timer((60 - now.getSeconds()) * 1000).pipe(
              switchMap(() => interval(60 * 1000).pipe(startWith(null))),
              startWith(null)
            );
          }

          return of();
        }),
        map(() => {
          const now = new Date();
          return now.getHours() + now.getMinutes() / 60;
        }),
        tap((workedHours) => this.dayProgressWorkedHours.set(workedHours)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  addWorkDayEntry() {
    let week = WeekIdentifierHelper.fromDate(this.weekStart());

    this.store.dispatch(
      DataWorkEntriesActions.setEntry({
        week: week,
        dayOfWeek: this.weekDay(),
        entry: { timeRange: { startHours: 8, endHours: 17 }, pauses: [] },
      })
    );
  }

  protected updateWorkDayEntry(workDayStart: string | null, workDayEnd: string | null) {
    if (workDayStart === null || workDayEnd === null) {
      return;
    }

    let week = WeekIdentifierHelper.fromDate(this.weekStart());
    let entry = { ...this.workEntry() } as WorkDayEntry;
    entry.timeRange = TimeRangeHelper.fromTime(workDayStart, workDayEnd);

    this.store.dispatch(
      DataWorkEntriesActions.setEntry({
        week: week,
        dayOfWeek: this.weekDay(),
        entry,
      })
    );
  }

  addHolidayEntry() {
    this.store.dispatch(
      DataWorkEntriesActions.setEntry({ week: this.week(), dayOfWeek: this.weekDay(), entry: {} as HolidayEntry })
    );
  }

  removeWorkEntry() {
    this.store.dispatch(DataWorkEntriesActions.removeEntry({ week: this.week(), dayOfWeek: this.weekDay() }));
  }
}
