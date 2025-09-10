import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { PublicComponent } from './public/public.component';
import { SoporteComponent } from './soporte/soporte.component';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'public', component: PublicComponent },
  { path: 'soporte', component: SoporteComponent },
  { path: '', redirectTo: '/public', pathMatch: 'full' }
];