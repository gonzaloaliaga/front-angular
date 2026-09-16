import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PedidosApi, PedidoApi } from '../../core/api/pedidos.api';

@Component({
  selector: 'app-cocina',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './cocina.html',
  styleUrl: './cocina.css',
})
export class CocinaComponent {
  private pedidosApi = inject(PedidosApi);

  pendientes = signal<PedidoApi[]>([]);
  enPreparacion = signal<PedidoApi[]>([]);
  hechos = signal<PedidoApi[]>([]);
  errorCarga = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.errorCarga.set(null);
    this.pedidosApi.listar('Pendiente').subscribe({
      next: (p) => this.pendientes.set(p),
      error: () => this.errorCarga.set('No se pudo conectar con el microservicio de Pedidos (puerto 8082).')
    });
    this.pedidosApi.listar('En preparación').subscribe({ next: (p) => this.enPreparacion.set(p) });
    this.pedidosApi.listar('Hecho').subscribe({ next: (p) => this.hechos.set(p) });
  }

  iniciarPreparacion(id: number) {
    this.pedidosApi.cambiarEstado(id, 'En preparación').subscribe({ next: () => this.cargar() });
  }

  marcarHecho(id: number) {
    this.pedidosApi.cambiarEstado(id, 'Hecho').subscribe({ next: () => this.cargar() });
  }
}
