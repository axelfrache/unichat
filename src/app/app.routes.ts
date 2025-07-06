import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/forum', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login.component').then(c => c.LoginComponent)
  },
  { 
    path: 'forum', 
    loadComponent: () => import('./forum/forum.component').then(c => c.ForumComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'forum/new-post', 
    loadComponent: () => import('./forum/new-post/new-post.component').then(c => c.NewPostComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'forum/post/:id', 
    loadComponent: () => import('./forum/post-detail/post-detail.component').then(c => c.PostDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'forum/categories', 
    loadComponent: () => import('./categories/categories-list.component').then(c => c.CategoriesListComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/forum' }
];
