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

    return (
        <div>
            <h1>Control de Atrasos</h1>
            <AttendanceForm 
                onSuccess={handleSuccess} // Usar el método para manejar éxito
                currentData={selectedAtraso} 
                onToggleList={toggleAttendanceList} // Pasar la función al formulario
            />
            <button onClick={toggleAttendanceList}>
                {showAttendanceList ? 'Ocultar Lista de Atrasos' : 'Mostrar Lista de Atrasos'}
            </button>
            {showAttendanceList && <AttendanceList onEdit={handleEdit} updated={updated} />} {/* Pasar estado actualizado */}
        </div>
    );
};

export default AttendancePage;


