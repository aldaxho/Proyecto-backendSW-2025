const db = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.crearDistribucionDemo = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    // Crear la distribución
    const distribucion = await db.distribucion_asientos.create({
      id: uuidv4(),
      nombre: 'Doble piso estándar',
      cantidad_niveles: 2
    }, { transaction: t });

    const niveles = [];

    // Nivel 1 - cama (ej. 10 asientos)
    const nivel1 = await db.nivel_distribucion.create({
      id: uuidv4(),
      distribucion_asientos_id: distribucion.id,
      nivel: 1,
      descripcion: 'Nivel inferior',
      imagen: 'nivel1.png'
    }, { transaction: t });

    for (let i = 0; i < 10; i++) {
      await db.asiento.create({
        id: uuidv4(),
        nivel_distribucion_id: nivel1.id,
        etiqueta: `C${i + 1}`,
        tipo_asiento: 'cama',
        x: i % 5,
        y: Math.floor(i / 5),
        width: 1,
        height: 1
      }, { transaction: t });
    }

    // Nivel 2 - semi_cama (ej. 20 asientos)
    const nivel2 = await db.nivel_distribucion.create({
      id: uuidv4(),
      distribucion_asientos_id: distribucion.id,
      nivel: 2,
      descripcion: 'Nivel superior',
      imagen: 'nivel2.png'
    }, { transaction: t });

    for (let i = 0; i < 20; i++) {
      await db.asiento.create({
        id: uuidv4(),
        nivel_distribucion_id: nivel2.id,
        etiqueta: `SC${i + 1}`,
        tipo_asiento: 'semi_cama',
        x: i % 5,
        y: Math.floor(i / 5),
        width: 1,
        height: 1
      }, { transaction: t });
    }

    await t.commit();
    res.json({ mensaje: 'Distribución demo creada', distribucion_id: distribucion.id });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear la distribución', detalle: err.message });
  }
};
