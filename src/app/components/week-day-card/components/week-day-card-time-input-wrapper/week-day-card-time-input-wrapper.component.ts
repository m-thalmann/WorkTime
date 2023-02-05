import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-week-day-card-time-input-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './week-day-card-time-input-wrapper.component.html',
  styleUrls: ['./week-day-card-time-input-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekDayCardTimeInputWrapperComponent {}

