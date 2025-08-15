import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    canActivate: [authGuard] 
  },
];