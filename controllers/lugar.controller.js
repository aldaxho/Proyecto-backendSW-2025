const db = require('../models');

exports.getAll = async (req, res) => {
  try {
    const lugares = await db.lugar.findAll();
    res.json(lugares);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los lugares' });
  }
};

exports.create = async (req, res) => {
  try {
    const nuevo = await db.lugar.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el lugar', detalle: error.message });
  }
};
