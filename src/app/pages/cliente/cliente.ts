import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth';
import { CarritoService, Producto } from '../../core/carrito/carrito';
import { PedidosStore } from '../../core/state/pedidos.store';
import { Modalidad } from '../../core/models/pedido.model';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css']
})
export class ClienteComponent {
  private authService = inject(AuthService);
  private pedidosStore = inject(PedidosStore);
  carritoService = inject(CarritoService);

  nombre = this.authService.obtenerNombre();
  correo = this.authService.obtenerCorreo();

  vista = signal<'catalogo' | 'cuenta'>('catalogo');
  categoriaSeleccionada = signal<string>('Todas');
  modalidad = signal<Modalidad>('Retiro en tienda');
  direccion = signal<string>('');
  pedidoConfirmado = signal<number | null>(null);

  categorias = ['Todas', 'Panadería', 'Pastelería', 'Cafetería', 'Empanadas'];

  productos = signal<Producto[]>([
    { id: 1, nombre: 'Empanada de Pino', descripcion: 'Clásica empanada horneada, receta tradicional.', precio: 2500, stock: 50, categoria: 'Empanadas', local: 'Pan Artesanal', imagenUrl: 'https://images.unsplash.com/photo-1626200419189-3b589a813c98?auto=format&fit=crop&w=500&q=80' },
    { id: 2, nombre: 'Torta Tres Leches', descripcion: 'Bizcocho bañado en tres leches con merengue suizo (15 personas).', precio: 18900, stock: 5, categoria: 'Pastelería', local: 'Dulce Trigo', imagenUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=500&q=80' },
    { id: 3, nombre: 'Café Americano', descripcion: 'Café de grano recién molido, tostado medio.', precio: 1800, stock: 100, categoria: 'Cafetería', local: 'Café Central', imagenUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80' },
    { id: 4, nombre: 'Marraqueta x4', descripcion: 'Pan de trigo recién horneado, crocante por fuera.', precio: 1600, stock: 80, categoria: 'Panadería', local: 'Horno de Barrio', imagenUrl: 'https://images.unsplash.com/photo-1549931319-a545749fcd15?auto=format&fit=crop&w=500&q=80' },
    { id: 5, nombre: 'Kuchen de Manzana', descripcion: 'Kuchen alemán con manzanas caramelizadas.', precio: 6500, stock: 12, categoria: 'Pastelería', local: 'Aroma & Miga', imagenUrl: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=500&q=80' },
    { id: 6, nombre: 'Capuccino', descripcion: 'Espresso con leche vaporizada y espuma cremosa.', precio: 2200, stock: 100, categoria: 'Cafetería', local: 'Mesón del Café', imagenUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80' },
    { id: 7, nombre: 'Empanada de Queso', descripcion: 'Frita, con generoso relleno de queso.', precio: 2000, stock: 60, categoria: 'Empanadas', local: 'Trigal Norte', imagenUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80' },
    { id: 8, nombre: 'Hallulla x6', descripcion: 'Pan plano tradicional, recién salido del horno.', precio: 1400, stock: 90, categoria: 'Panadería', local: 'Pan Artesanal', imagenUrl: 'https://images.unsplash.com/photo-1585478259715-4d3a5f3b9f0a?auto=format&fit=crop&w=500&q=80' }
  ]);

  productosFiltrados = computed(() => {
    const cat = this.categoriaSeleccionada();
    return cat === 'Todas' ? this.productos() : this.productos().filter(p => p.categoria === cat);
  });

  misPedidos = computed(() => this.pedidosStore.pedidosDeCliente(this.nombre));

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregar(producto);
  }

  confirmarPedido() {
    const lineas = this.carritoService.lineas();
    if (lineas.length === 0) return;

    const items = lineas.map(l => ({
      productoId: l.producto.id,
      nombre: l.producto.nombre,
      cantidad: l.cantidad,
      precioUnitario: l.producto.precio
    }));
    const local = lineas[0].producto.local;
    const direccion = this.modalidad() === 'Despacho a domicilio' ? this.direccion() : undefined;

    const pedido = this.pedidosStore.crearPedido(this.nombre, items, this.modalidad(), local, direccion);
    this.carritoService.vaciar();
    this.pedidoConfirmado.set(pedido.id);
    this.vista.set('cuenta');
  }
}
