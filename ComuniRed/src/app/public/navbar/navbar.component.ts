import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  // public state
  query = '';
  isDark = false;
  notificationCount = 5; // ejemplo, cargar desde backend
  // logoUrl: usa la imagen que proporcionaste (Cloudinary)
  logoUrl = 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1761270927/fcd83bdf-0f03-44bf-9f55-7cfdc8244e99.png';
  userAvatarUrl = 'https://ui-avatars.com/api/?name=ComuniRed&background=0B3B36&color=fff';

  // emit search term to parent if you want
  @Output() search = new EventEmitter<string>();

  private debounceTimer?: any;
  private debounceMs = 350;

  constructor() {}

  onQueryChange(value: any) {
    // normalizar (acepta string o Event)
    if (value && typeof value !== 'string' && (value as Event).target) {
      const target = (value as Event).target as HTMLInputElement;
      this.query = target.value;
    } else {
      this.query = (value ?? '').toString();
    }

    // debounced emit
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.search.emit(this.query.trim());
    }, this.debounceMs);
  }

  openNotifications() {
    // abrir panel de notificaciones (implementar)
    console.log('Abrir notificaciones');
    // ejemplo: marcar como leidas y reiniciar contador
    this.notificationCount = 0;
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    const root = document.documentElement;
    if (this.isDark) {
      root.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
    }
  }

  openProfile() {
    // navegar al perfil o abrir menu
    console.log('Abrir perfil');
  }

  goHome() {
    // navegar a la home/dashboard
    console.log('Ir a inicio');
  }
}