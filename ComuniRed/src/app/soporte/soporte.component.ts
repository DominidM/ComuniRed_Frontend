import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css']
})
export class SoporteComponent implements OnInit {

  soporte: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // carga usuario guardado y pásalo al header
    this.soporte = this.usuarioService.getUser();
    // opcional: forzar login si no hay token
    // if (!this.usuarioService.isLoggedIn()) { this.router.navigate(['/login']); }
  }

  onModificarPerfil() {
    this.router.navigate(['/soporte/editar-perfil', this.soporte?.nombre ?? '']);
  }

  onPrincipal() {
    this.router.navigate(['/soporte/home']);
  }

  onSalir() {
    this.usuarioService.logout();
    this.router.navigate(['/login']);
  }
}