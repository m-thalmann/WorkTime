import { HttpClient, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  catchError,
  filter,
  lastValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  take,
  throwError,
} from 'rxjs';
import { SyncData, SyncResult } from '../models/sync-data.model';
import { isSyncTokenAuth } from '../models/sync-settings.model';
import { DataActions } from '../state/data/data.actions';
import { selectSyncData, selectSyncInfo } from '../state/data/data.selectors';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private store = inject(Store);
  private http = inject(HttpClient);

  private syncSettings$ = this.store.select(selectSyncInfo).pipe(map((s) => s?.settings));
  private syncHistory$ = this.store.select(selectSyncInfo).pipe(map((s) => s?.history));

  isSyncEnabled$ = this.syncSettings$.pipe(map((s) => !!s));

  private _isSyncing$ = new BehaviorSubject(false);
  isSyncing$ = this._isSyncing$.asObservable();

  get isSupported() {
    return !!window.crypto?.subtle;
  }

  private async hashData(str: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await window.crypto.subtle.digest('SHA-1', data);

    const hashArray = Array.from(new Uint8Array(hash));

    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private async getRequest<T>(body?: string) {
    const settings = await lastValueFrom(this.syncSettings$.pipe(take(1)));

    if (!settings) {
      throw new Error('No sync settings found');
    }

    let request;

    if (!body) {
      request = new HttpRequest('GET', settings.url);
    } else {
      request = new HttpRequest(settings.updateMethod, settings.url, body);
    }

    if (settings.authentication) {
      if (isSyncTokenAuth(settings.authentication)) {
        if (settings.authentication.location === 'header') {
          request = request.clone({ setHeaders: { Authorization: 'Bearer ' + settings.authentication.token } });
        } else if (settings.authentication.queryParam) {
          request = request.clone({
            setParams: { [settings.authentication.queryParam]: settings.authentication.token },
          });
        }
      } else {
        request = request.clone({
          setHeaders: {
            Authorization: 'Basic ' + settings.authentication,
          },
        });
      }
    }

    return request as HttpRequest<T>;
  }

  private makeRequest<T>(request: HttpRequest<T>) {
    return lastValueFrom(
      (
        this.http.request(request).pipe(
          shareReplay(1),
          filter((response) => response instanceof HttpResponse)
        ) as Observable<HttpResponse<T>>
      ).pipe(
        map((response: HttpResponse<T>) => response.body),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null);
          }

          return throwError(() => error);
        })
      )
    );
  }

  private async getData() {
    const request = await this.getRequest<SyncData>();

    return await this.makeRequest(request);
  }

  private async updateData(data: SyncData) {
    const request = await this.getRequest(JSON.stringify(data));

    await this.makeRequest(request);
  }

  async pushSync() {
    if (this._isSyncing$.value) {
      throw new Error('Already syncing');
    }

    this._isSyncing$.next(true);

    try {
      const localData = await lastValueFrom(this.store.select(selectSyncData).pipe(take(1)));

      const localDataHash = await this.hashData(JSON.stringify(localData));

      const localHistory = Array.from((await lastValueFrom(this.syncHistory$.pipe(take(1)))) || []);

      if (localHistory[localHistory.length - 1] !== localDataHash) {
        localHistory.push(localDataHash);
      }

      await this.updateData({ data: localData, history: localHistory });

      this.store.dispatch(DataActions.setSyncHistory({ history: localHistory }));

      this._isSyncing$.next(false);
    } catch (e) {
      this.log('Error:', e);
      this._isSyncing$.next(false);
      throw e;
    }
  }

  async pullSync() {
    if (this._isSyncing$.value) {
      throw new Error('Already syncing');
    }

    this._isSyncing$.next(true);

    try {
      const remoteSyncData = await this.getData();

      if (!remoteSyncData) {
        this._isSyncing$.next(false);

        return;
      }

      const remoteHistory = remoteSyncData.history;

      this.store.dispatch(DataActions.importData({ ...remoteSyncData.data }));
      this.store.dispatch(DataActions.setSyncHistory({ history: remoteHistory }));

      this._isSyncing$.next(false);
    } catch (e) {
      this.log('Error:', e);
      this._isSyncing$.next(false);
      throw e;
    }
  }

  async sync(): Promise<SyncResult> {
    if (this._isSyncing$.value) {
      throw new Error('Already syncing');
    }

    this._isSyncing$.next(true);

    try {
      const remoteSyncData = await this.getData();
      const localData = await lastValueFrom(this.store.select(selectSyncData).pipe(take(1)));

      const localDataHash = await this.hashData(JSON.stringify(localData));

      const localHistory = Array.from((await lastValueFrom(this.syncHistory$.pipe(take(1)))) || []);

      if (localHistory[localHistory.length - 1] !== localDataHash) {
        localHistory.push(localDataHash);
      }

      let localHistoryUpdate: string[] | null = null;

      let result = SyncResult.NoUpdate;

      if (remoteSyncData) {
        const remoteHistory = remoteSyncData.history;

        const lastLocalHistory = localHistory[localHistory.length - 1];
        const lastRemoteHistory = remoteHistory[remoteHistory.length - 1];

        if (lastLocalHistory === lastRemoteHistory) {
          // no update needed

          localHistoryUpdate = localHistory;

          this.log('No update needed');
        } else if (remoteHistory.includes(lastLocalHistory)) {
          // update to local

          localHistoryUpdate = remoteHistory;

          this.store.dispatch(DataActions.importData({ ...remoteSyncData.data }));

          this.log('Local updated');

          result = SyncResult.LocalUpdated;
        } else if (localHistory.includes(lastRemoteHistory)) {
          // update to remote

          localHistoryUpdate = localHistory;

          await this.updateData({ data: localData, history: localHistory });

          this.log('Remote updated');

          result = SyncResult.RemoteUpdated;
        } else {
          // conflict

          this.log('Conflict');

          result = SyncResult.Conflict;
        }
      } else {
        // no remote data

        localHistoryUpdate = localHistory;

        await this.updateData({ data: localData, history: localHistory });

        this.log('Remote updated');

        result = SyncResult.RemoteUpdated;
      }

      if (localHistoryUpdate) {
        this.store.dispatch(DataActions.setSyncHistory({ history: localHistoryUpdate }));
      }

      this._isSyncing$.next(false);

      return result;
    } catch (e) {
      this.log('Error:', e);
      this._isSyncing$.next(false);
      throw e;
    }
  }

  private log(...message: any) {
    console.log('%cSync', 'background: teal; color: white; padding: 2px 4px; border-radius: 0.5em;', ...message);
  }
}
