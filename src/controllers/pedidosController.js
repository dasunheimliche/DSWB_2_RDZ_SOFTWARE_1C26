const JsonStorage = require('../storage/jsonStorage');
const Pedido = require('../models/Pedido');

const pedidosStorage = new JsonStorage('pedidos.json');
const productosStorage = new JsonStorage('productos.json');

function _enriquecerItems(itemsBody) {
  const productos = productosStorage.readAll();
  return itemsBody.map((it) => {
    const producto = productos.find((p) => p.id === it.productoId);
    if (!producto) {
      throw new Error(`Producto ${it.productoId} no existe`);
    }
    return {
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: Number(it.cantidad),
    };
  });
}

function listar(req, res) {
  const pedidos = pedidosStorage.readAll();
  const pedidosConTotal = pedidos.map((p) => ({
    ...p,
    total: p.items.reduce((acc, it) => acc + it.precio * it.cantidad, 0),
  }));
  if (req.accepts('html')) {
    return res.render('pedidos/lista', { pedidos: pedidosConTotal });
  }
  return res.status(200).json(pedidosConTotal);
}

function verFormularioCrear(req, res) {
  const productos = productosStorage.readAll();
  res.render('pedidos/form', {
    pedido: null,
    productos,
    estados: Pedido.estadosValidos(),
    origenes: Pedido.origenesValidos(),
    accion: '/pedidos',
  });
}

function crear(req, res) {
  try {
    let itemsInput = req.body.items;
    if (!Array.isArray(itemsInput)) {
      const ids = Array.isArray(req.body.productoId) ? req.body.productoId : [req.body.productoId];
      const cants = Array.isArray(req.body.cantidad) ? req.body.cantidad : [req.body.cantidad];
      itemsInput = ids
        .map((id, i) => ({ productoId: id, cantidad: cants[i] }))
        .filter((it) => it.productoId && Number(it.cantidad) > 0);
    }
    const itemsEnriquecidos = _enriquecerItems(itemsInput || []);
    const pedido = new Pedido({
      origen: req.body.origen,
      nombreSolicitante: req.body.nombreSolicitante,
      items: itemsEnriquecidos,
      estado: req.body.estado || 'pendiente',
    });
    pedidosStorage.insert({ ...pedido, total: pedido.total });
    if (req.accepts('html') && !req.is('application/json')) {
      return res.redirect('/pedidos');
    }
    return res.status(201).json(pedido);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

function obtenerPorId(req, res) {
  const pedido = pedidosStorage.findById(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  return res.status(200).json(pedido);
}

function verFormularioEditar(req, res) {
  const pedido = pedidosStorage.findById(req.params.id);
  if (!pedido) return res.status(404).render('error', { mensaje: 'Pedido no encontrado' });
  const productos = productosStorage.readAll();
  res.render('pedidos/form', {
    pedido,
    productos,
    estados: Pedido.estadosValidos(),
    origenes: Pedido.origenesValidos(),
    accion: `/pedidos/${pedido.id}?_method=PUT`,
  });
}

function actualizar(req, res) {
  try {
    const cambios = {};
    if (req.body.origen) cambios.origen = req.body.origen;
    if (req.body.nombreSolicitante) cambios.nombreSolicitante = req.body.nombreSolicitante;
    if (req.body.estado) {
      if (!Pedido.estadosValidos().includes(req.body.estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      cambios.estado = req.body.estado;
    }
    if (req.body.items || req.body.productoId) {
      let itemsInput = req.body.items;
      if (!Array.isArray(itemsInput)) {
        const ids = Array.isArray(req.body.productoId) ? req.body.productoId : [req.body.productoId];
        const cants = Array.isArray(req.body.cantidad) ? req.body.cantidad : [req.body.cantidad];
        itemsInput = ids
          .map((id, i) => ({ productoId: id, cantidad: cants[i] }))
          .filter((it) => it.productoId && Number(it.cantidad) > 0);
      }
      cambios.items = _enriquecerItems(itemsInput);
    }
    const actualizado = pedidosStorage.update(req.params.id, cambios);
    if (!actualizado) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (req.accepts('html') && !req.is('application/json')) {
      return res.redirect('/pedidos');
    }
    return res.status(200).json(actualizado);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

function eliminar(req, res) {
  const ok = pedidosStorage.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Pedido no encontrado' });
  if (req.accepts('html') && !req.is('application/json')) {
    return res.redirect('/pedidos');
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
