import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Sample menu items - ajusta rutas/icons/labels según tu app
  menuItems = [
    { label: 'Inicio', route: '/home', icon: 'home', soft: false },
    { label: 'Tendencias', route: '/trends', icon: 'trending_up', soft: false },
    { label: 'Reels', route: '/reels', icon: 'videocam', soft: true },
    { label: 'Perfil', route: '/profile', icon: 'person', soft: false },
    { label: 'Sugerencias', route: '/suggestions', icon: 'lightbulb', soft: false },
    { label: 'Mensajes', route: '/messages', icon: 'chat', soft: false },
    { label: 'Configuración', route: '/settings', icon: 'settings', soft: false },
    { label: 'Ayuda', route: '/help', icon: 'help_outline', soft: true }
  ];

  // Sample user - reemplaza con tu servicio real
  user = {
    name: 'Dominid Mendoza',
    handle: '@dominidzero',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
  };

  @Output() logout = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  onSalir(): void {
    // Emite evento para que el padre maneje el cierre de sesión
    // O coloca aquí la llamada a tu AuthService.logout()
    console.log('Cerrar sesión solicitado');
    this.logout.emit();
  }
}