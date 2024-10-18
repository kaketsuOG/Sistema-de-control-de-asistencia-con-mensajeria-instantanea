import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PDFDocument, rgb } from 'pdf-lib'; // Importar pdf-lib para generar el PDF

const AtrasosPage = () => {
    const [atrasos, setAtrasos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados para filtros de búsqueda
    const [searchRut, setSearchRut] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchCurso, setSearchCurso] = useState('');

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
        const matchesCurso = atraso.NOMBRE_CURSO.toLowerCase().includes(searchCurso.toLowerCase());

        return matchesRut && matchesName && matchesCurso;
    });

    // Función para generar el PDF con los datos filtrados
    const generatePDF = async () => {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595, 842]);
        const { height } = page.getSize();
        const fontSize = 10;
        const titleFontSize = 12;
        const headerFontSize = 10;
    
        // Título del PDF
        page.drawText('Reporte de Atrasos', {
            x: 240,
            y: height - 40,
            size: titleFontSize,
            color: rgb(0, 0, 1),
        });
    
        // Espacio entre título y cabecera
        let yPosition = height - 60;
    
        // Nombres de las columnas
        page.drawText('RUT Alumno', { x: 30, y: yPosition, size: headerFontSize, color: rgb(0, 0, 0) });
        page.drawText('Fecha Atraso', { x: 100, y: yPosition, size: headerFontSize, color: rgb(0, 0, 0) });
        page.drawText('Hora Atraso', { x: 170, y: yPosition, size: headerFontSize, color: rgb(0, 0, 0) });
        page.drawText('Justificativo', { x: 240, y: yPosition, size: headerFontSize, color: rgb(0, 0, 0) });
        page.drawText('Nombre Completo', { x: 300, y: yPosition, size: headerFontSize, color: rgb(0, 0, 0) });
        page.drawText('Curso', { x: 520, y: yPosition, size: headerFontSize, color: rgb(0, 0, 0) });
    
        yPosition -= 20; // Ajuste para iniciar las filas de datos
    
        const rowHeight = 20; // Espacio entre filas
    
        filteredAtrasos.forEach((atraso) => {
            if (yPosition < 50) { // Salto de página si ya no queda espacio
                page = pdfDoc.addPage([595, 842]);
                yPosition = height - 40;
            }
    
            const fecha = new Date(atraso.FECHA_ATRASOS);
            const fechaFormateada = fecha.toLocaleDateString();
            const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
            // Dibujar los datos en columnas alineadas
            page.drawText(atraso.RUT_ALUMNO, { x: 30, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
            page.drawText(fechaFormateada, { x: 100, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
            page.drawText(horaFormateada, { x: 170, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
            page.drawText(atraso.JUSTIFICATIVO ? 'Sí' : 'No', { x: 250, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
            page.drawText(atraso.NOMBRE_COMPLETO, { x: 300, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
            page.drawText(atraso.NOMBRE_CURSO, { x: 520, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
    
            yPosition -= rowHeight; // Mover la posición hacia abajo para la siguiente fila
        });
    
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'reporte_atrasos.pdf';
        link.click();
    };
    

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
                <input 
                    type="text" 
                    placeholder="Buscar por Curso" 
                    value={searchCurso} 
                    onChange={(e) => setSearchCurso(e.target.value)} 
                    style={styles.filterInput}
                />
                <button onClick={generatePDF} style={styles.pdfButton}>
                    Imprimir Reporte PDF
                </button>
            </div>


            {filteredAtrasos.length === 0 ? (
                <p style={styles.noData}>No hay atrasos registrados.</p>
            ) : (
                <div style={styles.tableContainer}> {/* Contenedor para scrollbar */}
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
                                const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                </div>
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
        color: 'black',
        marginBottom: '15px',
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
    pdfButton: {
        marginLeft: 'auto',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    tableContainer: {
        maxHeight: '500px', 
        overflowY: 'auto',
        marginTop: '20px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
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
    noData: {
        textAlign: 'center',
        color: '#888',
        marginTop: '20px',
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
    loading: {
        textAlign: 'center',
        marginTop: '50px',
    },
    pdfLink: {
        color: '#007bff',
        textDecoration: 'none',
    },
};

export default AtrasosPage;
