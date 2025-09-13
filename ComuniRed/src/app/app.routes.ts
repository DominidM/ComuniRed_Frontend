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

// Importa los componentes públicos tipo red social
import { HomeComponent } from './public/home/home.component';
import { FeedComponent } from './public/feed/feed.component';
import { ProfileComponent } from './public/profile/profile.component';
import { UserListComponent } from './public/user-list/user-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminComponent,
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
  {
    path: 'public',
    component: PublicComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'feed', component: FeedComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'user-list', component: UserListComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { 
    path: 'soporte', 
    component: SoporteComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];