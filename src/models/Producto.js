const crypto = require('crypto');

class Producto {
  constructor({ id, nombre, categoria, precio, stock }) {
    this.id = id || crypto.randomUUID();
    this.nombre = nombre;
    this.categoria = categoria;
    this.precio = Number(precio);
    this.stock = Number(stock);
  }

  static fromBody(body) {
    return new Producto({
      nombre: body.nombre,
      categoria: body.categoria,
      precio: body.precio,
      stock: body.stock,
    });
  }
}

module.exports = Producto;
