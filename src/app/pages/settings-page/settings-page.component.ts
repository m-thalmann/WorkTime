import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { concatMap, delay, map, of, startWith, switchMap } from 'rxjs';
import { SyncSettings } from 'src/app/core/models/sync-settings.model';
import { TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { ImportExportService } from 'src/app/core/services/import-export.service';
import { SyncService } from 'src/app/core/services/sync.service';
import { DataActions } from 'src/app/core/state/data/data.actions';
import {
  selectHoursPerDay,
  selectSyncInfo,
  selectWorkStartDate,
  selectWorkStartHours,
} from 'src/app/core/state/data/data.selectors';
import { CardComponent } from '../../components/card/card.component';
import { isSyncTokenAuth } from '../../core/models/sync-settings.model';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HoursPipe, CardComponent, ReactiveFormsModule],
})
export class SettingsPageComponent {
  private readonly store = inject(Store);
  readonly importExport = inject(ImportExportService);
  readonly sync = inject(SyncService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly hoursPerDay = toSignal(this.store.select(selectHoursPerDay), { requireSync: true });
  readonly workStartDate = toSignal(this.store.select(selectWorkStartDate), { requireSync: true });
  readonly workStartHours = toSignal(this.store.select(selectWorkStartHours), { requireSync: true });

  readonly syncSettings = toSignal(this.store.select(selectSyncInfo).pipe(map((info) => info?.settings)), {
    requireSync: true,
  });

  private readonly syncSettingsSavedIndicatorEvent$ = new EventEmitter();
  readonly syncSettingsSavedIndicator = toSignal(
    this.syncSettingsSavedIndicatorEvent$.pipe(
      switchMap(() => of(true, false)),
      concatMap((value) => {
        if (value) {
          return of(value);
        } else {
          return of(value).pipe(delay(1000));
        }
      }),
      startWith(false)
    ),
    { requireSync: true }
  );

  readonly isSyncing = toSignal(this.sync.isSyncing$, { requireSync: true });

  readonly syncSettingsForm = this.fb.group({
    enabled: this.fb.control(false),
    url: this.fb.control(''),
    updateMethod: this.fb.control<'PUT' | 'PATCH' | 'POST'>('PUT'),
    authenticationType: this.fb.control<'basic' | 'token' | null>(null),
    tokenAuthentication: this.fb.group({
      token: this.fb.control(''),
      location: this.fb.control<'query' | 'header'>('header'),
      queryParam: this.fb.control(''),
    }),
    basicAuthentication: this.fb.group({
      username: this.fb.control(''),
      password: this.fb.control(''),
    }),
  });

  constructor() {
    this.setupSyncSettingsForm();
  }

  private async setupSyncSettingsForm() {
    const settings = this.syncSettings();

    if (settings) {
      const { url, updateMethod, authentication } = settings;

      let authenticationType: 'token' | 'basic' | null = null;
      let basicAuthentication;
      let tokenAuthentication;

      if (authentication) {
        if (isSyncTokenAuth(authentication)) {
          tokenAuthentication = authentication;
          authenticationType = 'token';
        } else {
          const [username, password] = window.atob(authentication).split(':');
          basicAuthentication = { username, password };
          authenticationType = 'basic';
        }
      }

      const updateData = {
        enabled: true,
        url,
        updateMethod,
        tokenAuthentication,
        basicAuthentication,
        authenticationType,
      };

      this.syncSettingsForm.patchValue(updateData);
    }
  }

  setHoursPerDay(hours: string) {
    this.store.dispatch(DataActions.setHoursPerDay({ hours: TimeRangeHelper.getHoursFromString(hours) }));
  }

  setWorkStartDate(date: string) {
    this.store.dispatch(DataActions.setWorkStartDate({ date }));
  }

  setWorkStartHours(hours: string) {
    this.store.dispatch(DataActions.setWorkStartHours({ hours: TimeRangeHelper.getHoursFromString(hours) }));
  }

  resetData() {
    if (!confirm('Are you sure you want to remove all data?')) {
      return;
    }

    this.store.dispatch(DataActions.resetData());
  }

  updateSyncSettings() {
    // TODO: add validation

    const formData = this.syncSettingsForm.getRawValue();

    if (!formData.enabled) {
      this.store.dispatch(DataActions.resetSync());
      return;
    }

    const settings: SyncSettings = {
      updateMethod: formData.updateMethod,
      url: formData.url,
    };

    if (formData.authenticationType === 'token') {
      settings.authentication = {
        token: formData.tokenAuthentication.token,
        location: formData.tokenAuthentication.location,
        queryParam: formData.tokenAuthentication.queryParam,
      };
    } else if (formData.authenticationType === 'basic') {
      settings.authentication = window.btoa(
        `${formData.basicAuthentication.username}:${formData.basicAuthentication.password}`
      );
    }

    this.store.dispatch(DataActions.setSyncSettings({ settings }));

    this.syncSettingsSavedIndicatorEvent$.emit();
  }

  async pullSync() {
    try {
      await this.sync.pullSync();

      alert('Sync successful!');
    } catch (e) {
      alert('Sync failed!');
    }
  }
  async pushSync() {
    try {
      await this.sync.pushSync();

      alert('Sync successful!');
    } catch (e) {
      alert('Sync failed!');
    }
  }
}
