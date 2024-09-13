import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    // Simulación de obtener el nombre de usuario (puedes cambiarlo según tu lógica)
    useEffect(() => {
        const storedUser = localStorage.getItem('userName'); // Suponiendo que el nombre está en el local storage
        if (storedUser) {
            setUserName(storedUser);
        } else {
            setUserName('No te encontré');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Elimina el token para cerrar sesión
        navigate('/login'); // Redirige al login
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const styles = {
        homepageContainer: {
            display: 'flex',
            height: '100vh',
        },
        sidebar: {
            width: '250px',
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
        },
        sidebarTitle: {
            marginBottom: '20px',
            fontSize: '18px',
        },
        sidebarList: {
            listStyle: 'none',
            padding: '0',
            marginTop: '10px', // Ajusta la separación con el título
        },
        sidebarListItem: {
            margin: '10px 0',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '5px',
            transition: 'background-color 0.3s',
        },
        sidebarListItemActive: {
            backgroundColor: '#34495e',
        },
        sidebarListItemInactive: {
            backgroundColor: 'transparent',
        },
        mainContent: {
            flexGrow: '1',
            display: 'flex',
            flexDirection: 'column',
        },
        topbar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#ecf0f1',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
        },
        logoutButton: {
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            cursor: 'pointer',
            borderRadius: '5px',
        },
        contentArea: {
            padding: '20px',
            backgroundColor: '#f7f9f9',
            flexGrow: '1',
        },
        welcomeText: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px',
        },
        sidebarTop: {
            flexGrow: '1', // Hace que las opciones suban más cerca de la parte superior
        },
    };

    return (
        <div style={styles.homepageContainer}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarTop}>
                    <h3 style={styles.sidebarTitle}>Menú</h3>
                    <ul style={styles.sidebarList}>
                        <li
                            style={styles.sidebarListItem}
                            onClick={() => handleNavigation('/attendance')}
                        >
                            Control de Atrasos
                        </li>
                        <li
                            style={styles.sidebarListItem}
                            onClick={() => handleNavigation('/reports')}
                        >
                            Reportes
                        </li>
                        <li
                            style={styles.sidebarListItem}
                            onClick={() => handleNavigation('/messaging')}
                        >
                            Mensajería
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main content */}
            <div style={styles.mainContent}>
                {/* Topbar */}
                <div style={styles.topbar}>
                    <h2>Sistema de Control de Atrasos</h2>
                    <button style={styles.logoutButton} onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
                {/* Main view */}
                <div style={styles.contentArea}>
                    <h3 style={styles.welcomeText}>Bienvenido, {userName}!</h3>
                    <p>Aquí puedes ver el control de atrasos y otras funcionalidades.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;


