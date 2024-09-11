// src/pages/LoginPage.js
import React, { useState } from 'react';
import { login } from '../services/authService';
import './LoginPage.css'; // Asegúrate de crear este archivo para los estilos

const LoginPage = () => {
    const [rutUsername, setRutUsername] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await login(rutUsername, contraseña);
            // Redirigir a la página de inicio después del login exitoso
            window.location.href = '/home';
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f4f4f9' // Color de fondo
        }}>
            <div style={{
                width: '400px', // Ajuste del ancho para expandir la tarjeta
                padding: '30px', // Más padding para que los elementos no estén pegados al borde
                border: '1px solid #ccc',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white' // Fondo blanco para la tarjeta
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Inicio de Sesión</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>RUT</label>
                        <input
                            type="text"
                            value={rutUsername}
                            onChange={(e) => setRutUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px'
                            }}
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '45px', // Ajuste para mejor alineación vertical
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#007BFF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Iniciar Sesión
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <a href="/register" style={{ fontSize: '14px' }}>Registrarme</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;