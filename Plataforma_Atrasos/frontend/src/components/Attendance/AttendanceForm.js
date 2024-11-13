import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onSuccess, currentData }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [fechaAtrasos, setFechaAtraso] = useState(new Date());
    const [residenciaJustificativo, setResidenciaJustificativo] = useState(false);
    const [medicoJustificativo, setMedicoJustificativo] = useState(false);
    const [deportivoJustificativo, setDeportivoJustificativo] = useState(false);
    const [mostrarJustificativo, setMostrarJustificativo] = useState(false);
    const [error, setError] = useState('');
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isValidatingRut, setIsValidatingRut] = useState(false);
    const rutInputRef = useRef(null);

    useEffect(() => {
        if (!currentData) {
            resetForm();
        } else {
            setRutAlumno(currentData.rutAlumno);
            setFechaAtraso(new Date());
            setResidenciaJustificativo(false);
            setMedicoJustificativo(false);
            setDeportivoJustificativo(false);
            setMostrarJustificativo(false);
            setError('');
        }
        rutInputRef.current?.focus();
    }, [currentData]);

    useEffect(() => {
        const timer = setInterval(() => setFechaAtraso(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let timer;
        if (error && error.includes('no existe')) {
            timer = setTimeout(() => {
                resetForm();
            }, 2000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [error]);

    const resetForm = () => {
        setRutAlumno('');
        setFechaAtraso(new Date());
        setResidenciaJustificativo(false);
        setMedicoJustificativo(false);
        setDeportivoJustificativo(false);
        setMostrarJustificativo(false);
        setError('');
        setNombreAlumno('');
        rutInputRef.current?.focus();
    };

    const validarRutExistente = async (rut) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/alumnos/verificar/${rut}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error al validar RUT:', error);
            throw new Error('Error al validar el RUT');
        }
    };

    const checkJustificativos = async () => {
        setIsValidatingRut(true);
        setError('');
        try {
            // Primero validamos si el RUT existe
            const rutExiste = await validarRutExistente(rutAlumno);
            if (!rutExiste) {
                setError('El RUT ingresado no existe en la base de datos');
                setMostrarJustificativo(false);
                setNombreAlumno('');
                return false;
            }

            const response = await axios.get(`http://localhost:3000/api/alumnos/${rutAlumno}/residencia`);
            
            const tieneResidencia = response.data.justificativo_residencia === 1;
            const tieneMedico = response.data.justificativo_medico === 1;
            const tieneDeportivo = response.data.justificativo_deportivo === 1;

            setResidenciaJustificativo(tieneResidencia);
            setMedicoJustificativo(tieneMedico);
            setDeportivoJustificativo(tieneDeportivo);
            setNombreAlumno(response.data.NOMBRE_ALUMNO || '');
            setMostrarJustificativo(true);
            setError('');
            return true;
        } catch (err) {
            setResidenciaJustificativo(false);
            setMedicoJustificativo(false);
            setDeportivoJustificativo(false);
            setMostrarJustificativo(false);
            setError(err.response?.status === 404 
                ? 'El RUT ingresado no existe en la base de datos' 
                : 'Error al verificar justificativos');
            return false;
        } finally {
            setIsValidatingRut(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        try {
            const isValid = await checkJustificativos();
            if (!isValid) {
                return; // Si el RUT no es válido, detenemos el proceso
            }
            
            setMostrarJustificativo(true);
    
            setTimeout(async () => {
                const url = currentData 
                    ? `http://localhost:3000/api/atrasos/${currentData.id}`
                    : 'http://localhost:3000/api/atrasos';
                const method = currentData ? axios.put : axios.post;
                const response = await method(url, { rutAlumno, fechaAtrasos });
    
                if (response.status >= 200 && response.status < 300) {
                    setSuccessMessage('Atraso registrado y PDF generado con éxito.');
                    setNotificationVisible(true);
    
                    if (onSuccess) onSuccess();
                    resetForm();
                } else {
                    setError('Error en la solicitud. Código de estado: ' + response.status);
                }
                
                setMostrarJustificativo(false);
            }, 2000);
    
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al guardar el atraso: ' + err.message;
            setError(errorMessage);
            
            // Si el error es de RUT no existente, se limpiará automáticamente por el useEffect
            if (!errorMessage.includes('no existe')) {
                // Para otros errores, no hacemos reset automático
                setIsValidatingRut(false);
            }
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
            opacity: isValidatingRut ? 0.7 : 1,
            pointerEvents: isValidatingRut ? 'none' : 'auto',
        },
        dateDisplay: {
            width: '100%',
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#555',
            marginBottom: '20px',
            fontSize: '18px',
        },
        error: {
            color: '#dc3545',
            textAlign: 'center',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
            width: '100%',
            transition: 'opacity 0.5s ease-in-out',
            opacity: error ? 1 : 0
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
                        ref={rutInputRef} // Agrega la referencia al input
                        type="text"
                        value={rutAlumno}
                        onChange={(e) => setRutAlumno(e.target.value)}
                        placeholder="Ingrese RUT"
                        required
                        style={{
                            ...styles.input,
                            borderColor: error ? '#dc3545' : '#ddd'
                        }}
                        disabled={isValidatingRut}
                    />
                </div>
                {mostrarJustificativo && nombreAlumno && (
                    <p style={styles.justificativoText}>
                        {nombreAlumno} {' '}
                        {[
                            residenciaJustificativo && 'residencia',
                            medicoJustificativo && 'médico',
                            deportivoJustificativo && 'deportivo'
                        ]
                            .filter(Boolean)
                            .join(' y ') || 'no presenta justificativos.'}
                    </p>
                )}
                <label style={styles.label}>Fecha y Hora Actual</label>
                <div style={styles.dateDisplay}>
                    {fechaAtrasos.toLocaleString()}
                </div>
                <button 
                    type="submit" 
                    style={{ ...styles.button, width: '100%' }}
                    disabled={isValidatingRut}
                >
                    {isValidatingRut ? 'Validando...' : (currentData ? 'Actualizar' : 'Guardar')}
                </button>
            </form>
            {notificationVisible && <div style={styles.notification}>{successMessage}</div>}
        </div>
    );
};

export default AttendanceForm;