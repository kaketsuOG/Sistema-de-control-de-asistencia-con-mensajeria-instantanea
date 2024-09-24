import React, { useState } from 'react';
import AttendanceForm from '../components/Attendance/AttendanceForm';
import AttendanceList from '../components/Attendance/AttendanceList';

const AttendancePage = () => {
    const [showAttendanceList, setShowAttendanceList] = useState(false);
    const [selectedAtraso, setSelectedAtraso] = useState(null);

    const toggleAttendanceList = () => {
        setShowAttendanceList(prev => !prev);
        setSelectedAtraso(null); // Reiniciar selección al ocultar la lista
    };

    const handleEdit = (atraso) => {
        setSelectedAtraso(atraso);
        setShowAttendanceList(false); // Ocultar lista al editar
    };

    return (
        <div>
            <h1>Control de Atrasos</h1>
            <AttendanceForm 
                onSuccess={() => window.location.reload()} 
                currentData={selectedAtraso} 
                onListClick={toggleAttendanceList} // Pasar la función al formulario
            />
            <button onClick={toggleAttendanceList}>
                {showAttendanceList ? 'Ocultar Lista de Atrasos' : 'Mostrar Lista de Atrasos'}
            </button>
            {showAttendanceList && <AttendanceList onEdit={handleEdit} />}
        </div>
    );
};

export default AttendancePage;

