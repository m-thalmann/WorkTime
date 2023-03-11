import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { SyncResult } from '../core/models/sync-data.model';
import { HoursPipe } from '../core/pipes/hours.pipe';
import { ImportExportService } from '../core/services/import-export.service';
import { SyncService } from '../core/services/sync.service';
import { selectTotalWorkHoursDiff } from '../core/state/data/data.selectors';

const syncResultIcons: { [key in SyncResult]: string } = {
  [SyncResult.NoUpdate]: 'fa-circle-check',
  [SyncResult.LocalUpdated]: 'fa-download',
  [SyncResult.RemoteUpdated]: 'fa-upload',
  [SyncResult.Conflict]: 'fa-triangle-exclamation',
};

const defaultSyncIcon = 'fa-sync';

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

  syncIcon$ = new BehaviorSubject(defaultSyncIcon);

  constructor(private store: Store, public importExport: ImportExportService, public sync: SyncService) {}

  async syncData() {
    const syncResult = await this.sync.sync();

    this.syncIcon$.next(syncResultIcons[syncResult]);

    if (syncResult === SyncResult.Conflict) {
      alert('Conflict detected. Please resolve the conflict in the settings by forcing a push or pull.');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.syncIcon$.next(defaultSyncIcon);
  }
}
