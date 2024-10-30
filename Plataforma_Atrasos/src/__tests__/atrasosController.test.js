const request = require('supertest');
const db = require('../config/db');
const app = require('../app'); // Asegúrate de que exportas tu instancia de app en app.js
jest.mock('../config/db'); // Mock de la base de datos

// Mock de whatsappController para evitar inicialización en pruebas
jest.mock('../controllers/whatsappController', () => ({
    initializeClient: jest.fn(),
    handleQRGeneration: jest.fn(),
    handleAuthentication: jest.fn(),
    handleDisconnection: jest.fn(),
    sendPDF: jest.fn(() => Promise.resolve()), // Evitamos operaciones de envío de PDF
}));

// Mock de pdfController para evitar la creación real de PDF
jest.mock('../controllers/PDFController', () => ({
    fillForm: jest.fn(() => Promise.resolve('/fake/path/to/generated.pdf')), // Ruta ficticia del PDF
}));

jest.setTimeout(15000); // Aumenta el tiempo de espera de cada test a 15 segundos

describe('Atrasos Controller', () => {
    describe('GET /api/atrasos', () => {
        it('Debe obtener todos los atrasos', async () => {
            const mockAtrasos = [{ RUT_ALUMNO: '123', NOMBRE_COMPLETO: 'Juan Perez', NOMBRE_CURSO: 'Matemáticas' }];

            db.query.mockImplementation((query, callback) => {
                callback(null, mockAtrasos);
            });

            const response = await request(app).get('/api/atrasos');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAtrasos);
        });

        it('Debe retornar un error si ocurre un problema en la base de datos', async () => {
            db.query.mockImplementation((query, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app).get('/api/atrasos');
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error al obtener los atrasos');
        });
    });

    describe('POST /api/atrasos', () => {
        it('Debe registrar un nuevo atraso', async () => {
            const newAtraso = { rutAlumno: '123' };
            db.query.mockImplementation((query, params, callback) => {
                if (query.includes('SELECT JUSTIFICATIVO')) {
                    callback(null, [{ JUSTIFICATIVO_RESIDENCIA: 0, JUSTIFICATIVO_MEDICO: 0, JUSTIFICATIVO_DEPORTIVO: 0 }]);
                } else if (query.includes('INSERT INTO ATRASOS')) {
                    callback(null, { insertId: 1 });
                } else if (query.includes('UPDATE ATRASOS SET pdf_path')) {
                    callback(null);
                } else if (query.includes('SELECT N_CELULAR_APODERADO')) {
                    callback(null, [{ N_CELULAR_APODERADO: '123456789' }]);
                }
            });

            const response = await request(app).post('/api/atrasos').send(newAtraso);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Atraso creado con éxito');
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al crear atraso', async () => {
            db.query.mockImplementation((query, params, callback) => {
                if (query.includes('SELECT JUSTIFICATIVO')) {
                    callback(null, [{ JUSTIFICATIVO_RESIDENCIA: 0 }]);
                } else if (query.includes('INSERT INTO ATRASOS')) {
                    callback(new Error('Error en la base de datos'));
                }
            });

            const response = await request(app).post('/api/atrasos').send({ rutAlumno: '123' });
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error al insertar el atraso');
        });
    });

    describe('PUT /api/atrasos/:id', () => {
        it('Debe actualizar un atraso existente', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null);
            });

            const response = await request(app).put('/api/atrasos/1').send({
                rutAlumno: '123',
                fechaAtrasos: '2023-10-01',
                justificativo: true,
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Atraso actualizado con éxito');
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al actualizar', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app).put('/api/atrasos/1').send({
                rutAlumno: '123',
                fechaAtrasos: '2023-10-01',
                justificativo: true,
            });
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error al actualizar el atraso');
        });
    });

    describe('DELETE /api/atrasos/:id', () => {
        it('Debe eliminar un atraso existente', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null);
            });

            const response = await request(app).delete('/api/atrasos/1');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Atraso eliminado con éxito');
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al eliminar', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app).delete('/api/atrasos/1');
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error al eliminar el atraso');
        });
    });

    describe('GET /api/atrasos/dia', () => {
        it('Debe obtener los atrasos del día', async () => {
            const mockAtrasos = [{ RUT_ALUMNO: '123', NOMBRE_COMPLETO: 'Juan Perez', NOMBRE_CURSO: 'Matemáticas' }];
            db.query.mockImplementation((query, params, callback) => {
                callback(null, mockAtrasos);
            });

            const response = await request(app).get('/api/atrasos/dia').query({ fecha: '2023-10-01' });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAtrasos);
        });

        it('Debe retornar error si falta la fecha', async () => {
            const response = await request(app).get('/api/atrasos/dia');
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Se requiere una fecha');
        });
    });

    describe('GET /api/atrasos/rango', () => {
        it('Debe obtener atrasos dentro del rango de fechas', async () => {
            const mockAtrasos = [{ RUT_ALUMNO: '123', NOMBRE_COMPLETO: 'Juan Perez', NOMBRE_CURSO: 'Matemáticas' }];
            db.query.mockImplementation((query, params, callback) => {
                callback(null, mockAtrasos);
            });

            const response = await request(app).get('/api/atrasos/rango').query({
                startDate: '2023-09-01',
                endDate: '2023-09-30',
            });
            expect(response.status).toBe(200);
            expect(response.body.atrasos).toEqual(mockAtrasos);
        });

        it('Debe retornar error si falta una de las fechas', async () => {
            const response = await request(app).get('/api/atrasos/rango').query({ startDate: '2023-09-01' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Se requieren ambas fechas: startDate y endDate');
        });
    });
});