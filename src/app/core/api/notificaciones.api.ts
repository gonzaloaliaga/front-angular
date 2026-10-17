import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificacionApi {
  id: number;
  pedidoId: number | null;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

export interface NotificacionesRespuesta {
  noLeidas: number;
  notificaciones: NotificacionApi[];
}

/**
 * Notificaciones de la campanita. El backend decide de quién son según el token:
 * el cliente ve las suyas y Auditoría ve las alertas de stock.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesApi {
  private http = inject(HttpClient);
  private baseUrl = environment.apiPedidosUrl;

  misNotificaciones(): Observable<NotificacionesRespuesta> {
    return this.http.get<NotificacionesRespuesta>(`${this.baseUrl}/notificaciones/mias`);
  }

  marcarLeida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/notificaciones/${id}/leida`, {});
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/notificaciones/leidas`, {});
  }
}