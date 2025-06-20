const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { correo, contraseña, nombre, ci, fecha_nacimiento, tipo_usuario } = req.body;

    const existe = await db.usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const nuevo = await db.usuario.create({
      correo,
      contraseña: hash,
      nombre,
      ci,
      fecha_nacimiento,
      tipo_usuario,
      fecha_registro: new Date()
    });

    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevo });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario', detalle: err.message });
  }
};

exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const user = await db.usuario.findOne({ where: { correo } });
    if (!user) return res.status(401).json({ error: 'Correo no registrado' });

    const valido = await bcrypt.compare(contraseña, user.contraseña);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      {
        id: user.id,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario
      },
      SECRET_KEY,
      { expiresIn: '4h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
