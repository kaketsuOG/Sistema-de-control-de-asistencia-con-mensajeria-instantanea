const express = require('express');
const path = require('path');
const router = express.Router();
const atrasosController = require('../controllers/atrasosController'); // Importar controlador

// Obtener todos los atrasos
router.get('/atrasos', atrasosController.getAllAtrasos);

// Obtener atrasos en un rango específico
router.get('/atrasos/rango', atrasosController.getAtrasosRango);

// Verificar si existe un alumno con el RUT proporcionado
router.get('/alumnos/verificar/:rut', atrasosController.verificarRut); // Asegúrate de que esta función exista

// Obtener los atrasos del día (debe ir antes de la ruta dinámica con :id)
router.get('/atrasos/dia', atrasosController.getAtrasosDelDia);

// Registrar un nuevo atraso
router.post('/atrasos', atrasosController.createAtraso);

// Actualizar un atraso existente
router.put('/atrasos/:id', atrasosController.updateAtraso);

// Eliminar un atraso
router.delete('/atrasos/:id', atrasosController.deleteAtraso);

// Descargar el PDF de los atrasos
router.get('/SalidaPDF/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../SalidaPDF', req.params.filename);
    res.download(filePath); // Inicia la descarga del archivo
});

module.exports = router;