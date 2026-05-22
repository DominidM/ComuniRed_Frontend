import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

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

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  openNotifications(): void {
    console.log('Abriendo notificaciones...');
  }
}
