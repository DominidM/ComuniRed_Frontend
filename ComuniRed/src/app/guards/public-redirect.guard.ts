import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

export const publicRedirectGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const usuarioService = inject(UsuarioService);

  const user = usuarioService.getUser();
  const roles = usuarioService.getRoles() || [];

  console.log('=== publicRedirectGuard ===');
  console.log('user:', user);
  console.log('roles:', roles);
  console.log('roles raw string:', JSON.stringify(roles));

  if (!user) {
    console.log('→ sin usuario, permite');
    return true;
  }

  const isAdmin = roles.some(
    (r) =>
      String(r).toLowerCase().includes('admin') ||
      String(r).toLowerCase() === 'rol_admin' ||
      String(r) === '68ca68c40bc4d9ca3267b667',
  );

  console.log('→ isAdmin:', isAdmin);

  if (isAdmin) {
    console.log('→ es admin, PERMITE entrada a public');
    return true;
  }

  const isSoporte = roles.some(
    (r) =>
      /soporte|support/i.test(String(r)) ||
      String(r) === '68ca68bb0bc4d9ca3267b665',
  );

  console.log('→ isSoporte:', isSoporte);

  if (isSoporte) {
    console.log('→ es soporte, redirige');
    return router.createUrlTree(['/soporte/clasificacion']);
  }

  console.log('→ usuario normal, permite');
  return true;
};
