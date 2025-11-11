import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { OlvideClaveComponent } from './auth/olvide-clave/olvide-clave.component';

import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CrudRolComponent } from './admin/crud-rol/crud-rol.component';
import { CrudUsuarioComponent } from './admin/crud-usuario/crud-usuario.component';

import { CrudEstadoQuejaComponent } from './admin/crud-estado-queja/crud-estado-queja.component';
import { CrudQuejaComponent } from './admin/crud-queja/crud-queja.component';
import { CrudAsignacionComponent } from './admin/crud-asignacion/crud-asignacion.component';
import { CrudTipoReaccionComponent } from './admin/crud-tipo-reaccion/crud-tipo-reaccion.component';
import { CrudReaccionComponent } from './admin/crud-reaccion/crud-reaccion.component';
import { CrudCategoriaComponent } from './admin/crud-categoria/crud-categoria.component';
import { CrudComentarioComponent } from './admin/crud-comentario/crud-comentario.component';
import { PublicComponent } from './public/public.component';

import { SoporteComponent } from './soporte/soporte.component';
import { EditarPerfilComponent } from './soporte/edit-profile/editar-perfil.component';
import { SoporteHomeComponent } from './soporte/home/soporte-home.component';
import { ReportStatsComponent } from './soporte/home/report-stats/report-stats.component';

// Componentes públicos tipo red social
import { FeedComponent } from './public/feed/feed.component';
import { ProfileComponent } from './public/profile/profile.component';
import { TrendingComponent } from './public/trending/trending.component';
import { NotificationsComponent } from './public/notifications/notifications.component';
import { HelpComponent } from './public/help/help.component';


import { SettingsComponent } from './public/settings/settings.component';

import { SettingsNotificationsComponent } from './public/settings/settings-notifications/settings-notifications.component';
import { SettingsPrivacyComponent } from './public/settings/settings-privacy/settings-privacy.component';
import { SettingsSecurityComponent } from './public/settings/settings-security/settings-security.component';
import { SettingsProfileComponent } from './public/settings/settings-profile/settings-profile.component';


// Reportes y exportaciones
import { ReportExportComponent } from './admin/report-export/report-export.component';
import { AdminReportsComponent } from './admin/admin-reports/admin-reports.component';
import { ExportCsvComponent } from './admin/export-csv/export-csv.component';

// Tools / maintenance components
import { SeedComponent } from './admin/tools/seed/seed.component';
import { BackupsComponent } from './admin/tools/backups/backups.component';
import { JobMonitorComponent } from './admin/tools/job-monitor/job-monitor.component';
import { ExportsHistoryComponent } from './admin/tools/exports-history/exports-history.component';

// Audit / configuration
import { AuditoriaComponent } from './admin/auditoria/auditoria.component';
import { ConfiguracionComponent } from './admin/configuracion/configuracion.component';

import { MapaGeneralComponent } from './admin/mapa-general/mapa-general.component';
import { CrudEvidenciaComponent } from './admin/crud-evidencia/crud-evidencia.component';

import { AuthGuard } from './guards/auth.guard';
import { ReelsComponent } from './public/reels/reels.component';
import { SuggestionsComponent } from './public/suggestions/suggestions.component';
import { MessageComponent } from './public/message/message.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'olvide-clave', component: OlvideClaveComponent },
  // Admin area: protected, only users with ADMIN role_id can access children
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AuthGuard],
    data: { roles: ['68ca68c40bc4d9ca3267b667'] },
    children: [
      // Principal
      { path: 'dashboard', component: DashboardComponent },
      { path: 'mapa', component: MapaGeneralComponent },

      // Gestión de Quejas
      { path: 'queja', component: CrudQuejaComponent },
      { path: 'asignacion', component: CrudAsignacionComponent },
      { path: 'comentarios', component: CrudComentarioComponent },
      { path: 'evidencias', component: CrudEvidenciaComponent },

      // Configuración
      { path: 'categoria', component: CrudCategoriaComponent },
      { path: 'estado-queja', component: CrudEstadoQuejaComponent },
      { path: 'reaccion', component: CrudReaccionComponent },
      { path: 'tipo-reaccion', component: CrudTipoReaccionComponent },

      // Usuarios y Permisos
      { path: 'usuario', component: CrudUsuarioComponent },
      { path: 'rol', component: CrudRolComponent },

      // Reportes y Exportaciones
      { path: 'reporte-export', component: ReportExportComponent },
      { path: 'reportes', component: AdminReportsComponent },
      { path: 'export-csv', component: ExportCsvComponent },

      // Tools / Mantenimiento
      { path: 'seed', component: SeedComponent },
      { path: 'backups', component: BackupsComponent },
      { path: 'job-monitor', component: JobMonitorComponent },
      { path: 'exports-history', component: ExportsHistoryComponent },

      // Auditoría y Configuración
      { path: 'auditoria', component: AuditoriaComponent },
      { path: 'configuracion', component: ConfiguracionComponent },

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
      { path: 'reels', component: ReelsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'suggestions', component: SuggestionsComponent },
      { path: 'messages', component: MessageComponent },
      { path: 'profile/:id', component: ProfileComponent},
      { path: 'help', component: HelpComponent },
      {
        path: 'settings',
        component: SettingsComponent,
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          { path: 'profile', component: SettingsProfileComponent },
          { path: 'notifications', component: SettingsNotificationsComponent },
          { path: 'privacy', component: SettingsPrivacyComponent },
          { path: 'security', component: SettingsSecurityComponent }
        ]
      },

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },


  // Soporte area: protected, only soporte role can access children
  {
    path: 'soporte',
    component: SoporteComponent,
    canActivateChild: [AuthGuard],
    data: { roles: ['68ca68bb0bc4d9ca3267b665'] },
    children: [
      { path: 'home', component: SoporteHomeComponent },
      { path: 'editar-perfil/:nombre', component: EditarPerfilComponent },
      { path: 'report-stats', component: ReportStatsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // Default route
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Fallback
  { path: '**', redirectTo: '/login' }
];