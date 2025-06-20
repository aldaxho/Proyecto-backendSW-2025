const express = require('express');
const router = express.Router();
const boletoController = require('../controllers/boleto.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');

router.get('/', auth, checkRole('administrador'), boletoController.getAll); // o 'controlador_abordaje'
router.post('/create', auth, boletoController.create);
router.get('/mios', auth, boletoController.getByUsuario);

module.exports = router;
