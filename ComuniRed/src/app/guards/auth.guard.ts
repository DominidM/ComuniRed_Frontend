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

  private getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
    // Chequea roles en el child; si no hay, mira en el parent (útil cuando canActivateChild se aplica en el padre)
    const childRoles: string[] = route.data?.['roles'] || [];
    if (childRoles.length > 0) return childRoles;
    const parentRoles: string[] = route.parent?.data?.['roles'] || [];
    return parentRoles;
  }

  private check(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const token = this.usuarioService.getToken();
    const tokenExpired = this.isTokenExpired(token);

    // LOGGING de depuración (elimina o reduce en producción)
    console.log('[AuthGuard] checking route:', state.url);
    console.log('[AuthGuard] token:', token ? 'PRESENT' : 'MISSING', tokenExpired ? '(expired)' : '(valid)');
    console.log('[AuthGuard] user roles from service:', this.usuarioService.getRoles());

    if (!token || tokenExpired) {
      // Si está expirado o no existe: log out y redirigir a login con returnUrl
      console.warn('[AuthGuard] token inválido/expirado. Redirigiendo a /login');
      this.usuarioService.logout();
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
    }

    const requiredRoles: string[] = this.getRequiredRoles(route) || [];
    if (requiredRoles.length > 0) {
      const userRoles = this.usuarioService.getRoles() || [];
      const hasRole = requiredRoles.some(rr => userRoles.some(ur => String(ur).toLowerCase() === String(rr).toLowerCase()));
      console.log('[AuthGuard] requiredRoles=', requiredRoles, 'hasRole=', hasRole);
      if (!hasRole) {
        console.warn('[AuthGuard] usuario no autorizado (roles insuficientes). Redirigiendo a /login');
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