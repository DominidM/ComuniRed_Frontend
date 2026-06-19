import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  Input,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { ThemeService } from '../../../services/theme.service';
import { NotificacionService } from '../../../services/notificacion.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();
  @Input() modalActive = false;

  query = '';
  notificationCount = 0;
  private notifSub?: Subscription;
  logoUrl =
    'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1778266727/WhatsApp_Image_2026-05-08_at_12.35.24_PM-removebg-preview_sga0m0.png';
  showSearchResults = false;
  searchResults: Usuario[] = [];
  searching = false;
  currentUserId?: string;

  private debounceTimer?: any;
  private debounceMs = 350;

  avatarUrl = '';
  initials = 'CR';

  showUserModal = false;
  selectedUser: Usuario | null = null;

  accOpen = false;
  textScale = 1;
  isHighContrast = false;
  isReducedMotion = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService,
    private notificacionService: NotificacionService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const user = this.usuarioService.getUser();
    if (user) {
      this.currentUserId = (user as any).id;
      this.avatarUrl = this.usuarioService.obtenerFotoMiniatura(user.foto_perfil, 44);
      this.initials =
        `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase() || 'CR';
      this.cargarContadorNotificaciones();
      this.suscribirseANotificaciones();
    }
    this.cargarAccesibilidad();
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.notifSub?.unsubscribe();
  }

  private cargarContadorNotificaciones(): void {
    if (!this.currentUserId) return;
    this.notificacionService.contarNoLeidas(this.currentUserId).subscribe({
      next: (count) => (this.notificationCount = count ?? 0),
      error: () => {},
    });
  }

  private suscribirseANotificaciones(): void {
    if (!this.currentUserId) return;
    this.notifSub = this.notificacionService
      .suscribirseANotificaciones(this.currentUserId)
      .subscribe({
        next: (notif) => {
          if (notif) this.notificationCount++;
        },
        error: () => {},
      });
  }

  canInteract(): boolean {
    return !this.modalActive;
  }

  onMenuToggle(): void {
    if (!this.canInteract()) return;
    this.menuToggle.emit();
  }

  onQueryChange(value: any): void {
    if (!this.canInteract()) return;

    if (value && typeof value !== 'string' && (value as Event).target) {
      this.query = ((value as Event).target as HTMLInputElement).value;
    } else {
      this.query = (value ?? '').toString();
    }

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (!this.query.trim()) {
      this.showSearchResults = false;
      this.searchResults = [];
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.performSearch(this.query.trim());
    }, this.debounceMs);
  }

  performSearch(term: string): void {
    if (!this.canInteract() || !term) return;

    this.searching = true;
    this.showSearchResults = true;

    this.seguimientoService.buscarUsuarios(term, 0, 10).subscribe({
      next: (pageData) => {
        this.searchResults = pageData.content || [];
        this.searching = false;
      },
      error: () => {
        this.searching = false;
        this.searchResults = [];
      },
    });
  }

  selectResult(user: Usuario): void {
    if (!this.canInteract()) return;

    this.showSearchResults = false;
    this.query = '';
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  goToProfile(): void {
    if (!this.selectedUser) return;
    const id = this.selectedUser.id;
    this.closeUserModal();
    id === this.currentUserId
      ? this.router.navigate(['/public/profile'])
      : this.router.navigate(['/public/user-profile', id]);
  }

  calcularEdad(fecha?: string): number | null {
    if (!fecha) return null;
    return this.usuarioService.calcularEdad(fecha);
  }

  obtenerFoto(foto?: string): string {
    return this.usuarioService.obtenerFotoMiniatura(foto, 120);
  }

  closeSearch(): void {
    if (!this.canInteract()) return;
    this.showSearchResults = false;
  }

  getResultName(user: Usuario): string {
    return `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario';
  }

  openNotifications(): void {
    if (!this.canInteract()) return;
    this.router.navigate(['/public/notifications']);
    this.notificationCount = 0;
  }

  goMessages(): void {
    if (!this.canInteract()) return;
    this.router.navigate(['/public/messages']);
  }

  toggleTheme(): void {
    if (!this.canInteract()) return;
    this.themeService.toggleTheme();
  }

  goHome(): void {
    if (!this.canInteract()) return;
    this.router.navigate(['/public/home']);
  }

  trackByResult(index: number, user: Usuario): string {
    return user.id;
  }

  goProfile(): void {
    if (!this.canInteract()) return;
    this.router.navigate(['/public/profile']);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (this.accOpen && e.key === 'Escape') this.accOpen = false;
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

  toggleAcc(): void {
    this.accOpen = !this.accOpen;
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