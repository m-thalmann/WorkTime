import { TimeRange, TimeRangeHelper } from './time-range.model';

export type WorkEntry = WorkDayEntry | HolidayEntry;

export interface HolidayEntry {}

export interface WorkDayEntry {
  timeRange: TimeRange;

  pauses: TimeRange[];
}

export const isWorkDayEntry = (entry: WorkEntry): entry is WorkDayEntry => {
  return (entry as WorkDayEntry).timeRange !== undefined;
};

export const isHoliday = (entry: WorkEntry): entry is HolidayEntry => {
  return !isWorkDayEntry(entry);
};

export class WorkEntryHelper {
  static getWorkHours(entry: WorkEntry) {
    if (isWorkDayEntry(entry)) {
      return (
        TimeRangeHelper.getHoursDiff(entry.timeRange) -
        entry.pauses.reduce((acc, pause) => TimeRangeHelper.getHoursDiff(pause) + acc, 0)
      );
    }

    return 0;
  }
}
