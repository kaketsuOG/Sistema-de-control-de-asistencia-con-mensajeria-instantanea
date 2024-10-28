const request = require('supertest');
const express = require('express');
const app = express();
const db = require('../config/db'); // Importa tu configuración de DB
const atrasosController = require('./atrasosController');

// Configura el middleware de express
app.use(express.json());

// Rutas de prueba
app.get('/atrasos', atrasosController.getAllAtrasos);
app.post('/atrasos', atrasosController.createAtraso);
app.put('/atrasos/:id', atrasosController.updateAtraso);
app.delete('/atrasos/:id', atrasosController.deleteAtraso);
app.get('/atrasos/dia', atrasosController.getAtrasosDelDia);

// Mock de la base de datos
jest.mock('../config/db', () => ({
  query: jest.fn((query, params, callback) => {
    if (query.includes('SELECT')) {
      callback(null, [{ RUT_ALUMNO: '12345678-9', FECHA_ATRASOS: '2024-10-28', JUSTIFICATIVO: 0 }]);
    } else if (query.includes('INSERT')) {
      callback(null, { insertId: 1 });
    } else {
      callback(null, {});
    }
  }),
}));

describe('Atrasos Controller', () => {
  describe('GET /atrasos', () => {
    it('debe devolver todos los atrasos', async () => {
      const response = await request(app).get('/atrasos');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ RUT_ALUMNO: '12345678-9' })]));
    });
  });

  describe('POST /atrasos', () => {
    it('debe crear un nuevo atraso', async () => {
      const response = await request(app).post('/atrasos').send({ rutAlumno: '12345678-9' });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Atraso creado con éxito');
      expect(response.body).toHaveProperty('id', 1);
    });

    it('debe devolver error si faltan datos', async () => {
      const response = await request(app).post('/atrasos').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Faltan datos requeridos');
    });
  });

  describe('PUT /atrasos/:id', () => {
    it('debe actualizar un atraso existente', async () => {
      const response = await request(app).put('/atrasos/1').send({ rutAlumno: '12345678-9', fechaAtrasos: new Date(), justificativo: false });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Atraso actualizado con éxito');
    });
  });

  describe('DELETE /atrasos/:id', () => {
    it('debe eliminar un atraso', async () => {
      const response = await request(app).delete('/atrasos/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Atraso eliminado con éxito');
    });
  });
});