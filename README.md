# La Espiga de Oro S.R.L. - Sistema de gestión de pedidos

Proyecto para la **Primer Entrega** de la materia **Desarrollo Web Backend** (IFTS 29).
Resuelve el **Caso 4: Panificadora Industrial "La Espiga de Oro S.R.L."**.

## Alcance de esta entrega

Según los lineamientos del profesor para la primer entrega:

- Al menos **dos módulos funcionales** con CRUD completo: **Productos** y **Pedidos**.
- **Persistencia en archivos JSON** (sin MongoDB en esta etapa).
- Estructura organizada en **router / controller / almacenamiento / modelos**.
- **Express** como framework HTTP.
- **Pug** como motor de plantillas.
- Pruebas con **Thunder Client** (rutas REST disponibles bajo `/productos` y `/pedidos`).

## Estructura del proyecto

```
entrega-1/
├── data/                       # Persistencia JSON
│   ├── productos.json
│   └── pedidos.json
├── public/                     # Estáticos (CSS)
│   └── css/styles.css
├── src/
│   ├── app.js                  # Punto de entrada Express
│   ├── controllers/            # Lógica de negocio
│   │   ├── productosController.js
│   │   └── pedidosController.js
│   ├── models/                 # Clases POO
│   │   ├── Producto.js
│   │   └── Pedido.js
│   ├── routes/                 # Routers Express
│   │   ├── productosRouter.js
│   │   └── pedidosRouter.js
│   └── storage/                # Capa de acceso a JSON
│       └── jsonStorage.js
├── views/                      # Plantillas Pug
│   ├── layout.pug
│   ├── index.pug
│   ├── error.pug
│   ├── productos/
│   │   ├── lista.pug
│   │   └── form.pug
│   └── pedidos/
│       ├── lista.pug
│       └── form.pug
├── package.json
└── README.md
```

## Cómo ejecutar

```bash
cd entrega-1
npm install
npm start
```

Luego abrir [http://localhost:3000](http://localhost:3000).

## Módulos y endpoints

### Productos (`/productos`)

| Método | Ruta                    | Descripción                                     |
| ------ | ----------------------- | ----------------------------------------------- |
| GET    | `/productos`            | Lista todos los productos (HTML o JSON)         |
| GET    | `/productos/nuevo`      | Formulario de alta                              |
| POST   | `/productos`            | Crear producto                                  |
| GET    | `/productos/:id`        | Obtener un producto (JSON)                      |
| GET    | `/productos/:id/editar` | Formulario de edición                           |
| PUT    | `/productos/:id`        | Actualizar producto                             |
| DELETE | `/productos/:id`        | Eliminar producto (si no tiene pedidos activos) |

Body de ejemplo (POST/PUT):

```json
{
  "nombre": "Pan francés",
  "categoria": "panificados",
  "precio": 1500,
  "stock": 200
}
```

### Pedidos (`/pedidos`)

| Método | Ruta                  | Descripción                        |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/pedidos`            | Lista todos los pedidos            |
| GET    | `/pedidos/nuevo`      | Formulario de alta                 |
| POST   | `/pedidos`            | Crear pedido                       |
| GET    | `/pedidos/:id`        | Obtener un pedido                  |
| GET    | `/pedidos/:id/editar` | Formulario de edición              |
| PUT    | `/pedidos/:id`        | Actualizar pedido (incluye estado) |
| DELETE | `/pedidos/:id`        | Eliminar pedido                    |

Body de ejemplo (POST):

```json
{
  "origen": "sucursal",
  "nombreSolicitante": "Sucursal Centro",
  "estado": "pendiente",
  "items": [
    { "productoId": "p-001", "cantidad": 30 },
    { "productoId": "p-002", "cantidad": 100 }
  ]
}
```

Estados válidos: `pendiente`, `en_produccion`, `despachado`, `entregado`.
Orígenes válidos: `sucursal`, `franquicia`.

## Interacción entre módulos

- Al crear o editar un **pedido**, el sistema valida que cada `productoId` exista en el módulo de productos y enriquece el ítem con `nombre` y `precio` (snapshot al momento del pedido).
- Al **eliminar** un producto, se rechaza con HTTP 409 si el producto está siendo utilizado por algún pedido **no entregado**.
- Los pedidos calculan dinámicamente su `total` a partir de los precios e items.

## Pruebas con Postman

1. Iniciar el servidor (`npm start`).
2. En Postman probar:
   - `GET http://localhost:3000/productos`
   - `POST http://localhost:3000/productos` con body JSON.
   - `GET http://localhost:3000/pedidos`
   - `POST http://localhost:3000/pedidos` con body JSON.
   - `PUT http://localhost:3000/pedidos/<id>` cambiando el estado a `en_produccion`.
   - `DELETE http://localhost:3000/productos/<id>` (probar uno con y otro sin pedidos activos).

## Datos iniciales

Los archivos `data/productos.json` y `data/pedidos.json` traen registros de ejemplo para poder probar la app sin tener que cargar datos manualmente.
