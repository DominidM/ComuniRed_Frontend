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
  foto_perfil_url = 'assets/img/avatar-placeholder.png';
  usuario: Usuario | null = null;
  guardando = false;
  avatarPreview: string | null = null;
  hoy: string = new Date().toISOString().substring(0, 10);

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
     
    const currentUser = this.usuarioService.getUser();
    
    if (currentUser && currentUser.id) {

      this.usuarioService.obtenerUsuarioPorId(currentUser.id).subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.cargarDatosUsuario(usuario);
        },
        error: (err) => {
          console.error('Error al cargar usuario:', err);
          alert('Error al cargar los datos del usuario');
        }
      });
    } else {
      alert('No hay sesión activa. Por favor inicia sesión.');
      this.router.navigate(['/login']);
    }
  }

  private cargarDatosUsuario(usuario: Usuario): void {

    if (usuario.foto_perfil) {
      this.foto_perfil_url = usuario.foto_perfil;
      this.avatarPreview = usuario.foto_perfil;
    }

    this.profileForm = this.fb.group({
      nombre: [usuario.nombre || '', Validators.required],
      apellido: [usuario.apellido || '', Validators.required],
      email: [usuario.email || '', [Validators.required, Validators.email]],
      dni: [usuario.dni || ''],
      numero_telefono: [usuario.numero_telefono || ''],
      fecha_nacimiento: [usuario.fecha_nacimiento || ''],
      sexo: [usuario.sexo || ''],
      distrito: [usuario.distrito || ''],
      codigo_postal: [usuario.codigo_postal || ''],
      direccion: [usuario.direccion || ''],
    });
  }

  calcularEdad(): number | null {
    const fechaNac = this.profileForm.get('fecha_nacimiento')?.value;
    if (!fechaNac) return null;
    return this.usuarioService.calcularEdad(fechaNac);
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

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.avatarPreview = base64;
        this.foto_perfil_url = base64;
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.profileForm.invalid) {
      alert('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    if (!this.usuario || !this.usuario.id) {
      alert('Error: No se pudo identificar al usuario');
      return;
    }

    this.guardando = true;

    const usuarioActualizado = {
      foto_perfil: this.avatarPreview || this.usuario.foto_perfil || '',
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
        
        this.guardando = false;
        alert('Perfil actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        this.guardando = false;
        alert('Error al actualizar el perfil. Por favor, intenta de nuevo.');
      },
    });
  }

  cancel(): void {
    if (this.usuario) {
      this.cargarDatosUsuario(this.usuario);
      
      if (this.usuario.foto_perfil) {
        this.foto_perfil_url = this.usuario.foto_perfil;
        this.avatarPreview = this.usuario.foto_perfil;
      }
      
      alert('Cambios cancelados');
    }
  }
}
