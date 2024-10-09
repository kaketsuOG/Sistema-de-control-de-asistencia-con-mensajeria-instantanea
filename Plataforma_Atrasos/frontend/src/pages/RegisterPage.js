import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [rutUsername, setRutUsername] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    //const [codRol, setCodRol] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (contraseña !== confirmarContraseña) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await register({ nombreUsuario, rutUsername, contraseña }); // se puede añadir codRol
            console.log('Registro exitoso');
            // Aquí podrías redirigir al usuario al login o a otra página
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>Registro</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label>Nombre de Usuario</label>
                        <input
                            type="text"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>RUT</label>
                        <input
                            type="text"
                            value={rutUsername}
                            onChange={(e) => setRutUsername(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmarContraseña}
                            onChange={(e) => setConfirmarContraseña(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    {/* <div style={styles.formGroup}>
                        <label>Código de Rol</label>
                        <input
                            type="number"
                            value={codRol}
                            onChange={(e) => setCodRol(e.target.value)}
                            style={styles.input}
                        />
                    </div> */}
                    <button type="submit" style={styles.button}>Registrar</button>
                </form>
            </div>
        </div>
    );
};

// Estilos en línea para el diseño
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f7f7f7',
    },
    card: {
        width: '400px',
        padding: '40px',
        borderRadius: '80px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    input: {
        width: '95%',
        padding: '10px',
        marginTop: '5px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#FF8C00',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: '15px',
    },
};

export default RegisterPage;
