import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CrudRolComponent } from './admin/crud-rol/crud-rol.component';
import { CrudUsuarioComponent } from './admin/crud-usuario/crud-usuario.component';
import { CrudEstadoQuejaComponent } from './admin/crud-estado-queja/crud-estado-queja.component';
import { CrudQuejaComponent } from './admin/crud-queja/crud-queja.component';
import { CrudAsignacionComponent } from './admin/crud-asignacion/crud-asignacion.component';
import { CrudTipoReaccionComponent } from './admin/crud-tipo-reaccion/crud-tipo-reaccion.component';
import { CrudReaccionComponent } from './admin/crud-reaccion/crud-reaccion.component';
import { PublicComponent } from './public/public.component';

import { SoporteComponent } from './soporte/soporte.component';
import { EditarPerfilComponent } from './soporte/edit-profile/editar-perfil.component';
import { SoporteHomeComponent } from './soporte/home/soporte-home.component';
// Componentes públicos tipo red social
import { FeedComponent } from './public/feed/feed.component';
import { ProfileComponent } from './public/profile/profile.component';
import { TrendingComponent } from './public/trending/trending.component';
import { NotificationsComponent } from './public/notifications/notifications.component';
import { SettingsComponent } from './public/settings/settings.component';
import { HelpComponent } from './public/help/help.component';
import { ReportStatsComponent } from './soporte/home/report-stats/report-stats.component';

import { AuthGuard } from './guards/auth.guard';

/*
  Notes:
  - AuthGuard expects UsuarioService.getToken() and UsuarioService.getRoles() to be available.
  - Use role IDs or role names consistently. Below I used role IDs (examples you provided earlier).
  - If you want to protect every child route under a parent, apply canActivateChild on the parent (used below).
*/

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin area: protected, only users with ADMIN role_id can access children
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AuthGuard],
    data: { roles: ['68ca68c40bc4d9ca3267b667'] }, // admin rol_id (adjust if you use role names)
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rol', component: CrudRolComponent },
      { path: 'usuario', component: CrudUsuarioComponent },
      { path: 'estado-queja', component: CrudEstadoQuejaComponent },
      { path: 'queja', component: CrudQuejaComponent },
      { path: 'asignacion', component: CrudAsignacionComponent },
      { path: 'tipo-reaccion', component: CrudTipoReaccionComponent },
      { path: 'reaccion', component: CrudReaccionComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Public area: no auth required
  {
    path: 'public',
    component: PublicComponent,
    children: [
      { path: 'home', component: FeedComponent },
      { path: 'trending', component: TrendingComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'help', component: HelpComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // Soporte area: protected, only soporte role can access children
  {
    path: 'soporte',
    component: SoporteComponent,
    canActivateChild: [AuthGuard],
    data: { roles: ['68ca68bb0bc4d9ca3267b665'] }, // soporte rol_id (adjust if needed)
    children: [
      { path: 'home', component: SoporteHomeComponent },
      { path: 'editar-perfil/:nombre', component: EditarPerfilComponent },
      // add other soporte children here and protect them via route data if needed
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // Default route -> redirect to login (or change to /public/home if you prefer)
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Fallback
  { path: '**', redirectTo: '/login' }
];