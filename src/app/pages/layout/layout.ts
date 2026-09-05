import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth';
import { CarritoService } from '../../core/carrito/carrito';

const CLAVE_CONSENTIMIENTO = 'pedidos360_consentimiento';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);

  // Si llegamos aquí, MsalGuard ya garantizó que hay sesión activa.
  rol = signal(this.authService.rolActual());
  nombre = signal(this.authService.obtenerNombre());
  correo = signal(this.authService.obtenerCorreo());

  cartCount = this.carritoService.cantidadTotal;
  hasUnreadAlerts = signal<boolean>(true);
  consentAccepted = signal<boolean>(!!localStorage.getItem(CLAVE_CONSENTIMIENTO));

  etiquetaRol = computed(() => {
    switch (this.rol()) {
      case 'cocina': return 'Panel de Cocina';
      case 'despacho': return 'Panel de Despacho';
      case 'auditoria': return 'Panel de Auditoría';
      default: return 'Catálogo';
    }
  });

  acceptConsent(): void {
    // Guardamos solo lo mínimo: que aceptó, y cuándo. Nada de datos personales extra.
    localStorage.setItem(CLAVE_CONSENTIMIENTO, new Date().toISOString());
    this.consentAccepted.set(true);
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
