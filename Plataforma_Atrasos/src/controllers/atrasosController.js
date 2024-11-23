const db = require('../config/db');
const pdfController = require('./PDFController');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode-terminal');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns');
const whatsappController = require('./whatsappController');
const PDFDocument = require('pdfkit');
const path = require('path');

// Inicializar cliente de WhatsApp y configurar eventos
whatsappController.initializeClient();
whatsappController.handleQRGeneration();
whatsappController.handleAuthentication();
whatsappController.handleDisconnection();

// Función para enviar un PDF
const sendPDF = whatsappController.sendPDF;

// Función para generar el baucher del atraso
const generateBaucher = (data) => {
    const { curso, nombre, rut, fecha, codAtraso } = data;

    // Crear un documento PDF ajustado al tamaño de una impresora térmica de 80mm (ancho 80mm, altura automática)
    const doc = new PDFDocument({
        size: [283, 841], // 80mm de ancho (283 puntos) y altura predeterminada (841 puntos para tamaño A4)
        margin: 0, // Sin márgenes grandes
    });

    // Establecer la fuente (puedes usar una fuente estándar o alguna específica que sea legible en impresoras térmicas)
    doc.font('Helvetica');

    // Ajustar el tamaño de la fuente
    doc.fontSize(10); // Puedes probar con 9 o 10, dependiendo de cuánto espacio necesites

    // Ajustar la posición del título para moverlo más a la izquierda y hacia arriba
    doc.text('Comprobante de Atraso', {
        align: 'left', // Alineación a la izquierda
        continued: true,
        lineBreak: true,
        baseline: 'top',
        indent: 10, // Un pequeño desplazamiento hacia la izquierda
    });

    doc.moveDown(0.5); // Espacio hacia abajo

    // Ajustar el texto del curso, alineado a la izquierda
    doc.text(`Curso: ${curso}`, {
        align: 'left', // Alineación a la izquierda
        indent: 10, // Moverlo un poco hacia la izquierda
    });

    doc.moveDown(1); // Un poco más de espacio hacia abajo para el curso

    // Mover los siguientes elementos un poco a la derecha para evitar corte, y reducir el espacio entre ellos
    doc.text(`Nombre: ${nombre}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    doc.moveDown(0.3); // Menos espacio hacia abajo

    doc.text(`RUT: ${rut}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    doc.moveDown(0.3); // Menos espacio hacia abajo

    doc.text(`Fecha de Atraso: ${fecha}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    doc.moveDown(0.3); // Menos espacio hacia abajo

    doc.text(`Código de Atraso: ${codAtraso}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    // Añadir la línea de separación (si deseas)
    doc.moveDown(1); // Espacio adicional
    doc.text('----------------------------', { align: 'center' });

    // Generar el archivo PDF en la ubicación deseada
    const dir = path.join(__dirname, '../pdfs'); // Ruta del directorio 'pdfs'
    const fileName = `baucher_atraso_${codAtraso}.pdf`;
    const filePath = path.join(dir, fileName);

    // Verificar si el directorio 'pdfs' existe, y crearlo si no
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Crea el directorio y subdirectorios necesarios
    }

    // Escribir el archivo PDF
    doc.pipe(fs.createWriteStream(filePath));
    doc.end();

    return `/pdfs/${fileName}`; // Ruta pública del PDF
};

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
    const { rutAlumno } = req.body;
    const fechaAtrasos = new Date();

    if (!rutAlumno) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const checkRutQuery = 'SELECT * FROM ALUMNOS WHERE RUT_ALUMNO = ?';

    db.query(checkRutQuery, [rutAlumno], async (checkError, checkResults) => {
        if (checkError) {
            return res.status(500).json({ error: 'Error al verificar el RUT del alumno' });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({ error: 'El RUT del alumno no existe en la base de datos' });
        }

        const alumno = checkResults[0];
        const cursoQuery = 'SELECT NOMBRE_CURSO FROM CURSOS WHERE COD_CURSO = ?';

        db.query(cursoQuery, [alumno.COD_CURSO], async (cursoError, cursoResults) => {
            if (cursoError) {
                return res.status(500).json({ error: 'Error al obtener el curso del alumno' });
            }

            const curso = cursoResults[0]?.NOMBRE_CURSO || 'Curso desconocido';

            const insertQuery = `
                INSERT INTO ATRASOS (RUT_ALUMNO, FECHA_ATRASOS, JUSTIFICATIVO, TIPO_JUSTIFICATIVO) 
                VALUES (?, ?, 0, 'Sin justificativo')
            `;

            db.query(insertQuery, [rutAlumno, fechaAtrasos], async (insertError, results) => {
                if (insertError) {
                    return res.status(500).json({ error: 'Error al insertar el atraso' });
                }

                const codAtraso = results.insertId;

                try {
                    const pdfPath = await pdfController.fillForm(rutAlumno, fechaAtrasos);
                    const pdfFileName = pdfPath.split('/').pop();
                    console.log('Nombre del PDF generado:', pdfFileName);

                    const updatePdfPathQuery = 'UPDATE ATRASOS SET pdf_path = ? WHERE COD_ATRASOS = ?';
                    db.query(updatePdfPathQuery, [pdfFileName, codAtraso], (error, result) => {
                        if (error) {
                            console.error('Error al actualizar la ruta del PDF institucional:', error);
                            return res.status(500).json({ error: 'Error al actualizar la ruta del PDF en la base de datos' });
                        }
                        console.log('Ruta del PDF actualizada correctamente en la base de datos.');
                    });

                    const getCelularQuery = 'SELECT N_CELULAR_APODERADO FROM ALUMNOS WHERE RUT_ALUMNO = ?';
                    db.query(getCelularQuery, [rutAlumno], async (error, results) => {
                        if (error) {
                            console.error('Error al obtener el celular del apoderado:', error);
                            return res.status(500).json({ error: 'Error al obtener el celular del apoderado' });
                        }

                        const celularApoderado = results[0]?.N_CELULAR_APODERADO;
                        if (celularApoderado) {
                            await sendPDF(celularApoderado, pdfPath);
                        }  else {
                            console.error('Error: No se encontró el número de celular del apoderado.');
                            return res.status(404).json({ error: 'No se encontró el número de celular del apoderado' });
                        }
                    });

                    const baucherPath = generateBaucher({
                        curso,
                        nombre: `${alumno.NOMBRE_ALUMNO} ${alumno.APELLIDO_PATERNO_ALUMNO} ${alumno.APELLIDO_MATERNO_ALUMNO}`,
                        rut: alumno.RUT_ALUMNO,
                        fecha: fechaAtrasos.toLocaleString(),
                        codAtraso,
                    });

                    console.log('Baucher generado correctamente.');

                    return res.status(201).json({
                        message: 'Atraso creado con éxito',
                        pdfInstitutionalPath: pdfPath,
                        baucherPath,
                    });
                } catch (pdfError) {
                    console.error('Error al procesar el atraso:', pdfError);
                    res.status(500).json({ error: 'Error al procesar el atraso y generar PDFs' });
                }
            });
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

    db.query(query, [rutAlumno, fechaAtrasos, justificativo, id], (error) => {
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

    db.query(query, [id], (error) => {
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
            console.error('Error en la consulta SQL:', error);
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
// Verificar si existe un RUT
exports.verificarRut = (req, res) => {
    const { rut } = req.params;

    if (!rut) {
        return res.status(400).json({ error: 'RUT no proporcionado' });
    }

    const query = 'SELECT COUNT(*) as count FROM ALUMNOS WHERE RUT_ALUMNO = ?';

    db.query(query, [rut], (error, results) => {
        if (error) {
            console.error('Error al verificar RUT:', error);
            return res.status(500).json({ error: 'Error al verificar el RUT' });
        }

        const exists = results[0].count > 0;
        res.json({ exists });
    });
};