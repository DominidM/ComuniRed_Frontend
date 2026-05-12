import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeComponent, Alert, ConfirmDialog } from '../../shared/components/change/change.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ChangeComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  tabs = [
    { label: 'Perfil', route: 'profile', icon: 'person' },
    { label: 'Notificaciones', route: 'notifications', icon: 'notifications' },
    { label: 'Privacidad', route: 'privacy', icon: 'lock' },
    { label: 'Seguridad', route: 'security', icon: 'security' }
  ];

  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  save() {
    this.showAlert('success', 'Configuración guardada correctamente');
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter(a => a !== alert);
  }

  onConfirmAction(): void {
    this.confirmDialog = null;
  }

  onCancelAction(): void {
    this.confirmDialog = null;
  }

  private showAlert(type: Alert['type'], message: string, duration = 4000): void {
    const alert: Alert = { type, message, duration };
    this.alerts.push(alert);

    setTimeout(() => {
      this.removeAlert(alert);
    }, duration);
  }
}