// routes/analisisIA.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/analisisIA.controller');

router.post('/analizar-viaje', controller.analizarViaje);
router.post('/recomendar', controller.analizarYRecomendarViajes);

module.exports = router;
