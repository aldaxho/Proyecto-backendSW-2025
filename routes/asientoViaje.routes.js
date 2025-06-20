const express = require('express');
const router = express.Router();
const controller = require('../controllers/asientoViaje.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');

router.post('/generar/:viaje_id', controller.generarAsientosParaViaje);
router.get('/:viaje_id/disponibles', controller.disponiblesPorViaje);


module.exports = router;
