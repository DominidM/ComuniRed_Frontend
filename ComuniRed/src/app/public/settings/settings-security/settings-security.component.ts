import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeComponent,
  Alert,
  ConfirmDialog
} from '../../../shared/components/change/change.component';
import { ModalStateService } from '../../../shared/services/modal-state.service';

@Component({
  selector: 'app-settings-security',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangeComponent],
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css']
})
export class SettingsSecurityComponent implements OnDestroy {
  twoFactor = false;
  guardando = false;

  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;

  constructor(private modalState: ModalStateService) {}

  ngOnDestroy(): void {
    this.modalState.close();
  }

  cancel(): void {
    this.twoFactor = false;
    this.showAlert('info', 'Cambios cancelados');
  }

  save(): void {
    this.confirmDialog = {
      title: '¿Guardar cambios?',
      message: '¿Estás seguro de que deseas actualizar la seguridad de tu cuenta?',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar'
    };
    this.modalState.open();
  }

  onConfirmSave(): void {
    this.confirmDialog = null;
    this.modalState.close();
    this.guardando = true;

    setTimeout(() => {
      this.guardando = false;
      this.showAlert('success', 'Configuración de seguridad guardada exitosamente');
    }, 1500);
  }

  onCancelSave(): void {
    this.confirmDialog = null;
    this.modalState.close();
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter(a => a !== alert);
  }

  private showAlert(type: Alert['type'], message: string, duration = 4000): void {
    const alert: Alert = { type, message, duration };
    this.alerts.push(alert);

    setTimeout(() => {
      this.removeAlert(alert);
    }, duration);
  }
}