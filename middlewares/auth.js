const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    req.user = decoded; // ahora puedes acceder a req.user en el controlador
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
