import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { SyncResult } from '../core/models/sync-data.model';
import { HoursPipe } from '../core/pipes/hours.pipe';
import { ImportExportService } from '../core/services/import-export.service';
import { SyncService } from '../core/services/sync.service';
import { selectTotalWorkHoursDiff } from '../core/state/data/data.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

const syncResultIcons: { [key in SyncResult]: string } = {
  [SyncResult.NoUpdate]: 'fa-circle-check',
  [SyncResult.LocalUpdated]: 'fa-download',
  [SyncResult.RemoteUpdated]: 'fa-upload',
  [SyncResult.Conflict]: 'fa-triangle-exclamation',
};

const defaultSyncIcon = 'fa-sync';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, HoursPipe],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private readonly store = inject(Store);
  readonly importExport = inject(ImportExportService);
  private readonly sync = inject(SyncService);

  readonly totalWorkHoursDiff = toSignal(this.store.select(selectTotalWorkHoursDiff), { requireSync: true });
  readonly hasPositiveHours = computed(() => this.totalWorkHoursDiff() >= 0);

  readonly syncEnabled = toSignal(this.sync.isSyncEnabled$, { requireSync: true });
  readonly isSyncing = toSignal(this.sync.isSyncing$, { requireSync: true });

  readonly syncIcon = signal(defaultSyncIcon);

  async syncData() {
    try {
      const syncResult = await this.sync.sync();

      this.syncIcon.set(syncResultIcons[syncResult]);

      if (syncResult === SyncResult.Conflict) {
        alert('Conflict detected. Please resolve the conflict in the settings by forcing a push or pull.');
      }
    } catch (e) {
      this.syncIcon.set('fa-circle-exclamation');
      alert('Sync failed!');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.syncIcon.set(defaultSyncIcon);
  }
}
