const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compra.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');

// Historial solo accesible si el usuario autenticado es dueño o admin
router.get('/:usuario_id', auth, compraController.historialPorUsuario);

// Cancelación solo para el dueño o admin
router.delete('/:compra_id', auth, compraController.cancelarCompra);

module.exports = router;
