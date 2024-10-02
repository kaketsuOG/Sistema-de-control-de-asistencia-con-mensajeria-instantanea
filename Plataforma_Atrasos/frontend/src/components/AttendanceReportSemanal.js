// src/components/AttendanceReportSemanal.js

import React, { useState } from 'react';
import axios from 'axios';

const AttendanceReportSemanal = () => {
    const [fecha, setFecha] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFechaChange = (e) => {
        setFecha(e.target.value);
    };

    const fetchWeeklyReport = async () => {
        if (!fecha) {
            setError('Por favor, selecciona una fecha de referencia.');
            return;
        }

        setLoading(true);
        setError('');
        setReportData(null);

        try {
            const response = await axios.get(`http://localhost:3000/api/atrasos/semana`, {
                params: { fecha },
            });

            setReportData(response.data);
        } catch (err) {
            console.error(err);
            if (err.response) {
                setError(err.response.data.error || 'Error al obtener el reporte.');
            } else if (err.request) {
                setError('No se recibió respuesta del servidor.');
            } else {
                setError('Error al configurar la solicitud.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Reporte Semanal de Atrasos</h2>
            <div style={styles.inputContainer}>
                <label htmlFor="fechaSemanal" style={styles.label}>Fecha de Referencia:</label>
                <input
                    type="date"
                    id="fechaSemanal"
                    value={fecha}
                    onChange={handleFechaChange}
                    style={styles.input}
                />
                <button onClick={fetchWeeklyReport} style={styles.button}>
                    Generar Reporte
                </button>
            </div>

            {loading && <p>Cargando...</p>}

            {error && <p style={styles.error}>{error}</p>}

            {reportData && (
                <div style={styles.reportContainer}>
                    <h3>
                        Semana del {new Date(reportData.inicioSemana).toLocaleDateString()} al {new Date(reportData.finSemana).toLocaleDateString()}
                    </h3>
                    {reportData.atrasos.length > 0 ? (
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
                                {reportData.atrasos.map((atraso) => (
                                    <tr key={atraso.COD_ATRASOS}>
                                        <td>{atraso.RUT_ALUMNO}</td>
                                        <td>{atraso.NOMBRE_COMPLETO}</td>
                                        <td>{atraso.NOMBRE_CURSO}</td>
                                        <td>{new Date(atraso.FECHA_ATRASOS).toLocaleString()}</td>
                                        <td>{atraso.JUSTIFICATIVO ? 'Sí' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No se encontraron atrasos en esta semana.</p>
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
        marginBottom: '20px',
    },
    label: {
        marginRight: '10px',
        fontWeight: 'bold',
    },
    input: {
        padding: '5px',
        marginRight: '10px',
    },
    button: {
        padding: '5px 10px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
    },
    reportContainer: {
        marginTop: '20px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        border: '1px solid #ddd',
        padding: '8px',
        backgroundColor: '#f2f2f2',
    },
    td: {
        border: '1px solid #ddd',
        padding: '8px',
    },
};

export default AttendanceReportSemanal;
