const express = require('express');
const { login, register, getUser } = require('../controllers/authController'); // Importamos controladores
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register); // Ruta para registro
router.get('/user', authMiddleware, getUser);

module.exports = router;