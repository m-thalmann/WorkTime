import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DayOfWeek } from 'src/app/core/models/day-of-week.model';
import { TimeRange, TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { WorkDayEntry } from 'src/app/core/models/work-entry.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataActions } from 'src/app/core/state/data/data.actions';
import { WeekDayCardTimeInputWrapperComponent } from '../week-day-card-time-input-wrapper/week-day-card-time-input-wrapper.component';

@Component({
  selector: 'app-week-day-card-pause',
  standalone: true,
  templateUrl: './week-day-card-pause.component.html',
  styleUrls: ['./week-day-card-pause.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, WeekDayCardTimeInputWrapperComponent, HoursPipe, FormsModule],
})
export class WeekDayCardPauseComponent {
  @Input() weekStart!: Date;
  @Input() weekDay!: DayOfWeek;
  @Input() workDayEntry!: WorkDayEntry;
  @Input()
  set pause(pause: TimeRange | null) {
    if (pause) {
      this.pauseStart = TimeRangeHelper.getTimeString(pause.startHours);
      this.pauseEnd = TimeRangeHelper.getTimeString(pause.endHours);
    } else {
      this.pauseStart = null;
      this.pauseEnd = null;
    }

    this._pause = pause;
  }
  @Input() pauseIndex!: number | null;

  @Output() finishAddPause = new EventEmitter<void>();

  private _pause: TimeRange | null = null;

  pauseStart: string | null = null;
  pauseEnd: string | null = null;

  constructor(private store: Store) {}

  get isNew() {
    return this.pauseIndex === null;
  }

  get hasChanges() {
    if (this._pause === null) {
      return true;
    }

    const newPauseStart = this.pauseStart !== null ? TimeRangeHelper.getHoursFromString(this.pauseStart) : null;
    const newPauseEnd = this.pauseEnd !== null ? TimeRangeHelper.getHoursFromString(this.pauseEnd) : null;

    return this._pause.startHours !== newPauseStart || this._pause.endHours !== newPauseEnd;
  }

  get week() {
    return WeekIdentifierHelper.fromDate(this.weekStart);
  }

  saveEntry() {
    if (!this.pauseStart || !this.pauseEnd) {
      return;
    }

    this.store.dispatch(
      DataActions.setWorkEntry({
        week: this.week,
        dayOfWeek: this.weekDay,
        entry: {
          ...this.workDayEntry,
          pauses: [...this.workDayEntry.pauses, TimeRangeHelper.fromTime(this.pauseStart, this.pauseEnd)],
        },
      })
    );

    if (this.isNew) {
      this.finishAddPause.emit();
      this.pauseStart = null;
      this.pauseEnd = null;
    }
  }

  removeEntry() {
    if (!this.isNew) {
      this.store.dispatch(
        DataActions.setWorkEntry({
          week: this.week,
          dayOfWeek: this.weekDay,
          entry: { ...this.workDayEntry, pauses: this.workDayEntry.pauses.filter((_, i) => i !== this.pauseIndex) },
        })
      );
    }

    this.finishAddPause.emit();
  }
}

