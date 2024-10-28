// src/controllers/whatsappController.js
const { Client, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client();

// Inicializar el cliente de WhatsApp
const initializeClient = () => {
    console.log('Inicializando cliente de WhatsApp...');
    client.initialize();
};

// Generar y mostrar el código QR en la terminal
const handleQRGeneration = () => {
    client.on('qr', (qr) => {
        console.log('Escanea el código QR para conectar con WhatsApp');
        QRCode.generate(qr, { small: true });
    });
};

// Manejar la autenticación
const handleAuthentication = () => {
    client.on('authenticated', () => {
        console.log('Cliente de WhatsApp autenticado exitosamente');
    });

    client.on('auth_failure', () => {
        console.log('Fallo en la autenticación, reiniciando...');
        client.initialize(); // Reinicia el cliente si la autenticación falla
    });
};

// Manejar la desconexión
const handleDisconnection = () => {
    client.on('disconnected', (reason) => {
        console.log('Cliente de WhatsApp desconectado:', reason);
        client.destroy();
        client.initialize(); // Reinicia el cliente para generar un nuevo código QR
    });
};

// Función para enviar un PDF
const sendPDF = async (number, filePath) => {
    try {
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        console.log(`Enviando archivo a: ${formattedNumber} con el archivo: ${filePath}`);

        if (filePath && fs.existsSync(filePath)) {
            const media = await MessageMedia.fromFilePath(filePath);
            await client.sendMessage(formattedNumber, media);
            console.log('PDF enviado con éxito');
        } else {
            console.error('Error: La ruta del archivo es incorrecta o el archivo no existe');
        }
    } catch (error) {
        console.error('Error al enviar el PDF por WhatsApp:', error);
    }
};

// Exportar las funciones
module.exports = {
    initializeClient,
    handleQRGeneration,
    handleAuthentication,
    handleDisconnection,
    sendPDF,
};