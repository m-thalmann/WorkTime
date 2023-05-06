import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DayOfWeek } from 'src/app/core/models/day-of-week.model';
import { TimeRange, TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { WeekIdentifierHelper } from 'src/app/core/models/week-identifier.model';
import { WorkDayEntry } from 'src/app/core/models/work-entry.model';
import { WeekDayIdentifier } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataActions, DataWorkEntriesActions } from 'src/app/core/state/data/data.actions';
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
  @Input() weekDayIdentifier!: WeekDayIdentifier;
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

    const pauseStart = TimeRangeHelper.getTimeString(this._pause.startHours);
    const pauseEnd = TimeRangeHelper.getTimeString(this._pause.endHours);

    return this.pauseStart !== pauseStart || this.pauseEnd !== pauseEnd;
  }

  get week() {
    return this.weekDayIdentifier.week;
  }

  get weekDay() {
    return this.weekDayIdentifier.weekDay;
  }

  saveEntry() {
    if (!this.pauseStart || !this.pauseEnd) {
      return;
    }

    const pause = TimeRangeHelper.fromTime(this.pauseStart, this.pauseEnd);

    if (this.isNew) {
      this.store.dispatch(DataWorkEntriesActions.addPause({ week: this.week, dayOfWeek: this.weekDay, pause }));

      this.finishAddPause.emit();
      this.pauseStart = null;
      this.pauseEnd = null;
    } else {
      this.store.dispatch(
        DataWorkEntriesActions.updatePause({
          week: this.week,
          dayOfWeek: this.weekDay,
          pauseIndex: this.pauseIndex!,
          pause,
        })
      );
    }
  }

  removeEntry() {
    if (!this.isNew) {
      this.store.dispatch(
        DataWorkEntriesActions.removePause({
          week: this.week,
          dayOfWeek: this.weekDay,
          pauseIndex: this.pauseIndex!,
        })
      );
    }

    this.finishAddPause.emit();
  }
}

