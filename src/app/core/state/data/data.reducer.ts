import { createReducer, on } from '@ngrx/store';
import { WeekIdentifierHelper } from '../../models/week-identifier.model';
import { DataActions } from './data.actions';
import { DataState, InitialDataState } from './data.state';

export const dataReducer = createReducer(
  InitialDataState,

  on(DataActions.loadData, (state) => ({ ...state, loaded: false })),

  on(DataActions.loadDataSuccess, (state, { workWeeks, hoursPerDay, workStartDate }) => {
    return { ...state, workWeeks, hoursPerDay, workStartDate, loaded: true };
  }),

  on(DataActions.setWorkEntry, (state, { week, dayOfWeek, entry }) => {
    let newState: DataState = { ...state, workWeeks: { ...state.workWeeks } };

    const weekKey = WeekIdentifierHelper.getKey(week);

    if (!(weekKey in newState.workWeeks)) {
      newState.workWeeks[weekKey] = { week: week, entries: {} };
    } else {
      newState.workWeeks[weekKey] = {
        ...newState.workWeeks[weekKey],
        entries: { ...newState.workWeeks[weekKey].entries },
      };
    }

    newState.workWeeks[weekKey].entries[dayOfWeek] = entry;

    return newState;
  }),

  on(DataActions.removeWorkEntry, (state, { week, dayOfWeek }) => {
    const weekKey = WeekIdentifierHelper.getKey(week);

    if (!(weekKey in state.workWeeks) || !(dayOfWeek in state.workWeeks[weekKey].entries)) {
      return state;
    }

    let newWorkWeeks = { ...state.workWeeks };
    newWorkWeeks[weekKey] = { ...newWorkWeeks[weekKey], entries: { ...newWorkWeeks[weekKey].entries } };
    delete newWorkWeeks[weekKey].entries[dayOfWeek];

    return { ...state, workWeeks: newWorkWeeks };
  }),

  on(DataActions.setWorkStartDate, (state, { date }) => {
    return { ...state, workStartDate: date };
  })
);
