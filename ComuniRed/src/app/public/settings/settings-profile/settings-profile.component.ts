import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import {
  ChangeComponent,
  Alert,
  ConfirmDialog,
} from '../../../shared/components/change/change.component';
import { ModalStateService } from '../../../shared/services/modal-state.service';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ChangeComponent],
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css'],
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  foto_perfil_url =
    'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
  usuario: Usuario | null = null;
  guardando = false;
  cargando = true;
  subiendoImagen = false;
  eliminandoFoto = false;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  hoy: string = new Date().toISOString().substring(0, 10);

  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;
  accionPendiente: 'guardar' | 'eliminarFoto' | null = null;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private modalState: ModalStateService
  ) {
    this.inicializarFormularioVacio();
  }

  ngOnInit(): void {
    const currentUser = this.usuarioService.getUser();

    if (currentUser && currentUser.id) {
      this.cargando = true;

      this.usuarioService.obtenerUsuarioPorId(currentUser.id).subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.cargarDatosUsuario(usuario);
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar usuario:', err);
          this.showAlert('error', 'Error al cargar los datos del usuario');
          this.cargando = false;
        },
      });
    } else {
      this.showAlert(
        'warning',
        'No hay sesión activa. Por favor inicia sesión.'
      );
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.modalState.close();
  }

  private inicializarFormularioVacio(): void {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dni: [''],
      numero_telefono: [''],
      fecha_nacimiento: [''],
      sexo: [''],
      distrito: [''],
      codigo_postal: [''],
      direccion: [''],
    });
  }

  private cargarDatosUsuario(usuario: Usuario): void {
    if (usuario.foto_perfil) {
      this.foto_perfil_url = this.usuarioService.obtenerFotoMiniatura(
        usuario.foto_perfil,
        130
      );
      this.avatarPreview = usuario.foto_perfil;
    } else {
      this.foto_perfil_url =
        'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
      this.avatarPreview = null;
    }

    this.profileForm.patchValue({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      dni: usuario.dni || '',
      numero_telefono: usuario.numero_telefono || '',
      fecha_nacimiento: usuario.fecha_nacimiento || '',
      sexo: usuario.sexo || '',
      distrito: usuario.distrito || '',
      codigo_postal: usuario.codigo_postal || '',
      direccion: usuario.direccion || '',
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.showAlert(
          'warning',
          'Por favor selecciona una imagen válida (JPG, PNG, GIF)'
        );
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.showAlert('warning', 'La imagen no debe superar los 2MB');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarFoto(): void {
    if (!this.usuario || !this.usuario.id) {
      this.showAlert('error', 'Error: No se pudo identificar al usuario');
      return;
    }

    this.accionPendiente = 'eliminarFoto';
    this.confirmDialog = {
      title: '¿Eliminar foto de perfil?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
    };
    this.modalState.open();
  }

  save(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showAlert(
        'warning',
        'Por favor, completa todos los campos requeridos correctamente.'
      );
      return;
    }

    if (!this.usuario || !this.usuario.id) {
      this.showAlert('error', 'Error: No se pudo identificar al usuario');
      return;
    }

    this.accionPendiente = 'guardar';
    this.confirmDialog = {
      title: '¿Guardar cambios?',
      message: '¿Estás seguro de que deseas actualizar tu perfil?',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    };
    this.modalState.open();
  }

  onConfirmAction(): void {
    const accion = this.accionPendiente;
    this.confirmDialog = null;
    this.accionPendiente = null;
    this.modalState.close();

    if (accion === 'eliminarFoto') {
      this.ejecutarEliminarFoto();
      return;
    }

    if (accion === 'guardar') {
      this.ejecutarGuardado();
    }
  }

  onCancelAction(): void {
    this.confirmDialog = null;
    this.accionPendiente = null;
    this.modalState.close();
  }

  private ejecutarEliminarFoto(): void {
    if (!this.usuario || !this.usuario.id) return;

    this.eliminandoFoto = true;

    this.usuarioService.eliminarFotoPerfil(this.usuario.id).subscribe({
      next: (exito) => {
        if (exito) {
          this.usuarioService.obtenerUsuarioPorId(this.usuario!.id).subscribe({
            next: (usuarioActualizado) => {
              this.usuarioService.saveUser(usuarioActualizado);
              this.usuario = usuarioActualizado;
              this.foto_perfil_url =
                'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
              this.avatarPreview = null;
              this.selectedFile = null;
              this.eliminandoFoto = false;
              this.showAlert(
                'success',
                'Foto de perfil eliminada correctamente'
              );
            },
            error: (err) => {
              console.error('Error recargando usuario:', err);
              this.eliminandoFoto = false;
              this.showAlert(
                'error',
                'Error al recargar los datos del usuario'
              );
            },
          });
        } else {
          this.eliminandoFoto = false;
          this.showAlert('error', 'No se pudo eliminar la foto');
        }
      },
      error: (err) => {
        console.error('Error al eliminar foto:', err);
        this.eliminandoFoto = false;
        this.showAlert(
          'error',
          'Error al eliminar la foto. Por favor, intenta de nuevo.'
        );
      },
    });
  }

  private async ejecutarGuardado(): Promise<void> {
    if (!this.usuario || !this.usuario.id) return;

    this.guardando = true;

    try {
      let fotoUrl = this.usuario.foto_perfil || '';

      if (this.selectedFile) {
        this.subiendoImagen = true;

        try {
          fotoUrl = await this.usuarioService.subirFotoCloudinary(
            this.selectedFile
          );
        } catch (error) {
          this.subiendoImagen = false;
          this.guardando = false;
          this.showAlert(
            'error',
            'Error al subir la imagen. Por favor, intenta de nuevo.'
          );
          return;
        }

        this.subiendoImagen = false;
      }

      const usuarioActualizado = {
        foto_perfil: fotoUrl,
        nombre: this.profileForm.value.nombre,
        apellido: this.profileForm.value.apellido,
        email: this.profileForm.value.email,
        dni: this.profileForm.value.dni || '',
        numero_telefono: this.profileForm.value.numero_telefono || '',
        sexo: this.profileForm.value.sexo || '',
        distrito: this.profileForm.value.distrito || '',
        codigo_postal: this.profileForm.value.codigo_postal || '',
        direccion: this.profileForm.value.direccion || '',
        fecha_nacimiento: this.profileForm.value.fecha_nacimiento || '',
        rol_id: this.usuario.rol_id,
      };

      this.usuarioService
        .actualizarUsuario(this.usuario.id, usuarioActualizado)
        .subscribe({
          next: (usuarioActualizado) => {
            this.usuarioService.saveUser(usuarioActualizado);
            this.usuario = usuarioActualizado;
            this.cargarDatosUsuario(usuarioActualizado);
            this.selectedFile = null;
            this.guardando = false;
            this.showAlert('success', 'Perfil actualizado correctamente');
          },
          error: (err) => {
            console.error('Error al actualizar perfil:', err);
            this.guardando = false;
            this.showAlert(
              'error',
              'Error al actualizar el perfil. Por favor, intenta de nuevo.'
            );
          },
        });
    } catch (error) {
      console.error('Error general:', error);
      this.guardando = false;
      this.subiendoImagen = false;
      this.showAlert('error', 'Error al guardar el perfil');
    }
  }

  cancel(): void {
    if (this.usuario) {
      this.cargarDatosUsuario(this.usuario);
      this.selectedFile = null;
      this.showAlert('info', 'Cambios cancelados');
    }
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter((a) => a !== alert);
  }

  private showAlert(
    type: Alert['type'],
    message: string,
    duration = 4000
  ): void {
    const alert: Alert = { type, message, duration };
    this.alerts.push(alert);

    setTimeout(() => {
      this.removeAlert(alert);
    }, duration);
  }
}