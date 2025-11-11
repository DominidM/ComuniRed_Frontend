import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioService } from '../../services/usuario.service';
import { Subscription } from 'rxjs';

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
export class SidebarComponent implements OnInit, OnDestroy {
  showModal = false;
  mostrarMenu = false;
  private readonly DEFAULT_AVATAR = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';

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
    { label: 'Reels', icon: 'video_library', route: '/public/reels' },
    { label: 'Perfil', icon: 'person', route: '/public/profile/1', soft: true },
    { label: 'Sugerencias', icon: 'post_add', route: '/public/suggestions', soft: true},
    { label: 'Mensajes', icon: 'message', route: '/public/messages' },
    { label: 'Configuración', icon: 'settings', route: '/public/settings' },
    { label: 'Ayuda', icon: 'help_outline', route: '/public/help' },
  ];

  user: { name: string; handle: string; avatarUrl: string } | null = null;
  
  private userSubscription?: Subscription;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();

    this.userSubscription = this.usuarioService.usuario$.subscribe({
      next: (usuario) => {
        console.log('Usuario actualizado en sidebar:', usuario);
        if (usuario) {
          this.actualizarVistaUsuario(usuario);
        } else {
          this.user = null;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  private cargarUsuario(): void {
    const u = this.usuarioService.getUser();
    if (u) {
      this.actualizarVistaUsuario(u);
    } else {
      this.user = {
        name: 'Tu Usuario',
        handle: '@tuusuario',
        avatarUrl: this.DEFAULT_AVATAR
      };
    }
  }

  private actualizarVistaUsuario(u: any): void {
    const nombre = u.nombre ?? '';
    const apellido = u.apellido ?? '';
    const email = u.email ?? '';
    let avatar = u.foto_perfil ?? '';

    if (avatar && avatar.trim() !== '') {
      if (this.usuarioService.esFotoCloudinary(avatar)) {
        avatar = this.usuarioService.obtenerFotoMiniatura(avatar, 40);
      }
    } else {
      avatar = this.DEFAULT_AVATAR;
    }

    this.user = {
      name: `${nombre} ${apellido}`.trim() || email,
      handle: email ? `@${email.split('@')[0]}` : '',
      avatarUrl: avatar
    };

    console.log('Vista de usuario actualizada:', this.user);
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

    const report = {
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

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  onModificar() {
    console.log('Modificar perfil');
    this.mostrarMenu = false;
    this.router.navigate(['/public/settings']);
  }

  onSalir() {
    this.usuarioService.logout();
    this.mostrarMenu = false;
    this.router.navigate(['/login']);
  }

  isActive(item: any) {
    return false;
  }
}
