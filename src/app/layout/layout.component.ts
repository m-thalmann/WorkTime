import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { HoursPipe } from '../core/pipes/hours.pipe';
import { ImportExportService } from '../core/services/import-export.service';
import { selectTotalWorkHoursDiff } from '../core/state/data/data.selectors';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HoursPipe],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  totalWorkHoursDiff$ = this.store.select(selectTotalWorkHoursDiff);

  constructor(private store: Store, public importExport: ImportExportService) {}
}
