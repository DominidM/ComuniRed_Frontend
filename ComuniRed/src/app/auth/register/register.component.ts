import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, UsuarioInput } from '../../services/usuario.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  showSuccess = false;
  showError: string | null = null;
  isLoading = false;

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  register() {
    if (this.isLoading) return;

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
        // Puedes personalizar el mensaje según la estructura del error
        if (err?.error?.message?.includes('email')) {
          this.showError = 'Este email ya está registrado.';
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