import { Routes } from '@angular/router';

import { authGuard, unauthGuard } from './core/auth/auth.guard';

import { Shell } from './layout/shell/shell';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((module) => module.Login),
    canActivate: [unauthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register').then((module) => module.Register),
    canActivate: [unauthGuard],
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth/callback/auth-callback').then((module) => module.AuthCallback),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'feed',
        loadComponent: () => import('./pages/feed/feed').then((module) => module.Feed),
      },
      {
        path: 'communities',
        loadComponent: () =>
          import('./pages/communities/communities').then((module) => module.Communities),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/projects/projects').then((module) => module.Projects),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./pages/projects/project-details').then((module) => module.ProjectDetails),
      },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat').then((module) => module.Chat),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((module) => module.Profile),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then((module) => module.Settings),
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search').then((module) => module.Search),
      },
      {
        path: 'privacy',
        loadComponent: () => import('./pages/legal/legal').then((module) => module.Legal),
        data: { section: 'privacy' },
      },
      {
        path: 'terms',
        loadComponent: () => import('./pages/legal/legal').then((module) => module.Legal),
        data: { section: 'terms' },
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found').then((module) => module.NotFound),
      },
    ],
  },
];
