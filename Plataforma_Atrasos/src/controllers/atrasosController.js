const db = require('../config/db');
const pdfController = require('./PDFController')

// Obtener todos los atrasos
exports.getAllAtrasos = (req, res) => {
    const query = `
        SELECT A.RUT_ALUMNO, A.FECHA_ATRASOS, A.JUSTIFICATIVO, 
               CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO, 
               C.NOMBRE_CURSO
        FROM ATRASOS A
        JOIN ALUMNOS B ON A.RUT_ALUMNO = B.RUT_ALUMNO
        JOIN CURSOS C ON B.COD_CURSO = C.COD_CURSO
        GROUP BY A.COD_ATRASOS
    `;
    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener los atrasos' });
        }
        res.status(200).json(results);
    });
};


// Registrar un nuevo atraso
exports.createAtraso = (req, res) => {
    const { rutAlumno, justificativo } = req.body;
    const fechaAtrasos = new Date();

    // Verifica que falten datos requeridos
    if (!rutAlumno) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const query = 'INSERT INTO ATRASOS (RUT_ALUMNO, FECHA_ATRASOS, JUSTIFICATIVO) VALUES (?, ?, ?)';

    // Realiza la inserción en la base de datos
    db.query(query, [rutAlumno, fechaAtrasos, justificativo], async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al insertar el atraso' });
        }

        // Solo genera el PDF si la inserción fue exitosa
        try {
            pdfController.fillForm(rutAlumno, fechaAtrasos);
            res.status(201).json({ message: 'Atraso creado con éxito', id: results.insertId });
        } catch (pdfError) {
            console.error('Error al generar PDF:', pdfError);
            res.status(500).json({ error: 'Se creó el atraso, pero no se pudo generar el PDF' });
        }
    });
};

// Actualizar un atraso existente
exports.updateAtraso = (req, res) => {
    const { id } = req.params;
    const { rutAlumno, fechaAtrasos, justificativo } = req.body;

    // Verifica que el justificativo sea un booleano
    if (typeof justificativo !== 'boolean') {
        return res.status(400).json({ error: 'El justificativo debe ser un booleano' });
    }

    const query = 'UPDATE ATRASOS SET RUT_ALUMNO = ?, FECHA_ATRASOS = ?, JUSTIFICATIVO = ? WHERE COD_ATRASOS = ?';

    db.query(query, [rutAlumno, fechaAtrasos, justificativo, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al actualizar el atraso' });
        }
        res.status(200).json({ message: 'Atraso actualizado con éxito' });
    });
};


// Eliminar un atraso
exports.deleteAtraso = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM ATRASOS WHERE COD_ATRASOS = ?';

    db.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al eliminar el atraso' });
        }
        res.status(200).json({ message: 'Atraso eliminado con éxito' });
    });
};




// En tu controlador de atrasos
exports.getAtrasosDelDia = (req, res) => {
    const { fecha } = req.query; // Recibe la fecha desde el frontend como un parámetro de consulta

    if (!fecha) {
        return res.status(400).json({ error: 'Se requiere una fecha' });
    }

    // Convertir la fecha proporcionada a formato de JavaScript y establecer el inicio y fin del día
    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    const query = 'SELECT * FROM ATRASOS WHERE FECHA_ATRASOS BETWEEN ? AND ?';
    db.query(query, [inicioDelDia, finDelDia], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener los atrasos' });
        }
        res.json(results);
    });
};



