// src/index.js
const app = require('./app'); // Importa app.js
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});