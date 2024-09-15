import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importa los iconos
import controlIcon from '../assets/icons/control.png';
import reportIcon from '../assets/icons/report.png';
import messageIcon from '../assets/icons/message.png';

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('userName');
        if (storedUser) {
            setUserName(storedUser);
        } else {
            setUserName('No te encontré');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
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
            marginTop: '10px',
        },
        sidebarListItem: {
            display: 'flex', // Alinea el icono con el texto
            alignItems: 'center',
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
        icon: {
            width: '30px',  // Ajusta el tamaño del icono
            height: '30px',
            marginRight: '10px',  // Añade espacio entre el icono y el texto
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
            flexGrow: '1',
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
                            <img src={controlIcon} alt="Control de Atrasos" style={styles.icon} />
                            control de atrasos
                        </li>
                        <li
                            style={styles.sidebarListItem}
                            onClick={() => handleNavigation('/reports')}
                        >
                            <img src={reportIcon} alt="Reportes" style={styles.icon} />
                            Reportes
                        </li>
                        <li
                            style={styles.sidebarListItem}
                            onClick={() => handleNavigation('/messaging')}
                        >
                             <img src={messageIcon} alt="Mensajería" style={styles.icon} />
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


