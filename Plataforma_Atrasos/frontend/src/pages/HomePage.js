import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importa los iconos
import controlIcon from '../assets/icons/control.png';
import reportIcon from '../assets/icons/report.png';
import messageIcon from '../assets/icons/message.png';
import AttendancePage from './AttendancePage'; // Asegúrate de que la ruta sea correcta
import logo from '../assets/images/logo.png'; // Importa la imagen del logo


const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [showAttendance, setShowAttendance] = useState(false); // Estado para mostrar/ocultar AttendancePage

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

    const toggleAttendance = () => {
        setShowAttendance(!showAttendance); // Cambia el estado al hacer clic
    };

    const styles = {
        homepageContainer: {
            display: 'flex',
            height: '100vh',
        },
        sidebar: {
            width: '250px',
            backgroundColor: '#01579b',
            color: 'white',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',  // Asegura que los elementos se distribuyan en la barra lateral
        },
        logo: {
            width: '90%',  // Ajusta el tamaño de la imagen del logo
            marginBottom: '10px',
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
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '5px',
            transition: 'background-color 0.3s',
        },
        icon: {
            width: '30px',
            height: '30px',
            marginRight: '10px',
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
        sidebarBottom: {
            marginTop: 'auto', // Empuja el logo hacia la parte inferior
        },
    };

    // Retorno del componente
    return (
        <div style={styles.homepageContainer}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarTop}>
                    <h3 style={styles.sidebarTitle}>Menú</h3>
                    <ul style={styles.sidebarList}>
                        <li
                            style={styles.sidebarListItem}
                            onClick={toggleAttendance} // Cambia aquí para mostrar/ocultar AttendancePage
                        >
                            <img src={controlIcon} alt="Control de Atrasos" style={styles.icon} />

                            Control de atrasos

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

                {/* Logo en la parte inferior */}
                <div style={styles.sidebarBottom}>
                    <img src={logo} alt="Logo" style={styles.logo} />
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
                    {/* Muestra el mensaje de bienvenida solo si showAttendance es false */}
                    {!showAttendance && (
                        <>
                            <h3 style={styles.welcomeText}>Bienvenido, {userName}!</h3>
                            <p>Aquí puedes ver el control de atrasos y otras funcionalidades.</p>
                        </>
                    )}
                    
                    {/* Muestra AttendancePage si showAttendance es true */}
                    {showAttendance && <AttendancePage />}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

