import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { ChangeComponent, Alert } from '../../shared/components/change/change.component';

@Component({
  selector: 'app-olvide-clave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChangeComponent],
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
  alerts: Alert[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  pushAlert(type: Alert['type'], message: string, duration = 3500): void {
    const alert: Alert = { type, message, duration };
    this.alerts = [...this.alerts, alert];

    setTimeout(() => {
      this.removeAlert(alert);
    }, duration);
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter(a => a !== alert);
  }

  enviarCodigo(form: NgForm): void {
    if (form.invalid || this.isLoading) return;

    this.isLoading = true;
    this.alerts = [];

    this.usuarioService.solicitarCodigoRecuperacion(this.correo).subscribe({
      next: (enviado) => {
        this.isLoading = false;

        if (enviado) {
          this.pushAlert(
            'success',
            `Se envió un código de verificación a ${this.correo}. Revisa tu bandeja de entrada.`,
            5000
          );
          this.pasoActual = 2;
        } else {
          this.pushAlert('error', 'No se pudo enviar el código. Intenta nuevamente.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.pushAlert(
          'error',
          'Ocurrió un error al enviar el código. Verifica tu conexión e intenta nuevamente.'
        );
      }
    });
  }

  verificarCodigo(form: NgForm): void {
    if (form.invalid || this.isLoading) return;

    this.isLoading = true;
    this.alerts = [];

    this.usuarioService.verificarCodigoRecuperacion(this.correo, this.codigo).subscribe({
      next: (valido) => {
        this.isLoading = false;

        if (valido) {
          this.pushAlert(
            'success',
            'Código verificado correctamente. Ahora puedes cambiar tu contraseña.',
            3000
          );
          this.pasoActual = 3;
        } else {
          this.pushAlert(
            'error',
            'El código ingresado no es válido o ha expirado. Verifica e intenta nuevamente.'
          );
        }
      },
      error: () => {
        this.isLoading = false;
        this.pushAlert('error', 'Ocurrió un error al verificar el código. Intenta nuevamente.');
      }
    });
  }

  cambiarClave(form: NgForm): void {
    if (form.invalid || this.isLoading) return;

    this.alerts = [];

    if (this.nuevaClave !== this.confirmarClave) {
      this.pushAlert('error', 'Las contraseñas no coinciden. Verifica e intenta nuevamente.');
      return;
    }

    if (this.nuevaClave.trim().length < 6) {
      this.pushAlert('error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isLoading = true;

    this.usuarioService.cambiarPasswordConCodigo(this.correo, this.codigo, this.nuevaClave).subscribe({
      next: (cambiado) => {
        this.isLoading = false;

        if (cambiado) {
          this.pushAlert(
            'success',
            '¡Contraseña actualizada correctamente! Redirigiendo al login...',
            2000
          );

          setTimeout(() => {
            this.limpiarFormulario();
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.pushAlert(
            'error',
            'No se pudo cambiar la contraseña. El código puede haber expirado. Solicita uno nuevo.'
          );
        }
      },
      error: () => {
        this.isLoading = false;
        this.pushAlert('error', 'Ocurrió un error al cambiar la contraseña. Intenta nuevamente.');
      }
    });
  }

  volverPaso(paso: number): void {
    this.pasoActual = paso;
    this.alerts = [];
  }

  private limpiarFormulario(): void {
    this.pasoActual = 1;
    this.correo = '';
    this.codigo = '';
    this.nuevaClave = '';
    this.confirmarClave = '';
    this.alerts = [];
    this.isLoading = false;
  }
}