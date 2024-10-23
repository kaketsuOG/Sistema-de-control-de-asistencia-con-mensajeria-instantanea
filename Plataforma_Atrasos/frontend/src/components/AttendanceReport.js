import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AttendanceReport = () => {
    const [reportes, setReportes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReportsByDate = async () => {
        if (!selectedDate) {
            alert("Por favor selecciona una fecha.");
            return;
        }
    
        try {
            setLoading(true);
            setError(null);
            const formattedDate = selectedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const response = await axios.get(`http://localhost:3000/api/atrasos/dia?fecha=${formattedDate}`);
            setReportes(response.data); 
        } catch (error) {
            setError('Error al obtener los reportes. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            marginTop: '20px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        },
        datepicker: {
            marginRight: '10px',
            width: '60%',
        },
        button: {
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
        },
        buttonHover: {
            backgroundColor: '#0056b3',
        },
        tableContainer: {
            marginTop: '20px',
            overflowX: 'auto', // Para pantallas pequeñas
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px',
            textAlign: 'left',
            fontSize: '14px',
            borderBottom: '2px solid #ddd',
        },
        td: {
            padding: '10px',
            fontSize: '14px',
            borderBottom: '1px solid #ddd',
        },
        stripedRow: {
            backgroundColor: '#f7f7f7',
        },
        listItem: {
            padding: '8px',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
            borderRadius: '5px',
            marginBottom: '10px',
            fontSize: '12px',
        },
        errorMessage: {
            color: 'red',
            textAlign: 'center',
        },
        loadingMessage: {
            textAlign: 'center',
            fontStyle: 'italic',
        },
        title: {
            textAlign: 'center',
            marginBottom: '15px',
            fontSize: '24px',
            fontWeight: '600',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Reportes de Atrasos</h2>
            <div style={styles.header}>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Seleccionar fecha"
                    style={styles.datepicker}
                />
                <button 
                    onClick={fetchReportsByDate} 
                    style={styles.button}
                    onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
                    onMouseOut={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
                >
                    Filtrar
                </button>
            </div>

            {loading && <p style={styles.loadingMessage}>Cargando reportes...</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}

            {reportes.length > 0 ? (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>RUT</th>
                                <th style={styles.th}>Nombre</th>
                                <th style={styles.th}>Curso</th>
                                <th style={styles.th}>Justificativo</th>
                                <th style={styles.th}>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.map((reporte, index) => (
                                <tr 
                                    key={reporte.COD_ATRASOS}
                                    style={index % 2 === 0 ? styles.stripedRow : {}}
                                >
                                    <td style={styles.td}>{reporte.RUT_ALUMNO}</td>
                                    <td style={styles.td}>{reporte.NOMBRE_COMPLETO || 'No disponible'}</td>
                                    <td style={styles.td}>{reporte.NOMBRE_CURSO || 'No disponible'}</td>
                                    <td style={styles.td}>{reporte.JUSTIFICATIVO ? 'Sí' : 'No'}</td>
                                    <td style={styles.td}>{new Date(reporte.FECHA_ATRASOS).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p>No hay reportes disponibles para la fecha seleccionada.</p>
            )}
        </div>
    );
};

export default AttendanceReport;
