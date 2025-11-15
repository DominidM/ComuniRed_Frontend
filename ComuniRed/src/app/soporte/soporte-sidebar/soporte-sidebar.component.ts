import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './soporte-sidebar.component.html',
  styleUrls: ['./soporte-sidebar.component.css']
})
export class SoporteSidebarComponent implements OnInit {
  usuario: Usuario | null = null;

  menuItems = [
    { 
      label: 'Editar Reportes', 
      icon: 'edit', 
      route: '/soporte/reporte-editar' 
    },
    { 
      label: 'Clasificacion',
      icon: 'label',  
      route: '/soporte/clasificacion' 
    },
    /*{ 
      label: 'Validacion', 
      icon: 'description', 
      route: '/soporte/validacion' 
    },*/
    { 
      label: 'Seguimiento',
      icon: 'schedule', 
      route: '/soporte/seguimiento' 
    },
    { 
      label: 'Mi Perfil', 
      icon: 'person', 
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
}
