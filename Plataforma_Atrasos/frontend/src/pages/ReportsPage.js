import React, { useEffect, useState } from 'react';
import AttendanceReport from '../components/AttendanceReport'; // Verifica que la ruta sea correcta

const ReportsPage = () => {
    const [showReportList, setShowReportList] = useState(false);

    // Maneja el toggle de la lista de reportes
    const toggleReportList = () => {
        setShowReportList(prev => !prev);
    };

    // Aquí podrías utilizar useEffect para realizar alguna acción al cargar el componente
    useEffect(() => {
        console.log("ReportsPage se ha montado");
    }, []); // Dependencias vacías aseguran que se ejecute solo al montar

    const styles = {
        pageContainer: {
            marginTop: '10px',
            padding: '20px',
        },
        headerContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center', // Para alinear verticalmente el texto y el botón
            gap: '10px', // Espacio entre el texto y el botón
            marginBottom: '20px',
        },
        toggleButton: {
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
        },
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.headerContainer}>
                <h1>Reportes de Atrasos</h1>
                <button onClick={toggleReportList} style={styles.toggleButton}>
                    {showReportList ? 'Ocultar Reportes' : 'Mostrar Reportes'}
                </button>
            </div>

            {/* Renderiza AttendanceReport si se solicita */}
            {showReportList && (
                <div>
                    <AttendanceReport />
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
