import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PedidosStore } from '../../core/state/pedidos.store';

@Component({
  selector: 'app-cocina',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './cocina.html',
  styleUrl: './cocina.css',
})
export class CocinaComponent {
  store = inject(PedidosStore);

  iniciarPreparacion(id: number) {
    this.store.cambiarEstadoCocina(id, 'En preparación');
  }

  marcarHecho(id: number) {
    this.store.cambiarEstadoCocina(id, 'Hecho');
  }
}
