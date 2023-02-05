import { DaysOfWeek } from '../models/day-of-week.model';

class DateHelpers {
  static getStartOfWeek(date: Date) {
    let d = new Date(date);
    let day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);

    return d;
  }

  static getTotalDays(startDate: Date, endDate: Date) {
    return Math.floor(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  static getWorkingDays(startDate: Date, endDate: Date) {
    if (startDate.getTime() > endDate.getTime()) {
      return 0;
    }

    const startDateDay = (startDate.getDay() || 7) - 1;
    const endDateDay = (endDate.getDay() || 7) - 1;

    let firstWeekDays = Math.max(0, 7 - 2 - startDateDay);
    let lastWeekDays = 0;

    if (DateHelpers.getStartOfWeek(startDate).getTime() !== DateHelpers.getStartOfWeek(endDate).getTime()) {
      lastWeekDays = Math.max(0, Math.min(5, 1 + endDateDay));
    }

    const totalDayDiff = DateHelpers.getTotalDays(startDate, endDate);

    const fullWeekDiffDays = totalDayDiff - (7 - startDateDay) - (1 + endDateDay);
    let fullWeekWorkDays = 0;

    if (fullWeekDiffDays % 7 === 0) {
      fullWeekWorkDays = fullWeekDiffDays * (5 / 7);
    }

    return fullWeekWorkDays + firstWeekDays + lastWeekDays;
  }

  static isToday(date: Date) {
    return date.toDateString() === new Date().toDateString();
  }

  static isInFuture(date: Date) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    return today < date;
  }

  static getDayDateString(date: Date) {
    let day = DaysOfWeek[(date.getDay() || 7) - 1];

    let dayName = day.substring(0, 1).toUpperCase() + day.substring(1, 3);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let dateDay = date.getDate().toString().padStart(2, '0');

    return `${dayName}, ${dateDay}.${month}.${year}`;
  }

  static getDateString(date: Date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let dateDay = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${dateDay}`;
  }
}

export default DateHelpers;
