import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css'
})
export class Cliente {
    categoriaSeleccionada = signal<string>('Panadería');
  
  productos = signal([
    { id: 1, nombre: 'Marraqueta', categoria: 'Panadería', precio: 1500 },
    { id: 2, nombre: 'Croissant', categoria: 'Pastelería', precio: 2200 },
    { id: 3, nombre: 'Latte Vainilla', categoria: 'Cafetería', precio: 3500 },
    { id: 4, nombre: 'Hallulla', categoria: 'Panadería', precio: 1500 }
  ]);

  // Un Signal computado que reacciona automáticamente al cambio de pestaña
  productosFiltrados = computed(() => {
    return this.productos().filter(p => p.categoria === this.categoriaSeleccionada());
  });

  cambiarCategoria(nuevaCategoria: string) {
    this.categoriaSeleccionada.set(nuevaCategoria);
  }
}