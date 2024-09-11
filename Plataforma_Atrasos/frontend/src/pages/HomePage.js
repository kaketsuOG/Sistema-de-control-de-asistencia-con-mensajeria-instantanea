import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Aquí puedes eliminar el token o realizar otras acciones para cerrar sesión
        localStorage.removeItem('token'); // Por ejemplo, eliminar el token de localStorage
        navigate('/login'); // Redirigir al login
    };

    return (
        <div style={styles.container}>
            <button onClick={handleLogout} style={styles.logoutButton}>
                Cerrar sesión
            </button>
            <h2>Home Page</h2>
            <p>Welcome to the home page!</p>
        </div>
    );
};

// Estilos en línea para el diseño
const styles = {
    container: {
        position: 'relative',
        padding: '20px',
        textAlign: 'center',
    },
    logoutButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '10px 20px',
        backgroundColor: '#FF8C00', // Color naranja
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
};

export default HomePage;
