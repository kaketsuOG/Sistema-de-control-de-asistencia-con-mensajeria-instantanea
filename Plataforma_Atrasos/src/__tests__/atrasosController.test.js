import request from 'supertest';
import app from '../index';
import { pool } from '../config/database';

describe('Atrasos Controller', () => {
  beforeAll(async () => {
    // Configurar base de datos de prueba
    await pool.query(`
      CREATE TEMPORARY TABLE IF NOT EXISTS atrasos (
        id SERIAL PRIMARY KEY,
        fecha DATE,
        estado VARCHAR(50),
        justificado BOOLEAN
      )
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  test('GET /api/atrasos should return list of delays', async () => {
    const response = await request(app)
      .get('/api/atrasos')
      .set('Authorization', 'Bearer test-token')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('POST /api/atrasos should create new delay record', async () => {
    const newAtraso = {
      fecha: '2024-03-27',
      estado: 'ATRASO',
      justificado: false
    };

    const response = await request(app)
      .post('/api/atrasos')
      .set('Authorization', 'Bearer test-token')
      .send(newAtraso)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
