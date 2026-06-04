import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';

import { Dashboard } from './pages/dashboard/dashboard';
import { Feed } from './pages/feed/feed';
import { Communities } from './pages/communities/communities';
import { Projects } from './pages/projects/projects';
import { ProjectDetails } from './pages/projects/project-details';
import { Chat } from './pages/chat/chat';
import { Profile } from './pages/profile/profile';
import { Settings } from './pages/settings/settings';

export const appRoutes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        component: Dashboard,
      },
      {
        path: 'feed',
        component: Feed,
      },
      {
        path: 'communities',
        component: Communities,
      },
      {
        path: 'projects',
        component: Projects,
      },
      {
        path: 'projects/:id',
        component: ProjectDetails,
      },
      {
        path: 'chat',
        component: Chat,
      },
      {
        path: 'profile',
        component: Profile,
      },
      {
        path: 'settings',
        component: Settings,
      },
    ],
  },
];