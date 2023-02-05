import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { isWorkDayEntry, WorkDayEntry, WorkEntry } from 'src/app/core/models/work-entry.model';
import { DayOfWeek } from 'src/app/core/models/day-of-week.model';
import { Store } from '@ngrx/store';
import { DataActions } from 'src/app/core/state/data/data.actions';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-week-day-card-pauses',
  standalone: true,
  imports: [CommonModule, HoursPipe, FormsModule],
  templateUrl: './week-day-card-pauses.component.html',
  styleUrls: ['./week-day-card-pauses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekDayCardPausesComponent {
  @Input() weekStart!: Date;
  @Input() weekDay!: DayOfWeek;
  @Input() workDayEntry!: WorkDayEntry;

  isAddingPause = false;

  newPauseStart: string = '';
  newPauseEnd: string = '';

  constructor(private store: Store) {}

  get week() {
    return WeekIdentifierHelper.fromDate(this.weekStart);
  }

  get workDay() {
    if (this.workDayEntry && isWorkDayEntry(this.workDayEntry)) {
      return this.workDayEntry;
    }

    return null;
  }

  addPauseEntry() {
    if (!this.workDayEntry || !isWorkDayEntry(this.workDayEntry)) {
      return;
    }

    this.store.dispatch(
      DataActions.setWorkEntry({
        week: this.week,
        dayOfWeek: this.weekDay,
        entry: {
          ...this.workDayEntry,
          pauses: [...this.workDayEntry.pauses, TimeRangeHelper.fromTime(this.newPauseStart, this.newPauseEnd)],
        },
      })
    );

    this.isAddingPause = false;
    this.newPauseStart = '';
    this.newPauseEnd = '';
  }

  removePauseEntry(index: number) {
    if (!this.workDayEntry || !isWorkDayEntry(this.workDayEntry)) {
      return;
    }

    this.store.dispatch(
      DataActions.setWorkEntry({
        week: this.week,
        dayOfWeek: this.weekDay,
        entry: { ...this.workDayEntry, pauses: this.workDayEntry.pauses.filter((_, i) => i !== index) },
      })
    );

    this.isAddingPause = false;
  }
}

