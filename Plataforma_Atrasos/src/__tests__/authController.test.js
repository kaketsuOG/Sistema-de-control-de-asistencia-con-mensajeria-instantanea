const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Mockeamos la base de datos
const app = require('../app'); // Asegúrate de que exportas tu instancia de app en app.js

jest.mock('../config/db'); // Simulamos las consultas a la base de datos

// Generamos un token válido para autenticación
const token = jwt.sign({ id: '12345678-9' }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Auth Controller - Otros Endpoints', () => {
    describe('Register', () => {
        it('Debe registrar un nuevo usuario', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null); // Simulamos una inserción exitosa
            });

            const response = await request(app)
                .post('/auth/register')
                .send({
                    nombreUsuario: 'testuser',
                    codRol: 1,
                    contraseña: 'password123',
                    rutUsername: '12345678-9',
                })
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Usuario registrado correctamente');
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al registrar', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app)
                .post('/auth/register')
                .send({
                    nombreUsuario: 'testuser',
                    codRol: 1,
                    contraseña: 'password123',
                    rutUsername: '12345678-9',
                })
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Error al registrar el usuario');
        });
    });

    describe('Get All Users', () => {
        it('Debe obtener todos los usuarios', async () => {
            const mockUsers = [{ RUT_USERNAME: '12345678-9', NOMBRE_USUARIO: 'testuser' }];
            db.query.mockImplementation((query, callback) => {
                callback(null, mockUsers);
            });

            const response = await request(app)
                .get('/auth/users')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al obtener todos los usuarios', async () => {
            db.query.mockImplementation((query, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app)
                .get('/auth/users')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Error en la base de datos');
        });
    });

    describe('Get Users By RUT', () => {
        it('Debe obtener un usuario por su RUT', async () => {
            const mockUser = { RUT_USERNAME: '12345678-9', NOMBRE_USUARIO: 'testuser' };
            db.query.mockImplementation((query, params, callback) => {
                callback(null, [mockUser]);
            });

            const response = await request(app)
                .get('/auth/users/12345678-9')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([mockUser]);
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al buscar por RUT', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app)
                .get('/auth/users/12345678-9')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Error en la base de datos');
        });
    });

    describe('Delete User', () => {
        it('Debe eliminar un usuario por su código de usuario', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null); // Simulamos eliminación exitosa
            });

            const response = await request(app)
                .delete('/auth/users/1')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Usuario eliminado correctamente');
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al eliminar el usuario', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app)
                .delete('/auth/users/1')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Error al eliminar el usuario');
        });
    });

    describe('Get User Name By RUT', () => {
        it('Debe obtener el nombre de usuario por RUT', async () => {
            const mockUser = { NOMBRE_USUARIO: 'testuser' };
            db.query.mockImplementation((query, params, callback) => {
                callback(null, [mockUser]);
            });

            const response = await request(app)
                .get('/auth/username/12345678-9')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
        });

        it('Debe retornar un error si el usuario no existe', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null, []);
            });

            const response = await request(app)
                .get('/auth/username/12345678-9')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Usuario no encontrado');
        });
    });
});