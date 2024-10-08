// src/components/AttendanceReportCustomRange.js

import React, { useState } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'; // Importar componentes de Recharts

const AttendanceReportCustomRange = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showChart, setShowChart] = useState(false); // Estado para mostrar/ocultar la gráfica
    const [chartData, setChartData] = useState([]); // Estado para almacenar los datos de la gráfica

    const handleGenerateReport = async () => {
        // Validar que ambas fechas estén seleccionadas
        if (!startDate || !endDate) {
            setError('Por favor, selecciona ambas fechas.');
            return;
        }

        // Validar que startDate no sea posterior a endDate
        if (new Date(startDate) > new Date(endDate)) {
            setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
            return;
        }

        setLoading(true);
        setError('');
        setReportData(null);
        setShowChart(false); // Ocultar la gráfica al generar un nuevo reporte
        setChartData([]); // Limpiar datos de la gráfica

        try {
            const response = await axios.get(`http://localhost:3000/api/atrasos/rango`, { // Asegúrate de que el puerto y la URL sean correctos
                params: {
                    startDate,
                    endDate
                }
            });

            setReportData(response.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Error al obtener el reporte.');
            }
        } finally {
            setLoading(false);
        }
    };

    const processChartData = () => {
        if (!reportData || !reportData.atrasos) {
            return [];
        }

        // Crear un objeto para contar atrasos por fecha
        const counts = {};

        reportData.atrasos.forEach((atraso) => {
            const date = new Date(atraso.FECHA_ATRASOS).toLocaleDateString();
            counts[date] = (counts[date] || 0) + 1;
        });

        // Convertir el objeto a un array para Recharts
        const data = Object.keys(counts).map((date) => ({
            fecha: date,
            cantidad: counts[date],
        }));

        // Opcional: Ordenar las fechas
        data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        return data;
    };

    const toggleChart = () => {
        if (!showChart) {
            const data = processChartData();
            setChartData(data);
        }
        setShowChart(prev => !prev); // Alternar el estado de la gráfica
    };

    return (
        <div style={styles.container}>
            <h2>Reporte de Atrasos por Rango de Fechas</h2>
            <div style={styles.inputContainer}>
                <div style={styles.datePicker}>
                    <label htmlFor="startDate">Fecha de Inicio:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.datePicker}>
                    <label htmlFor="endDate">Fecha de Fin:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <button onClick={handleGenerateReport} style={styles.button}>
                    Generar Reporte
                </button>
            </div>

            {loading && <p>Cargando...</p>}
            {error && <p style={styles.error}>{error}</p>}

            {reportData && (
                <div style={styles.reportContainer}>
                    <h3>
                        Reporte de Atrasos del {new Date(reportData.startDate).toLocaleDateString()} al {new Date(reportData.endDate).toLocaleDateString()}
                    </h3>
                    {reportData.atrasos.length > 0 ? (
                        <>
                            {/* Contenedor con scrollbar para la tabla */}
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>RUT Alumno</th>
                                            <th>Nombre Completo</th>
                                            <th>Curso</th>
                                            <th>Fecha de Atraso</th>
                                            <th>Justificativo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.atrasos.map((atraso, index) => (
                                            <tr key={index}>
                                                <td>{atraso.RUT_ALUMNO}</td>
                                                <td>{atraso.NOMBRE_COMPLETO}</td>
                                                <td>{atraso.NOMBRE_CURSO}</td>
                                                <td>{new Date(atraso.FECHA_ATRASOS).toLocaleString()}</td>
                                                <td>{atraso.JUSTIFICATIVO ? 'Sí' : 'No'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Botón Toggle para la gráfica */}
                            <button
                                onClick={toggleChart}
                                style={styles.chartButton}
                                disabled={reportData.atrasos.length === 0}
                            >
                                {showChart ? 'Ocultar Gráfica de Atrasos' : 'Mostrar Gráfica de Atrasos'}
                            </button>

                            {/* Renderizar la gráfica si showChart es true */}
                            {showChart && chartData.length > 0 && (
                                <div style={styles.chartContainer}>
                                    <h3>Cantidad de Atrasos por Fecha</h3>
                                    <ResponsiveContainer width="50%" height={300}>
                                        <BarChart
                                            data={chartData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="fecha" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad de Atrasos" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>No se encontraron atrasos en este rango de fechas.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginTop: '20px',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap', // Para manejar mejor en pantallas pequeñas
    },
    datePicker: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '5px',
        marginTop: '5px',
        width: '150px', // Definir un ancho fijo para consistencia
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        flexShrink: 0, // Evitar que el botón se reduzca en pantallas pequeñas
    },
    chartButton: {
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    error: {
        color: 'red',
    },
    reportContainer: {
        marginTop: '20px',
    },
    tableContainer: {
        maxHeight: '400px', // Altura máxima del contenedor
        overflowY: 'auto', // Habilitar scroll vertical
        border: '1px solid #ddd',
        borderRadius: '5px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        border: '1px solid #ddd',
        padding: '8px',
        backgroundColor: '#f2f2f2',
        position: 'sticky', // Para mantener los encabezados visibles al hacer scroll
        top: 0,
        zIndex: 1,
    },
    td: {
        border: '1px solid #ddd',
        padding: '8px',
    },
    chartContainer: {
        marginTop: '40px',
    },
};

export default AttendanceReportCustomRange;
