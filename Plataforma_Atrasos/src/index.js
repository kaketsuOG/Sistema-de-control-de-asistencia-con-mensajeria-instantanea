const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('express').json;
const path = require('path'); // Importa path para manejar rutas de archivos

const authRoutes = require('./routes/authRoutes');
const atrasosRoutes = require('./routes/atrasosRoutes');
const justificativoRoutes = require('./routes/justificativoRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser());
app.use(express.json());

// Ruta para servir archivos PDF desde la carpeta SalidaPDF
app.use('/SalidaPDF', express.static(path.join(__dirname, 'src/SalidaPDF')));

// Rutas
app.use('/auth', authRoutes);
app.use('/api', atrasosRoutes);
app.use('/api', justificativoRoutes);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
