const db = require('../models');
const { Op } = require('sequelize');

exports.buscar = async (req, res) => {
  try {
    const { origen, destino, fecha } = req.query;

    const viajes = await db.viaje.findAll({
      include: [
        {
          model: db.ruta,
          include: [
            { model: db.lugar, as: 'origen', where: origen ? { nombre: origen } : undefined },
            { model: db.lugar, as: 'destino', where: destino ? { nombre: destino } : undefined }
          ]
        },
        { model: db.bus }
      ],
      where: fecha ? {
        hora_salida: {
          [Op.between]: [
            new Date(`${fecha}T00:00:00`),
            new Date(`${fecha}T23:59:59`)
          ]
        }
      } : undefined
    });

    res.json(viajes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar viajes' });
  }
};
exports.create = async (req, res) => {
  try {
    const nuevo = await db.viaje.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo crear el viaje', detalle: err.message });
  }
};
