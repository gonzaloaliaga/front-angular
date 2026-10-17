import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth';
import { CarritoService } from '../../core/carrito/carrito';
import { NotificacionApi } from '../../core/api/notificaciones.api';
import { NotificacionesStore } from '../../core/state/notificaciones.store';

const CLAVE_CONSENTIMIENTO = 'pedidos360_consentimiento';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, DatePipe],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private notificacionesStore = inject(NotificacionesStore);
  private destroyRef = inject(DestroyRef);

  // Si llegamos aquí, MsalGuard ya garantizó que hay sesión activa.
  rol = signal(this.authService.rolActual());
  nombre = signal(this.authService.obtenerNombre());
  correo = signal(this.authService.obtenerCorreo());

  cartCount = this.carritoService.cantidadTotal;
  consentAccepted = signal<boolean>(!!localStorage.getItem(CLAVE_CONSENTIMIENTO));

  // Campanita: el cliente ve los avisos de sus pedidos y Auditoría ve las alertas de stock bajo.
  mostrarCampana = computed(() => this.rol() === 'cliente' || this.rol() === 'auditoria');
  notificaciones = this.notificacionesStore.notificaciones;
  noLeidas = this.notificacionesStore.noLeidas;
  panelAbierto = signal<boolean>(false);

  etiquetaRol = computed(() => {
    switch (this.rol()) {
      case 'cocina': return 'Panel de Cocina';
      case 'despacho': return 'Panel de Despacho';
      case 'auditoria': return 'Panel de Auditoría';
      default: return 'Catálogo';
    }
  });

  constructor() {
    if (this.mostrarCampana()) {
      this.notificacionesStore.iniciar();
      this.destroyRef.onDestroy(() => this.notificacionesStore.detener());
    }
  }

  alternarPanel(): void {
    this.panelAbierto.update(abierto => !abierto);
  }

  cerrarPanel(): void {
    this.panelAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  alPulsarEscape(): void {
    this.cerrarPanel();
  }

  alElegirNotificacion(notificacion: NotificacionApi): void {
    this.notificacionesStore.marcarLeida(notificacion.id);
  }

  marcarTodasLeidas(): void {
    this.notificacionesStore.marcarTodasLeidas();
  }

  acceptConsent(): void {
    // Guardamos solo lo mínimo: que aceptó, y cuándo. Nada de datos personales extra.
    localStorage.setItem(CLAVE_CONSENTIMIENTO, new Date().toISOString());
    this.consentAccepted.set(true);
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}