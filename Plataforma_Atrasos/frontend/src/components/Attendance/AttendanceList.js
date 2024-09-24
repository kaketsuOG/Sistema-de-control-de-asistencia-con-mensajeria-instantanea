import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import JustificativoModal from './JustificativoModal'; // Importar el nuevo modal

const AttendanceList = ({ onEdit, updated }) => {
    const [atrasos, setAtrasos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentAtraso, setCurrentAtraso] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchAtrasos = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/atrasos');
                setAtrasos(response.data);
            } catch (err) {
                console.error('Error al obtener atrasos', err);
            }
        };

        fetchAtrasos();
    }, [updated]);

    const handleEditJustificativo = async (justificativo) => {
        try {
            await axios.put(`http://localhost:3000/api/atrasos/${currentAtraso.COD_ATRASOS}`, {
                JUSTIFICATIVO: justificativo,
            });
            setAtrasos(atrasos.map(atraso => 
                atraso.COD_ATRASOS === currentAtraso.COD_ATRASOS ? { ...atraso, JUSTIFICATIVO: justificativo } : atraso
            ));
            setSuccessMessage('Justificativo actualizado correctamente.');
            setErrorMessage('');
        } catch (err) {
            console.error('Error al actualizar el justificativo', err);
            setErrorMessage('Error al actualizar el justificativo.');
            setSuccessMessage('');
        }
    };

    

    const openModal = (atraso) => {
        setCurrentAtraso(atraso);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentAtraso(null);
    };

    const styles = {
        container: {
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        title: {
            textAlign: 'center',
            color: '#333',
            marginBottom: '20px',
        },
        list: {
            listStyleType: 'none',
            padding: '0',
        },
        listItem: {
            padding: '15px',
            margin: '10px 0',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        detail: {
            color: '#555',
            flexGrow: 1,
            marginRight: '10px',
        },
        button: {
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.3s ease',
        },
        editButton: {
            marginRight: '10px',
        },
        message: {
            textAlign: 'center',
            color: successMessage ? 'green' : 'red',
            marginBottom: '15px',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Lista de Atrasos</h2>

            {successMessage && <p style={styles.message}>{successMessage}</p>}
            {errorMessage && <p style={styles.message}>{errorMessage}</p>}

            <ul style={styles.list}>
                {atrasos.map(atraso => (
                    <li key={atraso.COD_ATRASOS} style={styles.listItem}>
                        <div style={styles.detail}>
                            <strong>Nombre:</strong> {atraso.NOMBRE_COMPLETO} <br />
                            <strong>Curso:</strong> {atraso.NOMBRE_CURSO} <br />
                            <strong>Fecha:</strong> {format(new Date(atraso.FECHA_ATRASOS), 'dd/MM/yyyy HH:mm:ss')} <br />
                            <strong>Justificativo:</strong> {atraso.JUSTIFICATIVO ? 'Sí' : 'No'}
                        </div>
                        <div>
                            <button 
                                onClick={() => openModal(atraso)} 
                                style={styles.button}>
                                Editar 
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <JustificativoModal 
                isOpen={modalOpen} 
                onClose={closeModal} 
                onSubmit={handleEditJustificativo} 
                currentJustificativo={currentAtraso ? currentAtraso.JUSTIFICATIVO : false} 
            />
        </div>
    );
};

export default AttendanceList;





