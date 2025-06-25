const db = require('../models');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { viaje_id, asientos } = req.body;
    const usuario_id = req.user.id;


    // Verificar disponibilidad
    const ids = asientos.map(a => a.asiento_viaje_id);
    const disponibles = await db.asiento_viaje.findAll({
      where: { id: ids, disponible: true }
    });

    if (disponibles.length !== ids.length) {
      throw new Error('Uno o más asientos no están disponibles');
    }

    // Calcular monto total
    const monto_total = disponibles.reduce((sum, a) => sum + parseFloat(a.precio), 0);

    // Crear compra
    const compra = await db.compra_boletos.create({
      id: uuidv4(),
      usuario_id,
      viaje_id,
      monto_total,
      fecha: new Date()
    }, { transaction: t });

    // Crear boletos
    for (const a of asientos) {
      const asientoViaje = disponibles.find(x => x.id === a.asiento_viaje_id);
      const asiento = await db.asiento.findByPk(asientoViaje.asiento_id);

      await db.boleto.create({
        id: uuidv4(),
        compra_id: compra.id,
        asiento_id: asiento.id,
        precio: asientoViaje.precio,
        pasajero_nombre: a.pasajero_nombre,
        pasajero_ci: a.pasajero_ci,
        pasajero_fecha_nacimiento: a.pasajero_fecha_nacimiento
      }, { transaction: t });

      await asientoViaje.update({ disponible: false }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ mensaje: 'Boletos comprados exitosamente' });

  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: 'Error al comprar boletos', detalle: err.message });
  }
};
exports.getAll = async (req, res) => {
  try {
    const boletos = await db.boleto.findAll();
    res.json(boletos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener boletos' });
  }
};
exports.getByUsuario = async (req, res) => {
  try {
    const boletos = await db.boleto.findAll({
      include: [
        {
          model: db.compra_boletos,
          where: { usuario_id: req.user.id }
        }
      ]
    });
    res.json(boletos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tus boletos' });
  }
};
exports.generarBoletosConQR = async (req, res) => {
  try {
    const { compra_id, asientos, precio, datosPasajeros } = req.body;

    const boletosCreados = [];

    for (let i = 0; i < asientos.length; i++) {
      const nuevoBoleto = await db.boleto.create({
        id: uuidv4(),
        compra_id,
        asiento_id: asientos[i],
        precio,
        pasajero_ci: datosPasajeros[i].ci,
        pasajero_nombre: datosPasajeros[i].nombre,
        pasajero_fecha_nacimiento: datosPasajeros[i].fecha_nacimiento
      });

      const qrData = `boleto_id:${nuevoBoleto.id}`;
      const qrImage = await QRCode.toDataURL(qrData);

      // Actualiza el boleto con el QR
      await nuevoBoleto.update({ qr: qrImage });

      boletosCreados.push(nuevoBoleto);
    }

    res.status(201).json(boletosCreados);
  } catch (err) {
    res.status(500).json({ error: 'Error generando boletos con QR', detalle: err.message });
  }
};