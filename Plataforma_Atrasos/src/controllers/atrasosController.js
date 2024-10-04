const db = require('../config/db');
const pdfController = require('./PDFController');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode-terminal');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns');

// Inicializa el cliente de WhatsApp
const client = new Client();

// Genera y muestra el código QR en la terminal
client.on('qr', (qr) => {
    console.log('Escanea el código QR para conectar con WhatsApp');
    QRCode.generate(qr, { small: true }); // Muestra el código QR en la terminal
});

// Inicia el cliente de WhatsApp
console.log('Inicializando cliente de WhatsApp...');
client.initialize();

// Maneja la autenticación
client.on('authenticated', () => {
    console.log('Cliente de WhatsApp autenticado exitosamente');
});

// Maneja fallos de autenticación
client.on('auth_failure', () => {
    console.log('Fallo en la autenticación, reiniciando...');
    client.initialize(); // Reinicia el cliente si la autenticación falla
});

// Maneja la desconexión
client.on('disconnected', (reason) => {
    console.log('Cliente de WhatsApp desconectado:', reason);
    client.destroy(); // Destruye el cliente para asegurarse de que no quedan sesiones abiertas
    client.initialize(); // Reinicia el cliente para que vuelva a generar el código QR
});

// Función para enviar un PDF
const sendPDF = async (number, filePath) => {
    try {
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        console.log(`Enviando archivo a: ${formattedNumber} con el archivo: ${filePath}`);

        // Verifica si el archivo existe
        if (filePath && fs.existsSync(filePath)) {
            console.log('El archivo existe, procediendo a enviar el PDF...');

            // Crea una instancia de MessageMedia desde el archivo
            const media = await MessageMedia.fromFilePath(filePath);

            // Envía el archivo PDF
            await client.sendMessage(formattedNumber, media);

            console.log('PDF enviado con éxito');
        } else {
            console.error('Error: La ruta del archivo es incorrecta o el archivo no existe');
        }
    } catch (error) {
        console.error('Error al enviar el PDF por WhatsApp:', error);
    }
};

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
exports.createAtraso = async (req, res) => {
    const { rutAlumno, justificativo } = req.body;
    const fechaAtrasos = new Date();

    if (!rutAlumno) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const query = 'INSERT INTO ATRASOS (RUT_ALUMNO, FECHA_ATRASOS, JUSTIFICATIVO) VALUES (?, ?, ?)';

    db.query(query, [rutAlumno, fechaAtrasos, justificativo], async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al insertar el atraso' });
        }

        try {
            // Genera el PDF
            const pdfPath = await pdfController.fillForm(rutAlumno, fechaAtrasos);
            console.log('Ruta del PDF generado:', pdfPath);

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

                res.status(201).json({ message: 'Atraso creado con éxito', id: results.insertId });
            });
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

// Obtener atrasos del día
exports.getAtrasosDelDia = (req, res) => {
    const { fecha } = req.query; // Recibe la fecha desde el frontend como un parámetro de consulta

    if (!fecha) {
        return res.status(400).json({ error: 'Se requiere una fecha' });
    }

    // Convertir la fecha proporcionada a formato de JavaScript y establecer el inicio y fin del día
    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    // Corrige el nombre de la tabla aquí
    const query = `
        SELECT A.RUT_ALUMNO, A.FECHA_ATRASOS, A.JUSTIFICATIVO, 
               CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO, 
               C.NOMBRE_CURSO
        FROM ATRASOS A
        JOIN ALUMNOS B ON A.RUT_ALUMNO = B.RUT_ALUMNO
        JOIN CURSOS C ON B.COD_CURSO = C.COD_CURSO
        WHERE A.FECHA_ATRASOS BETWEEN ? AND ?
    `;

    db.query(query, [inicioDelDia, finDelDia], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error); // Agrega esta línea para ver el error
            return res.status(500).json({ error: 'Error al obtener los atrasos' });
        }
        res.json(results);
    });
};
// *** Nueva Funcionalidad: Obtener atrasos semanales (de lunes a viernes) ***
exports.getAtrasosSemanal = (req, res) => {
    const { fecha } = req.query; // Recibe una fecha de referencia desde el frontend

    if (!fecha) {
        return res.status(400).json({ error: 'Se requiere una fecha de referencia' });
    }

    // Convertir la fecha proporcionada a un objeto Date
    const fechaRef = new Date(fecha);
    if (isNaN(fechaRef)) {
        return res.status(400).json({ error: 'Fecha inválida' });
    }





    // Calcular el inicio y fin de la semana completa (Lunes a Domingo)
    const inicioSemana = startOfWeek(fechaRef, { weekStartsOn: 1 }); // 1 = Lunes
    const finSemana = endOfWeek(fechaRef, { weekStartsOn: 0.5 }); // 0 = Domingo

    // Establecer las horas para abarcar todo el día
    inicioSemana.setHours(0, 0, 0, 0); // Inicio del lunes
    finSemana.setHours(23, 59, 59, 999); // Fin del domingo

    // Debugging: Imprimir las fechas calculadas
    console.log('Fecha de Referencia:', fechaRef.toISOString());
    console.log('Inicio de Semana (Lunes):', inicioSemana.toISOString());
    console.log('Fin de Semana (Domingo):', finSemana.toISOString());

    const query = `
        SELECT A.RUT_ALUMNO, A.FECHA_ATRASOS, A.JUSTIFICATIVO, 
               CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO, 
               C.NOMBRE_CURSO
        FROM ATRASOS A
        JOIN ALUMNOS B ON A.RUT_ALUMNO = B.RUT_ALUMNO
        JOIN CURSOS C ON B.COD_CURSO = C.COD_CURSO
        WHERE A.FECHA_ATRASOS BETWEEN ? AND ?
        ORDER BY A.FECHA_ATRASOS ASC
    `;

    db.query(query, [inicioSemana, finSemana], (error, results) => {
        if (error) {
            console.error('Error en la consulta de atrasos semanales:', error);
            return res.status(500).json({ error: 'Error al obtener los atrasos semanales' });
        }
        res.status(200).json({
            inicioSemana: inicioSemana.toISOString().split('T')[0],
            finSemana: finSemana.toISOString().split('T')[0],
            atrasos: results
        });
    });
};

