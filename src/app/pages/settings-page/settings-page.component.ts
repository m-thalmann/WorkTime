import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { DataActions } from 'src/app/core/state/data/data.actions';
import { TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { selectHoursPerDay, selectWorkStartDate } from 'src/app/core/state/data/data.selectors';
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HoursPipe, CardComponent],
})
export class SettingsPageComponent {
  hoursPerDay$ = this.store.select(selectHoursPerDay);
  workStartDate$ = this.store.select(selectWorkStartDate);

  constructor(private store: Store) {}

  setHoursPerDay(hours: string) {
    this.store.dispatch(DataActions.setHoursPerDay({ hours: TimeRangeHelper.getHoursFromString(hours) }));
  }

  setWorkStartDate(date: string) {
    this.store.dispatch(DataActions.setWorkStartDate({ date }));
  }

  resetData() {
    if (!confirm('Are you sure you want to remove all data?')) {
      return;
    }

    this.store.dispatch(DataActions.resetData());
  }
}

