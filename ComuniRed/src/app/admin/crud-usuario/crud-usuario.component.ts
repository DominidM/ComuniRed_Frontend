import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { UsuarioService } from '../../services/usuario.service'; // Crea tu servicio real
// import { RolService } from '../../services/rol.service'; // Para obtener los roles

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  rol_nombre?: string;
}

interface Rol {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-crud-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-usuario.component.html',
  styleUrls: ['./crud-usuario.component.css']
})
export class CrudUsuarioComponent implements OnInit {
  usuarios: Usuario[] = [
    { id: 1, nombre: 'Franco', email: 'Acceso total al sistema', rol_id: 123, rol_nombre: 'Admin'},
    { id: 2, nombre: 'Jeremy', email: 'Acceso total al sistema', rol_id: 321, rol_nombre: 'Admin'},
    { id: 3, nombre: 'Axel', email: 'Acceso total al sistema', rol_id: 231, rol_nombre: 'Admin'},
  ];
  roles: Rol[] = [
    { id: 1, nombre: 'Admin'}
    ];
  showModal = false;
  editingUsuario: Usuario | null = null;
  usuarioData: Partial<Usuario & { password?: string }> = {};

  // constructor(private usuarioService: UsuarioService, private rolService: RolService) {}
  constructor() {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadRoles();
  }

  loadUsuarios() {
    // Ejemplo con tu servicio real:
    // this.usuarioService.getUsuarios().subscribe(data => { this.usuarios = data; });
    // Demo:
    this.usuarios = [];
  }

  loadRoles() {
    // Ejemplo con tu servicio real:
    // this.rolService.getRoles().subscribe(data => { this.roles = data; });
    // Demo:
    this.roles = [];
  }

  openAddModal() {
    this.editingUsuario = null;
    this.usuarioData = {};
    this.showModal = true;
  }

  openEditModal(usuario: Usuario) {
    this.editingUsuario = usuario;
    this.usuarioData = { ...usuario };
    delete this.usuarioData.password;
    this.showModal = true;
  }

  saveUsuario() {
    if (!this.usuarioData.nombre || !this.usuarioData.email || !this.usuarioData.rol_id) return;
    if (this.editingUsuario) {
      // Actualiza en tu API
      // this.usuarioService.updateUsuario(this.editingUsuario.id, this.usuarioData).subscribe(() => this.loadUsuarios());
    } else {
      // Inserta en tu API
      // this.usuarioService.createUsuario(this.usuarioData).subscribe(() => this.loadUsuarios());
    }
    this.closeModal();
  }

  deleteUsuario(usuario: Usuario) {
    if (confirm(`¿Seguro que deseas eliminar el usuario "${usuario.nombre}"?`)) {
      // this.usuarioService.deleteUsuario(usuario.id).subscribe(() => this.loadUsuarios());
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingUsuario = null;
    this.usuarioData = {};
  }
}