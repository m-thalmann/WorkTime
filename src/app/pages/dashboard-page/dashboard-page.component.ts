import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { DayOfWeek, DaysOfWeek } from 'src/app/core/models/day-of-week.model';
import { TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { WeekIdentifier, WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { WeekDayIdentifier, WorkWeek } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataActions } from 'src/app/core/state/data/data.actions';
import {
  selectHoursPerDay,
  selectTotalWorkHoursDiff,
  selectWorkStartDate,
  selectWorkWeeks,
} from 'src/app/core/state/data/data.selectors';
import { CardComponent } from '../../components/card/card.component';
import { WeekDayCardComponent } from '../../components/week-day-card/week-day-card.component';

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

  selectedWeek$: Observable<WeekIdentifier> = this.route.queryParams.pipe(
    map((params) => {
      const year = parseInt(params['year']);
      const weekNumber = parseInt(params['week']);

      if (!year || !weekNumber) {
        return WeekIdentifierHelper.fromDate(new Date());
      }

      return {
        year,
        weekNumber,
      };
    })
  );

  currentWeekData$: Observable<WorkWeek> = combineLatest([this.selectedWeek$, this.store.select(selectWorkWeeks)]).pipe(
    map(([week, weekData]) => {
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

  constructor(private store: Store, private route: ActivatedRoute, private router: Router) {}

  get weekDays() {
    return DaysOfWeek;
  }

  nextWeek(week: WeekIdentifier, amount: number) {
    const weekDate = WeekIdentifierHelper.getStartOfWeek(week);
    weekDate.setDate(weekDate.getDate() + 7 * amount);

    const newWeek = WeekIdentifierHelper.fromDate(weekDate);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { year: newWeek.year, week: newWeek.weekNumber },
      queryParamsHandling: 'merge',
    });
  }

  goToThisWeek() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { year: null, week: null },
      queryParamsHandling: 'merge',
    });
  }

  getDayData(data: WorkWeek, day: DayOfWeek) {
    return data.entries[day];
  }

  getWeekDayIdentifier(week: WeekIdentifier, day: DayOfWeek) {
    return { week, weekDay: day } as WeekDayIdentifier;
  }

  setHoursPerDay(hours: string) {
    this.store.dispatch(DataActions.setHoursPerDay({ hours: TimeRangeHelper.getHoursFromString(hours) }));
  }

  setWorkStartDate(date: string) {
    this.store.dispatch(DataActions.setWorkStartDate({ date }));
  }

  resetData() {
    if (!confirm('Are you sure you want to remove all data?')) {
      return;
    }

    this.store.dispatch(DataActions.resetData());
  }
}
