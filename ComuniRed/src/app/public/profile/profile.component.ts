import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentTab = 'actividad';

  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    foto_perfil: string;
    fecha_registro: string | null;
  } | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser();

    if (u) {
      this.user = {
        id: (u as any).id,
        nombre: (u as any).nombre || 'Usuario',
        apellido: (u as any).apellido || '',
        email: (u as any).email || 'correo@ejemplo.com',
        foto_perfil: (u as any).foto_perfil || 'assets/img/default-avatar.png',
        fecha_registro: (u as any).fecha_registro || null
      };
      
      console.log('Usuario cargado:', this.user);
    } else {
      this.user = {
        id: '',
        nombre: 'Usuario',
        apellido: '',
        email: 'correo@ejemplo.com',
        foto_perfil: 'assets/img/default-avatar.png',
        fecha_registro: null
      };
    }
  }

  changeTab(tab: string): void {
    this.currentTab = tab;
  }


}
