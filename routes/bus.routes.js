const express = require('express');
const router = express.Router();
const controller = require('../controllers/bus.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');

router.post('/', auth, checkRole('administrador'), controller.create); // 🔐
router.get('/', controller.getAll);

module.exports = router;
