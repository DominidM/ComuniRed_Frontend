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

  private getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
    // Chequea roles en el child; si no hay, mira en el parent (útil cuando canActivateChild se aplica en el padre)
    const childRoles: string[] = route.data?.['roles'] || [];
    if (childRoles.length > 0) return childRoles;
    const parentRoles: string[] = route.parent?.data?.['roles'] || [];
    return parentRoles;
  }

  private check(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const token = this.usuarioService.getToken();
    const tokenExpired = this.isTokenExpired(token);
    const requiredRoles: string[] = this.getRequiredRoles(route) || [];
    const userRoles = this.usuarioService.getRoles() || [];

    console.log('==============================');
    console.log('[AuthGuard] URL:', state.url);
    console.log('[AuthGuard] token:', token);
    console.log('[AuthGuard] tokenExpired:', tokenExpired);
    console.log('[AuthGuard] route.data:', route.data);
    console.log('[AuthGuard] parent.data:', route.parent?.data);
    console.log('[AuthGuard] requiredRoles:', requiredRoles);
    console.log('[AuthGuard] userRoles:', userRoles);

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
