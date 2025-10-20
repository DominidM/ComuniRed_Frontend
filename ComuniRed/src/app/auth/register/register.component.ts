import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService, UsuarioInput } from '../../services/usuario.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  usuarioData: UsuarioInput = {
    nombre: '',
    apellido: '',
    dni: '',
    numero_telefono: '',
    edad: undefined,
    sexo: '',
    distrito: '',
    codigo_postal: '',
    direccion: '',
    email: '',
    password: '',
    rol_id: ''
  };

  // Objeto para almacenar errores de validación
  errors: { [key: string]: string } = {};

  showSuccess = false;
  showError: string | null = null;
  isLoading = false;

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  // Helper seguro para trim (evita error cuando value es undefined)
  private trim(value: unknown): string {
    return (value ?? '').toString().trim();
  }

  // Validaciones en tiempo real (usando trim seguro y checks defensivos)
  validateNombre() {
    const value = this.trim(this.usuarioData.nombre);
    if (!value) {
      this.errors['nombre'] = 'El nombre es obligatorio';
    } else if (value.length < 2) {
      this.errors['nombre'] = 'El nombre debe tener al menos 2 caracteres';
    } else if (value.length > 50) {
      this.errors['nombre'] = 'El nombre no puede exceder 50 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      this.errors['nombre'] = 'El nombre solo puede contener letras';
    } else {
      delete this.errors['nombre'];
    }
  }

  validateApellido() {
    const value = this.trim(this.usuarioData.apellido);
    if (!value) {
      this.errors['apellido'] = 'El apellido es obligatorio';
    } else if (value.length < 2) {
      this.errors['apellido'] = 'El apellido debe tener al menos 2 caracteres';
    } else if (value.length > 50) {
      this.errors['apellido'] = 'El apellido no puede exceder 50 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      this.errors['apellido'] = 'El apellido solo puede contener letras';
    } else {
      delete this.errors['apellido'];
    }
  }

  validateDni() {
    if (this.usuarioData.dni == null) {
      delete this.errors['dni'];
      return;
    }
    // Solo permitir números
    this.usuarioData.dni = (this.usuarioData.dni ?? '').toString().replace(/[^0-9]/g, '');
    // Limitar a 8 dígitos
    if (this.usuarioData.dni.length > 8) {
      this.usuarioData.dni = this.usuarioData.dni.substring(0, 8);
    }

    if (this.usuarioData.dni.length > 0 && this.usuarioData.dni.length < 8) {
      this.errors['dni'] = 'El DNI debe tener exactamente 8 dígitos';
    } else {
      delete this.errors['dni'];
    }
  }

  validateTelefono() {
    if (this.usuarioData.numero_telefono == null) {
      delete this.errors['numero_telefono'];
      return;
    }
    // Solo permitir números y el símbolo +
    this.usuarioData.numero_telefono = (this.usuarioData.numero_telefono ?? '').toString().replace(/[^0-9+]/g, '');
    // Limitar a 15 caracteres
    if (this.usuarioData.numero_telefono.length > 15) {
      this.usuarioData.numero_telefono = this.usuarioData.numero_telefono.substring(0, 15);
    }

    if (this.usuarioData.numero_telefono.length > 0 && this.usuarioData.numero_telefono.length < 9) {
      this.errors['numero_telefono'] = 'El teléfono debe tener al menos 9 dígitos';
    } else {
      delete this.errors['numero_telefono'];
    }
  }

  validateEdad() {
    const edad = this.usuarioData.edad;
    if (edad !== undefined && edad !== null) {
      if (typeof edad !== 'number' || isNaN(edad)) {
        this.errors['edad'] = 'Edad inválida';
      } else if (edad < 18) {
        this.errors['edad'] = 'Debes ser mayor de 18 años';
      } else if (edad > 120) {
        this.errors['edad'] = 'Edad inválida';
      } else {
        delete this.errors['edad'];
      }
    } else {
      delete this.errors['edad'];
    }
  }

  validateCodigoPostal() {
    if (this.usuarioData.codigo_postal == null) {
      delete this.errors['codigo_postal'];
      return;
    }
    // Solo permitir números
    this.usuarioData.codigo_postal = (this.usuarioData.codigo_postal ?? '').toString().replace(/[^0-9]/g, '');
    // Limitar a 5 dígitos
    if (this.usuarioData.codigo_postal.length > 5) {
      this.usuarioData.codigo_postal = this.usuarioData.codigo_postal.substring(0, 5);
    }

    if (this.usuarioData.codigo_postal.length > 0 && this.usuarioData.codigo_postal.length !== 5) {
      this.errors['codigo_postal'] = 'El código postal debe tener 5 dígitos';
    } else {
      delete this.errors['codigo_postal'];
    }
  }

  validateEmail() {
    const value = this.trim(this.usuarioData.email);
    if (!value) {
      this.errors['email'] = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.errors['email'] = 'Formato de email inválido';
    } else {
      delete this.errors['email'];
    }
  }

  validatePassword() {
    const pwd = this.trim(this.usuarioData.password);
    if (!pwd) {
      this.errors['password'] = 'La contraseña es obligatoria';
    } else if (pwd.length < 6) {
      this.errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
    } else if (pwd.length > 50) {
      this.errors['password'] = 'La contraseña no puede exceder 50 caracteres';
    } else {
      delete this.errors['password'];
    }
  }

  validateDireccion() {
    const d = this.usuarioData.direccion ?? '';
    if (d && d.length > 200) {
      this.errors['direccion'] = 'La dirección no puede exceder 200 caracteres';
    } else {
      delete this.errors['direccion'];
    }
  }

  validateDistrito() {
    const dist = this.usuarioData.distrito ?? '';
    if (dist && dist.length > 100) {
      this.errors['distrito'] = 'El distrito no puede exceder 100 caracteres';
    } else {
      delete this.errors['distrito'];
    }
  }

  // Verificar si el formulario es válido (usa trim seguro)
  isFormValid(): boolean {
    return Object.keys(this.errors).length === 0 &&
           this.trim(this.usuarioData.nombre) !== '' &&
           this.trim(this.usuarioData.apellido) !== '' &&
           this.trim(this.usuarioData.email) !== '' &&
           this.trim(this.usuarioData.password) !== '';
  }

  register() {
    if (this.isLoading) return;

    // Validar todos los campos antes de enviar
    this.validateNombre();
    this.validateApellido();
    this.validateDni();
    this.validateTelefono();
    this.validateEdad();
    this.validateCodigoPostal();
    this.validateEmail();
    this.validatePassword();
    this.validateDireccion();
    this.validateDistrito();

    if (!this.isFormValid()) {
      this.showError = 'Por favor, corrige los errores en el formulario';
      setTimeout(() => {
        this.showError = null;
      }, 3000);
      return;
    }

    this.isLoading = true;
    this.showError = null;

    // Asegurar rol por defecto si no se proporciona
    this.usuarioData.rol_id = this.usuarioData.rol_id && this.trim(this.usuarioData.rol_id) !== ''
      ? this.usuarioData.rol_id
      : '68ca68b40bc4d9ca3267b663';

    // Construir payload explícito (defensivo)
    const payload: UsuarioInput = {
      nombre: this.trim(this.usuarioData.nombre),
      apellido: this.trim(this.usuarioData.apellido),
      dni: this.usuarioData.dni ? this.usuarioData.dni.toString() : undefined,
      numero_telefono: this.usuarioData.numero_telefono ?? undefined,
      edad: typeof this.usuarioData.edad === 'number' ? this.usuarioData.edad : undefined,
      sexo: this.usuarioData.sexo ?? undefined,
      distrito: this.usuarioData.distrito ?? undefined,
      codigo_postal: this.usuarioData.codigo_postal ?? undefined,
      direccion: this.usuarioData.direccion ?? undefined,
      email: this.trim(this.usuarioData.email),
      password: this.trim(this.usuarioData.password),
      rol_id: this.usuarioData.rol_id
    };

    this.usuarioService.crearUsuario(payload).subscribe({
      next: (usuario) => {
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
          this.isLoading = false;
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (err) => {
        // Mensajes de error amigables
        if (err?.error?.message?.includes('email')) {
          this.showError = 'Este email ya está registrado.';
        } else if (err?.error?.message?.includes('dni')) {
          this.showError = 'Este DNI ya está registrado.';
        } else {
          this.showError = 'Hubo un error al crear el usuario.';
        }
        this.isLoading = false;
        setTimeout(() => {
          this.showError = null;
        }, 3000);
      }
    });
  }
}