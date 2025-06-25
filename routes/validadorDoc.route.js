// routes/validadorDoc.route.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/validadorDoc.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/validar', upload.fields([    { name: 'ci_frontal' },
    { name: 'ci_reverso' }]), controller.validarDocumentos);

module.exports = router;
