import { SyncDataState } from '../state/data/data.state';

export interface SyncData {
  history: string[];
  data: SyncDataState;
}
