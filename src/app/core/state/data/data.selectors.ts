import { createFeatureSelector, createSelector } from '@ngrx/store';
import DateHelpers from '../../helpers/DateHelpers';
import { DayOfWeek, DaysOfWeek } from '../../models/day-of-week.model';
import { WeekIdentifierHelper } from '../../models/week-identifier.model';
import { isWorkDayEntry, WorkEntryHelper } from '../../models/work-entry.model';
import { DataState, SyncDataState } from './data.state';

export const selectData = createFeatureSelector<DataState>('data');

export const selectWorkWeeks = createSelector(selectData, (state: DataState) => state.workWeeks);
export const selectHoursPerDay = createSelector(selectData, (state: DataState) => state.hoursPerDay);
export const selectWorkStartDate = createSelector(selectData, (state: DataState) => state.workStartDate);
export const selectSyncInfo = createSelector(selectData, (state: DataState) => state.syncInfo);

export const selectSyncData = createSelector(selectData, (state: DataState) => {
  const { workWeeks, hoursPerDay, workStartDate } = state;

  return { workWeeks, hoursPerDay, workStartDate } as SyncDataState;
});

export const selectTotalWorkHoursDiff = createSelector(selectData, (state: DataState) => {
  const today = new Date();
  const startDate = new Date(state.workStartDate);

  const startDateWeekIdentifier = WeekIdentifierHelper.fromDate(startDate);
  const startDateWeekDay = (startDate.getDay() || 7) - 1;

  const todayWeekIdentifier = WeekIdentifierHelper.fromDate(today);
  const todayWeekDay = (today.getDay() || 7) - 1;

  const totalDays = DateHelpers.getWorkingDays(startDate, today);

  const requiredHours = totalDays * state.hoursPerDay;

  const workedHours = Object.values(state.workWeeks).reduce((acc1: number, week) => {
    if (
      week.week.year < startDateWeekIdentifier.year ||
      (week.week.year === startDateWeekIdentifier.year && week.week.weekNumber < startDateWeekIdentifier.weekNumber)
    ) {
      return acc1;
    }

    if (
      week.week.year > todayWeekIdentifier.year ||
      (week.week.year === todayWeekIdentifier.year && week.week.weekNumber > todayWeekIdentifier.weekNumber)
    ) {
      return acc1;
    }

    return (
      Object.keys(week.entries).reduce((acc2: number, weekDayKey) => {
        if (
          week.week.year === startDateWeekIdentifier.year &&
          week.week.weekNumber === startDateWeekIdentifier.weekNumber
        ) {
          const entryWeekDay = DaysOfWeek.indexOf(weekDayKey as DayOfWeek);

          if (entryWeekDay < startDateWeekDay) {
            return acc2;
          }
        }

        if (week.week.year === todayWeekIdentifier.year && week.week.weekNumber === todayWeekIdentifier.weekNumber) {
          const entryWeekDay = DaysOfWeek.indexOf(weekDayKey as DayOfWeek);

          if (entryWeekDay > todayWeekDay) {
            return acc2;
          }
        }

        const entry = week.entries[weekDayKey];

        if (isWorkDayEntry(entry)) {
          return WorkEntryHelper.getWorkHours(entry) + acc2;
        }

        return state.hoursPerDay + acc2;
      }, 0) + acc1
    );
  }, 0);

  return workedHours - requiredHours;
});
