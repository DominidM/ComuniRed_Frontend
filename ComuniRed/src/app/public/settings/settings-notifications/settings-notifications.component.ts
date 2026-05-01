import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/services/change.service';

interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-notifications.component.html',
  styleUrls: ['./settings-notifications.component.css'],
})
export class SettingsNotificationsComponent {
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

  constructor(private alertService: AlertService) {}

  toggleNotification(id: string): void {
    const notif = this.notificaciones.find((n) => n.id === id);
    if (notif) notif.activo = !notif.activo;
  }

  async save(): Promise<void> {
    const confirmado = await this.alertService.confirm(
      '¿Guardar cambios?',
      '¿Estás seguro de que deseas actualizar las notificaciones?',
      'Sí, guardar',
      'Cancelar',
    );

    if (!confirmado) return;

    this.alertService.success('Configuración de notificaciones guardada');
  }

  cancel(): void {
    this.alertService.info('Cambios cancelados');
  }
}
