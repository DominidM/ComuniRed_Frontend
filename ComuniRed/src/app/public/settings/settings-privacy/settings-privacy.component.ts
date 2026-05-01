import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/services/change.service';

interface PrivacySetting {
  id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-privacy.component.html',
  styleUrl: './settings-privacy.component.css',
})
export class SettingsPrivacyComponent {
  privacySettings: PrivacySetting[] = [
    { id: 'public-profile', titulo: 'Perfil Público', descripcion: 'Permite que otros vean tu perfil', activo: true },
    { id: 'show-email', titulo: 'Mostrar Email', descripcion: 'Muestra tu email en tu perfil público', activo: false },
    { id: 'show-location', titulo: 'Mostrar Ubicación', descripcion: 'Permite que otros vean tu ubicación general', activo: true },
  ];

  constructor(private alertService: AlertService) {}

  togglePrivacy(id: string): void {
    const setting = this.privacySettings.find(s => s.id === id);
    if (setting) setting.activo = !setting.activo;
  }

  async save(): Promise<void> {
    const confirmado = await this.alertService.confirm(
      '¿Guardar cambios?',
      '¿Estás seguro de que deseas actualizar tu privacidad?',
      'Sí, guardar',
      'Cancelar'
    );

    if (!confirmado) return;

    this.alertService.success('Configuración de privacidad guardada');
  }

  cancel(): void {
    this.alertService.info('Cambios cancelados');
  }
}