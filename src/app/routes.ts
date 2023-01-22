import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

export const AppRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent,
      },
    ],
  },

  { path: '**', redirectTo: '/dashboard' },
];
