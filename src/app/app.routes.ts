import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(
        (m) => m.Login
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(
        (m) => m.Register
      ),
  },
  {
    path: 'home',
    // Add your user authentication guard here.
    loadComponent: () =>
      import('./features/user/user-layout/user-layout')
        .then(m => m.UserLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/user/home/home')
            .then(m => m.Home),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout').then(
        (m) => m.AdminLayout
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then(
            (m) => m.Dashboard
          ),
      },
      {
        path: 'songs',
        loadComponent: () =>
          import('./features/admin/songs/songs').then(
            (m) => m.Songs
          ),
      },
      {
        path: 'albums',
        loadComponent: () =>
          import('./features/admin/albums/albums')
            .then((m) => m.Albums),
      }
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
