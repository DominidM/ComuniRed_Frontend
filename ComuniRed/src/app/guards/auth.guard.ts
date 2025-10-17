import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private usuarioService: UsuarioService, private router: Router) {}

  private isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  private check(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const token = this.usuarioService.getToken();
    if (!token || this.isTokenExpired(token)) {
      // Si token inválido o expirado -> borrar y redirigir a login con returnUrl
      this.usuarioService.logout();
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
    }

    const requiredRoles: string[] = route.data?.['roles'] || [];
    if (requiredRoles.length > 0) {
      const userRoles = this.usuarioService.getRoles() || [];
      const hasRole = requiredRoles.some(rr => userRoles.some(ur => String(ur).toLowerCase() === String(rr).toLowerCase()));
      if (!hasRole) {
        // No autorizado: redirige a login o a otra ruta "no autorizado"
        return this.router.createUrlTree(['/login']);
      }
    }

    return true;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(route, state);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(childRoute, state);
  }
}