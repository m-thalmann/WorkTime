export interface TimeRange {
  startHours: number;
  endHours: number;
}

export class TimeRangeHelper {
  static fromTime(start: string, end: string): TimeRange {
    return { startHours: this.getHoursFromString(start), endHours: this.getHoursFromString(end) };
  }

  private static getHoursFromString(hourString: string) {
    let [hours, minutes] = hourString.split(':').map((v: string) => parseInt(v));

    return hours + Math.round((minutes / 60) * 1000) / 1000;
  }

  static getTimeString(totalHours: number) {
    let sign = totalHours > 0 ? '' : '-';
    let absHours = Math.abs(totalHours);
    let hours = Math.floor(absHours);
    let minutes = Math.round((absHours - hours) * 60 * 1000) / 1000;

    return sign + hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
  }

  static getHoursDiff(range: TimeRange) {
    return range.endHours - range.startHours;
  }
}