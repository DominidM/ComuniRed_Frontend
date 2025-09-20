import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  showSuccess = false;
  showError: string | null = null;

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  login() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.showError = null;
    this.usuarioService.login(this.email, this.password).subscribe({
      next: (usuario: Usuario) => {
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
          this.isLoading = false;
          // Redirige según rol_id
          switch (usuario.rol_id) {
            case '68ca68b40bc4d9ca3267b663': // Ciudadano
              this.router.navigate(['/public/home']);
              break;
            case '68ca68bb0bc4d9ca3267b665': // Soporte
              this.router.navigate(['/soporte']);
              break;
            case '68ca68c40bc4d9ca3267b667': // Administrador
              this.router.navigate(['/admin/dashboard']);
              break;
            default:
              this.router.navigate(['/public/home']);
          }
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.error?.message?.includes('password') || err?.error?.message?.includes('email')) {
          this.showError = 'Usuario o contraseña incorrectos.';
        } else {
          this.showError = 'Error al iniciar sesión. Intenta de nuevo.';
        }
        setTimeout(() => this.showError = null, 2500);
      }
    });
  }
}