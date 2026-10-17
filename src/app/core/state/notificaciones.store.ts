import { Injectable, inject, signal } from '@angular/core';
import { NotificacionApi, NotificacionesApi } from '../api/notificaciones.api';

const INTERVALO_MS = 30_000;

/**
 * Estado de la campanita. Consulta al backend cada 30 segundos (polling): así el usuario ve las
 * notificaciones que van llegando por RabbitMQ sin recargar la página, y el navegador nunca
 * se conecta directamente al broker.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesStore {
  private api = inject(NotificacionesApi);
  private temporizador: ReturnType<typeof setInterval> | null = null;

  private _notificaciones = signal<NotificacionApi[]>([]);
  private _noLeidas = signal<number>(0);

  notificaciones = this._notificaciones.asReadonly();
  noLeidas = this._noLeidas.asReadonly();

  iniciar(): void {
    if (this.temporizador) return;
    this.cargar();
    this.temporizador = setInterval(() => this.cargar(), INTERVALO_MS);
  }

  detener(): void {
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
    this._notificaciones.set([]);
    this._noLeidas.set(0);
  }

  marcarLeida(id: number): void {
    const notificacion = this._notificaciones().find(n => n.id === id);
    if (!notificacion || notificacion.leida) return;

    // Se actualiza la pantalla de inmediato; si el backend falla, se vuelve a cargar el estado real.
    this._notificaciones.update(lista => lista.map(n => (n.id === id ? { ...n, leida: true } : n)));
    this._noLeidas.update(cantidad => Math.max(0, cantidad - 1));
    this.api.marcarLeida(id).subscribe({ error: () => this.cargar() });
  }

  marcarTodasLeidas(): void {
    if (this._noLeidas() === 0) return;

    this._notificaciones.update(lista => lista.map(n => ({ ...n, leida: true })));
    this._noLeidas.set(0);
    this.api.marcarTodasLeidas().subscribe({ error: () => this.cargar() });
  }

  private cargar(): void {
    this.api.misNotificaciones().subscribe({
      next: respuesta => {
        this._notificaciones.set(respuesta.notificaciones);
        this._noLeidas.set(respuesta.noLeidas);
      },
      error: () => {
        // Sin conexión o sesión vencida: se conserva lo que ya se ve y se reintenta en el próximo ciclo.
      }
    });
  }
}