import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onSuccess, currentData }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [nombreAlumno, setNombreAlumno] = useState(''); // Añadir estado para nombre del alumno
    const [fechaAtrasos, setFechaAtraso] = useState(currentData?.fechaAtrasos || '');
    const [residenciaJustificativo, setResidenciaJustificativo] = useState(false);
    const [medicoJustificativo, setMedicoJustificativo] = useState(false); // Justificativo médico
    const [deportivoJustificativo, setDeportivoJustificativo] = useState(false); // Justificativo deportivo
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
            setMedicoJustificativo(false);
            setDeportivoJustificativo(false);
            setMostrarJustificativo(false);
            setError('');
        }
    }, [currentData]);

    const resetForm = () => {
        setRutAlumno('');
        setFechaAtraso('');
        setResidenciaJustificativo(false);
        setMedicoJustificativo(false);
        setDeportivoJustificativo(false);
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
                setSuccessMessage('Atraso registrado y PDF generado con éxito.');
                setNotificationVisible(true);

                if (onSuccess) onSuccess();
                resetForm();
            } else {
                setError('Error en la solicitud. Código de estado: ' + response.status);
            }
        } catch (err) {
            setError('Error al guardar el atraso: ' + err.message);
        }
    };

    const checkJustificativos = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/alumnos/${rutAlumno}/residencia`);
            
            const tieneResidencia = response.data.justificativo_residencia === 1;
            const tieneMedico = response.data.justificativo_medico === 1;
            const tieneDeportivo = response.data.justificativo_deportivo === 1;

            setResidenciaJustificativo(tieneResidencia);
            setMedicoJustificativo(tieneMedico);
            setDeportivoJustificativo(tieneDeportivo);
            setNombreAlumno(response.data.NOMBRE_ALUMNO || ''); // Extrae el nombre del alumno
            setMostrarJustificativo(true);
            setError('');
        } catch (err) {
            setResidenciaJustificativo(false);
            setMedicoJustificativo(false);
            setDeportivoJustificativo(false);
            setMostrarJustificativo(false);
            setError('Error al verificar justificativos');
        }
    };

    useEffect(() => {
        if (notificationVisible) {
            const timer = setTimeout(() => setNotificationVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [notificationVisible]);

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '500px',
            margin: '40px auto',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
        },
        title: {
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '24px',
            color: '#333',
        },
        form: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        label: {
            width: '100%',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#555',
        },
        inputContainer: {
            display: 'flex',
            width: '100%',
            marginBottom: '20px',
            gap: '10px',
        },
        input: {
            flex: '1',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
        },
        button: {
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
        },
        dateInput: {
            width: '95%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginBottom: '20px',
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
            fontWeight: 'bold',
            color: '#007bff',
            marginBottom: '15px',
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
            <h2 style={styles.title}>{currentData ? 'Editar Atraso' : 'Registrar Atraso'}</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>RUT Alumno</label>
                <div style={styles.inputContainer}>
                    <input
                        type="text"
                        value={rutAlumno}
                        onChange={(e) => setRutAlumno(e.target.value)}
                        placeholder="Ingrese RUT"
                        required
                        style={styles.input}
                    />
                    <button 
                        type="button" 
                        onClick={checkJustificativos} 
                        style={styles.button}
                    >
                        Verificar
                    </button>
                </div>
                {mostrarJustificativo && (
                    <p style={styles.justificativoText}>
                    {nombreAlumno ? `${nombreAlumno} ` : ''}
                    {[
                        residenciaJustificativo && 'residencia',
                        medicoJustificativo && 'médico',
                        deportivoJustificativo && 'deportivo'
                    ]
                        .filter(Boolean)
                        .join(' y ')
                        ? `presenta justificativo de ${[
                            residenciaJustificativo && 'residencia',
                            medicoJustificativo && 'médico',
                            deportivoJustificativo && 'deportivo'
                        ]
                        .filter(Boolean)
                        .join(' y ')}.`
                        : 'no presenta justificativos.'}
                    </p>
                )}
                <label style={styles.label}>Fecha del Atraso</label>
                <input
                    type="date"
                    value={fechaAtrasos}
                    onChange={(e) => setFechaAtraso(e.target.value)}
                    required
                    style={styles.dateInput}
                />
                <button type="submit" style={{ ...styles.button, width: '100%' }}>
                    {currentData ? 'Actualizar' : 'Guardar'}
                </button>
            </form>
            {notificationVisible && <div style={styles.notification}>{successMessage}</div>}
        </div>
    );
};

export default AttendanceForm;
