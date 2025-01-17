import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { WorkDayEntry } from 'src/app/core/models/work-entry.model';
import { WeekDayIdentifier } from 'src/app/core/models/work-week.model';
import { WeekDayCardPauseComponent } from '../week-day-card-pause/week-day-card-pause.component';

@Component({
  selector: 'app-week-day-card-pauses',
  templateUrl: './week-day-card-pauses.component.html',
  styleUrls: ['./week-day-card-pauses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WeekDayCardPauseComponent],
})
export class WeekDayCardPausesComponent {
  readonly weekDayIdentifier = input.required<WeekDayIdentifier>();
  readonly pauses = input.required<WorkDayEntry['pauses']>();

  readonly isAddingPause = signal(false);
}
