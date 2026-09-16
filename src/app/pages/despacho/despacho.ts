import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PedidosApi, PedidoApi } from '../../core/api/pedidos.api';

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './despacho.html',
  styleUrl: './despacho.css',
})
export class DespachoComponent {
  private pedidosApi = inject(PedidosApi);

  listosParaDespacho = signal<PedidoApi[]>([]);
  entregados = signal<PedidoApi[]>([]);
  errorCarga = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.errorCarga.set(null);
    this.pedidosApi.listar('Hecho').subscribe({
      next: (p) => this.listosParaDespacho.set(p),
      error: () => this.errorCarga.set('No se pudo conectar con el microservicio de Pedidos (puerto 8082).')
    });
    this.pedidosApi.listar('Entregado').subscribe({ next: (p) => this.entregados.set(p) });
  }

  entregar(id: number) {
    this.pedidosApi.entregar(id).subscribe({ next: () => this.cargar() });
  }
}
