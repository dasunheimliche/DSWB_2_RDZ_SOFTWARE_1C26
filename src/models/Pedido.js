const crypto = require('crypto');

const ESTADOS_VALIDOS = ['pendiente', 'en_produccion', 'despachado', 'entregado'];
const ORIGENES_VALIDOS = ['sucursal', 'franquicia'];

class Pedido {
  constructor({ id, origen, nombreSolicitante, items, estado, fechaCreacion }) {
    this.id = id || crypto.randomUUID();
    this.origen = origen;
    this.nombreSolicitante = nombreSolicitante;
    this.items = items || [];
    this.estado = estado || 'pendiente';
    this.fechaCreacion = fechaCreacion || new Date().toISOString();
  }

  get total() {
    return this.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  static fromBody(body) {
    return new Pedido({
      origen: body.origen,
      nombreSolicitante: body.nombreSolicitante,
      items: body.items || [],
      estado: body.estado || 'pendiente',
    });
  }

  static estadosValidos() {
    return [...ESTADOS_VALIDOS];
  }

  static origenesValidos() {
    return [...ORIGENES_VALIDOS];
  }
}

module.exports = Pedido;
