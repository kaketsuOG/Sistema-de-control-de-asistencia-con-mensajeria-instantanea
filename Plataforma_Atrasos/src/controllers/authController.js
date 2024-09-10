const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.login = (req, res) => {
    const { rutUsername, contraseña } = req.body;

    db.query('SELECT * FROM USUARIOS WHERE RUT_USERNAME = ?', [rutUsername], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en la base de datos' });

        if (results.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        bcrypt.compare(contraseña, user.CONTRASEÑA, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error al comparar contraseñas' });
            if (!isMatch) {
                return res.status(400).json({ message: 'Contraseña incorrecta' });
            }

            const token = jwt.sign({ id: user.COD_USUARIO }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ token });
        });
    });
};

exports.register = (req, res) => {
    const { nombreUsuario, codRol, contraseña, rutUsername } = req.body;

    bcrypt.hash(contraseña, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error al hash de la contraseña' });

        db.query('INSERT INTO USUARIOS (NOMBRE_USUARIO, COD_ROL, CONTRASEÑA, RUT_USERNAME) VALUES (?, ?, ?, ?)', [nombreUsuario, codRol, hashedPassword, rutUsername], (err) => {
            if (err) return res.status(500).json({ message: 'Error al registrar el usuario' });

            res.status(201).json({ message: 'Usuario registrado correctamente' });
        });
    });
};

exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM USUARIOS', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en la base de datos' });

        res.json(results);
    });
};

exports.getUsersByRole = (req, res) => {
    const { codRol } = req.params;

    db.query('SELECT * FROM USUARIOS WHERE COD_ROL = ?', [codRol], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en la base de datos' });

        res.json(results);
    });
};

exports.deleteUser = (req, res) => {
    const { codUsuario } = req.params;

    db.query('DELETE FROM USUARIOS WHERE COD_USUARIO = ?', [codUsuario], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar el usuario' });

        res.json({ message: 'Usuario eliminado correctamente' });
    });
};