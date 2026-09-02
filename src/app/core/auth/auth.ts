import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private msalService: MsalService) {}

  obtenerRoles(): string[] {
    const cuentaActiva = this.msalService.instance.getActiveAccount();
    
    // Si la cuenta existe y Microsoft le adjuntó roles, los devolvemos. Si no, array vacío.
    if (cuentaActiva && cuentaActiva.idTokenClaims && cuentaActiva.idTokenClaims['roles']) {
      return cuentaActiva.idTokenClaims['roles'] as string[];
    }
    
    return [];
  }

  tieneRol(rolBuscado: string): boolean {
    const rolesUsuario = this.obtenerRoles();
    // Transformamos a minúscula para evitar errores de tipeo (ej: 'Ventas' vs 'ventas')
    return rolesUsuario.includes(rolBuscado.toLowerCase()); 
  }
}