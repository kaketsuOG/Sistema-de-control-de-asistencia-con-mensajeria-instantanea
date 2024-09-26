import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import JustificativoModal from './JustificativoModal'; // Importar el modal

const AttendanceList = ({ onEdit, updated }) => {
    const [atrasos, setAtrasos] = useState([]);
    const [filteredAtrasos, setFilteredAtrasos] = useState([]); // Estado para los atrasos filtrados
    const [modalOpen, setModalOpen] = useState(false);
    const [currentAtraso, setCurrentAtraso] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState(''); // Filtro por nombre
    const [searchCurso, setSearchCurso] = useState(''); // Filtro por curso
    const [searchFecha, setSearchFecha] = useState(''); // Filtro por fecha
    const [searchJustificativo, setSearchJustificativo] = useState(''); // Filtro por justificativo

    const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros

    useEffect(() => {
        const fetchAtrasos = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/atrasos');
                setAtrasos(response.data);
                setFilteredAtrasos(response.data); // Inicialmente, todos los atrasos están filtrados
            } catch (err) {
                console.error('Error al obtener atrasos', err);
            }
        };

        fetchAtrasos();
    }, [updated]);

    // Filtrar los atrasos cuando alguno de los términos de búsqueda cambia
    useEffect(() => {
        const filtered = atrasos.filter(atraso => {
            const matchesNombre = atraso.NOMBRE_COMPLETO.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCurso = searchCurso === '' || atraso.NOMBRE_CURSO.toLowerCase().includes(searchCurso.toLowerCase());
            const matchesFecha = searchFecha === '' || format(new Date(atraso.FECHA_ATRASOS), 'yyyy-MM-dd') === searchFecha;
            const matchesJustificativo = searchJustificativo === '' || 
                (searchJustificativo === 'Sí' && atraso.JUSTIFICATIVO) ||
                (searchJustificativo === 'No' && !atraso.JUSTIFICATIVO);
            
            return matchesNombre && matchesCurso && matchesFecha && matchesJustificativo;
        });
        setFilteredAtrasos(filtered);
    }, [searchTerm, searchCurso, searchFecha, searchJustificativo, atrasos]);

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
        searchInput: {
            padding: '10px',
            width: '90%',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '16px',
        },
        filterGroup: {
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
        filterButton: {
            backgroundColor: '#e74c3c',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.3s ease',
            marginBottom: '10px',
            display: 'block',
            width: '20%',
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

            {/* Botón para mostrar/ocultar los filtros */}
            <button 
                onClick={() => setShowFilters(prev => !prev)} 
                style={styles.filterButton}
            >
                {showFilters ? 'Ocultar' : 'Filtrar'}
            </button>

            {/* Filtros (solo se muestran si el estado showFilters es true) */}
            {showFilters && (
                <div style={styles.filterGroup}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <input
                        type="text"
                        placeholder="Buscar por curso..."
                        value={searchCurso}
                        onChange={(e) => setSearchCurso(e.target.value)}
                        style={styles.searchInput}
                    />
                    <input
                        type="date"
                        placeholder="Buscar por fecha..."
                        value={searchFecha}
                        onChange={(e) => setSearchFecha(e.target.value)}
                        style={styles.searchInput}
                    />
                    <select
                        value={searchJustificativo}
                        onChange={(e) => setSearchJustificativo(e.target.value)}
                        style={styles.searchInput}
                    >
                        <option value="">Filtrar por justificativo</option>
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                    </select>
                </div>
            )}

            <ul style={styles.list}>
                {filteredAtrasos.map(atraso => (
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

export default AttendanceList
