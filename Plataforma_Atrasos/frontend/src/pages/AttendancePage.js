import React, { useState } from 'react';
import AttendanceForm from '../components/Attendance/AttendanceForm';
import AttendanceList from '../components/Attendance/AttendanceList';

const AttendancePage = () => {
    const [showAttendanceList, setShowAttendanceList] = useState(false);
    const [selectedAtraso, setSelectedAtraso] = useState(null);
    const [updated, setUpdated] = useState(false); // Estado para controlar la actualización

    const toggleAttendanceList = () => {
        setShowAttendanceList(prev => !prev);
        setSelectedAtraso(null); // Reiniciar selección al ocultar la lista
    };

    const handleEdit = (atraso) => {
        setSelectedAtraso(atraso);
        setShowAttendanceList(false); // Ocultar lista al editar
    };

    const handleSuccess = () => {
        setUpdated(prev => !prev); // Cambiar el estado para forzar la actualización de la lista
    };

    const styles = {
        pageContainer: {
            display: 'flex',
            justifyContent: 'space-between',  // Alinea el formulario y la lista
            padding: '20px',
        },
        formContainer: {
            flex: 1,  // Toma el 50% del ancho
            marginRight: '20px',
        },
        listContainer: {
            flex: 1,  // Toma el 50% del ancho
            maxHeight: '800px',  // Limita la altura de la lista
            overflowY: 'auto',  // Habilita scroll cuando haya muchos registros
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        toggleButton: {
            padding: '10px 20px',
            backgroundColor: showAttendanceList ? '#e74c3c' : '#FF8C00', // Rojo si la lista está visible, verde si está oculta
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'background-color 0.3s ease', // Transición para cambio de color
        },
        buttonText: {
            fontWeight: 'bold',
        },
    };

    return (
        <div style={styles.pageContainer}>
            {/* Contenedor del Formulario */}
            <div style={styles.formContainer}>
                <h1>Control de Atrasos</h1>
                <AttendanceForm 
                    onSuccess={handleSuccess}
                    currentData={selectedAtraso} 
                    onToggleList={toggleAttendanceList}
                />
                <button onClick={toggleAttendanceList} style={styles.toggleButton}>
                    <span style={styles.buttonText}>
                        {showAttendanceList ? 'Ocultar Lista de Atrasos' : 'Mostrar Lista de Atrasos'}
                    </span>
                </button>
            </div>

            {/* Contenedor de la Lista */}
            {showAttendanceList && (
                <div style={styles.listContainer}>
                    <AttendanceList onEdit={handleEdit} updated={updated} />
                </div>
            )}
        </div>
    );
};

export default AttendancePage;
