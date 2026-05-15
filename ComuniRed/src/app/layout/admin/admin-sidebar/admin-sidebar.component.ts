import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface AdminMenuItem {
  label: string;
  route: string;
  exact?: boolean;
  icon: string;
  roles?: ('admin' | 'soporte')[];
  externalNav?: boolean;
}

interface AdminMenuSection {
  title: string;
  items: AdminMenuItem[];
  roles?: ('admin' | 'soporte')[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
})
export class AdminSidebarComponent {
  @Input() isAdmin = false;
  @Input() isSoporte = false;

  @Output() exportPdfClick = new EventEmitter<void>();

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  readonly menuSections: AdminMenuSection[] = [
    {
      title: 'Principal',
      items: [
        {
          label: 'Dashboard',
          route: '/admin/dashboard',
          exact: true,
          icon: 'dashboard',
        },
        {
          label: 'Mapa General',
          route: '/admin/mapa',
          icon: 'map',
        },
        {
          label: 'Vista pública',
          route: '/public/home',
          icon: 'public',
          externalNav: true,
        },
      ],
    },
    {
      title: 'Gestión de Quejas',
      items: [
        {
          label: 'Quejas',
          route: '/admin/queja',
          icon: 'quejas',
        },
        {
          label: 'Asignaciones',
          route: '/admin/asignacion',
          icon: 'asignaciones',
        },
        {
          label: 'Reels',
          route: '/admin/reel',
          icon: 'reel',
        },
        {
          label: 'Auditoría',
          route: '/admin/auditoria',
          icon: 'auditoria',
        },
      ],
    },
    {
      title: 'Configuración',
      roles: ['admin'],
      items: [
        {
          label: 'Categorías',
          route: '/admin/categoria',
          icon: 'categoria',
          roles: ['admin'],
        },
        {
          label: 'Estados de Queja',
          route: '/admin/estado-queja',
          icon: 'estado',
          roles: ['admin'],
        },
        {
          label: 'Tipos de Reacción',
          route: '/admin/tipo-reaccion',
          icon: 'reaccion',
          roles: ['admin'],
        },
        {
          label: 'Configuración',
          route: '/admin/configuracion',
          icon: 'config',
          roles: ['admin'],
        },
      ],
    },
    {
      title: 'Usuarios y Permisos',
      roles: ['admin', 'soporte'],
      items: [
        {
          label: 'Usuarios',
          route: '/admin/usuario',
          icon: 'usuarios',
          roles: ['admin'],
        },
        {
          label: 'Roles',
          route: '/admin/rol',
          icon: 'roles',
          roles: ['admin'],
        },
        {
          label: 'Panel Soporte',
          route: '/soporte',
          icon: 'soporte',
          roles: ['soporte'],
        },
      ],
    },
  ];

  onExportPdf(): void {
    this.exportPdfClick.emit();
  }

  onNavigate(item: AdminMenuItem, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (item.externalNav) {
      window.location.href = item.route;
      return;
    }

    this.router.navigateByUrl(item.route).catch(console.error);
  }

  canShowSection(section: AdminMenuSection): boolean {
    if (!section.roles || section.roles.length === 0) return true;
    return section.roles.some((role) => this.hasRole(role));
  }

  canShowItem(item: AdminMenuItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((role) => this.hasRole(role));
  }

  private hasRole(role: 'admin' | 'soporte'): boolean {
    if (role === 'admin') return this.isAdmin;
    if (role === 'soporte') return this.isSoporte;
    return false;
  }

  trackBySection(_: number, section: AdminMenuSection): string {
    return section.title;
  }

  trackByItem(_: number, item: AdminMenuItem): string {
    return `${item.label}-${item.route}`;
  }

  getSafeIconSvg(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getIconSvgRaw(icon));
  }

  private getIconSvgRaw(icon: string): string {
    const icons: Record<string, string> = {
      dashboard: `
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      `,
      map: `
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      `,
      public: `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `,
      quejas: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`,
      asignaciones: `
        <polyline points="16 3 21 3 21 8"></polyline>
        <line x1="4" y1="20" x2="21" y2="3"></line>
        <polyline points="21 16 21 21 16 21"></polyline>
        <line x1="15" y1="15" x2="21" y2="21"></line>
        <line x1="4" y1="4" x2="9" y2="9"></line>
      `,
      auditoria: `
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      `,
      categoria: `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>`,
      estado: `
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      `,
      reaccion: `
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      `,
      config: `<circle cx="12" cy="12" r="3"></circle>`,
      usuarios: `
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      `,
      roles: `
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      `,
      reel: `
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      `,
      soporte: `
        <path d="M18 10c0-3.31-2.69-6-6-6s-6 2.69-6 6"></path>
        <path d="M4 10h4v6H4z"></path>
        <path d="M16 10h4v6h-4z"></path>
        <path d="M12 20a2 2 0 0 0 2-2"></path>
      `,
    };

    return icons[icon] || icons['dashboard'];
  }
}