import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendanceReport = () => {
    const [reportes, setReportes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para manejar la búsqueda por fecha
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

    // Procesa los reportes para la gráfica
    const processDataForChart = () => {
        const counts = {};
        reportes.forEach(reporte => {
            const date = new Date(reporte.FECHA_ATRASOS).toLocaleDateString();
            counts[date] = (counts[date] || 0) + 1;
        });

        return Object.entries(counts).map(([date, count]) => ({
            date,
            count
        }));
    };

    const chartData = processDataForChart();

    const styles = {
        container: {
            marginTop: '1px', // Desplaza el contenedor hacia arriba
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            maxWidth: '900px', // Aumenta el ancho máximo del contenedor
            marginLeft: '50px', // Desplaza el contenedor a la derecha
            display: 'flex', // Usar flexbox para el layout
        },
        reportContainer: {
            flex: 1, // Ocupa el espacio restante para la lista de reportes
            marginRight: '20px', // Espacio entre la lista y la gráfica
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        },
        datepicker: {
            display: 'inline-block',
            marginRight: '10px',
            width: '60%', // Ajusta el ancho del datepicker
        },
        button: {
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
        },
        list: {
            marginTop: '20px',
            listStyle: 'none',
            padding: 0,
            maxHeight: '250px', // Limita la altura de la lista
            overflowY: 'auto', // Agrega scroll si hay demasiados elementos
        },
        listItem: {
            padding: '10px',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
            borderRadius: '5px',
            marginBottom: '5px', // Espacio entre los elementos
        },
        errorMessage: {
            color: 'red',
            textAlign: 'center',
        },
        loadingMessage: {
            textAlign: 'center',
        },
        title: {
            textAlign: 'center',
            marginBottom: '15px',
        },
        chartContainer: {
            width: '400px', // Ancho fijo para el gráfico
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.reportContainer}>
                <h2 style={styles.title}>Reportes de Atrasos</h2>
                <div style={styles.header}>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Seleccionar fecha"
                        style={styles.datepicker}
                    />
                    <button onClick={fetchReportsByDate} style={styles.button}>
                        Filtrar
                    </button>
                </div>

                {loading && <p style={styles.loadingMessage}>Cargando reportes...</p>}
                {error && <p style={styles.errorMessage}>{error}</p>}
                
                {/* Lista de reportes */}
                {reportes.length > 0 ? (
                    <ul style={styles.list}>
                        {reportes.map((reporte) => (
                            <li key={reporte.COD_ATRASOS} style={styles.listItem}>
                                RUT: {reporte.RUT_ALUMNO}, Fecha: {new Date(reporte.FECHA_ATRASOS).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                ) : (
                    !loading && <p>No hay reportes disponibles para la fecha seleccionada.</p>
                )}
            </div>

            {/* Contenedor para el gráfico */}
            {chartData.length > 0 && (
                <div style={styles.chartContainer}>
                    <h3>Gráfica de Atrasos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;
