import { enableProdMode } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { AppComponent } from './app/app.component';
import { DataEffects } from './app/core/state/data/data.effects';
import { dataReducer } from './app/core/state/data/data.reducer';
import { AppRoutes } from './app/routes';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(AppRoutes),
    provideStore({ data: dataReducer }),
    provideEffects([DataEffects]),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));
