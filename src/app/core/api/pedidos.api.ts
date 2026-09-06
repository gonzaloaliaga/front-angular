import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoPedido, Modalidad } from '../models/pedido.model';

export interface ItemPedidoApi {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoApi {
  id: number;
  clienteNombre: string;
  clienteCorreo: string;
  localId: number;
  modalidad: Modalidad;
  direccionDespacho: string | null;
  estado: EstadoPedido;
  total: number;
  creadoEn: string;
  actualizadoEn: string;
  items: ItemPedidoApi[];
}

export interface CrearPedidoPayload {
  clienteNombre: string;
  clienteCorreo: string;
  localId: number;
  modalidad: Modalidad;
  direccionDespacho?: string;
  items: { productoId: number; cantidad: number }[];
}

export interface EventoAuditoriaApi {
  id: number;
  pedidoId: number;
  descripcion: string;
  rol: string;
  fecha: string;
}

export interface ResumenVentasApi {
  ventasTotales: number;
  totalPedidos: number;
  totalEntregados: number;
  porLocal: { localId: number; total: number }[];
}

@Injectable({ providedIn: 'root' })
export class PedidosApi {
  private http = inject(HttpClient);
  private baseUrl = environment.apiPedidosUrl;

  listar(estado?: EstadoPedido): Observable<PedidoApi[]> {
    const url = estado ? `${this.baseUrl}/pedidos?estado=${encodeURIComponent(estado)}` : `${this.baseUrl}/pedidos`;
    return this.http.get<PedidoApi[]>(url);
  }

  misPedidos(correo: string): Observable<PedidoApi[]> {
    return this.http.get<PedidoApi[]>(`${this.baseUrl}/pedidos/cliente/${encodeURIComponent(correo)}`);
  }

  crear(payload: CrearPedidoPayload): Observable<PedidoApi> {
    return this.http.post<PedidoApi>(`${this.baseUrl}/pedidos`, payload);
  }

  cambiarEstado(id: number, nuevoEstado: 'En preparación' | 'Hecho'): Observable<PedidoApi> {
    return this.http.patch<PedidoApi>(`${this.baseUrl}/pedidos/${id}/estado`, { nuevoEstado });
  }

  entregar(id: number): Observable<PedidoApi> {
    return this.http.patch<PedidoApi>(`${this.baseUrl}/pedidos/${id}/entregar`, {});
  }

  eventos(): Observable<EventoAuditoriaApi[]> {
    return this.http.get<EventoAuditoriaApi[]>(`${this.baseUrl}/eventos-auditoria`);
  }

  resumen(): Observable<ResumenVentasApi> {
    return this.http.get<ResumenVentasApi>(`${this.baseUrl}/pedidos/resumen`);
  }
}
