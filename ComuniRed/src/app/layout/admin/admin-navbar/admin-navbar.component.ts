import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
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
  @Input() avatarUrl: string = '';
  @Input() isDarkMode: boolean = false;
  @Input() notificationCount: number = 0;

  @Output() toggleThemeClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();

  accOpen = false;
  textScale = 1;
  isHighContrast = false;
  isReducedMotion = false;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (this.accOpen && e.key === 'Escape') this.accOpen = false;
  }

  ngOnInit(): void {
    this.cargarAccesibilidad();
  }

  onToggleTheme(): void {
    this.toggleThemeClick.emit();
  }

  onLogout(): void {
    this.logoutClick.emit();
  }

  onNotifications(): void {
    this.notificationsClick.emit();
  }

  toggleAcc(): void {
    this.accOpen = !this.accOpen;
  }

  private cargarAccesibilidad(): void {
    const savedScale = parseFloat(localStorage.getItem('acc-textScale') || '1');
    this.textScale = isNaN(savedScale) ? 1 : savedScale;
    this.isHighContrast = localStorage.getItem('acc-highContrast') === '1';
    this.isReducedMotion = localStorage.getItem('acc-reducedMotion') === '1';
    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    if (this.isHighContrast) document.documentElement.classList.add('high-contrast');
    if (this.isReducedMotion) document.documentElement.classList.add('reduced-motion');
  }

  increaseText(): void {
    this.textScale = Math.min(1.6, +(this.textScale + 0.1).toFixed(2));
    this.applyTextScale();
  }

  decreaseText(): void {
    this.textScale = Math.max(0.8, +(this.textScale - 0.1).toFixed(2));
    this.applyTextScale();
  }

  resetText(): void {
    this.textScale = 1;
    this.applyTextScale();
    localStorage.removeItem('acc-textScale');
  }

  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    document.documentElement.classList.toggle('high-contrast', this.isHighContrast);
    this.isHighContrast
      ? localStorage.setItem('acc-highContrast', '1')
      : localStorage.removeItem('acc-highContrast');
  }

  toggleReducedMotion(): void {
    this.isReducedMotion = !this.isReducedMotion;
    document.documentElement.classList.toggle('reduced-motion', this.isReducedMotion);
    this.isReducedMotion
      ? localStorage.setItem('acc-reducedMotion', '1')
      : localStorage.removeItem('acc-reducedMotion');
  }

  private applyTextScale(): void {
    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    localStorage.setItem('acc-textScale', String(this.textScale));
  }
}
