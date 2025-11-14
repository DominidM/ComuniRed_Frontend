import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './soporte-header.component.html',
  styleUrls: ['./soporte-header.component.css']
})
export class SoporteHeaderComponent implements OnInit {

  @Output() principal = new EventEmitter<void>();
  @Output() modificar = new EventEmitter<void>();
  @Output() salir = new EventEmitter<void>();

  usuario: Usuario | null = null;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    const userLocal = this.usuarioService.getUser();
    if (userLocal?.id) {
      this.usuarioService.obtenerUsuarioPorId(userLocal.id).subscribe({
        next: (data) => (this.usuario = data),
        error: (err) => console.error('Error al obtener usuario:', err)
      });
    } else {
      this.usuario = userLocal;
    }
  }

  onPrincipal() {
    this.principal.emit();
  }

  onModificar() {
    this.modificar.emit();
  }

  onSalir() {
    this.salir.emit();
  }

  getImagenUrl(foto?: string): string {
    return foto
      ? foto
      : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }
}
