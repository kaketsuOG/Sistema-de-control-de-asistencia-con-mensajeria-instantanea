import React, { useEffect, useState } from 'react';
import AttendanceReport from '../components/AttendanceReport'; // Verifica que la ruta sea correcta
import AttendanceReportSemanal from '../components/AttendanceReportSemanal'; // Importa el nuevo componente

const ReportsPage = () => {
    const [selectedReport, setSelectedReport] = useState(null); // Puede ser 'daily', 'weekly', o null

    // Maneja la selección de reporte
    const handleReportSelection = (reportType) => {
        setSelectedReport(prev => (prev === reportType ? null : reportType));
    };

    useEffect(() => {
        console.log("ReportsPage se ha montado");
    }, []); // Ejecuta solo al montar

    const styles = {
        pageContainer: {
            marginTop: '10px',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        buttonContainer: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
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
        activeButton: {
            backgroundColor: '#0056b3',
        },
    };

    return (
        <div style={styles.pageContainer}>

            <div style={styles.headerContainer}>
                <h1>Reportes de Atrasos</h1>
            </div>

            <div style={styles.buttonContainer}>
                <button
                    onClick={() => handleReportSelection('daily')}
                    style={{
                        ...styles.toggleButton,
                        ...(selectedReport === 'daily' ? styles.activeButton : {})
                    }}
                >
                    {selectedReport === 'daily' ? 'Ocultar Reporte Diario' : 'Mostrar Reporte Diario'}
                </button>

                <button
                    onClick={() => handleReportSelection('weekly')}
                    style={{
                        ...styles.toggleButton,
                        ...(selectedReport === 'weekly' ? styles.activeButton : {})
                    }}
                >
                    {selectedReport === 'weekly' ? 'Ocultar Reporte Semanal' : 'Mostrar Reporte Semanal'}
                </button>
            </div>

            {/* Renderiza AttendanceReport si se selecciona el reporte diario */}
            {selectedReport === 'daily' && (
                <div>
                    <AttendanceReport />
                </div>
            )}

            {/* Renderiza AttendanceReportSemanal si se selecciona el reporte semanal */}
            {selectedReport === 'weekly' && (
                <div>
                    <AttendanceReportSemanal />
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
