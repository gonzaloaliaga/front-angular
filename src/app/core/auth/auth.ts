import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

/** Roles soportados por el sistema (coinciden con los App Roles de Azure AD). */
export const ROLES_SISTEMA = ['cliente', 'cocina', 'despacho', 'auditoria'] as const;
export type Rol = (typeof ROLES_SISTEMA)[number];

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private msalService: MsalService) {}

  obtenerRoles(): string[] {
    const cuentaActiva = this.msalService.instance.getActiveAccount();

    // Si la cuenta existe y Microsoft le adjuntó roles, los devolvemos. Si no, array vacío.
    if (cuentaActiva && cuentaActiva.idTokenClaims && cuentaActiva.idTokenClaims['roles']) {
      return (cuentaActiva.idTokenClaims['roles'] as string[]).map(r => r.toLowerCase());
    }

    return [];
  }

  tieneRol(rolBuscado: string): boolean {
    const rolesUsuario = this.obtenerRoles();
    // Normalizamos AMBOS lados a minúscula (antes solo se normalizaba rolBuscado).
    return rolesUsuario.includes(rolBuscado.toLowerCase());
  }

  /** Devuelve el primer rol reconocido del usuario, o null si no tiene ninguno válido. */
  rolActual(): Rol | null {
    const roles = this.obtenerRoles();
    return (ROLES_SISTEMA.find(r => roles.includes(r)) ?? null);
  }

  obtenerNombre(): string {
    const cuenta = this.msalService.instance.getActiveAccount();
    return cuenta?.name ?? cuenta?.username?.split('@')[0] ?? 'Usuario';
  }

  obtenerCorreo(): string {
    const cuenta = this.msalService.instance.getActiveAccount();
    return cuenta?.username ?? '';
  }

  cerrarSesion(): void {
    this.msalService.logoutRedirect();
  }
}
