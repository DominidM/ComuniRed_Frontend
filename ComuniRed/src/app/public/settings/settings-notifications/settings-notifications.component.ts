import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeComponent,
  Alert,
  ConfirmDialog,
} from '../../../shared/components/change/change.component';
import { ModalStateService } from '../../../shared/services/modal-state.service';

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
export class SettingsNotificationsComponent implements OnDestroy {
  notificaciones: Notificacion[] = [
    {
      id: 'email',
      titulo: 'Notificaciones por Email',
      descripcion: 'Recibe actualizaciones por correo',
      activo: true,
    },
    {
      id: 'push',
      titulo: 'Notificaciones Push',
      descripcion: 'Recibe notificaciones en tu dispositivo',
      activo: true,
    },
    {
      id: 'comentarios',
      titulo: 'Nuevos Comentarios',
      descripcion: 'Cuando alguien comente en tus reportes',
      activo: true,
    },
    {
      id: 'reacciones',
      titulo: 'Nuevas Reacciones',
      descripcion: 'Cuando reaccionen a tus reportes',
      activo: true,
    },
    {
      id: 'zona',
      titulo: 'Nuevos Reportes en tu Zona',
      descripcion: 'Reportes cerca de tu ubicación',
      activo: false,
    },
    {
      id: 'estado',
      titulo: 'Actualización de Estado',
      descripcion: 'Cuando cambien el estado de tus reportes',
      activo: true,
    },
  ];

  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;

  constructor(private modalState: ModalStateService) {}

  ngOnDestroy(): void {
    this.modalState.close();
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
    this.showAlert('success', 'Configuración de notificaciones guardada');
  }

  onCancelSave(): void {
    this.confirmDialog = null;
    this.modalState.close();
  }

  cancel(): void {
    this.showAlert('info', 'Cambios cancelados');
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter((a) => a !== alert);
  }

  private showAlert(
    type: Alert['type'],
    message: string,
    duration = 4000
  ): void {
    const alert: Alert = { type, message, duration };
    this.alerts.push(alert);

    setTimeout(() => {
      this.removeAlert(alert);
    }, duration);
  }
}