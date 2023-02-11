import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import DateHelpers from 'src/app/core/helpers/DateHelpers';
import { DaysOfWeek } from 'src/app/core/models/day-of-week.model';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { HolidayEntry, isWorkDayEntry, WorkEntry, WorkEntryHelper } from 'src/app/core/models/work-entry.model';
import { WeekDayIdentifier } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataWorkEntriesActions } from 'src/app/core/state/data/data.actions';
import { selectHoursPerDay } from 'src/app/core/state/data/data.selectors';
import { WeekDayCardPausesComponent } from './components/week-day-card-pauses/week-day-card-pauses.component';
import { WeekDayCardTimeInputWrapperComponent } from './components/week-day-card-time-input-wrapper/week-day-card-time-input-wrapper.component';

@Component({
  selector: 'app-week-day-card',
  standalone: true,
  templateUrl: './week-day-card.component.html',
  styleUrls: ['./week-day-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HoursPipe, WeekDayCardPausesComponent, WeekDayCardTimeInputWrapperComponent],
})
export class WeekDayCardComponent {
  @Input() weekDayIdentifier!: WeekDayIdentifier;
  @Input() workEntry!: WorkEntry | null;

  hoursPerDay$ = this.store.select(selectHoursPerDay);

  constructor(private store: Store) {}

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

  get isDayToday() {
    return DateHelpers.isToday(this.date);
  }

  get isDayInFuture() {
    return DateHelpers.isInFuture(this.date);
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

  addHolidayEntry() {
    this.store.dispatch(
      DataWorkEntriesActions.setEntry({ week: this.week, dayOfWeek: this.weekDay, entry: {} as HolidayEntry })
    );
  }

  removeWorkEntry() {
    this.store.dispatch(DataWorkEntriesActions.removeEntry({ week: this.week, dayOfWeek: this.weekDay }));
  }
}

