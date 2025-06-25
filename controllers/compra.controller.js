const db = require('../models');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
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
  // Iniciamos una transacción para garantizar la integridad de los datos
  const t = await db.sequelize.transaction();
  try {
    // El usuario que realiza la compra (asumimos que viene de un middleware de autenticación)
    const comprador_usuario_id = req.user.id;
    
    // Datos que envía el frontend
    const { viaje_id, pasajeros } = req.body;

    if (!pasajeros || pasajeros.length === 0) {
      return res.status(400).json({ error: 'No se han proporcionado datos de pasajeros y asientos.' });
    }

    // 1. VERIFICAR DISPONIBILIDAD DE TODOS LOS ASIENTOS
    const asientoViajeIds = pasajeros.map(p => p.asiento_viaje_id);
    const asientosEnVenta = await db.asiento_viaje.findAll({
      where: { id: asientoViajeIds, disponible: true },
      transaction: t
    });

    // Si la cantidad de asientos encontrados no coincide, es porque uno o más ya fueron comprados
    if (asientosEnVenta.length !== asientoViajeIds.length) {
      await t.rollback();
      return res.status(409).json({ error: 'Lo sentimos, uno o más de los asientos seleccionados ya no están disponibles. Por favor, intenta de nuevo.' }); // 409 Conflict es un buen código de estado para esto
    }

    // 2. CREAR EL REGISTRO DE LA COMPRA GENERAL
    const montoTotal = asientosEnVenta.reduce((sum, asiento) => sum + parseFloat(asiento.precio), 0);

    const compra = await db.compra_boletos.create({
      id: uuidv4(),
      usuario_id: comprador_usuario_id, // El usuario logueado que está comprando
      viaje_id,
      monto_total: montoTotal,
      fecha: new Date()
    }, { transaction: t });

    const boletosCreados = [];

    // 3. PROCESAR CADA PASAJERO Y CREAR SU BOLETO
    for (const pasajeroData of pasajeros) {
      // VERIFICACIÓN DE DOCUMENTO: Usamos la tabla 'usuario' como nos pediste
      // Buscamos si ya existe un usuario (pasajero) con ese CI
      let pasajero = await db.usuario.findOne({ where: { ci: pasajeroData.ci } });

      // Si no existe, lo creamos. Asumimos un tipo de usuario 'pasajero' y una contraseña temporal.
      // En un caso real, podrías manejar esto de forma diferente (ej. no crear contraseña).
      if (!pasajero) {
        pasajero = await db.usuario.create({
            id: uuidv4(),
            nombre: pasajeroData.nombre,
            ci: pasajeroData.ci,
            fecha_nacimiento: pasajeroData.fechaNacimiento,
            correo: `${pasajeroData.ci}@email-temporal.com`, // Correo temporal
            contraseña: 'password-temporal', // Contraseña temporal
            tipo_usuario: 'pasajero',
            fecha_registro: new Date()
        }, { transaction: t });
      }

      const asientoInfo = asientosEnVenta.find(a => a.id === pasajeroData.asiento_viaje_id);

      // 4. CREAR EL BOLETO
      const nuevoBoleto = await db.boleto.create({
        id: uuidv4(),
        compra_id: compra.id,
        asiento_viaje_id: asientoInfo.id, // ID del asiento_viaje
        // Guardamos los datos del pasajero directamente en el boleto como en tu tabla
        pasajero_ci: pasajero.ci,
        pasajero_nombre: pasajero.nombre,
        pasajero_fecha_nacimiento: pasajero.fecha_nacimiento,
        precio: asientoInfo.precio
      }, { transaction: t });
      
      // 5. GENERAR QR ÚNICO PARA CADA BOLETO
      const qrData = JSON.stringify({
          boletoId: nuevoBoleto.id,
          viajeId: viaje_id,
          asiento: (await db.asiento.findByPk(asientoInfo.asiento_id)).etiqueta,
          pasajero: pasajero.nombre
      });
      const qrImage = await QRCode.toDataURL(qrData);

      // Actualizar el boleto con su QR
      await nuevoBoleto.update({ qr: qrImage }, { transaction: t });

      // 6. MARCAR EL ASIENTO COMO NO DISPONIBLE
      await asientoInfo.update({ disponible: false }, { transaction: t });
      
      boletosCreados.push(nuevoBoleto);
    }
    
    // Si todo salió bien, confirmamos la transacción
    await t.commit();
    
    res.status(201).json({ 
        mensaje: 'Compra realizada con éxito', 
        compra_id: compra.id
    });

  } catch (err) {
    // Si algo falla, revertimos todos los cambios
    await t.rollback();
    console.error("Error al realizar la compra:", err);
    res.status(500).json({ error: 'Error interno al procesar la compra', detalle: err.message });
  }
}
