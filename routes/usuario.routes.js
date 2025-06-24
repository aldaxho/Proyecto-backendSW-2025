const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/role.middleware');

// Solo el administrador puede ver o crear usuarios
router.get('/', auth, checkRole('administrador'), usuarioController.getAll);
router.post('/', auth, checkRole('administrador'), usuarioController.create);

// Editar usuario por ID
router.put('/:id', auth, checkRole('administrador'), usuarioController.actualizarUsuario);

// Eliminar usuario por ID
router.delete('/:id', auth, checkRole('administrador'), usuarioController.eliminarUsuario);


module.exports = router;
