import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DayOfWeek } from '../../models/day-of-week.model';
import { SyncSettings } from '../../models/sync-settings.model';
import { WeekIdentifier } from '../../models/week-identifier.model';
import { WorkDayEntry, WorkEntry } from '../../models/work-entry.model';
import { DataState } from './data.state';

export const DataActions = createActionGroup({
  source: 'Data',
  events: {
    'Load data': emptyProps(),
    'Load data success': props<{
      workWeeks: DataState['workWeeks'];
      hoursPerDay: DataState['hoursPerDay'];
      workStartDate: DataState['workStartDate'];
      workStartHours: DataState['workStartHours'];
      syncInfo: DataState['syncInfo'];
    }>(),
    'Import data': props<{
      workWeeks: DataState['workWeeks'];
      hoursPerDay: DataState['hoursPerDay'];
      workStartDate: DataState['workStartDate'];
      workStartHours: DataState['workStartHours'];
    }>(),

    'Reset data': emptyProps(),

    'Set hours per day': props<{ hours: number }>(),
    'Set work start date': props<{ date: string }>(),
    'Set work start hours': props<{ hours: number }>(),

    'Set sync settings': props<{ settings: SyncSettings }>(),
    'Set sync history': props<{ history: string[] }>(),
    'Reset sync': emptyProps(),
  },
});

export const DataWorkEntriesActions = createActionGroup({
  source: 'Data work entries',
  events: {
    'Set entry': props<{ week: WeekIdentifier; dayOfWeek: DayOfWeek; entry: WorkEntry }>(),
    'Remove entry': props<{ week: WeekIdentifier; dayOfWeek: DayOfWeek }>(),

    'Add pause': props<{ week: WeekIdentifier; dayOfWeek: DayOfWeek; pause: WorkDayEntry['pauses'][0] }>(),
    'Update pause': props<{
      week: WeekIdentifier;
      dayOfWeek: DayOfWeek;
      pauseIndex: number;
      pause: WorkDayEntry['pauses'][0];
    }>(),
    'Remove pause': props<{ week: WeekIdentifier; dayOfWeek: DayOfWeek; pauseIndex: number }>(),
  },
});
