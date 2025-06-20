const db = require('../models');

exports.create = async (req, res) => {
  try {
    const nuevo = await db.bus.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo crear el bus', detalle: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const buses = await db.bus.findAll({
      include: [db.distribucion_asientos]
    });
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener buses' });
  }
};
