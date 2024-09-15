import React, { useState } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onSuccess, currentData }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [fechaAtraso, setFechaAtraso] = useState(currentData?.fechaAtraso || '');
    const [justificativo, setJustificativo] = useState(currentData?.justificativo || false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = currentData ? `/api/atrasos${currentData.id}` : '/api/atrasos';
            const method = currentData ? 'put' : 'post';

            await axios[method](url, { rutAlumno, fechaAtraso, justificativo });
            onSuccess();
        } catch (err) {
            setError('Error al guardar el atraso');
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
                        value={fechaAtraso}
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
