import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeComponent,
  Alert,
  ConfirmDialog,
} from '../../../shared/components/change/change.component';
import { ModalStateService } from '../../../shared/services/modal-state.service';

interface PrivacySetting {
  id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangeComponent],
  templateUrl: './settings-privacy.component.html',
  styleUrl: './settings-privacy.component.css',
})
export class SettingsPrivacyComponent implements OnDestroy {
  privacySettings: PrivacySetting[] = [
    {
      id: 'public-profile',
      titulo: 'Perfil Público',
      descripcion: 'Permite que otros vean tu perfil',
      activo: true,
    },
    {
      id: 'show-email',
      titulo: 'Mostrar Email',
      descripcion: 'Muestra tu email en tu perfil público',
      activo: false,
    },
    {
      id: 'show-location',
      titulo: 'Mostrar Ubicación',
      descripcion: 'Permite que otros vean tu ubicación general',
      activo: true,
    },
  ];

  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;

  constructor(private modalState: ModalStateService) {}

  ngOnDestroy(): void {
    this.modalState.close();
  }

  togglePrivacy(id: string): void {
    const setting = this.privacySettings.find((s) => s.id === id);
    if (setting) setting.activo = !setting.activo;
  }

  save(): void {
    this.confirmDialog = {
      title: '¿Guardar cambios?',
      message: '¿Estás seguro de que deseas actualizar tu privacidad?',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    };
    this.modalState.open();
  }

  onConfirmSave(): void {
    this.confirmDialog = null;
    this.modalState.close();
    this.showAlert('success', 'Configuración de privacidad guardada');
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