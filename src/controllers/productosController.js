const JsonStorage = require('../storage/jsonStorage');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');

const productosStorage = new JsonStorage('productos.json');
const pedidosStorage = new JsonStorage('pedidos.json');

function listar(req, res) {
  const productos = productosStorage.readAll();
  if (req.accepts('html')) {
    return res.render('productos/lista', { productos });
  }
  return res.status(200).json(productos);
}

function verFormularioCrear(req, res) {
  res.render('productos/form', { producto: null, accion: '/productos' });
}

function crear(req, res) {
  const producto = Producto.fromBody(req.body);
  productosStorage.insert(producto);
  if (req.accepts('html') && !req.is('application/json')) {
    return res.redirect('/productos');
  }
  return res.status(201).json(producto);
}

function obtenerPorId(req, res) {
  const producto = productosStorage.findById(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  return res.status(200).json(producto);
}

function verFormularioEditar(req, res) {
  const producto = productosStorage.findById(req.params.id);
  if (!producto) return res.status(404).render('error', { mensaje: 'Producto no encontrado' });
  res.render('productos/form', { producto, accion: `/productos/${producto.id}?_method=PUT` });
}

function actualizar(req, res) {
  const actualizado = productosStorage.update(req.params.id, {
    nombre: req.body.nombre,
    categoria: req.body.categoria,
    precio: Number(req.body.precio),
    stock: Number(req.body.stock),
  });
  if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
  if (req.accepts('html') && !req.is('application/json')) {
    return res.redirect('/productos');
  }
  return res.status(200).json(actualizado);
}

function eliminar(req, res) {
  const id = req.params.id;
  const pedidos = pedidosStorage.readAll();
  const enUso = pedidos.some((p) =>
    p.items.some((it) => it.productoId === id) &&
    p.estado !== 'entregado'
  );
  if (enUso) {
    return res.status(409).json({
      error: 'No se puede eliminar el producto porque está en pedidos activos',
    });
  }
  const ok = productosStorage.remove(id);
  if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
  if (req.accepts('html') && !req.is('application/json')) {
    return res.redirect('/productos');
  }
  return res.status(204).send();
}

module.exports = {
  listar,
  verFormularioCrear,
  crear,
  obtenerPorId,
  verFormularioEditar,
  actualizar,
  eliminar,
};
