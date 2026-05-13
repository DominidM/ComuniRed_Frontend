import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  @Input() userDisplay: string = 'Invitado';
  @Input() isDarkMode: boolean = false;

  @Output() toggleThemeClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  onToggleTheme(): void {
    this.toggleThemeClick.emit();
  }

  onLogout(): void {
    this.logoutClick.emit();
  }
}