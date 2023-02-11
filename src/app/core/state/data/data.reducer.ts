import { createReducer, on } from '@ngrx/store';
import { WeekIdentifierHelper } from '../../models/week-identifier.model';
import { isWorkDayEntry } from '../../models/work-entry.model';
import { DataActions, DataWorkEntriesActions } from './data.actions';
import { DataState, InitialDataState } from './data.state';

export const dataReducer = createReducer(
  InitialDataState,

  /*
   |--------------------
   | Data Actions
   |--------------------
   */

  on(DataActions.loadData, (state) => ({ ...state, loaded: false })),

  on(DataActions.loadDataSuccess, (state, { workWeeks, hoursPerDay, workStartDate }) => {
    return { ...state, workWeeks, hoursPerDay, workStartDate, loaded: true };
  }),

  on(DataActions.setWorkStartDate, (state, { date }) => {
    return { ...state, workStartDate: date };
  }),

  /*
   |--------------------
   | Data Work Entries Actions
   |--------------------
   */

  on(DataWorkEntriesActions.setEntry, (state, { week, dayOfWeek, entry }) => {
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

  on(DataWorkEntriesActions.removeEntry, (state, { week, dayOfWeek }) => {
    const weekKey = WeekIdentifierHelper.getKey(week);

    if (!(weekKey in state.workWeeks) || !(dayOfWeek in state.workWeeks[weekKey].entries)) {
      return state;
    }

    let newWorkWeeks = { ...state.workWeeks };
    newWorkWeeks[weekKey] = { ...newWorkWeeks[weekKey], entries: { ...newWorkWeeks[weekKey].entries } };
    delete newWorkWeeks[weekKey].entries[dayOfWeek];

    return { ...state, workWeeks: newWorkWeeks };
  }),

  on(DataWorkEntriesActions.addPause, (state, { week, dayOfWeek, pause }) => {
    const weekKey = WeekIdentifierHelper.getKey(week);

    const entry = { ...state.workWeeks[weekKey]?.entries?.[dayOfWeek] };

    if (!entry || !isWorkDayEntry(entry)) {
      return state;
    }

    entry.pauses = [...entry.pauses, pause].sort((a, b) => {
      return a.startHours - b.startHours;
    });

    let newState: DataState = { ...state, workWeeks: { ...state.workWeeks } };
    newState.workWeeks[weekKey] = { ...state.workWeeks[weekKey], entries: { ...state.workWeeks[weekKey].entries } };
    newState.workWeeks[weekKey].entries[dayOfWeek] = {
      ...entry,
    };

    return newState;
  }),

  on(DataWorkEntriesActions.updatePause, (state, { week, dayOfWeek, pause, pauseIndex }) => {
    const weekKey = WeekIdentifierHelper.getKey(week);

    const entry = { ...state.workWeeks[weekKey]?.entries?.[dayOfWeek] };

    if (!entry || !isWorkDayEntry(entry) || pauseIndex >= entry.pauses.length) {
      return state;
    }

    entry.pauses = [...entry.pauses];
    entry.pauses[pauseIndex] = pause;
    entry.pauses = entry.pauses.sort((a, b) => {
      return a.startHours - b.startHours;
    });

    let newState: DataState = { ...state, workWeeks: { ...state.workWeeks } };
    newState.workWeeks[weekKey] = { ...state.workWeeks[weekKey], entries: { ...state.workWeeks[weekKey].entries } };
    newState.workWeeks[weekKey].entries[dayOfWeek] = {
      ...entry,
    };

    return newState;
  }),

  on(DataWorkEntriesActions.removePause, (state, { week, dayOfWeek, pauseIndex }) => {
    const weekKey = WeekIdentifierHelper.getKey(week);

    const entry = { ...state.workWeeks[weekKey]?.entries?.[dayOfWeek] };

    if (!entry || !isWorkDayEntry(entry) || pauseIndex >= entry.pauses.length) {
      return state;
    }

    entry.pauses = entry.pauses.filter((_, index) => index !== pauseIndex);

    let newState: DataState = { ...state, workWeeks: { ...state.workWeeks } };
    newState.workWeeks[weekKey] = { ...state.workWeeks[weekKey], entries: { ...state.workWeeks[weekKey].entries } };
    newState.workWeeks[weekKey].entries[dayOfWeek] = {
      ...entry,
    };

    return newState;
  })
);
