const db = require('../models');

exports.getAll = async (req, res) => {
  try {
    const rutas = await db.ruta.findAll({
      include: [
        { model: db.lugar, as: 'origen' },
        { model: db.lugar, as: 'destino' }
      ]
    });
    res.json(rutas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
};

exports.create = async (req, res) => {
  try {
    const nueva = await db.ruta.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo crear la ruta', detalle: err.message });
  }
};
