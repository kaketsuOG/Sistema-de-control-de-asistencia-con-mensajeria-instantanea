const printer = require("printer");
const db = require('../config/db');
const pdfController = require('./PDFController');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode-terminal');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns');
const whatsappController = require('./whatsappController');

// Inicializar cliente de WhatsApp y configurar eventos
whatsappController.initializeClient();
whatsappController.handleQRGeneration();
whatsappController.handleAuthentication();
whatsappController.handleDisconnection();


exports.verificarRut = (req, res) => {
    const { rut } = req.params;
    const query = 'SELECT * FROM ALUMNOS WHERE RUT_ALUMNO = ?';

    db.query(query, [rut], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al verificar el RUT' });
        }
        if (results.length > 0) {
            res.status(200).json({ exists: true, alumno: results[0] });
        } else {
            res.status(404).json({ exists: false });
        }
    });
};

// Función para enviar un PDF
const sendPDF = whatsappController.sendPDF;

// Función para imprimir el boucher
function imprimirBoucher(nombreCompleto = "Desconocido", rutAlumno = "Sin RUT", nombreCurso = "Sin Curso", fechaAtraso = "Sin Fecha", codAtraso = "Sin Código") {
    // Generar el contenido en formato RAW, incluyendo el código del atraso
    const rawData = '\x1B\x40' + // Resetear impresora
        `Curso: ${nombreCurso}\n` +
        `Nombre: ${nombreCompleto}\n` +
        `RUT: ${rutAlumno}\n` +
        `Fecha: ${fechaAtraso}\n` +
        `Código de Atraso: ${codAtraso}\n\n` +
        '\x1D\x56\x42\x00'; // Cortar papel

    // Depuración: mostrar el contenido generado
    console.log("Datos enviados a la impresora:");
    console.log(rawData);

    // Enviar a la impresora
    printer.printDirect({
        data: rawData,
        type: "RAW",
        printer: "EPSON TM-T20II Receipt", // Nombre exacto de tu impresora
        success: (jobID) => {
            console.log(`Trabajo de impresión enviado con ID: ${jobID}`);
        },
        error: (err) => {
            console.error("Error al imprimir:", err);
        },
    });
}

// Obtener todos los atrasos
exports.getAllAtrasos = (req, res) => {
    const query = `
        SELECT A.RUT_ALUMNO, A.FECHA_ATRASOS, A.JUSTIFICATIVO, A.pdf_path,
               CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO, 
               C.NOMBRE_CURSO,
               CASE
                   WHEN A.JUSTIFICATIVO = 0 THEN 'Sin justificativo'
                   WHEN B.JUSTIFICATIVO_RESIDENCIA = 1 THEN 'Residencial'
                   WHEN B.JUSTIFICATIVO_MEDICO = 1 THEN 'Medico'
                   WHEN B.JUSTIFICATIVO_DEPORTIVO = 1 THEN 'Deportivo'
                   ELSE 'Sin justificativo'
               END AS TIPO_JUSTIFICATIVO
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
exports.createAtraso = async (req, res) => {
    const { rutAlumno } = req.body; // Eliminamos CODATRASO del body
    const fechaAtrasos = new Date();

    if (!rutAlumno) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Consulta para obtener datos del alumno
    const alumnoQuery = `
        SELECT 
            A.RUT_ALUMNO,
            CONCAT(A.NOMBRE_ALUMNO, ' ', A.SEGUNDO_NOMBRE_ALUMNO, ' ', A.APELLIDO_PATERNO_ALUMNO, ' ', A.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO,
            C.NOMBRE_CURSO
        FROM ALUMNOS A
        JOIN CURSOS C ON A.COD_CURSO = C.COD_CURSO
        WHERE A.RUT_ALUMNO = ?;
    `;

    db.query(alumnoQuery, [rutAlumno], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener datos del alumno' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const alumno = results[0];
        const { NOMBRE_COMPLETO: nombreCompleto, NOMBRE_CURSO: nombreCurso } = alumno;

        // Insertar el atraso
        const insertQuery = `
            INSERT INTO ATRASOS (RUT_ALUMNO, FECHA_ATRASOS, JUSTIFICATIVO, TIPO_JUSTIFICATIVO) 
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertQuery, [rutAlumno, fechaAtrasos, 0, 'Sin justificativo'], async (insertError, insertResults) => {
            if (insertError) {
                return res.status(500).json({ error: 'Error al registrar el atraso' });
            }

            const codAtraso = insertResults.insertId;

            // Imprimir el boucher
            const fechaFormateada = fechaAtrasos.toLocaleString();
            imprimirBoucher(nombreCompleto, rutAlumno, nombreCurso, fechaFormateada, codAtraso);

            try {
                // Generar PDF
                const pdfPath = await pdfController.fillForm(rutAlumno, fechaAtrasos);
                const updatePdfQuery = 'UPDATE ATRASOS SET pdf_path = ? WHERE COD_ATRASOS = ?';
                db.query(updatePdfQuery, [pdfPath, codAtraso]);

                res.status(201).json({ message: 'Atraso registrado, boucher impreso y PDF generado correctamente' });
            } catch (err) {
                console.error('Error generando el PDF:', err);
                res.status(500).json({ error: 'Se registró el atraso, pero ocurrió un error generando el PDF' });
            }
        });
    });
};

