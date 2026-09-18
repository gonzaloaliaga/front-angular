import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductoApi {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  categoria: string;
  local: string;
  activo: boolean;
}

export interface LocalApi {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface CategoriaApi {
  id: number;
  nombre: string;
}

export interface ProductoPayload {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  categoriaId: number;
  localId: number;
}

@Injectable({ providedIn: 'root' })
export class InventarioApi {
  private http = inject(HttpClient);
  private baseUrl = environment.apiInventarioUrl;

  listarProductos(categoria?: string): Observable<ProductoApi[]> {
    const url = categoria && categoria !== 'Todas'
      ? `${this.baseUrl}/productos?categoria=${encodeURIComponent(categoria)}`
      : `${this.baseUrl}/productos`;
    return this.http.get<ProductoApi[]>(url);
  }

  listarLocales(): Observable<LocalApi[]> {
    return this.http.get<LocalApi[]>(`${this.baseUrl}/locales`);
  }

  listarCategorias(): Observable<CategoriaApi[]> {
    return this.http.get<CategoriaApi[]>(`${this.baseUrl}/categorias`);
  }

  crearProducto(payload: ProductoPayload): Observable<ProductoApi> {
    return this.http.post<ProductoApi>(`${this.baseUrl}/productos`, payload);
  }

  actualizarProducto(id: number, payload: ProductoPayload): Observable<ProductoApi> {
    return this.http.put<ProductoApi>(`${this.baseUrl}/productos/${id}`, payload);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/productos/${id}`);
  }
}