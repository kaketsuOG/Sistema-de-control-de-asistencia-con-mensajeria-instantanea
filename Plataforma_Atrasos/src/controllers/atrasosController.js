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


// Función para enviar un PDF
const sendPDF = whatsappController.sendPDF;

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

    // Consulta para obtener el tipo de justificativo del alumno
    const tipoJustificativoQuery = `
        SELECT JUSTIFICATIVO_RESIDENCIA, JUSTIFICATIVO_MEDICO, JUSTIFICATIVO_DEPORTIVO 
        FROM ALUMNOS 
        WHERE RUT_ALUMNO = ?;
    `;

    db.query(tipoJustificativoQuery, [rutAlumno], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener datos del alumno' });
        }

        const justificativos = results[0];
        let tipoJustificativo = 'Sin justificativo'; // Valor por defecto
        let justificativoValue = 0; // Inicializa JUSTIFICATIVO como 0

        // Determinar el tipo de justificativo y actualizar el valor de JUSTIFICATIVO
        if (justificativos.JUSTIFICATIVO_RESIDENCIA) {
            tipoJustificativo = 'Residencia';
            justificativoValue = 1; // Cambia a 1 si hay justificativo de residencia
        } else if (justificativos.JUSTIFICATIVO_MEDICO) {
            tipoJustificativo = 'Médico';
            justificativoValue = 1; // Cambia a 1 si hay justificativo médico
        } else if (justificativos.JUSTIFICATIVO_DEPORTIVO) {
            tipoJustificativo = 'Deportivo';
            justificativoValue = 1; // Cambia a 1 si hay justificativo deportivo
        }

        // Inserta el atraso con el tipo de justificativo
        const insertQuery = `
            INSERT INTO ATRASOS (RUT_ALUMNO, FECHA_ATRASOS, JUSTIFICATIVO, TIPO_JUSTIFICATIVO) 
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertQuery, [rutAlumno, fechaAtrasos, justificativoValue, tipoJustificativo], async (insertError, results) => {
            if (insertError) {
                return res.status(500).json({ error: 'Error al insertar el atraso' });
            }

            const codAtraso = results.insertId; // Obtenemos el ID del atraso recién creado

            try {
                // Genera el PDF
                const pdfPath = await pdfController.fillForm(rutAlumno, fechaAtrasos);
                const pdfFileName = pdfPath.split('/').pop();
                console.log('Nombre del PDF generado:', pdfFileName);

                // Actualizar el campo pdf_path en la tabla atrasos con el ID recién creado
                const updatePdfPathQuery = 'UPDATE ATRASOS SET pdf_path = ? WHERE COD_ATRASOS = ?';
                db.query(updatePdfPathQuery, [pdfFileName, codAtraso], (error, result) => {
                    if (error) {
                        console.error('Error al actualizar la ruta del PDF en la base de datos:', error);
                        return res.status(500).json({ error: 'Error al actualizar la ruta del PDF en la base de datos' });
                    }
                    console.log('Ruta del PDF actualizada correctamente en la base de datos.');
                });

                // Solo se enviará el mensaje si justificativoValue es 0 (sin justificativo)
                if (justificativoValue === 0) {
                    // Obtener el número de celular del apoderado
                    const getCelularQuery = 'SELECT N_CELULAR_APODERADO FROM ALUMNOS WHERE RUT_ALUMNO = ?';
                    db.query(getCelularQuery, [rutAlumno], async (error, results) => {
                        if (error) {
                            console.error('Error al obtener el número de celular del apoderado:', error);
                            return res.status(500).json({ error: 'Error al obtener el número de celular del apoderado' });
                        }

                        const celularApoderado = results[0]?.N_CELULAR_APODERADO;
                        if (celularApoderado) {
                            // Enviar solo el PDF por WhatsApp
                            await sendPDF(celularApoderado, pdfPath);
                        } else {
                            console.error('Error: No se encontró el número de celular del apoderado.');
                            return res.status(404).json({ error: 'No se encontró el número de celular del apoderado' });
                        }

                        res.status(201).json({ message: 'Atraso creado con éxito', id: codAtraso });
                    });
                } else {
                    console.log('El alumno tiene un justificativo, no se enviará el mensaje.');
                    res.status(201).json({ message: 'Atraso creado con éxito, pero no se envió mensaje por justificativo', id: codAtraso });
                }

            } catch (pdfError) {
                console.error('Error al generar PDF:', pdfError);
                res.status(500).json({ error: 'Se creó el atraso, pero no se pudo generar el PDF' });
            }
        });
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

// Obtener atrasos del día
exports.getAtrasosDelDia = (req, res) => {
    const { fecha } = req.query; // Recibe la fecha desde el frontend como un parámetro de consulta

    if (!fecha) {
        return res.status(400).json({ error: 'Se requiere una fecha' });
    }

    // Convertir la fecha proporcionada a formato de JavaScript y establecer el inicio y fin del día
    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    // Incluir TIPO_JUSTIFICATIVO en la consulta
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
            console.error('Error en la consulta SQL:', error); // Agrega esta línea para ver el error
            return res.status(500).json({ error: 'Error al obtener los atrasos' });
        }
        res.json(results);
    });
};


// Obtener atrasos en un rango de fechas con el tipo de justificativo
exports.getAtrasosRango = (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Se requieren ambas fechas: startDate y endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ error: 'Formato de fecha inválido. Usa YYYY-MM-DD' });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const query = `
        SELECT 
            A.RUT_ALUMNO,
            A.FECHA_ATRASOS,
            CASE
                WHEN B.JUSTIFICATIVO_RESIDENCIA = 1 THEN 'Residencia'
                WHEN B.JUSTIFICATIVO_MEDICO = 1 THEN 'Médico'
                WHEN B.JUSTIFICATIVO_DEPORTIVO = 1 THEN 'Deportivo'
                ELSE 'Sin justificativo'
            END AS TIPO_JUSTIFICATIVO,
            CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO,
            C.NOMBRE_CURSO
        FROM 
            ATRASOS A
        JOIN 
            ALUMNOS B ON A.RUT_ALUMNO = B.RUT_ALUMNO
        JOIN 
            CURSOS C ON B.COD_CURSO = C.COD_CURSO
        WHERE 
            A.FECHA_ATRASOS BETWEEN ? AND ?
        ORDER BY 
            A.FECHA_ATRASOS ASC
    `;

    db.query(query, [start, end], (error, results) => {
        if (error) {
            console.error('Error en la consulta de atrasos por rango:', error);
            return res.status(500).json({ error: 'Error al obtener los atrasos por rango' });
        }

        res.status(200).json({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            atrasos: results
        });
    });
};
