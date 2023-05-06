export interface TimeRange {
  startHours: number;
  endHours: number;
}

const ROUND_MULTIPLIER = 1000;

export class TimeRangeHelper {
  static fromTime(start: string, end: string): TimeRange {
    const data = { startHours: this.getHoursFromString(start), endHours: this.getHoursFromString(end) };

    if (data.startHours > data.endHours) {
      const tmp = data.startHours;
      data.startHours = data.endHours;
      data.endHours = tmp;
    }

    return data;
  }

  static getHoursFromString(hourString: string) {
    const [hours, minutes] = hourString.split(':').map((v: string) => parseInt(v));

    return hours + Math.round((minutes / 60) * ROUND_MULTIPLIER) / ROUND_MULTIPLIER;
  }

  static getTimeString(totalHours: number) {
    const totalMinutes = Math.round(totalHours * 60);
    const sign = totalMinutes !== 0 && totalMinutes < 0 ? '-' : '';
    const absTotalMinutes = Math.abs(totalMinutes);

    const hours = Math.floor(absTotalMinutes / 60);
    const minutes = absTotalMinutes % 60;

    return sign + hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
  }

  static getHoursDiff(range: TimeRange) {
    return Math.round((range.endHours - range.startHours) * ROUND_MULTIPLIER) / ROUND_MULTIPLIER;
  }
}
