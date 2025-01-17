import { Pipe, PipeTransform } from '@angular/core';
import { TimeRangeHelper } from '../models/time-range.model';

@Pipe({
  name: 'hours',
  pure: true,
})
export class HoursPipe implements PipeTransform {
  transform(value: number | null, showPositiveSign = false): string {
    if (value === null) {
      return '-';
    }

    let timeString = TimeRangeHelper.getTimeString(value);

    if (showPositiveSign && timeString[0] !== '-') {
      timeString = '+' + timeString;
    }

    return timeString;
  }
}
