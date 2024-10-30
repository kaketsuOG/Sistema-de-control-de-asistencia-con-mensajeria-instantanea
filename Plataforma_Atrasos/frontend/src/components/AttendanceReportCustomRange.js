import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AttendanceReportCustomRange = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reportData, setReportData] = useState([]);

    const fetchReportData = () => {
        if (!startDate || !endDate) {
            alert('Por favor, selecciona ambas fechas.');
            return;
        }

        // Formato de fecha en YYYY-MM-DD para el inicio del día
        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        // Formato de fecha en YYYY-MM-DD para el final del día
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999); // Configurar el final del día
        const formattedEndDate = endOfDay.toISOString().split('T')[0];

        axios.get(`/api/atrasos/rango?startDate=${formattedStartDate}&endDate=${formattedEndDate}`)
            .then(response => {
                console.log(response.data); // Verificar la estructura de los datos
                setReportData(response.data.atrasos);
            })
            .catch(error => {
                console.error('Error al obtener los datos del reporte:', error);
            });
    };

    return (
        <div>
            <h2>Reporte de Atrasos - Rango Personalizado</h2>
            <div>
                <label>Fecha de inicio:</label>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                />
            </div>
            <div>
                <label>Fecha de fin:</label>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                />
            </div>
            <button onClick={fetchReportData}>Obtener Reporte</button>
            
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Estudiante</th>
                        <th>Justificativo</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.map((atraso, index) => (
                        <tr key={index}>
                            <td>{atraso.FECHA_ATRASOS}</td>
                            <td>{atraso.estudiante}</td>
                            <td>{atraso.justificativo || 'Sin justificativo'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9',
        marginTop: '20px',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    datePicker: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginTop: '5px',
        width: '180px',
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
    chartButton: {
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s ease',
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
    },
    reportContainer: {
        marginTop: '20px',
    },
    tableContainer: {
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 10px', // Separación entre las filas
        fontFamily: '"Roboto", sans-serif',
    },
    th: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        textAlign: 'left',
    },
    td: {
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
    },
    tr: {
        cursor: 'pointer',
    },
    trHover: {
        backgroundColor: '#f0f0f0',
    },
    chartContainer: {
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    },
};

export default AttendanceReportCustomRange;
