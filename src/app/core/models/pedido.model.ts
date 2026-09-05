export type EstadoPedido = 'Pendiente' | 'En preparación' | 'Hecho' | 'Entregado' | 'Cancelado';
export type Modalidad = 'Retiro en tienda' | 'Despacho a domicilio';

export interface ItemPedido {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: number;
  cliente: string;
  local: string;
  items: ItemPedido[];
  total: number;
  modalidad: Modalidad;
  direccion?: string;
  estado: EstadoPedido;
  creadoEn: Date;
}

export interface EventoAuditoria {
  id: number;
  pedidoId: number;
  descripcion: string;
  rol: string;
  fecha: Date;
}
