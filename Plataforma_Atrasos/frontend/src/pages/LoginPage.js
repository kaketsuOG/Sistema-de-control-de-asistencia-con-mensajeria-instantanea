import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
    const [rutUsername, setRutUsername] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            //const user = await login(rutUsername, contraseña);
            localStorage.setItem('RUT_USERNAME', rutUsername); // Guardar el RUT en localStorage
            window.location.href = '/home';
        } catch (err) {
            setError(err.response?.data?.message || "Error al iniciar sesión. Inténtalo de nuevo.");
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f4f4f9'
        }}>
            <div style={{
                width: '400px',
                padding: '30px',
                border: '1px solid #ccc',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white'
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
                                width: '95%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px'
                            }}
                            aria-label="Ingrese su RUT"
                        />
                    </div>
                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            style={{
                                width: '95%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px'
                            }}
                            aria-label="Ingrese su contraseña"
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '45px',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#FF8C00',
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
            </div>
        </div>
    );
};

export default LoginPage;
