jest.setTimeout(30000);

const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req;
    let res;
    let next;

    beforeAll(() => {
        process.env.JWT_SECRET = 'secret'; // Configura JWT_SECRET para las pruebas
    });

    beforeEach(() => {
        req = {
            header: jest.fn(),
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('Debe permitir el acceso con un token válido', () => {
        const tokenPayload = { id: '12345' };
        const token = 'valid-token';

        req.header.mockReturnValue(`Bearer ${token}`);
        jwt.verify.mockImplementation((receivedToken, secret) => {
            if (receivedToken === token && secret === process.env.JWT_SECRET) {
                return tokenPayload;
            }
            throw new Error('Token inválido');
        });

        authMiddleware(req, res, next);

        expect(req.header).toHaveBeenCalledWith('Authorization');
        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
        expect(req.user).toEqual(tokenPayload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('Debe bloquear el acceso con un token inválido', () => {
        req.header.mockReturnValue('Bearer invalid-token');
        jwt.verify.mockImplementation(() => {
            throw new Error('Token inválido');
        });

        authMiddleware(req, res, next);

        expect(req.header).toHaveBeenCalledWith('Authorization');
        expect(jwt.verify).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('Debe bloquear el acceso sin un token', () => {
        req.header.mockReturnValue(null);

        authMiddleware(req, res, next);

        expect(req.header).toHaveBeenCalledWith('Authorization');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Acceso denegado, se requiere autenticación.' });
        expect(next).not.toHaveBeenCalled();
    });
});