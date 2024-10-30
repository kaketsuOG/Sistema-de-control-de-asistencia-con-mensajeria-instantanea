const request = require('supertest');
const db = require('../config/db'); // Mockeamos la base de datos
const app = require('../app'); // Asegúrate de exportar tu instancia de app en app.js

jest.mock('../config/db'); // Simulamos las consultas a la base de datos

describe('Justificativos Controller', () => {
    describe('GET /api/alumnos/:rut/residencia', () => {
        it('Debe obtener justificativos y nombre del alumno', async () => {
            const mockJustificativo = {
                NOMBRE_ALUMNO: 'Juan Perez',
                JUSTIFICATIVO_RESIDENCIA: 1,
                JUSTIFICATIVO_DEPORTIVO: 0,
                JUSTIFICATIVO_MEDICO: 1,
            };

            db.query.mockImplementation((query, params, callback) => {
                callback(null, [mockJustificativo]);
            });

            const response = await request(app).get('/api/alumnos/12345678-9/residencia');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                justificativo_residencia: mockJustificativo.JUSTIFICATIVO_RESIDENCIA,
                justificativo_deportivo: mockJustificativo.JUSTIFICATIVO_DEPORTIVO,
                justificativo_medico: mockJustificativo.JUSTIFICATIVO_MEDICO,
                NOMBRE_ALUMNO: mockJustificativo.NOMBRE_ALUMNO,
            });
        });

        it('Debe retornar un error si ocurre un problema en la base de datos', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Error en la base de datos'));
            });

            const response = await request(app).get('/api/alumnos/12345678-9/residencia');
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error al consultar justificativo de residencia');
        });

        it('Debe retornar un error si el alumno no se encuentra', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null, []);
            });

            const response = await request(app).get('/api/alumnos/12345678-9/residencia');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Alumno no encontrado');
        });
    });
});