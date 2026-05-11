import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-olvide-clave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './olvide-clave.component.html',
  styleUrls: ['./olvide-clave.component.css']
})
export class OlvideClaveComponent {
  pasoActual = 1;
  correo = '';
  codigo = '';
  nuevaClave = '';
  confirmarClave = '';

  isLoading = false;
  mensaje = '';
  error = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  enviarCodigo(form: NgForm) {
    if (form.invalid || this.isLoading) return;

    this.isLoading = true;
    this.mensaje = '';
    this.error = '';

    this.usuarioService.solicitarCodigoRecuperacion(this.correo).subscribe({
      next: (enviado) => {
        this.isLoading = false;

        if (enviado) {
          this.mensaje = `Se envió un código de verificación a ${this.correo}. Revisa tu bandeja de entrada.`;
          this.pasoActual = 2;

          setTimeout(() => {
            this.mensaje = '';
          }, 5000);
        } else {
          this.error = 'No se pudo enviar el código. Intenta nuevamente.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Ocurrió un error al enviar el código. Verifica tu conexión e intenta nuevamente.';
      }
    });
  }

  verificarCodigo(form: NgForm) {
    if (form.invalid || this.isLoading) return;

    this.isLoading = true;
    this.mensaje = '';
    this.error = '';

    this.usuarioService.verificarCodigoRecuperacion(this.correo, this.codigo).subscribe({
      next: (valido) => {
        this.isLoading = false;

        if (valido) {
          this.mensaje = 'Código verificado correctamente. Ahora puedes cambiar tu contraseña.';
          this.pasoActual = 3;

          setTimeout(() => {
            this.mensaje = '';
          }, 3000);
        } else {
          this.error = 'El código ingresado no es válido o ha expirado. Verifica e intenta nuevamente.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Ocurrió un error al verificar el código. Intenta nuevamente.';
      }
    });
  }

  cambiarClave(form: NgForm) {
    if (form.invalid || this.isLoading) return;

    this.mensaje = '';
    this.error = '';

    if (this.nuevaClave !== this.confirmarClave) {
      this.error = 'Las contraseñas no coinciden. Verifica e intenta nuevamente.';
      return;
    }

    if (this.nuevaClave.trim().length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.isLoading = true;

    this.usuarioService.cambiarPasswordConCodigo(this.correo, this.codigo, this.nuevaClave).subscribe({
      next: (cambiado) => {
        this.isLoading = false;

        if (cambiado) {
          this.mensaje = '¡Contraseña actualizada correctamente! Redirigiendo al login...';

          setTimeout(() => {
            this.limpiarFormulario();
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = 'No se pudo cambiar la contraseña. El código puede haber expirado. Solicita uno nuevo.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Ocurrió un error al cambiar la contraseña. Intenta nuevamente.';
      }
    });
  }

  volverPaso(paso: number) {
    this.pasoActual = paso;
    this.mensaje = '';
    this.error = '';
  }

  private limpiarFormulario() {
    this.pasoActual = 1;
    this.correo = '';
    this.codigo = '';
    this.nuevaClave = '';
    this.confirmarClave = '';
    this.mensaje = '';
    this.error = '';
    this.isLoading = false;
  }
}