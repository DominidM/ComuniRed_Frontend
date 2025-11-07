import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css'],
})
export class EditarPerfilComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  original: Usuario | null = null;
  
  cargando = true;
  guardando = false;
  error: string | null = null;
  
  avatarPreview: string | null = null;
  
  // ✅ NUEVO: Para el max del input date
  hoy: string = new Date().toISOString().substring(0, 10);
  
  private destroy$ = new Subject<void>();
  private rutaVolver: string = '/dashboard';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      const usuarioActual = this.usuarioService.getUser();
      if (usuarioActual && usuarioActual.id) {
        id = usuarioActual.id;
        console.log('Usando ID del usuario logueado:', id);
      } else {
        this.error = 'No se pudo identificar el usuario. Por favor inicia sesión.';
        this.cargando = false;
        return;
      }
    }

    this.cargarUsuario(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarUsuario(id: string): void {
    this.cargando = true;
    this.error = null;

    this.usuarioService
      .obtenerUsuarioPorId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          if (usuario) {
            this.usuario = { ...usuario };
            this.original = { ...usuario };
            
            if (usuario.foto_perfil) {
              this.avatarPreview = usuario.foto_perfil;
            }
            
            console.log('Usuario cargado:', usuario);
          } else {
            this.error = 'Usuario no encontrado';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar usuario:', err);
          this.error = 'Error al cargar el usuario. Por favor, intenta de nuevo.';
          this.cargando = false;
        },
      });
  }

  // ✅ NUEVO: Calcular edad desde fecha de nacimiento
  calcularEdad(fechaNacimiento: string): number | null {
    if (!fechaNacimiento) return null;
    return this.usuarioService.calcularEdad(fechaNacimiento);
  }

  cambiarAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.avatarPreview = base64;
        
        if (this.usuario) {
          this.usuario.foto_perfil = base64;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  hayCambios(): boolean {
    if (!this.usuario || !this.original) return false;
    return JSON.stringify(this.usuario) !== JSON.stringify(this.original);
  }

  guardarCambios(): void {
    if (!this.usuario || !this.hayCambios()) {
      return;
    }

    if (!this.validarUsuario()) {
      return;
    }

    this.guardando = true;
    this.error = null;

    // ✅ PAYLOAD ACTUALIZADO: sin edad
    const usuarioInput = {
      foto_perfil: this.usuario.foto_perfil || '',
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      dni: this.usuario.dni,
      numero_telefono: this.usuario.numero_telefono || '',
      sexo: this.usuario.sexo || '',
      distrito: this.usuario.distrito || '',
      codigo_postal: this.usuario.codigo_postal || '',
      direccion: this.usuario.direccion || '',
      email: this.usuario.email,
      rol_id: this.usuario.rol_id,
      fecha_nacimiento: this.usuario.fecha_nacimiento || ''
    };

    this.usuarioService
      .actualizarUsuario(this.usuario.id, usuarioInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuarioActualizado) => {
          console.log('Usuario actualizado:', usuarioActualizado);
          this.usuario = { ...usuarioActualizado };
          this.original = { ...usuarioActualizado };
          
          if (usuarioActualizado.foto_perfil) {
            this.avatarPreview = usuarioActualizado.foto_perfil;
          }
          
          this.guardando = false;
          alert('Perfil actualizado con éxito');
          
          const currentUser = this.usuarioService.getUser();
          if (currentUser && currentUser.id === usuarioActualizado.id) {
            this.usuarioService.saveUser(usuarioActualizado);
          }
        },
        error: (err) => {
          console.error('Error al guardar cambios:', err);
          this.error = 'Error al guardar los cambios. Por favor, intenta de nuevo.';
          this.guardando = false;
          alert('Error al actualizar el perfil');
        },
      });
  }

  private validarUsuario(): boolean {
    if (!this.usuario) return false;

    if (!this.usuario.nombre?.trim()) {
      alert('El nombre es obligatorio');
      return false;
    }

    if (!this.usuario.apellido?.trim()) {
      alert('El apellido es obligatorio');
      return false;
    }

    if (!this.usuario.email?.trim()) {
      alert('El email es obligatorio');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.usuario.email)) {
      alert('El formato del email no es válido');
      return false;
    }

    if (this.usuario.dni && !/^\d{8}$/.test(this.usuario.dni)) {
      alert('El DNI debe tener 8 dígitos');
      return false;
    }

    // ✅ ACTUALIZADO: Validar edad desde fecha_nacimiento
    if (this.usuario.fecha_nacimiento) {
      const edad = this.calcularEdad(this.usuario.fecha_nacimiento);
      if (edad !== null && (edad < 7 || edad > 100)) {
        alert('Debes tener entre 7 y 120 años para usar la plataforma');
        return false;
      }
    }

    return true;
  }

  cancelar(): void {
    if (this.hayCambios()) {
      const confirmar = confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.');
      if (!confirmar) return;
    }
    
    if (this.original) {
      this.usuario = { ...this.original };
      this.avatarPreview = this.original.foto_perfil || null;
    }
  }

  volver(): void {
    if (this.hayCambios()) {
      const confirmar = confirm('¿Estás seguro de salir? Se perderán los cambios no guardados.');
      if (!confirmar) return;
    }
    
    window.history.back();
  }
}
