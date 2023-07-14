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
import { interval, startWith, switchMap, timer } from 'rxjs';
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
    const now = new Date();

    timer((60 - now.getSeconds()) * 1000)
      .pipe(
        switchMap(() => interval(60 * 1000).pipe(startWith(null))),
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
    const outerOffset = '0.75em';

    if (!this.isDayToday || this.workDayStart === null || this.workDayEnd === null) {
      return outerOffset;
    }

    const timeRange = TimeRangeHelper.fromTime(this.workDayStart, this.workDayEnd);

    const now = new Date();
    const workedHours = now.getHours() + now.getMinutes() / 60;

    const workedTime = TimeRangeHelper.getHoursDiff({ startHours: timeRange.startHours, endHours: workedHours });
    const totalTime = TimeRangeHelper.getHoursDiff(timeRange);

    const progress = Math.min(100, (workedTime / totalTime) * 100);

    return `calc(((100% - (2 * ${outerOffset})) / 100) * ${progress} + ${outerOffset})`;
  }
}
