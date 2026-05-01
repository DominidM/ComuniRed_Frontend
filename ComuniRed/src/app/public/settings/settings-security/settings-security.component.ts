import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/services/change.service';

@Component({
  selector: 'app-settings-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css']
})
export class SettingsSecurityComponent {
  twoFactor = false;
  guardando = false;

  constructor(private alertService: AlertService) {}

  cancel(): void {
    this.twoFactor = false;
    this.alertService.info('Cambios cancelados');
  }

  async save(): Promise<void> {
    const confirmado = await this.alertService.confirm(
      '¿Guardar cambios?',
      '¿Estás seguro de que deseas actualizar la seguridad de tu cuenta?',
      'Sí, guardar',
      'Cancelar'
    );

    if (!confirmado) return;

    this.guardando = true;

    setTimeout(() => {
      this.guardando = false;
      this.alertService.success('Configuración de seguridad guardada exitosamente');
    }, 1500);
  }
}