import { WeekIdentifier } from './week-identifier.model';
import { isHoliday, WorkEntry, WorkEntryHelper } from './work-entry.model';

export interface WorkWeek {
  week: WeekIdentifier;

  entries: { [key: string]: WorkEntry };
}

export class WorkWeekHelper {
  static getWorkHours(week: WorkWeek) {
    return Object.values(week.entries).reduce((acc: number, entry) => acc + WorkEntryHelper.getWorkHours(entry), 0);
  }

  static getHolidayDays(week: WorkWeek) {
    return Object.values(week.entries).reduce((acc: number, entry) => (isHoliday(entry) ? 1 : 0) + acc, 0);
  }
}
