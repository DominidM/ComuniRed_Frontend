import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './soporte-sidebar.component.html',
  styleUrls: ['./soporte-sidebar.component.css']
})
export class SoporteSidebarComponent implements OnInit {
  usuario: Usuario | null = null;

  menuItems = [
    { 
      label: 'Clasificacion',
      icon: 'bi-tags-fill',  
      route: '/soporte/clasificacion' 
    },
    { 
      label: 'Seguimiento',
      icon: 'bi-clock-history', 
      route: '/soporte/seguimiento' 
    },
    { 
      label: 'Comentarios', 
      icon: 'bi-chat-dots', 
      route: '/soporte/comentarios' 
    },
    { 
      label: 'Mi Perfil', 
      icon: 'bi-person-circle', 
      route: '/soporte/perfil' 
    }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.usuarioService.getUser();
  }

  getImagenUrl(foto?: string): string {
    return foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }

  onSalir(): void {
    const confirmar = confirm('¿Estas seguro de cerrar sesion?');
    if (confirmar) {
      this.usuarioService.logout();
      this.router.navigate(['/login']);
    }
  }

  onPerfilClick(): void {
    this.router.navigate(['/soporte/perfil']);
  }
}
