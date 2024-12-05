const request = require('supertest');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcryptjs'); // Asegúrate de usar bcryptjs
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const app = require('../app');
const authController = require('../controllers/authController');

jest.mock('../config/db');
jest.mock('bcryptjs', () => ({
    hash: jest.fn((password, saltRounds, callback) => {
        if (password === 'error') {
            return callback(new Error('Error al hash de la contraseña'));
        }
        callback(null, 'hashedPassword123');
    }),
}));
jest.mock('jsonwebtoken');

let token;

beforeEach(() => {
    token = jwt.sign({ id: '12345' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    jwt.verify = jest.fn(() => ({ id: '12345' }));
});

describe('Auth Controller - Otros Endpoints', () => {
    describe('Register', () => {
        it('Debe registrar un nuevo usuario', async () => {
            bcrypt.hash.mockImplementation((password, saltRounds, callback) => {
                callback(null, 'hashedPassword123'); // Mock del hash exitoso
            });

            db.query.mockImplementation((query, params, callback) => {
                callback(null); // Mock de una inserción exitosa
            });

            const req = httpMocks.createRequest({
                body: {
                    nombreUsuario: 'Test User',
                    codRol: 1,
                    contraseña: 'password123',
                    rutUsername: '12345678-9',
                },
            });
            const res = httpMocks.createResponse();

            await authController.register(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual({
                message: 'Usuario registrado correctamente',
            });
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al registrar', async () => {
            bcrypt.hash.mockImplementation((password, saltRounds, callback) => {
                callback(null, 'hashedPassword123'); // Mock del hash exitoso
            });

            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Error al registrar el usuario')); // Simula un error de la base de datos
            });

            const req = httpMocks.createRequest({
                body: {
                    nombreUsuario: 'Test User',
                    codRol: 1,
                    contraseña: 'password123',
                    rutUsername: '12345678-9',
                },
            });
            const res = httpMocks.createResponse();

            await authController.register(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({
                message: 'Error al registrar el usuario',
            });
        });

        it('Debe retornar un error si ocurre un problema al hash de la contraseña', async () => {
            bcrypt.hash.mockImplementation((password, saltRounds, callback) => {
                callback(new Error('Error al hash de la contraseña')); // Simula un error al hacer hash
            });

            const req = httpMocks.createRequest({
                body: {
                    nombreUsuario: 'Test User',
                    codRol: 1,
                    contraseña: 'password123',
                    rutUsername: '12345678-9',
                },
            });
            const res = httpMocks.createResponse();

            await authController.register(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({
                message: 'Error al hash de la contraseña',
            });
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

afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
});
