import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/splash-screen/splash-screen.component').then(m => m.SplashScreenComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
    {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage),
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.page').then(m => m.MenuPage),
    canActivate: [authGuard],
  },
  {
    path: 'survey',
    loadComponent: () => import('./pages/survey/survey.page').then( m => m.SurveyPage),
    canActivate: [authGuard]
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed.page').then( m => m.FeedPage),
    canActivate: [authGuard]
  },  {
    path: 'invite',
    loadComponent: () => import('./pages/invite/invite.page').then( m => m.InvitePage)
  }




];