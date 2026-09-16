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
}
