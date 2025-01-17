
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { DataActions } from './core/state/data/data.actions';

@Component({
    selector: 'app-root',
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private store = inject(Store);

  constructor() {
    this.store.dispatch(DataActions.loadData());
  }
}
