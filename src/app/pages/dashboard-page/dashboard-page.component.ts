import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { DayOfWeek, DaysOfWeek } from 'src/app/core/models/day-of-week.model';
import { WeekIdentifier, WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { WeekDayIdentifier, WorkWeek } from 'src/app/core/models/work-week.model';
import { selectWorkWeeks } from 'src/app/core/state/data/data.selectors';
import { WeekDayCardComponent } from '../../components/week-day-card/week-day-card.component';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, WeekDayCardComponent],
})
export class DashboardPageComponent {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedWeek = toSignal(
    this.route.queryParams.pipe(
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
    ),
    { requireSync: true }
  );

  protected readonly weekData = toSignal(this.store.select(selectWorkWeeks), { requireSync: true });

  readonly currentWeekData = computed(() => {
    const week = this.selectedWeek();
    const weekData = this.weekData();

    const data = weekData[WeekIdentifierHelper.getKey(week)];

    if (data !== undefined) {
      return data;
    }

    return {
      week: week,
      entries: {},
    } as WorkWeek;
  });

  get weekDays() {
    return DaysOfWeek;
  }

  nextWeek(amount: number) {
    const weekDate = WeekIdentifierHelper.getStartOfWeek(this.selectedWeek());
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

  getWeekDayIdentifier(day: DayOfWeek) {
    return { week: this.selectedWeek(), weekDay: day } as WeekDayIdentifier;
  }
}
