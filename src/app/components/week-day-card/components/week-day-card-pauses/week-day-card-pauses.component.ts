import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WorkDayEntry } from 'src/app/core/models/work-entry.model';
import { WeekDayIdentifier } from 'src/app/core/models/work-week.model';
import { WeekDayCardPauseComponent } from '../week-day-card-pause/week-day-card-pause.component';

@Component({
  selector: 'app-week-day-card-pauses',
  standalone: true,
  templateUrl: './week-day-card-pauses.component.html',
  styleUrls: ['./week-day-card-pauses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, WeekDayCardPauseComponent],
})
export class WeekDayCardPausesComponent {
  @Input() weekDayIdentifier!: WeekDayIdentifier;
  @Input() pauses!: WorkDayEntry['pauses'];

  isAddingPause = false;
}

