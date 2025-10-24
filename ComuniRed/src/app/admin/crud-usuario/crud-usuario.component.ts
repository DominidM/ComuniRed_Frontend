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
  fotoPreview: string | null = null;
  imagenPreview: string | ArrayBuffer | null = null;
  fotoPerfilFile: File | null = null;
  defaultFoto = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  private rolesMap = new Map<string, string>();

  showModal = false;
  editingUsuario: Usuario | null = null;
  // Incluimos codigo_postal y distrito en usuarioData (Partial permite campos faltantes)
  usuarioData: Partial<Usuario & { codigo_postal?: string }> = {};
  page = 0;
  size = 5;
  totalPages = 1;
  totalElements = 0;
  pageSizes = [5, 10, 20, 50];
  searchText: string = '';

  // UI states
  loading = false;
  saving = false;
  deleting = false;
  errorMessage: string | null = null;

  constructor(private usuarioService: UsuarioService, private rolService: RolService) {}

  ngOnInit() {
    // Load roles first so we can resolve names when loading users
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
          this.usuarios = pageData.content || [];
          // keep a copy for searching/filtering locally
          this.allUsuarios = pageData.content ? [...pageData.content] : [];
          this.totalPages = pageData.totalPages ?? 1;
          this.totalElements = pageData.totalElements ?? this.allUsuarios.length;

          console.log('[Usuarios] recibidos', this.usuarios);
        },
        error: (err: any) => {
          console.error('Error al cargar usuarios', err);
          this.errorMessage = 'Error al cargar usuarios. Revisa la consola.';
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
  // Load roles and normalize ids so template can lookup names reliably
  async loadRoles(): Promise<void> {
    return new Promise((resolve) => {
      this.rolService.obtenerTodosLosRoles().subscribe({
        next: (rlist: Rol[]) => {
          // normalize: ensure each role has an `id` value (use _id if backend returns that)
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
          console.log('[RolesMap]:', Array.from(this.rolesMap.entries()));

          resolve();
        },
        error: (err: any) => {
          console.warn('No se pudieron cargar roles', err);
          // continue even if roles fails (so UI still shows users)
          resolve();
        },
      });
    });
  }


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fotoPerfilFile = file;

      const reader = new FileReader();
      reader.onload = () => (this.imagenPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }
  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result as string;
      // guardamos temporalmente la imagen base64 en usuarioData
      this.usuarioData.foto_perfil = this.fotoPreview;
    };
    reader.readAsDataURL(archivo);
  }

  quitarFoto() {
    this.fotoPreview = this.defaultFoto;
    this.imagenPreview = null;
    this.fotoPerfilFile = null;

    if (this.usuarioData) {
      this.usuarioData.foto_perfil = this.defaultFoto;
    }
  }

  private limpiarImagen() {
    this.fotoPreview = null;
    this.imagenPreview = null;
    this.fotoPerfilFile = null;
    if (this.usuarioData) {
      this.usuarioData.foto_perfil = '';
    }
  }



  /**
   * Resolve a rol_id to a display name using the rolesMap.
   * Returns an empty string if name not found (so UI doesn't show raw id).
   */
  getRolNombre(rolId?: string | null): string {
    if (!rolId) return 'Sin rol';
    const key = String(rolId).trim();

    console.log(`[getRolNombre] Buscando rol_id: "${key}"`);

    // direct match
    const direct = this.rolesMap.get(key);
    if (direct) {
      console.log(`[getRolNombre] Match directo encontrado: "${direct}"`);
      return direct;
    }

    // try normalize ObjectId("...") pattern
    const m = key.match(/ObjectId\("(.*)"\)/);
    const normalized = m ? m[1] : key;
    const direct2 = this.rolesMap.get(normalized);
    if (direct2) {
      console.log(`[getRolNombre] Match normalizado encontrado: "${direct2}"`);
      return direct2;
    }

    // partial match fallback (match by suffix)
    const suffix = normalized.slice(-12);
    for (const [k, v] of this.rolesMap) {
      if (k.endsWith(suffix) || k.includes(suffix)) {
        console.log(`[getRolNombre] Match parcial encontrado: "${v}"`);
        return v;
      }
    }

    console.warn(`[getRolNombre] No se encontró nombre para rol_id: "${key}"`);
    // fallback: return the rol_id to debug
    return key;
  }

  // ---------- Modal / CRUD ----------
  openAddModal() {
    this.editingUsuario = null;
    this.usuarioData = {};
    this.fotoPreview = this.defaultFoto
    this.showModal = true;
  }

  openEditModal(usuario: Usuario) {
    this.editingUsuario = usuario;
    this.usuarioData = { ...usuario } as any;

    // Si el usuario tiene una foto, úsala; si no, usa la imagen por defecto
    this.fotoPreview = usuario.foto_perfil && usuario.foto_perfil.trim() !== ''
      ? usuario.foto_perfil
      : this.defaultFoto;

    // Quita password si existe (solo por seguridad)
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

    const edad = this.usuarioData.edad;
    if (edad !== undefined && (typeof edad !== 'number' || edad < 0 || edad > 120)) return 'Edad inválida';

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
      edad: this.usuarioData.edad ?? 0,
      sexo: this.usuarioData.sexo ?? '',
      distrito: this.usuarioData.distrito ?? '',
      codigo_postal: (this.usuarioData as any).codigo_postal ?? '',
      direccion: this.usuarioData.direccion ?? '',
      rol_id: this.usuarioData.rol_id ?? '',
      foto_perfil: this.usuarioData.foto_perfil ?? '',
    };



    // Añadir password si existe y no es vacío
    if (this.usuarioData.password && String(this.usuarioData.password).trim() !== '') {
      (payload as any).password = this.usuarioData.password;
    }

    if (this.editingUsuario && this.editingUsuario.id) {
      const id = this.editingUsuario.id;
      this.usuarioService
        .actualizarUsuario(id, payload)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => {
            // recargar desde servidor para mantener coherencia con paginación/contadores
            this.loadUsuarios();
            this.closeModal();
          },
          error: (err: any) => {
            console.error('Error actualizando usuario', err);
            this.errorMessage = 'Error al actualizar el usuario.';
            alert(this.errorMessage);
          },
        });
    } else {
      // create new
      this.usuarioService
        .crearUsuario(payload)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => {
            // recargar la página actual
            this.loadUsuarios();
            this.closeModal();
          },
          error: (err: any) => {
            console.error('Error creando usuario', err);
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
          // reload current page (safer with pagination)
          if (this.usuarios.length === 1 && this.page > 0) {
            this.page = Math.max(0, this.page - 1);
          }
          this.loadUsuarios();
        },
        error: (err: any) => {
          console.error('Error eliminando usuario', err);
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