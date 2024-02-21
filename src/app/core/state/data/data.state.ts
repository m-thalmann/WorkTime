import DateHelpers from '../../helpers/DateHelpers';
import { SyncSettings } from '../../models/sync-settings.model';
import { WorkWeek } from '../../models/work-week.model';

export const DataStateStorageKey = 'APP_DATA_STATE';

export interface DataState extends SyncDataState {
  syncInfo?: {
    settings: SyncSettings;
    history: string[];
  };
  loaded: boolean;
}

export const InitialDataState: DataState = {
  workWeeks: {},
  hoursPerDay: 8,
  workStartDate: DateHelpers.getDateString(new Date()),
  workStartHours: 0,
  useDecimalHours: false,
  loaded: false,
};

export interface SyncDataState {
  workWeeks: { [key: string]: WorkWeek };
  hoursPerDay: number;
  workStartDate: string;
  workStartHours: number;
  useDecimalHours: boolean;
}
