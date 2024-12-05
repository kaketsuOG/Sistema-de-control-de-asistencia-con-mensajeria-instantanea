const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

jest.mock('../config/db', () => ({
    query: jest.fn(),
}));

// Mock de whatsappController para evitar inicialización en pruebas
jest.mock('../controllers/whatsappController', () => ({
    initializeClient: jest.fn(),
    handleQRGeneration: jest.fn(),
    handleAuthentication: jest.fn(),
    handleDisconnection: jest.fn(),
    sendPDF: jest.fn(() => Promise.resolve()), // Evita operaciones reales de envío de PDF
}));

// Mock de pdfController para evitar la creación real de PDF
jest.mock('../controllers/PDFController', () => ({
    fillForm: jest.fn(() => Promise.resolve('/fake/path/to/generated.pdf')),
}));

describe('Atrasos Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/atrasos', () => {
        it('Debe registrar un nuevo atraso', async () => {
            db.query
                .mockImplementationOnce((query, params, callback) => {
                    if (query.includes('SELECT * FROM ALUMNOS')) {
                        callback(null, [{ COD_CURSO: 1, NOMBRE_ALUMNO: 'Juan', APELLIDO_PATERNO_ALUMNO: 'Pérez' }]);
                    }
                })
                .mockImplementationOnce((query, params, callback) => {
                    if (query.includes('SELECT NOMBRE_CURSO FROM CURSOS')) {
                        callback(null, [{ NOMBRE_CURSO: 'Matemáticas' }]);
                    }
                })
                .mockImplementationOnce((query, params, callback) => {
                    if (query.includes('INSERT INTO ATRASOS')) {
                        callback(null, { insertId: 1 });
                    }
                });

            const newAtraso = { rutAlumno: '123' };
            const response = await request(app).post('/api/atrasos').send(newAtraso);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Atraso creado con éxito');
        });

        it('Debe retornar un error si ocurre un problema en la base de datos al crear atraso', async () => {
            // Aquí mockeamos las consultas a la base de datos
            db.query.mockImplementation((query, params, callback) => {
                if (query.includes('SELECT * FROM ALUMNOS WHERE RUT_ALUMNO = ?')) {
                    callback(new Error('Error al verificar el RUT del alumno')); // Simulamos un error de base de datos
                } else if (query.includes('SELECT NOMBRE_CURSO FROM CURSOS WHERE COD_CURSO = ?')) {
                    callback(new Error('Error al obtener el curso del alumno'));
                } else if (query.includes('INSERT INTO ATRASOS')) {
                    callback(new Error('Error al insertar el atraso'));
                } else if (query.includes('SELECT N_CELULAR_APODERADO FROM ALUMNOS')) {
                    callback(new Error('Error al obtener el celular del apoderado'));
                }
            });

            const response = await request(app)
                .post('/api/atrasos')
                .send({ rutAlumno: '12345678-9' });  // Enviamos un rut válido para que se ejecute el flujo de base de datos

            // Aquí comprobamos que la respuesta tenga el error esperado
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Error al verificar el RUT del alumno');
        });
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