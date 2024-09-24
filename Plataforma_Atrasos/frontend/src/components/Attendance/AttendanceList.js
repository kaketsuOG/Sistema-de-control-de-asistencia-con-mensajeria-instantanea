import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AttendanceList = ({ onEdit }) => {
    const [atrasos, setAtrasos] = useState([]);

    useEffect(() => {
        const fetchAtrasos = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/atrasos');
                console.log(response.data);
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
            setAtrasos(atrasos.filter(atraso => atraso.COD_ATRASOS !== id));
        } catch (err) {
            console.error('Error al eliminar el atraso', err);
        }
    };

    return (
        <div>
            <h2>Lista de Atrasos</h2>
            <ul>
                {atrasos.map(atraso => (
                    <li key={atraso.COD_ATRASOS}>
                        <span>Nombre: {`${atraso.NOMBRE_COMPLETO}`}</span>
                        <span> - Curso: {atraso.NOMBRE_CURSO}</span>
                        <span> - Fecha: {format(new Date(atraso.FECHA_ATRASOS), 'dd/MM/yyyy HH:mm:ss')}</span>
                        <span> - Justificativo: {atraso.JUSTIFICATIVO ? 'Sí' : 'No'}</span>
                        <button onClick={() => onEdit(atraso)}>Editar</button>
                        
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttendanceList;

