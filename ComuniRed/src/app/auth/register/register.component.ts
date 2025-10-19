import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, UsuarioInput } from '../../services/usuario.service';
import { RouterModule } from '@angular/router';

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

  // Validaciones en tiempo real
  validateNombre() {
    if (!this.usuarioData.nombre.trim()) {
      this.errors['nombre'] = 'El nombre es obligatorio';
    } else if (this.usuarioData.nombre.length < 2) {
      this.errors['nombre'] = 'El nombre debe tener al menos 2 caracteres';
    } else if (this.usuarioData.nombre.length > 50) {
      this.errors['nombre'] = 'El nombre no puede exceder 50 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.usuarioData.nombre)) {
      this.errors['nombre'] = 'El nombre solo puede contener letras';
    } else {
      delete this.errors['nombre'];
    }
  }

  validateApellido() {
    if (!this.usuarioData.apellido.trim()) {
      this.errors['apellido'] = 'El apellido es obligatorio';
    } else if (this.usuarioData.apellido.length < 2) {
      this.errors['apellido'] = 'El apellido debe tener al menos 2 caracteres';
    } else if (this.usuarioData.apellido.length > 50) {
      this.errors['apellido'] = 'El apellido no puede exceder 50 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.usuarioData.apellido)) {
      this.errors['apellido'] = 'El apellido solo puede contener letras';
    } else {
      delete this.errors['apellido'];
    }
  }

  validateDni() {
    if (this.usuarioData.dni) {
      // Solo permitir números
      this.usuarioData.dni = this.usuarioData.dni.replace(/[^0-9]/g, '');
      
      // Limitar a 8 dígitos
      if (this.usuarioData.dni.length > 8) {
        this.usuarioData.dni = this.usuarioData.dni.substring(0, 8);
      }

      if (this.usuarioData.dni.length > 0 && this.usuarioData.dni.length < 8) {
        this.errors['dni'] = 'El DNI debe tener exactamente 8 dígitos';
      } else {
        delete this.errors['dni'];
      }
    } else {
      delete this.errors['dni'];
    }
  }

  validateTelefono() {
    if (this.usuarioData.numero_telefono) {
      // Solo permitir números y el símbolo +
      this.usuarioData.numero_telefono = this.usuarioData.numero_telefono.replace(/[^0-9+]/g, '');
      
      // Limitar a 15 caracteres
      if (this.usuarioData.numero_telefono.length > 15) {
        this.usuarioData.numero_telefono = this.usuarioData.numero_telefono.substring(0, 15);
      }

      if (this.usuarioData.numero_telefono.length > 0 && this.usuarioData.numero_telefono.length < 9) {
        this.errors['numero_telefono'] = 'El teléfono debe tener al menos 9 dígitos';
      } else {
        delete this.errors['numero_telefono'];
      }
    } else {
      delete this.errors['numero_telefono'];
    }
  }

  validateEdad() {
    if (this.usuarioData.edad !== undefined && this.usuarioData.edad !== null) {
      if (this.usuarioData.edad < 18) {
        this.errors['edad'] = 'Debes ser mayor de 18 años';
      } else if (this.usuarioData.edad > 120) {
        this.errors['edad'] = 'Edad inválida';
      } else {
        delete this.errors['edad'];
      }
    } else {
      delete this.errors['edad'];
    }
  }

  validateCodigoPostal() {
    if (this.usuarioData.codigo_postal) {
      // Solo permitir números
      this.usuarioData.codigo_postal = this.usuarioData.codigo_postal.replace(/[^0-9]/g, '');
      
      // Limitar a 5 dígitos
      if (this.usuarioData.codigo_postal.length > 5) {
        this.usuarioData.codigo_postal = this.usuarioData.codigo_postal.substring(0, 5);
      }

      if (this.usuarioData.codigo_postal.length > 0 && this.usuarioData.codigo_postal.length !== 5) {
        this.errors['codigo_postal'] = 'El código postal debe tener 5 dígitos';
      } else {
        delete this.errors['codigo_postal'];
      }
    } else {
      delete this.errors['codigo_postal'];
    }
  }

  validateEmail() {
    if (!this.usuarioData.email.trim()) {
      this.errors['email'] = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.usuarioData.email)) {
      this.errors['email'] = 'Formato de email inválido';
    } else {
      delete this.errors['email'];
    }
  }

  validatePassword() {
    if (!this.usuarioData.password) {
      this.errors['password'] = 'La contraseña es obligatoria';
    } else if (this.usuarioData.password.length < 6) {
      this.errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
    } else if (this.usuarioData.password.length > 50) {
      this.errors['password'] = 'La contraseña no puede exceder 50 caracteres';
    } else {
      delete this.errors['password'];
    }
  }

  validateDireccion() {
    if (this.usuarioData.direccion && this.usuarioData.direccion.length > 200) {
      this.errors['direccion'] = 'La dirección no puede exceder 200 caracteres';
    } else {
      delete this.errors['direccion'];
    }
  }

  validateDistrito() {
    if (this.usuarioData.distrito && this.usuarioData.distrito.length > 100) {
      this.errors['distrito'] = 'El distrito no puede exceder 100 caracteres';
    } else {
      delete this.errors['distrito'];
    }
  }

  // Verificar si el formulario es válido
  isFormValid(): boolean {
    return Object.keys(this.errors).length === 0 &&
           this.usuarioData.nombre.trim() !== '' &&
           this.usuarioData.apellido.trim() !== '' &&
           this.usuarioData.email.trim() !== '' &&
           this.usuarioData.password.trim() !== '';
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

    this.usuarioData.rol_id = '68ca68b40bc4d9ca3267b663';
    this.usuarioService.crearUsuario(this.usuarioData).subscribe({
      next: (usuario) => {
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
          this.isLoading = false;
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
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