import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import DateHelpers from 'src/app/core/helpers/DateHelpers';
import { DayOfWeek, DaysOfWeek } from 'src/app/core/models/day-of-week.model';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { HolidayEntry, isWorkDayEntry, WorkEntry, WorkEntryHelper } from 'src/app/core/models/work-entry.model';
import { WorkWeek } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataActions } from 'src/app/core/state/data/data.actions';
import {
  selectHoursPerDay,
  selectTotalWorkHoursDiff,
  selectWorkStartDate,
  selectWorkWeeks,
} from 'src/app/core/state/data/data.selectors';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HoursPipe],
})
export class DashboardPageComponent {
  isAddingPause = false;

  hoursPerDay$ = this.store.select(selectHoursPerDay);
  workStartDate$ = this.store.select(selectWorkStartDate);
  totalWorkHoursDiff$ = this.store.select(selectTotalWorkHoursDiff);

  currentWeekStart$ = new BehaviorSubject(DateHelpers.getStartOfWeek(new Date()));

  currentWeekData$: Observable<WorkWeek> = combineLatest([
    this.currentWeekStart$,
    this.store.select(selectWorkWeeks),
  ]).pipe(
    tap(() => (this.isAddingPause = false)),
    map(([weekStartDate, weekData]) => {
      let week = WeekIdentifierHelper.fromDate(weekStartDate);

      const data = weekData[WeekIdentifierHelper.getKey(week)];

      if (data !== undefined) {
        return data;
      }

      return {
        week: week,
        entries: {},
      } as WorkWeek;
    })
  );

  constructor(private store: Store) {}

  get weekDays() {
    return DaysOfWeek;
  }

  getWorkDay(entry: WorkEntry) {
    if (isWorkDayEntry(entry)) {
      return entry;
    }

    return null;
  }

  nextWeek(amount: number) {
    let nextDate = new Date(this.currentWeekStart$.value);
    nextDate.setDate(nextDate.getDate() + 7 * amount);

    this.currentWeekStart$.next(DateHelpers.getStartOfWeek(nextDate));
  }

  goToThisWeek() {
    this.currentWeekStart$.next(DateHelpers.getStartOfWeek(new Date()));
  }

  getDayDateString(day: DayOfWeek) {
    return DateHelpers.getDayDateString(this.getDateFromDay(day));
  }

  isDayToday(day: DayOfWeek) {
    return DateHelpers.isToday(this.getDateFromDay(day));
  }

  isDayInFuture(day: DayOfWeek) {
    return DateHelpers.isInFuture(this.getDateFromDay(day));
  }

  getDayData(data: WorkWeek, day: DayOfWeek) {
    return data.entries[day];
  }

  getWorkHours(entry: WorkEntry) {
    return WorkEntryHelper.getWorkHours(entry);
  }

  addHolidayEntry(day: DayOfWeek) {
    let week = WeekIdentifierHelper.fromDate(this.currentWeekStart$.value);

    this.store.dispatch(DataActions.setWorkEntry({ week: week, dayOfWeek: day, entry: {} as HolidayEntry }));
  }

  removeWorkEntry(day: DayOfWeek) {
    let week = WeekIdentifierHelper.fromDate(this.currentWeekStart$.value);

    this.store.dispatch(DataActions.removeWorkEntry({ week: week, dayOfWeek: day }));
  }

  setWorkStartDate(date: string) {
    this.store.dispatch(DataActions.setWorkStartDate({ date }));
  }

  private getDateFromDay(day: DayOfWeek) {
    let dayIndex = DaysOfWeek.indexOf(day);

    let date = new Date(this.currentWeekStart$.value);
    date.setDate(date.getDate() + dayIndex);

    return date;
  }
}
