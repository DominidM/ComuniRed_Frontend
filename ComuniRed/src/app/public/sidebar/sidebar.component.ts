import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioService } from '../../services/usuario.service';

interface Report {
  title: string;
  description: string;
  category: string;
  location: string;
  image?: File;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  showModal = false;
  mostrarMenu = false;

  // Modal Form State
  title = '';
  description = '';
  category = '';
  location = '';
  image: File | null = null;
  imagePreview: string | null = null;
  categories = ['Vías', 'Alumbrado', 'Grafitis', 'Semáforos', 'Otros'];

  menuItems = [
    { label: 'Inicio', icon: 'home', route: '/public/home' },
    { label: 'Tendencias', icon: 'trending_up', route: '/public/trending' },
    { label: 'Notificaciones', icon: 'notifications', route: '/public/notifications' },
    { label: 'Perfil', icon: 'person', route: '/public/profile/1' },
    { label: 'Configuración', icon: 'settings', route: '/public/settings' },
    { label: 'Ayuda', icon: 'help_outline', route: '/public/help' },
  ];

  // user mostrado en el sidebar (shape simple para la UI)
  user: { name: string; handle: string; avatarUrl: string } | null = null;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    // Obtén el usuario desde el service (token & user gestionados allí)
    const u = this.usuarioService.getUser();
    if (u) {
      // adapta los campos según tu objeto Usuario
      const nombre = (u as any).nombre ?? '';
      const apellido = (u as any).apellido ?? '';
      const email = (u as any).email ?? '';
      const avatar = (u as any).avatar_soporte ?? (u as any).avatar_cliente ?? 'https://randomuser.me/api/portraits/lego/1.jpg';
      this.user = {
        name: `${nombre} ${apellido}`.trim() || email,
        handle: email ? `@${email.split('@')[0]}` : '',
        avatarUrl: avatar
      };
    } else {
      // fallback (tu comportamiento actual)
      this.user = {
        name: 'Tu Usuario',
        handle: '@tuusuario',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
      };
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.image = null;
    this.imagePreview = null;
  }

  submitReport() {
    if (!this.title || !this.description || !this.category || !this.location) return;

    const report: Report = {
      title: this.title,
      description: this.description,
      category: this.category,
      location: this.location,
      image: this.image || undefined
    };

    console.log('Reporte creado (local):', report);
    this.closeModal();
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.category = '';
    this.location = '';
    this.removeImage();
  }

  // ==================== Menú usuario ====================
  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  onModificar() {
    console.log('Modificar perfil');
    this.mostrarMenu = false;
    // si quieres navegar a editar perfil:
    // this.router.navigate(['/public/profile/edit']);
  }

  onSalir() {
    // Cierra sesión con el UsuarioService (limpia token y user) y navega al login
    this.usuarioService.logout();
    this.mostrarMenu = false;
    this.router.navigate(['/login']);
  }
}