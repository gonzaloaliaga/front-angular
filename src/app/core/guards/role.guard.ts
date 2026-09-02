import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolRequerido = route.data['rolEsperado'];

  if (authService.tieneRol(rolRequerido)) {
    return true;
  }
  console.warn(`Acceso bloqueado: Necesitas ser ${rolRequerido} para ver esto.`);
    return router.createUrlTree(['/login']);
};