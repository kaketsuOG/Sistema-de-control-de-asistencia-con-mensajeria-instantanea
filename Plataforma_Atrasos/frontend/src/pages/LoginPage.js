import React, { useState } from 'react';
import { login } from '../services/authService';

const LoginPage = () => {
    const [rutUsername, setRutUsername] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await login(rutUsername, contraseña);
            // Redirigir a la página de inicio después del login exitoso
            window.location.href = '/';
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>RUT</label>
                    <input
                        type="text"
                        value={rutUsername}
                        onChange={(e) => setRutUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                    />
                </div>
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
};

export default LoginPage;