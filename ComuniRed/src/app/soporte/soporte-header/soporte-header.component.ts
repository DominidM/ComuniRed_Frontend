import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soporte-header.component.html',
  styleUrls: ['./soporte-header.component.css']
})
export class SoporteHeaderComponent implements OnInit {
  isDarkMode = false;
  notificationCount = 3;
  notificationsOpen = false;

  notifications = [
    { title: 'Nuevos reportes asignados', time: 'Hace 5 min' },
    { title: 'Un reporte fue resuelto', time: 'Hace 30 min' },
    { title: 'Hay reportes pendientes de revisión', time: 'Hace 2 h' }
  ];

  ngOnInit(): void {
  const savedTheme = localStorage.getItem('theme') || 'light';
  this.isDarkMode = savedTheme === 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

toggleTheme(): void {
  this.isDarkMode = !this.isDarkMode;
  const theme = this.isDarkMode ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
  openNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.notificationCount = 0;
    }
  }
}

