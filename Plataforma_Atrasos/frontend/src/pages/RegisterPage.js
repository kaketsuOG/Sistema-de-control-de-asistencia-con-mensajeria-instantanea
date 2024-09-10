import React, { useState } from 'react';
import { register } from '../services/authService';

const RegisterPage = () => {
    const [rutUsername, setRutUsername] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await register({ rutUsername, contraseña });
            console.log('Registro exitoso');
            // Aquí podrías redirigir al usuario al login o a otra página
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Registro</h2>
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
                <button type="submit">Registrar</button>
            </form>
        </div>
    );
};

export default RegisterPage;