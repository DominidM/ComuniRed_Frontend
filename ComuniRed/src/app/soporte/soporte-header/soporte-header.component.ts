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

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    document.body.setAttribute('data-theme', savedTheme || 'light');
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  openNotifications(): void {
    console.log('Abriendo notificaciones...');
  }
}
