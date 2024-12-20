// justificativosController.js
const db = require('../config/db');

// Verificar justificativo de residencia de un alumno y devolver su nombre
exports.verificarJustificativos = (req, res) => {
    const { rut } = req.params;
    const query = 'SELECT NOMBRE_ALUMNO, JUSTIFICATIVO_RESIDENCIA, JUSTIFICATIVO_DEPORTIVO, JUSTIFICATIVO_MEDICO FROM ALUMNOS WHERE RUT_ALUMNO = ?';

    db.query(query, [rut], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar justificativo de residencia' });
        }
        if (results.length > 0) {
            return res.status(200).json({
                justificativo_residencia: results[0].JUSTIFICATIVO_RESIDENCIA,
                justificativo_deportivo: results[0].JUSTIFICATIVO_DEPORTIVO,
                justificativo_medico: results[0].JUSTIFICATIVO_MEDICO,
                NOMBRE_ALUMNO: results[0].NOMBRE_ALUMNO // Añadir el nombre del alumno
            });
        } else {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
    });
};
