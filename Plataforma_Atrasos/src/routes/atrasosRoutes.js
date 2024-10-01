const express = require('express');
const router = express.Router();
const atrasosController = require('../controllers/atrasosController');


// Obtener todos los atrasos
router.get('/atrasos', atrasosController.getAllAtrasos);

// Registrar un nuevo atraso
router.post('/atrasos', atrasosController.createAtraso);

// Actualizar un atraso existente
router.put('/atrasos/:id', atrasosController.updateAtraso);

// Eliminar un atraso
router.delete('/atrasos/:id', atrasosController.deleteAtraso);

// Nueva ruta para obtener los atrasos del día
router.get('/atrasos/dia', atrasosController.getAtrasosDelDia);

router.get('/reports', atrasosController.getAtrasosDelDia);
module.exports = router;
