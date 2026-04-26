const express = require('express');
const controller = require('../controllers/pedidosController');

const router = express.Router();

router.get('/', controller.listar);
router.get('/nuevo', controller.verFormularioCrear);
router.post('/', controller.crear);
router.get('/:id', controller.obtenerPorId);
router.get('/:id/editar', controller.verFormularioEditar);
router.put('/:id', controller.actualizar);
router.post('/:id', (req, res, next) => {
  if (req.query._method === 'PUT') return controller.actualizar(req, res, next);
  if (req.query._method === 'DELETE') return controller.eliminar(req, res, next);
  return res.status(405).json({ error: 'Método no permitido' });
});
router.delete('/:id', controller.eliminar);

module.exports = router;
