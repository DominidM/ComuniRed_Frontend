import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
  ) {}

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

  private getRolesFromToken(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Ajusta las keys según lo que tu backend mete en el JWT
      if (payload.roles && Array.isArray(payload.roles)) return payload.roles;
      if (payload.rol_id) return [payload.rol_id];
      if (payload.role) return [payload.role];
      return [];
    } catch {
      return [];
    }
  }

  private getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
    let current: ActivatedRouteSnapshot | null = route;
    while (current) {
      const roles: string[] = current.data?.['roles'] || [];
      if (roles.length > 0) return roles;
      current = current.parent;
    }
    return [];
  }

  private check(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const token = this.usuarioService.getToken();
    const tokenExpired = this.isTokenExpired(token);
    const requiredRoles: string[] = this.getRequiredRoles(route) || [];

    // Roles desde el servicio; si están vacíos los saca directo del JWT
    const serviceRoles = this.usuarioService.getRoles() || [];
    const userRoles =
      serviceRoles.length > 0
        ? serviceRoles
        : token
          ? this.getRolesFromToken(token)
          : [];

    console.log('==============================');
    console.log('[AuthGuard] URL:', state.url);
    console.log('[AuthGuard] token:', token);
    console.log('[AuthGuard] tokenExpired:', tokenExpired);
    console.log('[AuthGuard] requiredRoles:', requiredRoles);
    console.log('[AuthGuard] userRoles (final):', userRoles);

    if (!token || tokenExpired) {
      console.warn('[AuthGuard] token inválido o expirado');
      this.usuarioService.logout();
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((rr) =>
        userRoles.some(
          (ur) => String(ur).toLowerCase() === String(rr).toLowerCase(),
        ),
      );

      console.log('[AuthGuard] hasRole:', hasRole);

      if (!hasRole) {
        console.warn('[AuthGuard] roles insuficientes');
        return this.router.createUrlTree(['/login']);
      }
    }

    console.log('[AuthGuard] acceso permitido');
    return true;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    return this.check(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    return this.check(childRoute, state);
  }
}