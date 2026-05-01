import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../shared/services/change.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  constructor(private router: Router, private alertService: AlertService) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  save() {
    this.alertService.success('Configuración guardada correctamente');
  }
}