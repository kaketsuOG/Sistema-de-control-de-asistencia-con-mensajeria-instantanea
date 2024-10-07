const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('express').json;
const authRoutes = require('./routes/authRoutes');
const atrasosRoutes = require('./routes/atrasosRoutes'); // Agrega esta línea
const justificativoRoutes = require('./routes/justificativoRoutes');


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const path = require('path');

app.use('/SalidaPDF', express.static(path.join(__dirname, 'SalidaPDF')));


app.use(cors());
app.use(bodyParser());
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/api', atrasosRoutes);
app.use('/api', justificativoRoutes)



app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});