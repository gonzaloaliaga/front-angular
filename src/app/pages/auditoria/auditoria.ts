import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PedidosApi, EventoAuditoriaApi, ResumenVentasApi } from '../../core/api/pedidos.api';
import { InventarioApi } from '../../core/api/inventario.api';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent {
  private pedidosApi = inject(PedidosApi);
  private inventarioApi = inject(InventarioApi);

  resumen = signal<ResumenVentasApi | null>(null);
  eventos = signal<EventoAuditoriaApi[]>([]);
  nombreLocalPorId = signal<Map<number, string>>(new Map());
  errorCarga = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.errorCarga.set(null);
    this.inventarioApi.listarLocales().subscribe({
      next: (locales) => this.nombreLocalPorId.set(new Map(locales.map(l => [l.id, l.nombre])))
    });
    this.pedidosApi.resumen().subscribe({
      next: (r) => this.resumen.set(r),
      error: () => this.errorCarga.set('No se pudo conectar con el microservicio de Pedidos (puerto 8082).')
    });
    this.pedidosApi.eventos().subscribe({ next: (e) => this.eventos.set(e) });
  }

  maxVentaLocal(): number {
    const filas = this.resumen()?.porLocal ?? [];
    return filas.length ? Math.max(...filas.map(f => f.total)) : 1;
  }
}
