import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  categoria: string;
}

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css']
})

export class ClienteComponent {
  productos = signal<Producto[]>([
    {
      id: 1,
      nombre: 'Empanada de Pino',
      descripcion: 'Clásica empanada de pino horneada, receta tradicional.',
      precio: 2500,
      stock: 50,
      imagenUrl: 'https://images.unsplash.com/photo-1626200419189-3b589a813c98?auto=format&fit=crop&w=500&q=80',
      categoria: 'Panadería'
    },
    {
      id: 2,
      nombre: 'Torta Tres Leches',
      descripcion: 'Suave bizcocho bañado en tres leches con merengue suizo. (15 personas)',
      precio: 18900,
      stock: 5,
      imagenUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=500&q=80',
      categoria: 'Pastelería'
    },
    {
      id: 3,
      nombre: 'Café Americano',
      descripcion: 'Café de grano recién molido, tostado medio.',
      precio: 1800,
      stock: 100,
      imagenUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80',
      categoria: 'Cafetería'
    }
  ]);

  agregarAlCarrito(producto: Producto) {
    console.log(`Intentando agregar ${producto.nombre} al carrito...`);
    alert(`Agregaste ${producto.nombre} al carrito.`);
  }
}