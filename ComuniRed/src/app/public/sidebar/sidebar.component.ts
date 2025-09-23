import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { label: 'Inicio', icon: 'home', route: '/public/home' },
    { label: 'Tendencias', icon: 'trending_up', route: '/public/trending' },
    { label: 'Notificaciones', icon: 'notifications', route: '/public/notifications' },
    { label: 'Perfil', icon: 'person', route: '/public/profile/1' },
    { label: 'Configuración', icon: 'settings', route: '/public/settings' },
    { label: 'Ayuda', icon: 'help_outline', route: '/public/help' },
  ];

  user = {
    name: 'Tu Usuario',
    handle: '@tuusuario',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
  };
}