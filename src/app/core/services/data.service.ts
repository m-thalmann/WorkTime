import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TimeRangeHelper } from '../models/time-range.model';
import { WeekIdentifierHelper } from '../models/week-identifier.model';
import { WorkWeek } from '../models/work-week.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  workWeeks$: Observable<{ [key: string]: WorkWeek }> = of({
    '2023_04': {
      week: WeekIdentifierHelper.fromDate(new Date()),
      entries: {
        monday: {
          pauses: [{ startHours: 12.5, endHours: 13.0 }],
          timeRange: TimeRangeHelper.fromTime('8:30', '17:15'),
        },
        tuesday: {
          holiday: true,
        },
      },
    },
  });

  hoursPerDay$: Observable<number> = of(7.9);

  constructor() {}
}
