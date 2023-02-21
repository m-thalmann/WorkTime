import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { fromEvent, lastValueFrom, take } from 'rxjs';
import { DataActions } from '../state/data/data.actions';
import { selectData } from '../state/data/data.selectors';

@Injectable({
  providedIn: 'root',
})
export class ImportExportService {
  constructor(private store: Store) {}

  async exportData() {
    const { workWeeks, hoursPerDay, workStartDate } = await lastValueFrom(this.store.select(selectData).pipe(take(1)));

    const exportData = { workWeeks, hoursPerDay, workStartDate };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData)));
    element.setAttribute('download', 'worktime-export.json');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  async importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.click();

    const event = await lastValueFrom(fromEvent(input, 'change').pipe(take(1)));
    const fileInputEvent = event as Event & { target: HTMLInputElement };

    const file = fileInputEvent.target!.files![0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string);
      const { workWeeks, hoursPerDay, workStartDate } = data;

      if (workWeeks == null || hoursPerDay == null || workStartDate == null) {
        return;
      }

      this.store.dispatch(DataActions.importData({ workWeeks, hoursPerDay, workStartDate }));
    };
  }
}

