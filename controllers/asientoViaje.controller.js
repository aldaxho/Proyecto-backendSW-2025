const db = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.generarAsientosParaViaje = async (req, res) => {
  const { viaje_id } = req.params;

  try {
    const viaje = await db.viaje.findByPk(viaje_id, {
      include: {
        model: db.bus,
        include: db.distribucion_asientos
      }
    });

    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });

    const asientos = await db.asiento.findAll({
      include: {
        model: db.nivel_distribucion,
        where: {
          distribucion_asientos_id: viaje.bus.distribucion_asientos_id
        }
      }
    });

    for (const a of asientos) {
      await db.asiento_viaje.create({
        id: uuidv4(),
        asiento_id: a.id,
        viaje_id: viaje.id,
        precio: a.tipo_asiento === 'cama' ? 150 : a.tipo_asiento === 'semi_cama' ? 120 : 100,
        disponible: true
      });
    }

    res.json({ mensaje: 'Asientos creados para el viaje' });
  } catch (err) {
    res.status(500).json({ error: 'Error al generar asiento_viaje', detalle: err.message });
  }
};
exports.disponiblesPorViaje = async (req, res) => {
  try {
    const viaje_id = req.params.viaje_id;

    const disponibles = await db.asiento_viaje.findAll({
      where: {
        viaje_id,
        disponible: true
      },
      include: {
        model: db.asiento,
        include: {
          model: db.nivel_distribucion,
          attributes: ['nivel']
        }
      }
    });

    const respuesta = disponibles.map(item => ({
      asiento_viaje_id: item.id,
      etiqueta: item.asiento.etiqueta,
      tipo_asiento: item.asiento.tipo_asiento,
      nivel: item.asiento.nivel_distribucion.nivel,
      x: item.asiento.x,
      y: item.asiento.y,
      precio: item.precio
    }));

    res.json(respuesta);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asientos disponibles', detalle: err.message });
  }
};
