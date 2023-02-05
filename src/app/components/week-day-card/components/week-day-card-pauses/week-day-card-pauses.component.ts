import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DayOfWeek } from 'src/app/core/models/day-of-week.model';
import { WorkDayEntry } from 'src/app/core/models/work-entry.model';
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
  @Input() weekStart!: Date;
  @Input() weekDay!: DayOfWeek;
  @Input() workDayEntry!: WorkDayEntry;

  isAddingPause = false;
}

