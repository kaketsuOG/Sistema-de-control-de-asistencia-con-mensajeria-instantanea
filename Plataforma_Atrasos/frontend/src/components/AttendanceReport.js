import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceReport = () => {
    const [reportes, setReportes] = useState([]);

    // Llama a la API cuando se monta el componente
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/atrasos/dia'); // Cambia la URL si es necesario
                setReportes(response.data);
            } catch (error) {
                console.error('Error al obtener los reportes', error);
            }
        };

        fetchReports();
    }, []); // Dependencias vacías aseguran que se ejecute solo al montar

    const styles = {
        listContainer: {
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
    };

    return (
        <div style={styles.listContainer}>
            <h2>Lista de Reportes</h2>
            {reportes.length > 0 ? (
                <ul>
                    {reportes.map((reporte) => (
                        <li key={reporte.COD_ATRASOS}>{`RUT: ${reporte.RUT_ALUMNO}, Fecha: ${reporte.FECHA_ATRASOS}`}</li>
                    ))}
                </ul>
            ) : (
                <p>No hay reportes disponibles.</p>
            )}
        </div>
    );
};

export default AttendanceReport;
