import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AttendanceForm from './AttendanceForm';

const AttendanceList = () => {
    const [atrasos, setAtrasos] = useState([]);
    const [selectedAtraso, setSelectedAtraso] = useState(null);

    useEffect(() => {
        const fetchAtrasos = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/atrasos');
                console.log(response.data); // Verifica los datos recibidos
                setAtrasos(response.data);
            } catch (err) {
                console.error('Error al obtener atrasos', err);
            }
        };

        fetchAtrasos();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/atrasos/${id}`);
            setAtrasos(atrasos.filter(atraso => atraso.id !== id));
        } catch (err) {
            console.error('Error al eliminar el atraso', err);
        }
    };

    return (
        <div>
            <h2>Lista de Atrasos</h2>
            <AttendanceForm onSuccess={() => window.location.reload()} currentData={selectedAtraso} />
            <ul>
                {atrasos.map(atraso => (
                    <li key={atraso.COD_ATRASOS}>
                        <span>{atraso.RUT_ALUMNO} - {atraso.FECHA_ATRASOS}</span>
                        <button onClick={() => setSelectedAtraso(atraso)}>Editar</button>
                        <button onClick={() => handleDelete(atraso.COD_ATRASOS)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttendanceList;


