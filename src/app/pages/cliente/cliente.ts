import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth';
import { CarritoService, Producto } from '../../core/carrito/carrito';
import { InventarioApi, LocalApi } from '../../core/api/inventario.api';
import { PedidosApi, PedidoApi } from '../../core/api/pedidos.api';
import { Modalidad } from '../../core/models/pedido.model';

const CLAVE_FAVORITOS = 'pedidos360_locales_favoritos';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css']
})
export class ClienteComponent {
  private authService = inject(AuthService);
  private inventarioApi = inject(InventarioApi);
  private pedidosApi = inject(PedidosApi);
  carritoService = inject(CarritoService);

  nombre = this.authService.obtenerNombre();
  correo = this.authService.obtenerCorreo();

  vista = signal<'catalogo' | 'cuenta'>('catalogo');
  categoriaSeleccionada = signal<string>('Todas');
  busqueda = signal<string>('');
  soloFavoritos = signal<boolean>(false);
  modalidad = signal<Modalidad>('Retiro en tienda');
  direccion = signal<string>('');
  pedidoConfirmado = signal<PedidoApi | null>(null);
  cargando = signal<boolean>(true);
  errorCarga = signal<string | null>(null);
  errorConfirmacion = signal<string | null>(null);

  categorias = ['Todas', 'Panadería', 'Pastelería', 'Cafetería'];

  productos = signal<Producto[]>([]);
  misPedidos = signal<PedidoApi[]>([]);
  nombreLocalPorId = signal<Map<number, string>>(new Map());
  localesFavoritos = signal<Set<number>>(this.leerFavoritosGuardados());

  constructor() {
    this.cargarCatalogo();
    this.cargarMisPedidos();
  }

  productosFiltrados = computed(() => {
    const cat = this.categoriaSeleccionada();
    const texto = this.busqueda().trim().toLowerCase();
    const favoritos = this.localesFavoritos();
    const soloFav = this.soloFavoritos();

    return this.productos().filter(p => {
      if (cat !== 'Todas' && p.categoria !== cat) return false;
      if (soloFav && !favoritos.has(p.localId)) return false;
      if (texto && !p.nombre.toLowerCase().includes(texto) && !p.descripcion.toLowerCase().includes(texto)) return false;
      return true;
    });
  });

  private leerFavoritosGuardados(): Set<number> {
    try {
      const guardado = localStorage.getItem(CLAVE_FAVORITOS);
      return guardado ? new Set(JSON.parse(guardado)) : new Set();
    } catch {
      return new Set();
    }
  }

  private guardarFavoritos() {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify([...this.localesFavoritos()]));
  }

  alternarFavorito(localId: number) {
    this.localesFavoritos.update(favoritos => {
      const nuevo = new Set(favoritos);
      nuevo.has(localId) ? nuevo.delete(localId) : nuevo.add(localId);
      return nuevo;
    });
    this.guardarFavoritos();
  }

  private cargarCatalogo() {
    this.cargando.set(true);
    // Pedimos los locales primero: el catálogo de Inventario devuelve el NOMBRE del
    // local (para mostrar), pero para crear un pedido el backend de Pedidos necesita
    // el ID. Con este mapa nombre -> id resolvemos ambos con una sola carga.
    this.inventarioApi.listarLocales().subscribe({
      next: (locales: LocalApi[]) => {
        const idPorNombre = new Map(locales.map(l => [l.nombre, l.id]));
        this.nombreLocalPorId.set(new Map(locales.map(l => [l.id, l.nombre])));
        this.inventarioApi.listarProductos().subscribe({
          next: (productosApi) => {
            this.productos.set(productosApi.map(p => ({
              id: p.id,
              nombre: p.nombre,
              descripcion: p.descripcion,
              precio: p.precio,
              stock: p.stock,
              imagenUrl: p.imagenUrl,
              categoria: p.categoria,
              local: p.local,
              localId: idPorNombre.get(p.local) ?? 0
            })));
            this.cargando.set(false);
          },
          error: () => {
            this.errorCarga.set('No se pudo cargar el catálogo. ¿Está corriendo el microservicio de Inventario en el puerto 8081?');
            this.cargando.set(false);
          }
        });
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el catálogo. ¿Está corriendo el microservicio de Inventario en el puerto 8081?');
        this.cargando.set(false);
      }
    });
  }

  private cargarMisPedidos() {
    this.pedidosApi.misPedidos(this.correo).subscribe({
      next: (pedidos) => this.misPedidos.set(pedidos),
      error: () => { /* si Pedidos aún no está arriba, simplemente no mostramos historial */ }
    });
  }

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregar(producto);
  }

  confirmarPedido() {
    const lineas = this.carritoService.lineas();
    if (lineas.length === 0) return;

    this.errorConfirmacion.set(null);
    const localId = lineas[0].producto.localId;
    const direccion = this.modalidad() === 'Despacho a domicilio' ? this.direccion() : undefined;

    this.pedidosApi.crear({
      clienteNombre: this.nombre,
      clienteCorreo: this.correo,
      localId,
      modalidad: this.modalidad(),
      direccionDespacho: direccion,
      items: lineas.map(l => ({ productoId: l.producto.id, cantidad: l.cantidad }))
    }).subscribe({
      next: (pedido) => {
        this.carritoService.vaciar();
        this.pedidoConfirmado.set(pedido);
        this.vista.set('cuenta');
        this.cargarMisPedidos();
        this.cargarCatalogo(); // refresca stock mostrado tras la reserva
      },
      error: (err) => {
        this.errorConfirmacion.set(
          err.status === 409
            ? 'Uno de los productos ya no tiene stock suficiente. Ajusta las cantidades e intenta de nuevo.'
            : 'No se pudo confirmar el pedido. Intenta nuevamente.'
        );
      }
    });
  }
}
