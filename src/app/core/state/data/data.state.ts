import DateHelpers from '../../helpers/DateHelpers';
import { TimeRangeHelper } from '../../models/time-range.model';
import { WeekIdentifierHelper } from '../../models/week-identifier.model';
import { WorkWeek } from '../../models/work-week.model';

export const DataStateStorageKey = 'APP_DATA_STATE';

export interface DataState {
  workWeeks: { [key: string]: WorkWeek };
  hoursPerDay: number;
  workStartDate: string;
  loaded: boolean;
}

export const InitialDataState: DataState = {
  workWeeks: {},
  hoursPerDay: 8,
  workStartDate: DateHelpers.getDateString(new Date()),
  loaded: false,
};
