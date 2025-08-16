import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { authGuard } from './services/auth.guard';
import { AstaComponent } from './component/asta.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    canActivate: [authGuard]
  },
  {
    path: 'asta',
    component: AstaComponent,
    canActivate: [authGuard]
  },
];