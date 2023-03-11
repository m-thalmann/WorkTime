import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { concatMap, concatWith, delay, lastValueFrom, map, of, startWith, switchMap, take, tap } from 'rxjs';
import { SyncSettings } from 'src/app/core/models/sync-settings.model';
import { TimeRangeHelper } from 'src/app/core/models/time-range.model';
import { HoursPipe } from 'src/app/core/pipes/hours.pipe';
import { ImportExportService } from 'src/app/core/services/import-export.service';
import { SyncService } from 'src/app/core/services/sync.service';
import { DataActions } from 'src/app/core/state/data/data.actions';
import { selectHoursPerDay, selectSyncInfo, selectWorkStartDate } from 'src/app/core/state/data/data.selectors';
import { CardComponent } from '../../components/card/card.component';
import { isSyncTokenAuth } from '../../core/models/sync-settings.model';

interface SyncSettingsForm {
  enabled: FormControl<boolean>;
  url: FormControl<string>;
  updateMethod: FormControl<'PUT' | 'PATCH' | 'POST'>;
  authenticationType: FormControl<'basic' | 'token' | null>;
  tokenAuthentication: FormGroup<{
    token: FormControl<string>;
    location: FormControl<'query' | 'header'>;
    queryParam: FormControl<string>;
  }>;
  basicAuthentication: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
  }>;
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HoursPipe, CardComponent, ReactiveFormsModule],
})
export class SettingsPageComponent {
  hoursPerDay$ = this.store.select(selectHoursPerDay);
  workStartDate$ = this.store.select(selectWorkStartDate);

  syncSettings$ = this.store.select(selectSyncInfo).pipe(map((info) => info?.settings));

  private syncSettingsSavedIndicatorEvent$ = new EventEmitter();
  syncSettingsSavedIndicator$ = this.syncSettingsSavedIndicatorEvent$.pipe(
    switchMap(() => of(true, false)),
    concatMap((value) => {
      if (value) {
        return of(value);
      } else {
        return of(value).pipe(delay(1000));
      }
    }),
    startWith(false)
  );

  syncSettingsForm: FormGroup;

  constructor(
    private store: Store,
    public importExport: ImportExportService,
    public sync: SyncService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.syncSettingsForm = new FormGroup<SyncSettingsForm>({
      enabled: new FormControl(false, { nonNullable: true }),
      url: new FormControl('', { nonNullable: true }),
      updateMethod: new FormControl('PUT', { nonNullable: true }),
      authenticationType: new FormControl(null),
      tokenAuthentication: new FormGroup({
        token: new FormControl('', { nonNullable: true }),
        location: new FormControl<'header' | 'query'>('header', { nonNullable: true }),
        queryParam: new FormControl('', { nonNullable: true }),
      }),
      basicAuthentication: new FormGroup({
        username: new FormControl('', { nonNullable: true }),
        password: new FormControl('', { nonNullable: true }),
      }),
    });
    this.setupSyncSettingsForm();
  }

  private async setupSyncSettingsForm() {
    const settings = await lastValueFrom(this.syncSettings$.pipe(take(1)));

    if (settings) {
      const { url, updateMethod, authentication } = settings;

      let authenticationType;
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

      this.changeDetectorRef.detectChanges();
    }
  }

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

  updateSyncSettings() {
    // TODO: add validation

    const formData = this.syncSettingsForm.value;

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
    await this.sync.pullSync();

    alert('Sync successful!');
  }
  async pushSync() {
    await this.sync.pushSync();

    alert('Sync successful!');
  }
}

