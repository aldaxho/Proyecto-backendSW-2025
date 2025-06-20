const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viaje.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');

// Solo administradores pueden crear viajes
router.post('/create', auth, checkRole('administrador'), viajeController.create);

// Todos pueden buscar viajes
router.get('/buscar', viajeController.buscar);

module.exports = router;
