const express = require('express');
const router = express.Router();
const controller = require('../controllers/distribucion.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');


router.post('/demo', auth, checkRole('administrador'), controller.crearDistribucionDemo);

module.exports = router;
