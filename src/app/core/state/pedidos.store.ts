import { Injectable, computed, signal } from '@angular/core';
import { EstadoPedido, EventoAuditoria, ItemPedido, Modalidad, Pedido } from '../models/pedido.model';

/**
 * Store en memoria que simula el ciclo de vida de un pedido mientras no existe backend.
 * Cuando lleguen los microservicios, este store se reemplaza por llamadas HTTP,
 * pero la forma de consumirlo desde los componentes (signals + computed) no cambia.
 */
@Injectable({ providedIn: 'root' })
export class PedidosStore {
  private contadorId = 1004;
  private contadorEvento = 1;

  private _pedidos = signal<Pedido[]>([
    {
      id: 1001,
      cliente: 'Javiera Muñoz',
      local: 'Pan Artesanal',
      items: [{ productoId: 1, nombre: 'Empanada de Pino', cantidad: 4, precioUnitario: 2500 }],
      total: 10000,
      modalidad: 'Retiro en tienda',
      estado: 'Pendiente',
      creadoEn: new Date(Date.now() - 1000 * 60 * 6)
    },
    {
      id: 1002,
      cliente: 'Bastián Rojas',
      local: 'Café Central',
      items: [{ productoId: 3, nombre: 'Café Americano', cantidad: 2, precioUnitario: 1800 }],
      total: 3600,
      modalidad: 'Despacho a domicilio',
      direccion: 'Av. Siempreviva 742, La Florida',
      estado: 'En preparación',
      creadoEn: new Date(Date.now() - 1000 * 60 * 18)
    },
    {
      id: 1003,
      cliente: 'Fernanda Castro',
      local: 'Dulce Trigo',
      items: [{ productoId: 2, nombre: 'Torta Tres Leches', cantidad: 1, precioUnitario: 18900 }],
      total: 18900,
      modalidad: 'Retiro en tienda',
      estado: 'Hecho',
      creadoEn: new Date(Date.now() - 1000 * 60 * 40)
    }
  ]);

  private _eventos = signal<EventoAuditoria[]>([
    { id: 1, pedidoId: 1003, descripcion: 'Pedido #1003 marcado como Hecho en cocina.', rol: 'cocina', fecha: new Date(Date.now() - 1000 * 60 * 12) },
    { id: 2, pedidoId: 1002, descripcion: 'Pedido #1002 pasó a En preparación.', rol: 'cocina', fecha: new Date(Date.now() - 1000 * 60 * 15) }
  ]);

  pedidos = this._pedidos.asReadonly();
  eventos = this._eventos.asReadonly();

  // ---- Selectores para Cocina ----
  pendientes = computed(() => this._pedidos().filter(p => p.estado === 'Pendiente'));
  enPreparacion = computed(() => this._pedidos().filter(p => p.estado === 'En preparación'));
  hechos = computed(() => this._pedidos().filter(p => p.estado === 'Hecho'));

  // ---- Selectores para Despacho ----
  listosParaDespacho = computed(() => this._pedidos().filter(p => p.estado === 'Hecho'));
  entregados = computed(() => this._pedidos().filter(p => p.estado === 'Entregado'));

  // ---- Selectores para Auditoría ----
  ventasHoy = computed(() =>
    this._pedidos()
      .filter(p => p.estado !== 'Cancelado')
      .reduce((acc, p) => acc + p.total, 0)
  );
  pedidosPorLocal = computed(() => {
    const mapa = new Map<string, number>();
    for (const p of this._pedidos()) {
      mapa.set(p.local, (mapa.get(p.local) ?? 0) + p.total);
    }
    return [...mapa.entries()]
      .map(([local, total]) => ({ local, total }))
      .sort((a, b) => b.total - a.total);
  });

  crearPedido(cliente: string, items: ItemPedido[], modalidad: Modalidad, local: string, direccion?: string): Pedido {
    const nuevo: Pedido = {
      id: ++this.contadorId,
      cliente,
      local,
      items,
      total: items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0),
      modalidad,
      direccion,
      estado: 'Pendiente',
      creadoEn: new Date()
    };
    this._pedidos.update(lista => [nuevo, ...lista]);
    this.registrarEvento(nuevo.id, `Pedido #${nuevo.id} creado por ${cliente}.`, 'cliente');
    return nuevo;
  }

  cambiarEstadoCocina(id: number, nuevoEstado: Extract<EstadoPedido, 'En preparación' | 'Hecho'>): void {
    this.actualizarEstado(id, nuevoEstado, 'cocina', `Pedido #${id} pasó a ${nuevoEstado}.`);
  }

  marcarEntregado(id: number): void {
    this.actualizarEstado(id, 'Entregado', 'despacho', `Pedido #${id} entregado.`);
  }

  pedidosDeCliente(nombreCliente: string): Pedido[] {
    return this._pedidos().filter(p => p.cliente === nombreCliente);
  }

  private actualizarEstado(id: number, estado: EstadoPedido, rol: string, descripcion: string): void {
    this._pedidos.update(lista => lista.map(p => (p.id === id ? { ...p, estado } : p)));
    this.registrarEvento(id, descripcion, rol);
  }

  private registrarEvento(pedidoId: number, descripcion: string, rol: string): void {
    this._eventos.update(lista => [
      { id: ++this.contadorEvento, pedidoId, descripcion, rol, fecha: new Date() },
      ...lista
    ]);
  }
}
