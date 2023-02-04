import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DayOfWeek } from '../../models/day-of-week.model';
import { WeekIdentifier } from '../../models/week-identifier.model';
import { WorkEntry } from '../../models/work-entry.model';
import { DataState } from './data.state';

export const DataActions = createActionGroup({
  source: 'Data',
  events: {
    'Load data': emptyProps(),
    'Load data success': props<{
      workWeeks: DataState['workWeeks'];
      hoursPerDay: DataState['hoursPerDay'];
      workStartDate: DataState['workStartDate'];
    }>(),

    'Set work entry': props<{ week: WeekIdentifier; dayOfWeek: DayOfWeek; entry: WorkEntry }>(),

    'Remove work entry': props<{ week: WeekIdentifier; dayOfWeek: DayOfWeek }>(),

    'Set work start date': props<{ date: string }>(),
  },
});
