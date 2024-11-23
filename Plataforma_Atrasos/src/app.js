// src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('express').json;

// Rutas
const authRoutes = require('./routes/authRoutes');
const atrasosRoutes = require('./routes/atrasosRoutes');
const justificativoRoutes = require('./routes/justificativoRoutes');

dotenv.config();

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(bodyParser());
app.use(express.json());

// Archivos estáticos
app.use('/SalidaPDF', express.static(path.join(__dirname, 'Plataforma_Atrasos/src/SalidaPDF')));

// Rutas
app.use('/auth', authRoutes);
app.use('/api', atrasosRoutes);
app.use('/api', justificativoRoutes);
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

module.exports = app;