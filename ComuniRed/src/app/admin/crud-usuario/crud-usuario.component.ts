import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { UsuarioService, Usuario, UsuarioPage, UsuarioInput } from '../../services/usuario.service';
import { RolService, Rol } from '../../services/rol.service';

@Component({
  selector: 'app-crud-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-usuario.component.html',
  styleUrls: ['./crud-usuario.component.css'],
})
export class CrudUsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  allUsuarios: Usuario[] = [];
  roles: Rol[] = [];
  imagenPreview: string | null = null;
  defaultFoto = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  private rolesMap = new Map<string, string>();

  showModal = false;
  editingUsuario: Usuario | null = null;
  usuarioData: Partial<Usuario & { codigo_postal?: string }> = {};
  page = 0;
  size = 5;
  totalPages = 1;
  totalElements = 0;
  pageSizes = [5, 10, 20, 50];
  searchText: string = '';

  hoy: string = new Date().toISOString().substring(0, 10);

  // UI states
  loading = false;
  saving = false;
  deleting = false;
  errorMessage: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit() {
    this.loadRoles()
      .then(() => this.loadUsuarios())
      .catch(() => this.loadUsuarios());
  }

  trackByUsuarioId(index: number, usuario: Usuario): any {
    return usuario.id;
  }

  // ---------- Usuarios ----------
  loadUsuarios() {
    this.loading = true;
    this.errorMessage = null;

    this.usuarioService
      .obtenerUsuarios(this.page, this.size)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (pageData: UsuarioPage) => {
          if (!pageData || !pageData.content) {
            console.warn('⚠️ No se recibieron usuarios del backend.');
            this.usuarios = [];
            this.allUsuarios = [];
            return;
          }

          this.usuarios = [...pageData.content];
          this.allUsuarios = [...this.usuarios];
          
          this.totalPages = pageData.totalPages ?? 1;
          this.totalElements = pageData.totalElements ?? this.allUsuarios.length;

          console.log('✅ [Usuarios] cargados correctamente:', this.usuarios.length, 'usuarios');
          
          if (this.usuarios.length > 0) {
            console.log('📅 Ejemplo de usuario:', {
              nombre: this.usuarios[0].nombre,
              fecha_nacimiento: this.usuarios[0].fecha_nacimiento,
              fecha_registro: this.usuarios[0].fecha_registro
            });
          }
        },
        error: (err: any) => {
          console.error('❌ Error al cargar usuarios:', err);
          
          if (err.graphQLErrors) {
            console.error('GraphQL Errors:', err.graphQLErrors);
          }
          if (err.networkError) {
            console.error('Network Error:', err.networkError);
          }
          if (err.message) {
            console.error('Error Message:', err.message);
          }
          
          this.errorMessage = 'Error al cargar usuarios. Ver consola para detalles.';
          this.usuarios = [];
          this.allUsuarios = [];
        },
      });
  }

  onPageSizeChange(event: any) {
    const newSize = +event.target.value;
    if (!isNaN(newSize) && newSize > 0) {
      this.size = newSize;
      this.page = 0;
      this.loadUsuarios();
    }
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

  // ---------- Roles ----------
  async loadRoles(): Promise<void> {
    return new Promise((resolve) => {
      this.rolService.obtenerTodosLosRoles().subscribe({
        next: (rlist: Rol[]) => {
          this.roles = (rlist || []).map((r: any) => ({
            id: (r as any).id ?? (r as any)._id ?? '',
            nombre: r.nombre,
            descripcion: r.descripcion,
          } as Rol));
          this.rolesMap.clear();
          this.roles.forEach((r) => {
            if (r && r.id) this.rolesMap.set(String(r.id), r.nombre);
          });
          console.log('[Roles] cargados:', this.roles);
          resolve();
        },
        error: (err: any) => {
          console.warn('No se pudieron cargar roles', err);
          resolve();
        },
      });
    });
  }

  // ---------- Manejo de Imágenes ----------
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.imagenPreview = base64String;
        this.usuarioData.foto_perfil = base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  quitarFoto() {
    this.imagenPreview = null;
    this.usuarioData.foto_perfil = '';
  }

  private limpiarImagen() {
    this.imagenPreview = null;
    if (this.usuarioData) {
      this.usuarioData.foto_perfil = '';
    }
  }

  // ---------- Roles ----------
  getRolNombre(rolId?: string | null): string {
    if (!rolId) return 'Sin rol';
    const key = String(rolId).trim();

    const direct = this.rolesMap.get(key);
    if (direct) return direct;

    const m = key.match(/ObjectId\("(.*)"\)/);
    const normalized = m ? m[1] : key;
    const direct2 = this.rolesMap.get(normalized);
    if (direct2) return direct2;

    const suffix = normalized.slice(-12);
    for (const [k, v] of this.rolesMap) {
      if (k.endsWith(suffix) || k.includes(suffix)) {
        return v;
      }
    }

    return key;
  }

  calcularEdad(fechaNacimiento?: string): number | null {
    if (!fechaNacimiento) return null;
    return this.usuarioService.calcularEdad(fechaNacimiento);
  }

  openAddModal() {
    this.editingUsuario = null;
    this.usuarioData = {};

    this.usuarioData.fecha_nacimiento = '';

    this.imagenPreview = null;
    this.showModal = true;
  }

  openEditModal(usuario: Usuario) {
    this.editingUsuario = usuario;
    this.usuarioData = { ...usuario } as any;

    // Manejar foto de perfil
    if (usuario.foto_perfil && usuario.foto_perfil.trim() !== '') {
      this.imagenPreview = usuario.foto_perfil;
      this.usuarioData.foto_perfil = usuario.foto_perfil;
    } else {
      this.imagenPreview = null;
      this.usuarioData.foto_perfil = '';
    }

    // Eliminar password del objeto (no debe editarse aquí)
    if ('password' in this.usuarioData) {
      delete (this.usuarioData as any).password;
    }

    this.showModal = true;
  }

  // ---------- Inputs helpers / validations ----------
  onNumericInput(event: Event, field: keyof Usuario, maxLen: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value ?? '';
    value = value.replace(/\D/g, '');
    if (value.length > maxLen) value = value.substring(0, maxLen);
    input.value = value;
    (this.usuarioData as any)[field] = value;
  }

  onTelefonoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value ?? '';
    value = value.replace(/[^0-9+]/g, '');
    if (value.length > 15) value = value.substring(0, 15);
    input.value = value;
    this.usuarioData.numero_telefono = value;
  }

  private validarAntesDeGuardar(): string | null {
    const nombre = (this.usuarioData.nombre ?? '').toString().trim();
    const apellido = (this.usuarioData.apellido ?? '').toString().trim();
    const email = (this.usuarioData.email ?? '').toString().trim();

    if (!nombre) return 'El nombre es obligatorio';
    if (!apellido) return 'El apellido es obligatorio';
    if (!email) return 'El email es obligatorio';

    const dni = (this.usuarioData.dni ?? '').toString().trim();
    if (dni && dni.length !== 8) return 'El DNI debe tener exactamente 8 dígitos';

    const cp = (this.usuarioData.codigo_postal ?? '').toString().trim();
    if (cp && cp.length !== 5) return 'El código postal debe tener 5 dígitos';

    if (!this.editingUsuario) {
      const pwd = (this.usuarioData.password ?? '').toString();
      if (!pwd || pwd.trim().length < 6) return 'La contraseña es obligatoria y debe tener al menos 6 caracteres';
    }

    if (!this.usuarioData.rol_id) return 'Debes seleccionar un rol';

    return null;
  }

  saveUsuario(form?: NgForm) {
    const validationError = this.validarAntesDeGuardar();
    if (validationError) {
      alert(validationError);
      return;
    }

    this.saving = true;
    this.errorMessage = null;

    const payload: UsuarioInput = {
      nombre: this.usuarioData.nombre!,
      apellido: this.usuarioData.apellido!,
      email: this.usuarioData.email!,
      dni: this.usuarioData.dni ?? '',
      numero_telefono: this.usuarioData.numero_telefono ?? '',
      sexo: this.usuarioData.sexo ?? '',
      distrito: this.usuarioData.distrito ?? '',
      codigo_postal: (this.usuarioData as any).codigo_postal ?? '',
      direccion: this.usuarioData.direccion ?? '',
      rol_id: this.usuarioData.rol_id ?? '',
      foto_perfil: this.usuarioData.foto_perfil ?? '',
      fecha_nacimiento: this.usuarioData.fecha_nacimiento ?? '',
    };

    // Agregar password solo si existe y no está vacío
    if (this.usuarioData.password && String(this.usuarioData.password).trim() !== '') {
      (payload as any).password = this.usuarioData.password;
    }

    if (this.editingUsuario && this.editingUsuario.id) {
      // ACTUALIZAR
      const id = this.editingUsuario.id;
      this.usuarioService
        .actualizarUsuario(id, payload)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: (usuario) => {
            console.log('✅ Usuario actualizado correctamente:', usuario);
            this.loadUsuarios();
            this.closeModal();
          },
          error: (err: any) => {
            console.error('❌ Error actualizando usuario:', err);
            this.errorMessage = 'Error al actualizar el usuario.';
            alert(this.errorMessage);
          },
        });
    } else {
      // CREAR
      this.usuarioService
        .crearUsuario(payload)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: (usuario) => {
            console.log('✅ Usuario creado correctamente:', usuario);
            this.loadUsuarios();
            this.closeModal();
          },
          error: (err: any) => {
            console.error('❌ Error creando usuario:', err);
            this.errorMessage = 'Error al crear el usuario.';
            alert(this.errorMessage);
          },
        });
    }
  }

  deleteUsuario(usuario: Usuario) {
    if (!confirm(`¿Seguro que deseas eliminar al usuario "${usuario.nombre} ${usuario.apellido}"?`)) return;

    this.deleting = true;
    this.errorMessage = null;

    this.usuarioService
      .eliminarUsuario(usuario.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          console.log('✅ Usuario eliminado correctamente');
          if (this.usuarios.length === 1 && this.page > 0) {
            this.page = Math.max(0, this.page - 1);
          }
          this.loadUsuarios();
        },
        error: (err: any) => {
          console.error('❌ Error eliminando usuario:', err);
          this.errorMessage = 'Error al eliminar el usuario.';
          alert(this.errorMessage);
        },
      });
  }

  closeModal() {
    this.showModal = false;
    this.editingUsuario = null;
    this.usuarioData = {};
    this.limpiarImagen();
  }

  buscarUsuario() {
    const q = this.searchText?.trim().toLowerCase() ?? '';
    if (!q) {
      this.usuarios = [...this.allUsuarios];
      return;
    }

    this.usuarios = this.allUsuarios.filter((u) =>
      (u.nombre ?? '').toLowerCase().includes(q) ||
      (u.apellido ?? '').toLowerCase().includes(q) ||
      (String(u.dni ?? '')).toLowerCase().includes(q) ||
      (u.distrito ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    );
  }
}
