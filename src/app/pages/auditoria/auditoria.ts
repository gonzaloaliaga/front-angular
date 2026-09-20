import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PedidosApi, EventoAuditoriaApi, ResumenVentasApi, PedidoApi } from '../../core/api/pedidos.api';
import { InventarioApi, ProductoApi, LocalApi, CategoriaApi, ProductoPayload } from '../../core/api/inventario.api';

interface FormularioProducto {
  id: number | null;
  nombre: string;
  descripcion: string;
  precio: number | null;
  stock: number | null;
  imagenUrl: string;
  categoriaId: number | null;
  localId: number | null;
}

const FORMULARIO_VACIO: FormularioProducto = {
  id: null, nombre: '', descripcion: '', precio: null, stock: null,
  imagenUrl: '', categoriaId: null, localId: null
};

type FiltroFecha = 'hoy' | 'semana' | 'mes' | 'todos';
const UMBRAL_STOCK_BAJO = 10;

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent {
  private pedidosApi = inject(PedidosApi);
  private inventarioApi = inject(InventarioApi);

  vista = signal<'resumen' | 'inventario' | 'ventas'>('resumen');

  // --- Resumen / eventos ---
  resumen = signal<ResumenVentasApi | null>(null);
  eventos = signal<EventoAuditoriaApi[]>([]);
  nombreLocalPorId = signal<Map<number, string>>(new Map());
  errorCarga = signal<string | null>(null);

  // --- Inventario ---
  productos = signal<ProductoApi[]>([]);
  locales = signal<LocalApi[]>([]);
  categorias = signal<CategoriaApi[]>([]);
  errorInventario = signal<string | null>(null);
  mostrarFormulario = signal(false);
  guardando = signal(false);
  formulario = signal<FormularioProducto>({ ...FORMULARIO_VACIO });

  tituloFormulario = computed(() => this.formulario().id ? 'Editar producto' : 'Nuevo producto');

  // Productos con poco stock, los más urgentes primero. Se muestran arriba de todo.
  productosStockBajo = computed(() =>
    this.productos()
      .filter(p => p.stock < UMBRAL_STOCK_BAJO)
      .sort((a, b) => a.stock - b.stock)
  );

  // --- Ventas ---
  ventas = signal<PedidoApi[]>([]);
  errorVentas = signal<string | null>(null);
  filtroFecha = signal<FiltroFecha>('todos');

  ventasFiltradas = computed(() => {
    const filtro = this.filtroFecha();
    if (filtro === 'todos') return this.ventas();

    const ahora = new Date();
    const inicio = new Date(ahora);
    if (filtro === 'hoy') {
      inicio.setHours(0, 0, 0, 0);
    } else if (filtro === 'semana') {
      inicio.setDate(inicio.getDate() - 7);
    } else if (filtro === 'mes') {
      inicio.setMonth(inicio.getMonth() - 1);
    }

    return this.ventas().filter(p => new Date(p.creadoEn) >= inicio);
  });

  constructor() {
    this.cargar();
    this.cargarInventario();
    this.cargarVentas();
  }

  cargar() {
    this.errorCarga.set(null);
    this.inventarioApi.listarLocales().subscribe({
      next: (locales) => this.nombreLocalPorId.set(new Map(locales.map(l => [l.id, l.nombre])))
    });
    this.pedidosApi.resumen().subscribe({
      next: (r) => this.resumen.set(r),
      error: () => this.errorCarga.set('No se pudo conectar con el microservicio de Pedidos (puerto 8082).')
    });
    this.pedidosApi.eventos().subscribe({ next: (e) => this.eventos.set(e) });
  }

  maxVentaLocal(): number {
    const filas = this.resumen()?.porLocal ?? [];
    return filas.length ? Math.max(...filas.map(f => f.total)) : 1;
  }

  cargarInventario() {
    this.errorInventario.set(null);
    this.inventarioApi.listarProductos().subscribe({
      next: (p) => this.productos.set(p),
      error: () => this.errorInventario.set('No se pudo conectar con el microservicio de Inventario (puerto 8081).')
    });
    this.inventarioApi.listarLocales().subscribe({ next: (l) => this.locales.set(l) });
    this.inventarioApi.listarCategorias().subscribe({ next: (c) => this.categorias.set(c) });
  }

  actualizarCampo<K extends keyof FormularioProducto>(campo: K, valor: FormularioProducto[K]) {
    this.formulario.update(f => ({ ...f, [campo]: valor }));
  }

  abrirNuevoProducto() {
    this.formulario.set({ ...FORMULARIO_VACIO });
    this.mostrarFormulario.set(true);
  }

  editarProducto(producto: ProductoApi) {
    const local = this.locales().find(l => l.nombre === producto.local);
    const categoria = this.categorias().find(c => c.nombre === producto.categoria);
    this.formulario.set({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl,
      categoriaId: categoria?.id ?? null,
      localId: local?.id ?? null
    });
    this.mostrarFormulario.set(true);
  }

  cancelarFormulario() {
    this.mostrarFormulario.set(false);
    this.formulario.set({ ...FORMULARIO_VACIO });
  }

  guardarProducto() {
    const f = this.formulario();
    const faltantes: string[] = [];
    if (!f.nombre) faltantes.push('nombre');
    if (f.precio === null) faltantes.push('precio');
    if (f.stock === null) faltantes.push('stock');
    if (!f.categoriaId) faltantes.push('categoría');
    if (!f.localId) faltantes.push('local');

    if (faltantes.length > 0) {
      this.errorInventario.set(`Falta completar: ${faltantes.join(', ')}.`);
      return;
    }

    const payload: ProductoPayload = {
      nombre: f.nombre,
      descripcion: f.descripcion,
      precio: f.precio!,
      stock: f.stock!,
      imagenUrl: f.imagenUrl,
      categoriaId: f.categoriaId!,
      localId: f.localId!
    };

    this.guardando.set(true);
    this.errorInventario.set(null);

    const peticion = f.id
      ? this.inventarioApi.actualizarProducto(f.id, payload)
      : this.inventarioApi.crearProducto(payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cancelarFormulario();
        this.cargarInventario();
      },
      error: () => {
        this.guardando.set(false);
        this.errorInventario.set('No se pudo guardar el producto. Revisa los datos e intenta de nuevo.');
      }
    });
  }

  eliminarProducto(producto: ProductoApi) {
    if (!confirm(`¿Dar de baja "${producto.nombre}"? Ya no aparecerá en el catálogo del cliente.`)) return;
    this.inventarioApi.eliminarProducto(producto.id).subscribe({
      next: () => this.cargarInventario(),
      error: () => this.errorInventario.set('No se pudo dar de baja el producto.')
    });
  }

  // --- Ventas ---
  cargarVentas() {
    this.errorVentas.set(null);
    this.pedidosApi.listar().subscribe({
      next: (p) => this.ventas.set(p),
      error: () => this.errorVentas.set('No se pudo conectar con el microservicio de Pedidos (puerto 8082).')
    });
  }

  puedeCancelar(pedido: PedidoApi): boolean {
    return pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado';
  }

  cancelarVenta(pedido: PedidoApi) {
    if (!confirm(`¿Cancelar el pedido #${pedido.id}? Esta acción no se puede deshacer.`)) return;
    this.pedidosApi.cancelar(pedido.id).subscribe({
      next: () => this.cargarVentas(),
      error: (err) => this.errorVentas.set(
        err.status === 409
          ? 'No se puede cancelar un pedido que ya fue entregado.'
          : 'No se pudo cancelar el pedido.'
      )
    });
  }

  exportarVentasCsv() {
    const filas = this.ventasFiltradas();
    const encabezado = ['ID', 'Cliente', 'Local', 'Modalidad', 'Estado', 'Total', 'Fecha'];
    const lineas = filas.map(p => [
      p.id,
      `"${p.clienteNombre}"`,
      `"${this.nombreLocalPorId().get(p.localId) ?? p.localId}"`,
      p.modalidad,
      p.estado,
      p.total,
      new Date(p.creadoEn).toLocaleString('es-CL')
    ].join(','));

    const csv = [encabezado.join(','), ...lineas].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `ventas-pedidos360-${this.filtroFecha()}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
