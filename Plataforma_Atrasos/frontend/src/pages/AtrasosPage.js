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
    const [searchMonth, setSearchMonth] = useState('');

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

        const fechaAtraso = new Date(atraso.FECHA_ATRASOS);
        const matchesMonth = searchMonth ? fechaAtraso.getMonth() === parseInt(searchMonth) : true;

        return matchesRut && matchesName && matchesCurso && matchesMonth;
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
            if (yPosition < 60) { // Salto de página si ya no queda espacio
                // Dibujar la firma antes de pasar a la siguiente página
                page.drawText('Firma Apoderado ________________', {
                    x: 30,
                    y: 40,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                });
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

        page.drawText('Firma Apoderado ________________', {
            x: 30,
            y: 40,
            size: fontSize,
            color: rgb(0, 0, 0),
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
                <select
                    value={searchMonth}
                    onChange={(e) => setSearchMonth(e.target.value)}
                    style={styles.filterInput}
                >
                    <option value="">Seleccionar Mes</option>
                    <option value="0">Enero</option>
                    <option value="1">Febrero</option>
                    <option value="2">Marzo</option>
                    <option value="3">Abril</option>
                    <option value="4">Mayo</option>
                    <option value="5">Junio</option>
                    <option value="6">Julio</option>
                    <option value="7">Agosto</option>
                    <option value="8">Septiembre</option>
                    <option value="9">Octubre</option>
                    <option value="10">Noviembre</option>
                    <option value="11">Diciembre</option>
                </select>
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
        margin: '2rem auto',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        color: 'black',
        marginBottom: '1rem',
    },
    filters: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
    },
    filterInput: {
        padding: '0.5rem',
        fontSize: '1rem',
        borderRadius: '0.375rem',
        border: '1px solid #ccc',
    },
    pdfButton: {
        marginLeft: 'auto',
        padding: '0.5rem 1rem',
        backgroundColor: '#01579b',
        color: '#fff',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#014377',
        },
    },
    tableContainer: {
        maxHeight: '500px',
        overflowY: 'auto',
        marginTop: '1.5rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    headerCell: {
        backgroundColor: '#01579b',
        color: '#ffffff',
        padding: '0.75rem',
        textAlign: 'left',
        fontWeight: 'bold',
        borderBottom: '2px solid #01579b',
    },
    row: {
        backgroundColor: '#f7f9f9',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(1, 87, 155, 0.1)',
        },
    },
    cell: {
        padding: '0.75rem',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
    },
    noData: {
        textAlign: 'center',
        color: '#888',
        marginTop: '1.5rem',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: '1rem',
    },
    loading: {
        textAlign: 'center',
        marginTop: '3rem',
    },
    pdfLink: {
        color: '#01579b',
        textDecoration: 'none',
    },
};


export default AtrasosPage;
