import React, { useState } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onSuccess, currentData, onToggleList }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [fechaAtrasos, setFechaAtraso] = useState(currentData?.fechaAtrasos || '');
    const [justificativo, setJustificativo] = useState(currentData?.justificativo || false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = currentData 
                ? `http://localhost:3000/api/atrasos/${currentData.id}`
                : 'http://localhost:3000/api/atrasos';
            const method = currentData ? axios.put : axios.post;
            const response = await method(url, { rutAlumno, fechaAtrasos, justificativo });
            if (response.status >= 200 && response.status < 300) {
                onSuccess();
            } else {
                setError('Error en la solicitud. Código de estado: ' + response.status);
            }
        } catch (err) {
            console.error('Error al guardar el atraso', err);
            setError('Error al guardar el atraso: ' + err.message);
        }
    };

    // Estilos en línea
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '500px',
            margin: '20px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f9f9f9',
        },
        title: {
            textAlign: 'center',
            marginBottom: '20px',
        },
        label: {
            marginBottom: '10px',
            fontWeight: 'bold',
        },
        input: {
            padding: '10px',
            marginBottom: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '90%',
        },
        button: {
            padding: '10px',
            backgroundColor: '#007bff', // azul
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '10px', // Espacio entre botones
        },
        error: {
            color: '#dc3545',
            textAlign: 'center',
            marginBottom: '15px',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{currentData ? 'Editar Atraso' : 'Agregar Atraso'}</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label style={styles.label}>
                    RUT Alumno
                    <input
                        type="text"
                        value={rutAlumno}
                        onChange={(e) => setRutAlumno(e.target.value)}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Fecha del Atraso
                    <input
                        type="date"
                        value={fechaAtrasos}
                        onChange={(e) => setFechaAtraso(e.target.value)}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Justificativo
                    <input
                        type="checkbox"
                        checked={justificativo}
                        onChange={(e) => setJustificativo(e.target.checked)}
                    />
                </label>
                <button type="submit" style={styles.button}>
                    {currentData ? 'Actualizar' : 'Guardar'}
                </button>
               
            </form>
        </div>
    );
};

export default AttendanceForm;


