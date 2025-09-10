import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminComponent } from './admin/admin.component';
import { PublicComponent } from './public/public.component';
import { SoporteComponent } from './soporte/soporte.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'public', component: PublicComponent },
  { path: 'soporte', component: SoporteComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];