import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../../../../services/usuario.service';

@Component({
  selector: 'app-perfil-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-header.component.html',
  styleUrls: ['./perfil-header.component.css']
})
export class PerfilHeaderComponent implements OnInit {
  @Output() principal = new EventEmitter<void>();
  @Output() modificar = new EventEmitter<void>();
  @Output() salir = new EventEmitter<void>();

  usuario: Usuario | null = null;
  mostrarMenu = false;

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

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  onPrincipal() {
    this.principal.emit();
    this.mostrarMenu = false;
  }

  onModificar() {
    this.modificar.emit();
    this.mostrarMenu = false;
  }

  onSalir() {
    this.salir.emit();
    this.mostrarMenu = false;
  }

  getImagenUrl(foto?: string): string {
    return foto
      ? foto
      : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }
}
