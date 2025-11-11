import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../../services/usuario.service';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css'],
})
export class SettingsProfileComponent implements OnInit {
  profileForm!: FormGroup;
  foto_perfil_url = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
  usuario: Usuario | null = null;
  guardando = false;
  cargando = true;
  subiendoImagen = false;
  eliminandoFoto = false;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  hoy: string = new Date().toISOString().substring(0, 10);

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
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
          alert('Error al cargar los datos del usuario');
          this.cargando = false;
        }
      });
    } else {
      alert('No hay sesión activa. Por favor inicia sesión.');
      this.router.navigate(['/login']);
    }
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
      this.foto_perfil_url = this.usuarioService.obtenerFotoMiniatura(usuario.foto_perfil, 130);
      this.avatarPreview = usuario.foto_perfil;
    } else {
      this.foto_perfil_url = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
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
        alert('Por favor selecciona una imagen válida (JPG, PNG, GIF)');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
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
      alert('Error: No se pudo identificar al usuario');
      return;
    }

    const confirmar = confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?');
    if (!confirmar) return;

    this.eliminandoFoto = true;

    this.usuarioService.eliminarFotoPerfil(this.usuario.id).subscribe({
      next: (exito) => {
        if (exito) {
          console.log('Foto eliminada correctamente');
          
          this.usuarioService.obtenerUsuarioPorId(this.usuario!.id).subscribe({
            next: (usuarioActualizado) => {
              this.usuarioService.saveUser(usuarioActualizado);
              this.usuario = usuarioActualizado;
              
              this.foto_perfil_url = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
              this.avatarPreview = null;
              this.selectedFile = null;
              
              this.eliminandoFoto = false;
              alert('Foto de perfil eliminada correctamente');
            },
            error: (err) => {
              console.error('Error recargando usuario:', err);
              this.eliminandoFoto = false;
            }
          });
        } else {
          this.eliminandoFoto = false;
          alert('No se pudo eliminar la foto');
        }
      },
      error: (err) => {
        console.error('Error al eliminar foto:', err);
        this.eliminandoFoto = false;
        alert('Error al eliminar la foto. Por favor, intenta de nuevo.');
      }
    });
  }

  async save(): Promise<void> {
    if (this.profileForm.invalid) {
      alert('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    if (!this.usuario || !this.usuario.id) {
      alert('Error: No se pudo identificar al usuario');
      return;
    }

    this.guardando = true;

    try {
      let fotoUrl = this.usuario.foto_perfil || '';

      if (this.selectedFile) {
        this.subiendoImagen = true;
        console.log('Subiendo imagen a Cloudinary...');
        
        try {
          fotoUrl = await this.usuarioService.subirFotoCloudinary(this.selectedFile);
          console.log('Imagen subida:', fotoUrl);
        } catch (error) {
          this.subiendoImagen = false;
          this.guardando = false;
          alert('Error al subir la imagen. Por favor, intenta de nuevo.');
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

      this.usuarioService.actualizarUsuario(this.usuario.id, usuarioActualizado).subscribe({
        next: (usuarioActualizado) => {
          console.log('Perfil actualizado:', usuarioActualizado);
          
          this.usuarioService.saveUser(usuarioActualizado);
          this.usuario = usuarioActualizado;
          this.cargarDatosUsuario(usuarioActualizado);
          
          this.selectedFile = null;
          this.guardando = false;
          alert('Perfil actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar perfil:', err);
          this.guardando = false;
          alert('Error al actualizar el perfil. Por favor, intenta de nuevo.');
        }
      });

    } catch (error) {
      console.error('Error general:', error);
      this.guardando = false;
      alert('Error al guardar el perfil');
    }
  }

  cancel(): void {
    if (this.usuario) {
      this.cargarDatosUsuario(this.usuario);
      this.selectedFile = null;
      alert('Cambios cancelados');
    }
  }
}
