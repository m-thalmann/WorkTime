import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

export const AppRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DashboardPageComponent,
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
      },

      { path: '**', redirectTo: '/' },
    ],
  },
];
