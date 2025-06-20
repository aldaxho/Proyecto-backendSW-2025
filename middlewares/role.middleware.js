module.exports = (rolRequerido) => {
  return (req, res, next) => {
    const user = req.user; // Lo inyecta el middleware JWT

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (user.tipo_usuario !== rolRequerido) {
      return res.status(403).json({ error: 'Acceso denegado: requiere rol ' + rolRequerido });
    }

    next();
  };
};
