import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PedidosStore } from '../../core/state/pedidos.store';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent {
  store = inject(PedidosStore);

  maxVentaLocal(): number {
    const locales = this.store.pedidosPorLocal();
    return locales.length ? locales[0].total : 1;
  }
}
