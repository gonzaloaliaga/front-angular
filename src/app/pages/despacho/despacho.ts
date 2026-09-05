import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PedidosStore } from '../../core/state/pedidos.store';

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './despacho.html',
  styleUrl: './despacho.css',
})
export class DespachoComponent {
  store = inject(PedidosStore);

  entregar(id: number) {
    this.store.marcarEntregado(id);
  }
}
