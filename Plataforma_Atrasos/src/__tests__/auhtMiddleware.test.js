jest.setTimeout(30000);

const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');


jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Debe permitir el acceso con un token válido', () => {
        const req = {
            headers: { authorization: 'Bearer valid-token' },
        };
        const res = {};
        const next = jest.fn();

        // Mock del token válido
        jwt.verify.mockReturnValue({ id: '12345678-9' });

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
        expect(req.user).toEqual({ id: '12345678-9' });
        expect(next).toHaveBeenCalled();
    });

    it('Debe bloquear el acceso con un token inválido', () => {
        const req = {
            headers: { authorization: 'Bearer invalid-token' },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        // Mock del token inválido
        jwt.verify.mockImplementation(() => {
            throw new Error('Token inválido');
        });

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
        expect(next).not.toHaveBeenCalled();
    });
});