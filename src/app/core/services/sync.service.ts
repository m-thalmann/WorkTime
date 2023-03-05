import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, filter, lastValueFrom, map, Observable, of, shareReplay, take, tap } from 'rxjs';
import { SyncData } from '../models/sync-data.model';
import { isSyncTokenAuth } from '../models/sync-settings.model';
import { DataActions } from '../state/data/data.actions';
import { selectSyncData, selectSyncInfo } from '../state/data/data.selectors';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private syncSettings$ = this.store.select(selectSyncInfo).pipe(map((s) => s?.settings));
  private syncHistory$ = this.store.select(selectSyncInfo).pipe(map((s) => s?.history));

  constructor(private store: Store, private http: HttpClient) {}

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
        catchError((_) => of(null))
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

  async sync() {
    const remoteSyncData = await this.getData();
    const localData = await lastValueFrom(this.store.select(selectSyncData).pipe(take(1)));

    const localDataHash = await this.hashData(JSON.stringify(localData));

    const localHistory = Array.from((await lastValueFrom(this.syncHistory$.pipe(take(1)))) || []);

    if (localHistory[localHistory.length - 1] !== localDataHash) {
      localHistory.push(localDataHash);
    }

    let localHistoryUpdate: string[] | null = null;

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
      } else if (localHistory.includes(lastRemoteHistory)) {
        // update to remote

        localHistoryUpdate = localHistory;

        await this.updateData({ data: localData, history: localHistory });

        this.log('Remote updated');
      } else {
        // conflict

        this.log('Conflict');

        // TODO: handle conflict
        return false;
      }
    } else {
      // no remote data

      localHistoryUpdate = localHistory;

      await this.updateData({ data: localData, history: localHistory });

      this.log('Remote updated');
    }

    if (localHistoryUpdate) {
      this.store.dispatch(DataActions.setSyncHistory({ history: localHistoryUpdate }));
    }

    return true;
  }

  private log(...message: any) {
    console.log('%cSync', 'background: teal; color: white; padding: 2px 4px; border-radius: 0.5em;', ...message);
  }
}
