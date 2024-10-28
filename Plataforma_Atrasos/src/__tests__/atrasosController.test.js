// src/__tests__/atrasosController.test.js
jest.mock('../utils/whatsappClient', () => jest.fn(() => ({
  initialize: jest.fn(),
  sendMessage: jest.fn(),
})));

const atrasosController = require('../controllers/atrasosController');

// Mock de los objetos req y res
const mockRequest = (body = {}) => ({
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('Pruebas del controlador atrasosController', () => {
  describe('Función getAllAtrasos', () => {
    it('Debería obtener todos los atrasos exitosamente', async () => {
      const req = mockRequest();
      const res = mockResponse();

      atrasosController.getAllAtrasos = jest.fn().mockResolvedValue([{ id: 1, motivo: 'Ejemplo' }]);

      await atrasosController.getAllAtrasos(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, motivo: 'Ejemplo' }]);
    });

    it('Debería manejar errores de base de datos', async () => {
      const req = mockRequest();
      const res = mockResponse();

      atrasosController.getAllAtrasos = jest.fn().mockRejectedValue(new Error('Error en la base de datos'));

      await atrasosController.getAllAtrasos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener los atrasos' });
    });
  });

  describe('Función createAtraso', () => {
    it('Debería crear un nuevo atraso', async () => {
      const req = mockRequest({ motivo: 'Llegada tarde', fecha: '2024-10-28' });
      const res = mockResponse();

      atrasosController.createAtraso = jest.fn().mockResolvedValue({ id: 1, message: 'Atraso registrado exitosamente' });

      await atrasosController.createAtraso(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Atraso registrado exitosamente' });
    });

    it('Debería manejar errores al crear un atraso', async () => {
      const req = mockRequest({ motivo: 'Llegada tarde', fecha: '2024-10-28' });
      const res = mockResponse();

      atrasosController.createAtraso = jest.fn().mockRejectedValue(new Error('Error al registrar el atraso'));

      await atrasosController.createAtraso(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al registrar el atraso' });
    });
  });
});