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
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user/profile/profile')
            .then((m) => m.Profile),
      },

      {
        path: 'liked-songs',
        loadComponent: () =>
          import('./features/user/liked-songs/liked-songs')
            .then(m => m.LikedSongs),
      },
      {
        path: 'playlists',
        loadComponent: () =>
          import('./features/user/playlists/playlists')
            .then(m => m.Playlists),
      },
      {
        path: 'playlists/:id',
        loadComponent: () =>
          import('./features/user/playlist-details/playlist-details')
            .then(m => m.PlaylistDetails),
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
