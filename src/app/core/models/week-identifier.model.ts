export interface WeekIdentifier {
  year: number;
  weekNumber: number;
}

export class WeekIdentifierHelper {
  /**
   * @see https://stackoverflow.com/a/6117889/11028838
   */
  static fromDate(date: Date): WeekIdentifier {
    let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    let weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

    return { year: d.getFullYear(), weekNumber };
  }

  static getKey(id: WeekIdentifier): string {
    return id.year + '_' + id.weekNumber.toString().padStart(2, '0');
  }

  static getStartOfWeek(id: WeekIdentifier) {
    let date = new Date(id.year, 0, 1);
    let day = date.getDay() || 7;

    let weekOffset = (id.weekNumber - 1) * 7;

    if (day <= 4) {
      date.setDate(2 - day + weekOffset);
    } else {
      date.setDate(7 - day + 2 + weekOffset);
    }

    return date;
  }
}
