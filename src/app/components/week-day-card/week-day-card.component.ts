import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { EMPTY, fromEvent, interval, map, merge, startWith, switchMap, timer } from 'rxjs';
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
  standalone: true,
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
export class WeekDayCardComponent implements OnInit, OnChanges {
  private destroyRef = inject(DestroyRef);

  @Input() weekDayIdentifier!: WeekDayIdentifier;
  @Input() workEntry!: WorkEntry | null;

  workDayStart: string | null = null;
  workDayEnd: string | null = null;

  hoursPerDay$ = this.store.select(selectHoursPerDay);

  constructor(private store: Store, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    merge(fromEvent(window, 'focus'), fromEvent(window, 'blur'))
      .pipe(
        map((event) => event.type),
        startWith(document.hasFocus() ? 'focus' : 'blur'),
        switchMap((type) => {
          const now = new Date();

          if (type === 'focus') {
            return timer((60 - now.getSeconds()) * 1000).pipe(
              switchMap(() => interval(60 * 1000).pipe(startWith(null))),
              startWith(null)
            );
          }

          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['workEntry']) {
      const workEntry = changes['workEntry'].currentValue;

      if (workEntry && isWorkDayEntry(workEntry)) {
        this.workDayStart = TimeRangeHelper.getTimeString(workEntry.timeRange.startHours);
        this.workDayEnd = TimeRangeHelper.getTimeString(workEntry.timeRange.endHours);
      } else {
        this.workDayStart = null;
        this.workDayEnd = null;
      }
    }
  }

  get hasChanges() {
    if (this.workEntry === null || !isWorkDayEntry(this.workEntry)) {
      return false;
    }

    const newStart = this.workDayStart !== null ? TimeRangeHelper.getHoursFromString(this.workDayStart) : null;
    const newEnd = this.workDayEnd !== null ? TimeRangeHelper.getHoursFromString(this.workDayEnd) : null;

    return this.workEntry.timeRange.startHours !== newStart || this.workEntry.timeRange.endHours !== newEnd;
  }

  get week() {
    return this.weekDayIdentifier.week;
  }

  get weekDay() {
    return this.weekDayIdentifier.weekDay;
  }

  get weekStart() {
    return WeekIdentifierHelper.getStartOfWeek(this.week);
  }

  get date() {
    let dayIndex = DaysOfWeek.indexOf(this.weekDayIdentifier.weekDay);

    let date = new Date(this.weekStart);
    date.setDate(date.getDate() + dayIndex);

    return date;
  }

  get dayDateString() {
    return DateHelpers.getDayDateString(this.date);
  }

  get workDay() {
    if (this.workEntry && isWorkDayEntry(this.workEntry)) {
      return this.workEntry;
    }

    return null;
  }

  get workHours() {
    return this.workEntry !== null ? WorkEntryHelper.getWorkHours(this.workEntry) : 0;
  }

  getDiffHours(hoursPerDay: number | null) {
    return TimeRangeHelper.getHoursDiff({ startHours: hoursPerDay || 0, endHours: this.workHours });
  }

  get isDayToday() {
    return DateHelpers.isToday(this.date);
  }

  get isDayInFuture() {
    return DateHelpers.isInFuture(this.date);
  }

  isReached(hours: number) {
    return Math.round(hours * 60) >= 0;
  }

  addWorkDayEntry() {
    let week = WeekIdentifierHelper.fromDate(this.weekStart);

    this.store.dispatch(
      DataWorkEntriesActions.setEntry({
        week: week,
        dayOfWeek: this.weekDay,
        entry: { timeRange: { startHours: 8, endHours: 17 }, pauses: [] },
      })
    );
  }

  updateWorkDayEntry() {
    if (!this.workDayStart || !this.workDayEnd) {
      return;
    }

    let week = WeekIdentifierHelper.fromDate(this.weekStart);
    let entry = { ...this.workEntry } as WorkDayEntry;
    entry.timeRange = TimeRangeHelper.fromTime(this.workDayStart, this.workDayEnd);

    this.store.dispatch(
      DataWorkEntriesActions.setEntry({
        week: week,
        dayOfWeek: this.weekDay,
        entry,
      })
    );
  }

  addHolidayEntry() {
    this.store.dispatch(
      DataWorkEntriesActions.setEntry({ week: this.week, dayOfWeek: this.weekDay, entry: {} as HolidayEntry })
    );
  }

  removeWorkEntry() {
    this.store.dispatch(DataWorkEntriesActions.removeEntry({ week: this.week, dayOfWeek: this.weekDay }));
  }

  get dayProgressIndicatorOffset() {
    // fixed rem values to calculate exact offset of indicator
    const lineHeight = 1.75;
    const prePauseGap = 2;
    const innerPauseHeight = 1;
    const pauseGap = 1.5;
    const afterPauseGap = 2 + 1.5 + 1.5;

    const getOffset = (rem: number) => `${rem}rem`;

    if (!this.workEntry || !isWorkDayEntry(this.workEntry)) {
      return getOffset(lineHeight / 2);
    }

    if (!this.isDayToday || this.workDayStart === null || this.workDayEnd === null) {
      return getOffset(lineHeight / 2);
    }

    const now = new Date();
    const workedHours = now.getHours() + now.getMinutes() / 60;

    const pauses = this.workEntry.pauses;

    let rangeStart = this.workDayStart;
    let rangeStartOffset = lineHeight / 2;
    let rangeEnd = this.workDayEnd;
    let rangeEndOffset =
      lineHeight +
      prePauseGap +
      pauses.length * (2 * lineHeight + innerPauseHeight) +
      (pauses.length - 1) * pauseGap +
      afterPauseGap +
      lineHeight / 2;

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
          rangeStartOffset = lineHeight / 2;
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
  }
}
