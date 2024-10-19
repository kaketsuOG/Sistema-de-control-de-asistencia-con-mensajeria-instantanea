const express = require('express');
const router = express.Router();
const justificativosController = require('../controllers/justificativosController');


// Ruta para verificar justificativo de residencia
router.get('/alumnos/:rut/residencia', justificativosController.verificarJustificativos);

module.exports = router;
