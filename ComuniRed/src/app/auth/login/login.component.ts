import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UsuarioService, Usuario, LoginResult } from '../../services/usuario.service';
import { ChangeComponent, Alert } from '../../shared/components/change/change.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChangeComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  alerts: Alert[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.alerts = [];

    this.usuarioService.loginAndStore(this.email, this.password).subscribe({
      next: (res: LoginResult) => {
        const usuario: Usuario | null = res?.usuario ?? this.usuarioService.getUser();
        const token = this.usuarioService.getToken();

        if (!token || !usuario) {
          this.isLoading = false;
          this.pushAlert('error', 'Usuario o contraseña incorrectos.');
          return;
        }

        this.isLoading = false;
        this.pushAlert('success', 'Inicio de sesión exitoso.');

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          setTimeout(() => {
            this.router.navigateByUrl(returnUrl);
          }, 500);
          return;
        }

        setTimeout(() => {
          const roles = this.usuarioService.getRoles() || [];
          const rolId = usuario.rol_id || null;

          const isAdmin =
            roles.some(r => /^admin/i.test(String(r))) ||
            String(rolId) === '68ca68c40bc4d9ca3267b667';

          const isSoporte =
            roles.some(r => /soporte|support/i.test(String(r))) ||
            String(rolId) === '68ca68bb0bc4d9ca3267b665';

          if (isAdmin) {
            this.router.navigate(['/admin/dashboard']);
          } else if (isSoporte) {
            this.router.navigate(['/soporte']);
          } else {
            this.router.navigate(['/public/home']);
          }
        }, 600);
      },
      error: (err) => {
        this.isLoading = false;

        const gqlMessage = err?.graphQLErrors?.[0]?.message || err?.message || '';

        if (
          gqlMessage.toLowerCase().includes('password') ||
          gqlMessage.toLowerCase().includes('email') ||
          gqlMessage.toLowerCase().includes('credenciales')
        ) {
          this.pushAlert('error', 'Usuario o contraseña incorrectos.');
        } else {
          this.pushAlert('error', 'Error al iniciar sesión. Intenta de nuevo.');
        }
      }
    });
  }

  pushAlert(type: Alert['type'], message: string, duration = 3000): void {
    const alert: Alert = { type, message, duration };
    this.alerts = [...this.alerts, alert];

    setTimeout(() => {
      this.removeAlert(alert);
    }, duration);
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter(a => a !== alert);
  }
}