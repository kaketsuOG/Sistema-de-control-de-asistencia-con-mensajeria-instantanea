const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); // Asegúrate de exportar `app` en tu archivo `app.js`

// Mocks
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    it('Debe denegar el acceso sin un token', async () => {
        const response = await request(app).get('/auth/users'); // Ruta protegida
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Acceso denegado, se requiere autenticación.');
    });

    it('Debe denegar el acceso con un token no válido', async () => {
        jwt.verify.mockImplementation(() => { throw new Error(); }); // Forzamos un error en la verificación del token

        const response = await request(app)
            .get('/auth/users') // Ruta protegida
            .set('Authorization', 'Bearer invalidtoken');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Token no válido.');
    });

    it('Debe permitir el acceso con un token válido', async () => {
        const mockUser = { id: '12345678-9' };
        jwt.verify.mockReturnValue(mockUser); // Simulamos un token válido

        const response = await request(app)
            .get('/auth/users') // Ruta protegida
            .set('Authorization', 'Bearer validtoken');

        expect(response.status).toBe(200);
        // Aquí puedes agregar más expectativas según la respuesta esperada cuando el token es válido
    });
});