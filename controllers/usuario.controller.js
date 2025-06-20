const db = require('../models');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await db.usuario.findAll();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.create = async (req, res) => {
  try {
    const nuevo = await db.usuario.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo crear el usuario', detalle: err.message });
  }
};
