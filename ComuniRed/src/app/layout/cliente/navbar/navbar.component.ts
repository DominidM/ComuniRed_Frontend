import {
  Component,
  EventEmitter,
  Output,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuejaService } from '../../../services/queja.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ThemeService } from '../../../services/theme.service';

interface SearchResult {
  type: 'reporte' | 'persona';
  id: string;
  titulo?: string;
  nombre?: string;
  apellido?: string;
  foto_perfil?: string;
  categoria?: string;
  fecha?: string;
}

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

  query = '';
  notificationCount = 5;
  logoUrl =
    'https://res.cloudinary.com/dxuk9bogw/image/upload/v1761270927/fcd83bdf-0f03-44bf-9f55-7cfdc8244e99.png';

  showSearchResults = false;
  searchResults: SearchResult[] = [];
  searching = false;
  currentUserId?: string;

  private debounceTimer?: any;
  private debounceMs = 350;

  avatarUrl = '';
  initials = 'CR';

  constructor(
    private router: Router,
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    const user = this.usuarioService.getUser();
    if (user) this.currentUserId = (user as any).id;
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onQueryChange(value: any): void {
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
    if (!term || !this.currentUserId) return;

    this.searching = true;
    this.showSearchResults = true;

    this.quejaService.obtenerQuejas(this.currentUserId).subscribe({
      next: (quejas) => {
        const termLower = term.toLowerCase();

        const reportesResults: SearchResult[] = quejas
          .filter(
            (q) =>
              q.titulo.toLowerCase().includes(termLower) ||
              q.descripcion.toLowerCase().includes(termLower) ||
              q.categoria?.nombre.toLowerCase().includes(termLower),
          )
          .slice(0, 5)
          .map((q) => ({
            type: 'reporte' as const,
            id: q.id,
            titulo: q.titulo,
            categoria: q.categoria?.nombre,
            fecha: q.fecha_creacion,
          }));

        const usuariosMap = new Map<string, SearchResult>();
        quejas.forEach((q) => {
          if (q.usuario) {
            const nombreCompleto =
              `${q.usuario.nombre} ${q.usuario.apellido}`.toLowerCase();
            if (
              nombreCompleto.includes(termLower) &&
              !usuariosMap.has(q.usuario.id)
            ) {
              usuariosMap.set(q.usuario.id, {
                type: 'persona' as const,
                id: q.usuario.id,
                nombre: q.usuario.nombre,
                apellido: q.usuario.apellido,
                foto_perfil: q.usuario.foto_perfil,
              });
            }
          }
        });

        this.searchResults = [
          ...reportesResults,
          ...Array.from(usuariosMap.values()).slice(0, 5),
        ];
        this.searching = false;
      },
      error: () => {
        this.searching = false;
        this.searchResults = [];
      },
    });
  }

  selectResult(result: SearchResult): void {
    this.showSearchResults = false;
    this.query = '';

    if (result.type === 'reporte') {
      this.router.navigate(['/public/feed'], {
        queryParams: { reporte: result.id },
      });
    } else {
      result.id === this.currentUserId
        ? this.router.navigate(['/public/profile'])
        : this.router.navigate(['/public/user-profile', result.id]);
    }
  }

  closeSearch(): void {
    this.showSearchResults = false;
  }

  getResultTitle(result: SearchResult): string {
    return result.type === 'reporte'
      ? result.titulo || 'Reporte sin título'
      : `${result.nombre || ''} ${result.apellido || ''}`.trim() || 'Usuario';
  }

  getResultSubtitle(result: SearchResult): string {
    return result.type === 'reporte'
      ? result.categoria || 'Sin categoría'
      : 'Usuario de ComuniRed';
  }

  formatDate(dateString: string): string {
    const diffInHours = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 3600000,
    );
    if (diffInHours < 1) return 'hace unos minutos';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    if (diffInHours < 48) return 'hace 1 día';
    return `hace ${Math.floor(diffInHours / 24)} días`;
  }

  openNotifications(): void {
    this.router.navigate(['/public/notifications']);
    this.notificationCount = 0;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  goHome(): void {
    this.router.navigate(['/public/feed']);
  }

  trackByResult(index: number, result: SearchResult): string {
    return result.id;
  }

  goProfile(): void {
    this.router.navigate(['/public/profile']);
  }
}
