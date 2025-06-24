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

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await db.usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.update(req.body);
    res.json({ mensaje: 'Usuario actualizado con éxito', usuario });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el usuario', detalle: err.message });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await db.usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el usuario', detalle: err.message });
  }
};

