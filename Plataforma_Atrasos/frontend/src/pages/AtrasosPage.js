import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AtrasosPage = () => {
    const [atrasos, setAtrasos] = useState([]); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados para filtros de búsqueda
    const [searchRut, setSearchRut] = useState('');
    const [searchName, setSearchName] = useState('');
    //const [searchDate, setSearchDate] = useState('');

    const fetchAtrasos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/atrasos');
            setAtrasos(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener la lista de atrasos:', error);
            setError('Error al obtener la lista de atrasos');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAtrasos();
    }, []);

    const filteredAtrasos = atrasos.filter((atraso) => {
        const matchesRut = atraso.RUT_ALUMNO.toLowerCase().includes(searchRut.toLowerCase());
        const matchesName = atraso.NOMBRE_COMPLETO.toLowerCase().includes(searchName.toLowerCase());
        //const matchesDate = searchDate ? new Date(atraso.FECHA_ATRASOS).toLocaleDateString() === searchDate : true;
        return matchesRut && matchesName //&& //matchesDate;
    });

    if (loading) {
        return <div style={styles.loading}>Cargando lista de atrasos...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Listado de Atrasos</h1>

            <div style={styles.filters}>
                <input 
                    type="text" 
                    placeholder="Buscar por RUT" 
                    value={searchRut} 
                    onChange={(e) => setSearchRut(e.target.value)} 
                    style={styles.filterInput}
                />
                <input 
                    type="text" 
                    placeholder="Buscar por Nombre" 
                    value={searchName} 
                    onChange={(e) => setSearchName(e.target.value)} 
                    style={styles.filterInput}
                />
            </div>

            {filteredAtrasos.length === 0 ? (
                <p style={styles.noData}>No hay atrasos registrados.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.headerCell}>RUT Alumno</th>
                            <th style={styles.headerCell}>Fecha Atraso</th>
                            <th style={styles.headerCell}>Hora Atraso</th>
                            <th style={styles.headerCell}>Justificativo</th>
                            <th style={styles.headerCell}>Nombre Completo</th>
                            <th style={styles.headerCell}>Curso</th>
                            <th style={styles.headerCell}>PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAtrasos.map((atraso) => {
                            const fecha = new Date(atraso.FECHA_ATRASOS);
                            const fechaFormateada = fecha.toLocaleDateString();
                            const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formato HH:MM
                            console.log("aqui",atraso);
                            
                            return (
                                
                            <tr key={atraso.COD_ATRASOS} style={styles.row}>
                                <td style={styles.cell}>{atraso.RUT_ALUMNO}</td>
                                <td style={styles.cell}>{fechaFormateada}</td>
                                <td style={styles.cell}>{horaFormateada}</td>
                                <td style={styles.cell}>{atraso.JUSTIFICATIVO ? 'Sí' : 'No'}</td>
                                <td style={styles.cell}>{atraso.NOMBRE_COMPLETO}</td>
                                <td style={styles.cell}>{atraso.NOMBRE_CURSO}</td>
                                <td style={styles.cell}>
                                    {atraso.pdf_path ? (
                                        <a 
                                            href={`http://localhost:3000/SalidaPDF/${atraso.pdf_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            download
                                            style={styles.pdfLink}
                                        >
                                            📥 Descargar PDF
                                        </a>
                                    ) : (
                                        'No disponible'
                                    )}
                                </td>

                            </tr>
                            
                            );
                        })}
                        
                    </tbody>
                </table>
            )}
        </div>
    );
};


const styles = {
    container: {
        maxWidth: '1200px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        color: '#007bff',
        marginBottom: '20px',
    },
    filters: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
    filterInput: {
        padding: '8px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
    },
    headerCell: {
        backgroundColor: '#007bff',
        color: '#ffffff',
        padding: '10px',
        textAlign: 'left',
        fontWeight: 'bold',
        borderBottom: '2px solid #007bff',
    },
    row: {
        backgroundColor: '#f9f9f9',
        transition: 'background-color 0.3s ease',
    },
    cell: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
    },
    pdfLink: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    loading: {
        textAlign: 'center',
        fontSize: '18px',
        color: '#007bff',
    },
    error: {
        textAlign: 'center',
        fontSize: '18px',
        color: '#dc3545',
    },
    noData: {
        textAlign: 'center',
        fontSize: '16px',
        color: '#6c757d',
    },
};

export default AtrasosPage;