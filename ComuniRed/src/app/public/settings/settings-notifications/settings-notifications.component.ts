import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeComponent,
  Alert,
  ConfirmDialog,
} from '../../../shared/components/change/change.component';
import { ModalStateService } from '../../../shared/services/modal-state.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Subscription } from 'rxjs';

interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangeComponent],
  templateUrl: './settings-notifications.component.html',
  styleUrls: ['./settings-notifications.component.css'],
})
export class SettingsNotificationsComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [
    { id: 'email', titulo: 'Notificaciones por Email', descripcion: 'Recibe actualizaciones por correo', activo: true },
    { id: 'push', titulo: 'Notificaciones Push', descripcion: 'Recibe notificaciones en tu dispositivo', activo: true },
    { id: 'comentarios', titulo: 'Nuevos Comentarios', descripcion: 'Cuando alguien comente en tus reportes', activo: true },
    { id: 'reacciones', titulo: 'Nuevas Reacciones', descripcion: 'Cuando reaccionen a tus reportes', activo: true },
    { id: 'zona', titulo: 'Nuevos Reportes en tu Zona', descripcion: 'Reportes cerca de tu ubicación', activo: false },
    { id: 'estado', titulo: 'Actualización de Estado', descripcion: 'Cuando cambien el estado de tus reportes', activo: true },
  ];

  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;
  isLoadingPrefs = true;
  private subs: Subscription[] = [];

  constructor(
    private modalState: ModalStateService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarPreferencias();
  }

  ngOnDestroy(): void {
    this.modalState.close();
    this.subs.forEach((s) => s.unsubscribe());
  }

  private cargarPreferencias(): void {
    const usuario = this.usuarioService.getUser();
    if (!usuario?.id) {
      this.isLoadingPrefs = false;
      return;
    }

    this.isLoadingPrefs = true;
    this.subs.push(
      this.usuarioService.obtenerPreferenciasNotificaciones(usuario.id).subscribe({
        next: (prefs) => {
          this.notificaciones = this.notificaciones.map((n) => ({
            ...n,
            activo: this.getPrefValue(prefs, n.id),
          }));
          this.isLoadingPrefs = false;
        },
        error: () => {
          this.isLoadingPrefs = false;
          this.showAlert('error', 'Error al cargar preferencias');
        },
      })
    );
  }

  private getPrefValue(prefs: any, id: string): boolean {
    const key = 'notificaciones' + id.charAt(0).toUpperCase() + id.slice(1);
    return prefs[key] !== false;
  }

  toggleNotification(id: string): void {
    const notif = this.notificaciones.find((n) => n.id === id);
    if (notif) notif.activo = !notif.activo;
  }

  save(): void {
    this.confirmDialog = {
      title: '¿Guardar cambios?',
      message: '¿Estás seguro de que deseas actualizar las notificaciones?',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    };
    this.modalState.open();
  }

  onConfirmSave(): void {
    this.confirmDialog = null;
    this.modalState.close();

    const usuario = this.usuarioService.getUser();
    if (!usuario?.id) {
      this.showAlert('error', 'Usuario no autenticado');
      return;
    }

    const toBackendKey = (id: string): string => {
      switch (id) {
        case 'email': return 'email';
        case 'push': return 'push';
        case 'comentarios': return 'comentarios';
        case 'reacciones': return 'reacciones';
        case 'zona': return 'zona';
        case 'estado': return 'estado';
        default: return id;
      }
    };

    const preferencias: any = {};
    this.notificaciones.forEach((n) => {
      preferencias[toBackendKey(n.id)] = n.activo;
    });

    this.subs.push(
      this.usuarioService.actualizarPreferenciasNotificaciones(usuario.id, preferencias).subscribe({
        next: () => this.showAlert('success', 'Configuración de notificaciones guardada'),
        error: () => this.showAlert('error', 'Error al guardar preferencias'),
      })
    );
  }

  onCancelSave(): void {
    this.confirmDialog = null;
    this.modalState.close();
  }

  cancel(): void {
    this.cargarPreferencias();
    this.showAlert('info', 'Cambios descartados');
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter((a) => a !== alert);
  }

  private showAlert(type: Alert['type'], message: string, duration = 4000): void {
    const alert: Alert = { type, message, duration };
    this.alerts.push(alert);
    setTimeout(() => this.removeAlert(alert), duration);
  }
}
