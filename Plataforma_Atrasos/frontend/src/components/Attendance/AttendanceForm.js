import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onSuccess, currentData }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [fechaAtrasos, setFechaAtraso] = useState(currentData?.fechaAtrasos || '');
    const [residenciaJustificativo, setResidenciaJustificativo] = useState(false);
    const [mostrarJustificativo, setMostrarJustificativo] = useState(false);
    const [error, setError] = useState('');
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!currentData) {
            resetForm();
        } else {
            setRutAlumno(currentData.rutAlumno);
            setFechaAtraso(currentData.fechaAtrasos);
            setResidenciaJustificativo(false);
            setMostrarJustificativo(false);
            setError('');
        }
    }, [currentData]);

    const resetForm = () => {
        setRutAlumno('');
        setFechaAtraso('');
        setResidenciaJustificativo(false);
        setMostrarJustificativo(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const url = currentData 
                ? `http://localhost:3000/api/atrasos/${currentData.id}`
                : 'http://localhost:3000/api/atrasos';
            const method = currentData ? axios.put : axios.post;
            const response = await method(url, { rutAlumno, fechaAtrasos, justificativo: residenciaJustificativo ? 1 : 0 });

            if (response.status >= 200 && response.status < 300) {
                // Generar PDF después de guardar el atraso
                await generatePDF(rutAlumno, new Date()); // Asegúrate de enviar la fecha correcta

                // Mostrar la notificación
                setSuccessMessage('Atraso registrado y PDF generado con éxito.');
                setNotificationVisible(true);

                if (onSuccess) {
                    onSuccess(); // Actualiza la lista si es necesario
                }

                resetForm(); // Limpia el formulario después de un registro exitoso
            } else {
                setError('Error en la solicitud. Código de estado: ' + response.status);
            }
        } catch (err) {
            console.error('Error al guardar el atraso', err);
            setError('Error al guardar el atraso: ' + err.message);
        }
    };

    // Función para generar el PDF
    const generatePDF = async (rutAlumno, fechaAtraso) => {
        try {
            const pdfResponse = await axios.post('http://localhost:3000/api/pdf', { rutAlumno, fechaAtraso });
            if (pdfResponse.status !== 200) {
                throw new Error('Error al generar el PDF');
            }
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            setError('Error al generar el PDF');
        }
    };

    const checkJustificativoResidencia = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/alumnos/${rutAlumno}/residencia`);
            const tieneJustificativo = response.data.justificativo_residencia === 1;
            setResidenciaJustificativo(tieneJustificativo);
            setMostrarJustificativo(true);
            setError('');
        } catch (err) {
            setResidenciaJustificativo(false);
            setMostrarJustificativo(false);
            setError('Error al verificar justificativo de residencia');
            console.error('Error en la verificación:', err);
        }
    };

    // Efecto para manejar la visibilidad de la notificación
    useEffect(() => {
        if (notificationVisible) {
            const timer = setTimeout(() => {
                setNotificationVisible(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notificationVisible]);

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
            width: '100%',
        },
        button: {
            padding: '10px',
            backgroundColor: '#007bff', // Azul
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '10px',
        },
        error: {
            color: '#dc3545',
            textAlign: 'center',
            marginBottom: '15px',
        },
        success: {
            color: '#28a745',
            textAlign: 'center',
            marginBottom: '15px',
        },
        justificativoText: {
            textAlign: 'center',
            marginBottom: '15px',
            fontWeight: 'bold',
            color: '#007bff',
        },
        inputContainer: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
        },
        notification: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transition: 'opacity 0.3s',
            opacity: notificationVisible ? 1 : 0,
            pointerEvents: notificationVisible ? 'auto' : 'none',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{currentData ? 'Editar Atraso' : 'Agregar Atraso'}</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={styles.inputContainer}>
                    <label style={styles.label}>RUT Alumno</label>
                    <input
                        type="text"
                        value={rutAlumno}
                        onChange={(e) => setRutAlumno(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button 
                        type="button" 
                        onClick={checkJustificativoResidencia} 
                        style={{ ...styles.button, marginLeft: '10px', width: 'auto' }}
                    >
                        Verificar
                    </button>
                </div>
                {mostrarJustificativo && (
                    <p style={styles.justificativoText}>
                        {residenciaJustificativo ? 'Presenta Justificativo' : 'No Presenta Justificativo'}
                    </p>
                )}
                <div>
                    <label style={styles.label}>Fecha del Atraso</label>
                    <input
                        type="date"
                        value={fechaAtrasos}
                        onChange={(e) => setFechaAtraso(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    {currentData ? 'Actualizar' : 'Guardar'}
                </button>
            </form>

            {/* Notificación emergente */}
            {notificationVisible && <div style={styles.notification}>{successMessage}</div>}
        </div>
    );
};

export default AttendanceForm;
