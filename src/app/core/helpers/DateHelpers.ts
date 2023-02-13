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

    // TODO: improve time complexity

    const workDays = DaysOfWeek.length;

    let count = 0;

    for (
      const currentDate = new Date(startDate.getTime());
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dayOfWeek = currentDate.getDay() || 7;

      if (dayOfWeek <= workDays) {
        count++;
      }
    }

    return count;
  }

  static isToday(date: Date) {
    return date.toDateString() === new Date().toDateString();
  }

  static isInFuture(date: Date) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    return today < date;
  }

  static isSameWeek(date1: Date, date2: Date) {
    return DateHelpers.getStartOfWeek(date1).getTime() === DateHelpers.getStartOfWeek(date2).getTime();
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
