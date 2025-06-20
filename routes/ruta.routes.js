const express = require('express');
const router = express.Router();
const controller = require('../controllers/ruta.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');

router.get('/', controller.getAll);
router.post('/', auth, checkRole('administrador'), controller.create);

module.exports = router;
