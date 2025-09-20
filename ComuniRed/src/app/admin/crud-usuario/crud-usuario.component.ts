import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario, UsuarioPage } from '../../services/usuario.service';

@Component({
  selector: 'app-crud-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-usuario.component.html',
  styleUrls: ['./crud-usuario.component.css'],
})
export class CrudUsuarioComponent {
  usuarios: Usuario[] = [];
  allUsuarios: Usuario[] = [];
  showModal = false;
  editingUsuario: Usuario | null = null;
  usuarioData: Partial<Usuario> = {};
  page = 0;
  size = 5;
  totalPages = 1;
  totalElements = 0;
  pageSizes = [5, 10, 20, 50];
  searchText: string = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.loadUsuarios();
  }

  trackByUsuarioId(index: number, usuario: any): any {
    return usuario.id;
  }

  loadUsuarios() {
    this.usuarioService.obtenerUsuarios(this.page, this.size).subscribe(pageData => {
      this.usuarios = pageData.content;
      this.allUsuarios = pageData.content;
      this.totalPages = pageData.totalPages;
      this.totalElements = pageData.totalElements;
    });
  }

  onPageSizeChange(event: any) {
    this.size = +event.target.value;
    this.page = 0;
    this.loadUsuarios();
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadUsuarios();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadUsuarios();
    }
  }

  openAddModal() {
    this.editingUsuario = null;
    this.usuarioData = {};
    this.showModal = true;
  }

  openEditModal(usuario: Usuario) {
    this.editingUsuario = usuario;
    this.usuarioData = { ...usuario };
    this.showModal = true;
  }

  saveUsuario() {
    if (!this.usuarioData.nombre || !this.usuarioData.apellido || !this.usuarioData.email) return;

    if (this.editingUsuario) {
      const idx = this.usuarios.findIndex(u => u.id === this.editingUsuario!.id);
      if (idx >= 0) {
        this.usuarios[idx] = { ...this.editingUsuario, ...this.usuarioData } as Usuario;
      }
    } else {
      this.usuarios.push({
        id: Date.now().toString(), // Temporal ID
        nombre: this.usuarioData.nombre!,
        apellido: this.usuarioData.apellido!,
        dni: this.usuarioData.dni || '',
        numero_telefono: this.usuarioData.numero_telefono || '',
        edad: this.usuarioData.edad || 0,
        sexo: this.usuarioData.sexo || '',
        distrito: this.usuarioData.distrito || '',
        codigo_postal: this.usuarioData.codigo_postal || '',
        direccion: this.usuarioData.direccion || '',
        email: this.usuarioData.email!,
        password: this.usuarioData.password || '',
        rol_id: this.usuarioData.rol_id || ''
      });
    }
    this.closeModal();
  }

  deleteUsuario(usuario: Usuario) {
    if (confirm(`¿Seguro que deseas eliminar al usuario "${usuario.nombre} ${usuario.apellido}"?`)) {
      this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
      this.allUsuarios = this.allUsuarios.filter(u => u.id !== usuario.id);
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingUsuario = null;
    this.usuarioData = {};
  }

  buscarUsuario() {
    if (this.searchText.trim() === '') {
      this.usuarios = [...this.allUsuarios];
    } else {
      const lowerSearch = this.searchText.toLowerCase();
      this.usuarios = this.allUsuarios.filter(
        u => u.nombre.toLowerCase().includes(lowerSearch) || 
             u.apellido.toLowerCase().includes(lowerSearch) ||
             u.dni.toLowerCase().includes(lowerSearch) ||
             u.distrito.toLowerCase().includes(lowerSearch) ||
             u.email.toLowerCase().includes(lowerSearch)
      );
    }
  }

  // Método auxiliar para mostrar el nombre del rol (asumiendo que tienes una lista de roles)
  getRolNombre(rolId: string): string {
    // Aquí deberías tener la lógica para convertir el ID del rol al nombre
    // Por ejemplo, si tienes un servicio de roles:
    // return this.rolService.getRolById(rolId)?.nombre || 'Sin rol';
    return rolId; // Temporal, devuelve el ID por ahora
  }
}