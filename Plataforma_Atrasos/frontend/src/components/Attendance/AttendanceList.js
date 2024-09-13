import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AttendanceForm from './AttendanceForm';

const AttendanceList = () => {
    const [atrasos, setAtrasos] = useState([]);
    const [selectedAtraso, setSelectedAtraso] = useState(null);

    useEffect(() => {
        const fetchAtrasos = async () => {
            try {
                const response = await axios.get('/api/atrasos');
                setAtrasos(response.data);
            } catch (err) {
                console.error('Error al obtener atrasos');
            }
        };

        fetchAtrasos();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/atrasos/${id}`);
            setAtrasos(atrasos.filter(atraso => atraso.id !== id));
        } catch (err) {
            console.error('Error al eliminar el atraso');
        }
    };

    return (
        <div>
            <h2>Lista de Atrasos</h2>
            <AttendanceForm onSuccess={() => window.location.reload()} currentData={selectedAtraso} />
            <ul>
                {atrasos.map(atraso => (
                    <li key={atraso.id}>
                        <span>{atraso.rutAlumno} - {atraso.fechaAtraso}</span>
                        <button onClick={() => setSelectedAtraso(atraso)}>Editar</button>
                        <button onClick={() => handleDelete(atraso.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttendanceList;
