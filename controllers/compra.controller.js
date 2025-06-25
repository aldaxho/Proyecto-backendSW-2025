const db = require('../models');
const QRCode = require('qrcode');
exports.historialPorUsuario = async (req, res) => {
  try {
    const compras = await db.compra_boletos.findAll({
      where: { usuario_id: req.params.usuario_id },
      include: [
        {
          model: db.viaje,
          include: [{ model: db.ruta }]
        },
        {
          model: db.boleto
        }
      ]
    });
    res.json(compras);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial de compras' });
  }
};

exports.cancelarCompra = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const compra_id = req.params.compra_id;

    const compra = await db.compra_boletos.findByPk(compra_id, {
      include: [db.boleto]
    });

    if (!compra) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    // Recuperar los asiento_id de los boletos
    const asientoIds = compra.boletos.map(b => b.asiento_id);

    // Buscar los asiento_viaje afectados
    const asientoViajes = await db.asiento_viaje.findAll({
      where: { asiento_id: asientoIds, viaje_id: compra.viaje_id }
    });

    // Liberar los asientos
    for (const av of asientoViajes) {
      await av.update({ disponible: true }, { transaction: t });
    }

    // Eliminar los boletos (ON DELETE CASCADE los elimina con la compra, pero lo hacemos explícito por claridad)
    await db.boleto.destroy({ where: { compra_id }, transaction: t });

    // Eliminar la compra
    await db.compra_boletos.destroy({ where: { id: compra_id }, transaction: t });

    await t.commit();
    res.json({ mensaje: 'Compra cancelada y asientos liberados' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: 'Error al cancelar compra', detalle: err.message });
  }
};

exports.realizarCompra = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { usuario_id, viaje_id, boletos } = req.body;

    const compra = await db.compra_boletos.create({
      id: uuidv4(),
      usuario_id,
      viaje_id,
      monto_total: boletos.reduce((sum, b) => sum + b.precio, 0),
      fecha: new Date()
    }, { transaction: t });

    for (const b of boletos) {
      await db.boleto.create({
        id: uuidv4(),
        compra_id: compra.id,
        asiento_id: b.asiento_id,
        precio: b.precio,
        pasajero_ci: b.pasajero_ci,
        pasajero_nombre: b.pasajero_nombre,
        pasajero_fecha_nacimiento: b.pasajero_fecha_nacimiento
      }, { transaction: t });

      await db.asiento_viaje.update(
        { disponible: false },
        { where: { asiento_id: b.asiento_id, viaje_id }, transaction: t }
      );
    }

    // 📌 Aquí generas el QR
    const qrTexto = `compra_id:${compra.id}`;
    const qrCompra = await QRCode.toDataURL(qrTexto);
    await compra.update({ qr: qrCompra }, { transaction: t });

    await t.commit();
    res.status(201).json({ mensaje: 'Compra realizada', compra_id: compra.id, qr: qrCompra });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: 'Error al realizar la compra', detalle: err.message });
  }
};
