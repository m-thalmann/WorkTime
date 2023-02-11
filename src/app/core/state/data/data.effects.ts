import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createEffect } from '@ngrx/effects';
import { ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, withLatestFrom } from 'rxjs';
import { DataActions, DataWorkEntriesActions } from './data.actions';
import { selectData } from './data.selectors';
import { DataStateStorageKey, InitialDataState } from './data.state';

@Injectable()
export class DataEffects {
  constructor(private actions$: Actions, private store: Store) {}

  loadData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataActions.loadData),
      map(() => {
        const data = JSON.parse(localStorage.getItem(DataStateStorageKey) || '{}');

        return DataActions.loadDataSuccess({
          workWeeks: data.workWeeks || InitialDataState.workWeeks,
          hoursPerDay: data.hoursPerDay || InitialDataState.hoursPerDay,
          workStartDate: data.workStartDate || InitialDataState.workStartDate,
        });
      })
    )
  );

  saveData$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          DataWorkEntriesActions.setEntry,
          DataWorkEntriesActions.removeEntry,
          DataWorkEntriesActions.addPause,
          DataWorkEntriesActions.updatePause,
          DataWorkEntriesActions.removePause,
          DataActions.setWorkStartDate
        ),
        withLatestFrom(this.store.select(selectData)),
        map(([_, data]) => {
          localStorage.setItem(
            DataStateStorageKey,
            JSON.stringify({
              workWeeks: data.workWeeks,
              hoursPerDay: data.hoursPerDay,
              workStartDate: data.workStartDate,
            })
          );
        })
      ),

    { dispatch: false }
  );
}
