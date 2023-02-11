import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import DateHelpers from 'src/app/core/helpers/DateHelpers';
import { DayOfWeek, DaysOfWeek } from 'src/app/core/models/day-of-week.model';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { WorkWeek, WeekDayIdentifier } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataActions } from 'src/app/core/state/data/data.actions';
import {
  selectHoursPerDay,
  selectTotalWorkHoursDiff,
  selectWorkStartDate,
  selectWorkWeeks,
} from 'src/app/core/state/data/data.selectors';
import { WeekDayCardComponent } from '../../components/week-day-card/week-day-card.component';
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HoursPipe, WeekDayCardComponent, CardComponent],
})
export class DashboardPageComponent {
  hoursPerDay$ = this.store.select(selectHoursPerDay);
  workStartDate$ = this.store.select(selectWorkStartDate);
  totalWorkHoursDiff$ = this.store.select(selectTotalWorkHoursDiff);

  currentWeekStart$ = new BehaviorSubject(DateHelpers.getStartOfWeek(new Date()));

  currentWeekData$: Observable<WorkWeek> = combineLatest([
    this.currentWeekStart$,
    this.store.select(selectWorkWeeks),
  ]).pipe(
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

  nextWeek(amount: number) {
    let nextDate = new Date(this.currentWeekStart$.value);
    nextDate.setDate(nextDate.getDate() + 7 * amount);

    this.currentWeekStart$.next(DateHelpers.getStartOfWeek(nextDate));
  }

  goToThisWeek() {
    this.currentWeekStart$.next(DateHelpers.getStartOfWeek(new Date()));
  }

  getDayData(data: WorkWeek, day: DayOfWeek) {
    return data.entries[day];
  }

  getWeekDayIdentifier(day: DayOfWeek) {
    let week = WeekIdentifierHelper.fromDate(this.currentWeekStart$.value);

    return { week, weekDay: day } as WeekDayIdentifier;
  }

  setWorkStartDate(date: string) {
    this.store.dispatch(DataActions.setWorkStartDate({ date }));
  }
}
