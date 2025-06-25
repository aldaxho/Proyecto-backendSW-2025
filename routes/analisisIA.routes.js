const express = require("express");
const router = express.Router();

const { analizarYRecomendarViajes } = require("../controllers/analisisIA.controller");

// Endpoint POST para análisis con IA
router.post("/analizar", analizarYRecomendarViajes);

module.exports = router;
