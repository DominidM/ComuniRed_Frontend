import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  query = '';
  isDark = false;
  notificationCount = 5;
  logoUrl = 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1761270927/fcd83bdf-0f03-44bf-9f55-7cfdc8244e99.png';
  userAvatarUrl = 'https://ui-avatars.com/api/?name=ComuniRed&background=0B3B36&color=fff';

  @Output() search = new EventEmitter<string>();

  private debounceTimer?: any;
  private debounceMs = 350;

  constructor() {}

ngOnInit(): void {
  const saved = localStorage.getItem('theme') || 'light';
  this.isDark = saved === 'dark';
  document.documentElement.classList.toggle('dark', this.isDark);
}

  onQueryChange(value: any): void {
    if (value && typeof value !== 'string' && (value as Event).target) {
      const target = (value as Event).target as HTMLInputElement;
      this.query = target.value;
    } else {
      this.query = (value ?? '').toString();
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.search.emit(this.query.trim());
    }, this.debounceMs);
  }

  openNotifications(): void {
    console.log('Abrir notificaciones');
    this.notificationCount = 0;
  }

toggleTheme() {
  document.documentElement.classList.toggle('dark');
  this.isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
}

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const appRoot = document.querySelector('app-root');

    if (isDark) {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      if (appRoot) appRoot.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      if (appRoot) appRoot.classList.remove('dark');
    }
  }

  openProfile(): void {
    console.log('Abrir perfil');
  }

  goHome(): void {
    console.log('Ir a inicio');
  }
}