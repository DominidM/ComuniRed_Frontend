import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { label: 'Inicio', icon: 'trending_up', route: '/public/feed' },
    { label: 'Tendencias', icon: 'home', route: '/public/home' },
    { label: 'Notificaciones', icon: 'notifications', route: '/public/notifications' },
    { label: 'Perfil', icon: 'person', route: '/public/profile/1' },
    { label: 'Configuración', icon: 'settings', route: '/public/settings' },
    { label: 'Ayuda', icon: 'help_outline', route: '/public/help' },
  ];
}
