import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UsuarioService, Usuario, LoginResult } from '../../services/usuario.service';

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

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login() {
    if (this.isLoading) return;
    console.log('login() called', { email: this.email });
    this.isLoading = true;
    this.showError = null;

    this.usuarioService.loginAndStore(this.email, this.password).subscribe({
      next: (res: LoginResult) => {
        console.log('login success', res);
        this.isLoading = false;
        this.showSuccess = true;

        // Si la respuesta incluye usuario lo usamos; si no, intentamos obtenerlo desde el service
        const usuario: Usuario | null = res.usuario ?? this.usuarioService.getUser();

        // redirigir inmediatamente si hay returnUrl (el guard lo pone)
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          // esperamos un corto delay para que el token quede guardado y Apollo pueda leerlo
          setTimeout(() => {
            this.showSuccess = false;
            this.router.navigateByUrl(returnUrl);
          }, 250);
          return;
        }

        setTimeout(() => {
          this.showSuccess = false;

          if (!usuario) {
            this.router.navigate(['/public/home']);
            return;
          }

          const roles = this.usuarioService.getRoles();
          const rolId = usuario.rol_id || null;

          const isAdmin = roles.some(r => /^admin/i.test(String(r))) ||
                          String(rolId) === '68ca68c40bc4d9ca3267b667';

          const isSoporte = roles.some(r => /soporte|support/i.test(String(r))) ||
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
        console.error('login error', err);
        this.isLoading = false;

        // Manejo de errores GraphQL y mensajes predeterminados
        const gqlMessage = err?.graphQLErrors?.[0]?.message || err?.message;
        if (gqlMessage && (gqlMessage.toLowerCase().includes('password') || gqlMessage.toLowerCase().includes('email') || gqlMessage.toLowerCase().includes('credenciales'))) {
          this.showError = 'Usuario o contraseña incorrectos.';
        } else {
          this.showError = 'Error al iniciar sesión. Intenta de nuevo.';
        }

        setTimeout(() => this.showError = null, 3000);
      }
    });
  }
}