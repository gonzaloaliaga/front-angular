import { Injectable, computed, signal } from '@angular/core';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  categoria: string;
  local: string;
  localId: number;
}

export interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private _lineas = signal<LineaCarrito[]>([]);
  lineas = this._lineas.asReadonly();

  cantidadTotal = computed(() => this._lineas().reduce((acc, l) => acc + l.cantidad, 0));
  subtotal = computed(() => this._lineas().reduce((acc, l) => acc + l.cantidad * l.producto.precio, 0));

  agregar(producto: Producto): void {
    this._lineas.update(lineas => {
      const existente = lineas.find(l => l.producto.id === producto.id);
      if (existente) {
        return lineas.map(l => (l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l));
      }
      return [...lineas, { producto, cantidad: 1 }];
    });
  }

  quitarUno(productoId: number): void {
    this._lineas.update(lineas =>
      lineas
        .map(l => (l.producto.id === productoId ? { ...l, cantidad: l.cantidad - 1 } : l))
        .filter(l => l.cantidad > 0)
    );
  }

  eliminar(productoId: number): void {
    this._lineas.update(lineas => lineas.filter(l => l.producto.id !== productoId));
  }

  vaciar(): void {
    this._lineas.set([]);
  }
}
