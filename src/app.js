const express = require('express');
const path = require('path');

const productosRouter = require('./routes/productosRouter');
const pedidosRouter = require('./routes/pedidosRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.render('index', { title: 'La Espiga de Oro - Inicio' });
});

app.use('/productos', productosRouter);
app.use('/pedidos', pedidosRouter);

app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).render('error', { mensaje: 'Página no encontrada' });
  }
  return res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
