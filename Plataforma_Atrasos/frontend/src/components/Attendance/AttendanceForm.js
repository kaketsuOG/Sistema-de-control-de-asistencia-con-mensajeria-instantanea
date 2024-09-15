import React, { useState } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onSuccess, currentData, onListClick }) => {
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

    const styles = {
        container: {
            maxWidth: '500px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        title: {
            textAlign: 'center',
            color: '#333',
            marginBottom: '20px',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
        },
        label: {
            fontWeight: 'bold',
            color: '#555',
        },
        input: {
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px',
        },
        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        button: {
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease',
        },
        listButton: {
            backgroundColor: '#007bff',
            marginTop: '10px',
        },
        error: {
            color: '#dc3545',
            textAlign: 'center',
            marginBottom: '15px',
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{currentData ? 'Editar Atraso' : 'Agregar Atraso'}</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>RUT Alumno</label>
                    <input
                        type="text"
                        value={rutAlumno}
                        onChange={(e) => setRutAlumno(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha del Atraso</label>
                    <input
                        type="date"
                        value={fechaAtrasos}
                        onChange={(e) => setFechaAtraso(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={justificativo}
                        onChange={(e) => setJustificativo(e.target.checked)}
                        id="justificativo"
                    />
                    <label htmlFor="justificativo" style={styles.label}>Justificativo</label>
                </div>
                <button
                    type="submit"
                    style={styles.button}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                    {currentData ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                    type="button"
                    style={{...styles.button, ...styles.listButton}}
                    onClick={onListClick}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                    Lista de Atrasos
                </button>
            </form>
        </div>
    );
};

export default AttendanceForm;