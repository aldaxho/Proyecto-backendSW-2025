const express = require('express');
const router = express.Router();
const lugarController = require('../controllers/lugar.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');


router.get('/', lugarController.getAll);
router.post('/', auth, checkRole('administrador'), lugarController.create);

module.exports = router;
