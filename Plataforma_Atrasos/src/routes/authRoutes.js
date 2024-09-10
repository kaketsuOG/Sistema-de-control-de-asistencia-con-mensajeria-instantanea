const express = require('express');
const { login, register, getAllUsers, getUsersByRole, deleteUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/users', authMiddleware, getAllUsers);
router.get('/users/:codRol', authMiddleware, getUsersByRole);
router.delete('/users/:codUsuario', authMiddleware, deleteUser);

module.exports = router;