// Actualizar un atraso existente
exports.updateAtraso = (req, res) => {
    const { id } = req.params;
    const { rutAlumno, fechaAtrasos, justificativo } = req.body;

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

// Obtener atrasos del día
exports.getAtrasosDelDia = (req, res) => {
    const { fecha } = req.query;

    if (!fecha) {
        return res.status(400).json({ error: 'Se requiere una fecha' });
    }

    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    const query = `
        SELECT A.RUT_ALUMNO, A.FECHA_ATRASOS, A.JUSTIFICATIVO, A.TIPO_JUSTIFICATIVO, 
               CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO, 
               C.NOMBRE_CURSO
        FROM ATRASOS A
        JOIN ALUMNOS B ON A.RUT_ALUMNO = B.RUT_ALUMNO
        JOIN CURSOS C ON B.COD_CURSO = C.COD_CURSO
        WHERE A.FECHA_ATRASOS BETWEEN ? AND ?;
    `;

    db.query(query, [inicioDelDia, finDelDia], (error, results) => {
        if (error) {
            console.error('Error al obtener atrasos:', error);
            return res.status(500).json({ error: 'Error al obtener los atrasos' });
        }
        res.json(results);
    });
};

// Obtener atrasos en un rango de fechas
exports.getAtrasosRango = (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Se requieren ambas fechas: startDate y endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const query = `
        SELECT 
            A.RUT_ALUMNO, A.FECHA_ATRASOS,
            CASE
                WHEN B.JUSTIFICATIVO_RESIDENCIA = 1 THEN 'Residencia'
                WHEN B.JUSTIFICATIVO_MEDICO = 1 THEN 'Médico'
                WHEN B.JUSTIFICATIVO_DEPORTIVO = 1 THEN 'Deportivo'
                ELSE 'Sin justificativo'
            END AS TIPO_JUSTIFICATIVO,
            CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO,
            C.NOMBRE_CURSO
        FROM ATRASOS A
        JOIN ALUMNOS B ON A.RUT_ALUMNO = B.RUT_ALUMNO
        JOIN CURSOS C ON B.COD_CURSO = C.COD_CURSO
        WHERE A.FECHA_ATRASOS BETWEEN ? AND ?
        ORDER BY A.FECHA_ATRASOS ASC
    `;

    db.query(query, [start, end], (error, results) => {
        if (error) {
            console.error('Error al obtener atrasos por rango:', error);
            return res.status(500).json({ error: 'Error al obtener los atrasos por rango' });
        }

        res.status(200).json({ atrasos: results });
    });
};
