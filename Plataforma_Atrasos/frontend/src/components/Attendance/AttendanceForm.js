import React, { useState } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onSuccess, currentData }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [fechaAtrasos, setFechaAtraso] = useState(currentData?.fechaAtrasos || '');
    const [justificativo, setJustificativo] = useState(currentData?.justificativo || false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Definir la URL y el método dependiendo si es edición o creación
            const url = currentData 
                ? `http://localhost:3000/api/atrasos/${currentData.id}`
                : 'http://localhost:3000/api/atrasos';
                
            // Utilizar axios.post o axios.put directamente
            const method = currentData ? axios.put : axios.post ;

            // Realizar la solicitud al backend
            const response = await method(url, { rutAlumno, fechaAtrasos, justificativo });

            if (response.status >= 200 && response.status < 300) {
                onSuccess(); // Llama a onSuccess solo si la respuesta es exitosa
            } else {
                setError('Error en la solicitud. Código de estado: ' + response.status);
            }
        } catch (err) {
            console.error('Error al guardar el atraso', err);
            setError('Error al guardar el atraso: ' + err.message);
        }
    };

    return (
        <div>
            <h3>{currentData ? 'Editar Atraso' : 'Agregar Atraso'}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>RUT Alumno</label>
                    <input
                        type="text"
                        value={rutAlumno}
                        onChange={(e) => setRutAlumno(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Fecha del Atraso</label>
                    <input
                        type="date"
                        value={fechaAtrasos}
                        onChange={(e) => setFechaAtraso(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Justificativo</label>
                    <input
                        type="checkbox"
                        checked={justificativo}
                        onChange={(e) => setJustificativo(e.target.checked)}
                    />
                </div>
                <button type="submit">{currentData ? 'Actualizar' : 'Guardar'}</button>
            </form>
        </div>
    );
};

export default AttendanceForm;

