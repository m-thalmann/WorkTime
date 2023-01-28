import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tap } from 'rxjs';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { getStartOfWeek } from 'src/app/core/helpers';
import { DayOfWeek, DaysOfWeek } from 'src/app/core/models/day-of-week.model';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { isWorkDayEntry, WorkEntry, WorkEntryHelper } from 'src/app/core/models/work-entry.model';
import { WorkWeek } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataService } from 'src/app/core/services/data.service';

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

  currentWeekStart$ = new BehaviorSubject(getStartOfWeek(new Date()));

  currentWeekData$: Observable<WorkWeek> = combineLatest([this.currentWeekStart$, this.data.workWeeks$]).pipe(
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

  constructor(public data: DataService) {}

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

    this.currentWeekStart$.next(getStartOfWeek(nextDate));
  }

  goToThisWeek() {
    this.currentWeekStart$.next(getStartOfWeek(new Date()));
  }

  getDayDateString(day: DayOfWeek) {
    let date = this.getDateFromDay(day);

    let dayName = day.substring(0, 1).toUpperCase() + day.substring(1, 3);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let dateDay = date.getDate().toString().padStart(2, '0');

    return `${dayName}, ${dateDay}.${month}.${year}`;
  }

  isDayToday(day: DayOfWeek) {
    let date = this.getDateFromDay(day);

    return date.toDateString() === new Date().toDateString();
  }

  isDayInFuture(day: DayOfWeek) {
    let date = this.getDateFromDay(day);

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    return today < date;
  }

  getDayData(data: WorkWeek, day: DayOfWeek) {
    return data.entries[day];
  }

  getWorkHours(entry: WorkEntry) {
    return WorkEntryHelper.getWorkHours(entry);
  }

  private getDateFromDay(day: DayOfWeek) {
    let dayIndex = DaysOfWeek.indexOf(day);

    let date = new Date(this.currentWeekStart$.value);
    date.setDate(date.getDate() + dayIndex);

    return date;
  }
}
