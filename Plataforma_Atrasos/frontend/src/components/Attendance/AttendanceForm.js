import React, { useState } from 'react';
import axios from 'axios';
import JustificativoModal from './JustificativoModal'; // Asegúrate de importar el modal

const AttendanceForm = ({ onSuccess, currentData, onToggleList }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [fechaAtrasos, setFechaAtraso] = useState(currentData?.fechaAtrasos || '');
    const [justificativo, setJustificativo] = useState(currentData?.justificativo || false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const url = currentData 
                ? `http://localhost:3000/api/atrasos/${currentData.id}`
                : 'http://localhost:3000/api/atrasos';
            const method = currentData ? axios.put : axios.post;
            const response = await method(url, { rutAlumno, fechaAtrasos, justificativo });
            
            if (response.status >= 200 && response.status < 300) {
                setSuccess('Atraso registrado con éxito');
                onSuccess();  // Llama a la función de éxito proporcionada
                // Limpia el formulario
                setRutAlumno('');
                setFechaAtraso('');
                setJustificativo(false);
            } else {
                setError('Error en la solicitud. Código de estado: ' + response.status);
            }
        } catch (err) {
            console.error('Error al guardar el atraso', err);
            setError('Error al guardar el atraso: ' + err.message);
        }
    };

    const handleJustificativoUpdate = (newJustificativo) => {
        setJustificativo(newJustificativo);
        setModalOpen(false); // Cerrar el modal después de actualizar
    };

    const openJustificativoModal = () => {
        setModalOpen(true);
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
        success: {
            color: '#28a745',
            textAlign: 'center',
            marginBottom: '15px',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{currentData ? 'Editar Atraso' : 'Agregar Atraso'}</h2>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
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
                        type="text"
                        value={justificativo ? 'Presenta Justificativo' : 'No Presenta Justificativo'}
                        readOnly
                        style={{ ...styles.input, cursor: 'not-allowed' }}
                    />
                </label>
                <button type="button" onClick={openJustificativoModal} style={styles.button}>
                    Editar Justificativo
                </button>
                <button type="submit" style={styles.button}>
                    {currentData ? 'Actualizar' : 'Guardar'}
                </button>
            </form>

            {/* Modal para editar justificativo */}
            <JustificativoModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                onSubmit={handleJustificativoUpdate} 
                currentJustificativo={justificativo} 
            />
        </div>
    );
};

export default AttendanceForm;



