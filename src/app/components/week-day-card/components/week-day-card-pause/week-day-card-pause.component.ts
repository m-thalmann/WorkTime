import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TimeRange, TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { WeekDayIdentifier } from 'src/app/core/models/work-week.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { DataWorkEntriesActions } from 'src/app/core/state/data/data.actions';
import { WeekDayCardTimeInputWrapperComponent } from '../week-day-card-time-input-wrapper/week-day-card-time-input-wrapper.component';

@Component({
  selector: 'app-week-day-card-pause',
  templateUrl: './week-day-card-pause.component.html',
  styleUrls: ['./week-day-card-pause.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WeekDayCardTimeInputWrapperComponent, HoursPipe, FormsModule],
})
export class WeekDayCardPauseComponent {
  private store = inject(Store);

  readonly weekDayIdentifier = input.required<WeekDayIdentifier>();
  readonly pause = input<TimeRange | null>(null);
  readonly pauseIndex = input.required<number | null>();

  readonly finishAddPause = output<void>();

  readonly pauseStart = linkedSignal(() => {
    const pause = this.pause();

    if (pause === null) {
      return null;
    }

    return TimeRangeHelper.getTimeString(pause.startHours);
  });
  readonly pauseEnd = linkedSignal(() => {
    const pause = this.pause();

    if (pause === null) {
      return null;
    }

    return TimeRangeHelper.getTimeString(pause.endHours);
  });

  readonly pauseTime = computed(() => {
    const pauseStart = this.pauseStart();
    const pauseEnd = this.pauseEnd();

    if (pauseStart === null || pauseEnd === null) {
      return null;
    }

    return TimeRangeHelper.getHoursDiff(TimeRangeHelper.fromTime(pauseStart, pauseEnd));
  });

  readonly isNew = computed(() => this.pauseIndex() === null);

  readonly hasChanges = computed(() => {
    const pause = this.pause();

    if (pause === null) {
      return true;
    }

    const pauseStart = TimeRangeHelper.getTimeString(pause.startHours);
    const pauseEnd = TimeRangeHelper.getTimeString(pause.endHours);

    return this.pauseStart() !== pauseStart || this.pauseEnd() !== pauseEnd;
  });

  readonly week = computed(() => this.weekDayIdentifier().week);
  readonly weekDay = computed(() => this.weekDayIdentifier().weekDay);

  saveEntry() {
    const pauseStart = this.pauseStart();
    const pauseEnd = this.pauseEnd();

    if (!pauseStart || !pauseEnd) {
      return;
    }

    const pause = TimeRangeHelper.fromTime(pauseStart, pauseEnd);

    if (this.isNew()) {
      this.store.dispatch(DataWorkEntriesActions.addPause({ week: this.week(), dayOfWeek: this.weekDay(), pause }));

      this.finishAddPause.emit();
      this.pauseStart.set(null);
      this.pauseEnd.set(null);
    } else {
      this.store.dispatch(
        DataWorkEntriesActions.updatePause({
          week: this.week(),
          dayOfWeek: this.weekDay(),
          pauseIndex: this.pauseIndex()!,
          pause,
        })
      );
    }
  }

  removeEntry() {
    if (!this.isNew()) {
      this.store.dispatch(
        DataWorkEntriesActions.removePause({
          week: this.week(),
          dayOfWeek: this.weekDay(),
          pauseIndex: this.pauseIndex()!,
        })
      );
    }

    this.finishAddPause.emit();
  }
}
