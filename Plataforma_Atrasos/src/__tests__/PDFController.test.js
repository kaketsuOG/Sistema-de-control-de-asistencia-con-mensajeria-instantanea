const PDFController = require('../controllers/PDFController');
const db = require('../config/db');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

// Mockear las dependencias
jest.mock('fs');
jest.mock('pdf-lib');
jest.mock('../config/db');

describe('PDFController - fillForm', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks antes de cada test
    });

    it('debería generar un PDF correctamente', async () => {
        // Mock de la respuesta de la base de datos
        const mockDatosAlumno = {
            RUT_ALUMNO: '12345678-9',
            NOMBRE_ALUMNO: 'Juan',
            SEGUNDO_NOMBRE_ALUMNO: 'Carlos',
            APELLIDO_PATERNO_ALUMNO: 'Perez',
            APELLIDO_MATERNO_ALUMNO: 'Gomez'
        };
        db.query.mockImplementation((query, rut, callback) => {
            callback(null, [mockDatosAlumno]);
        });

        // Mock de la lectura de archivos
        fs.readFileSync.mockReturnValue(Buffer.from('mock-pdf-or-image-data'));

        // Mock de PDF-lib para evitar la carga real de archivos
        const mockPdfDoc = {
            getForm: jest.fn().mockReturnValue({
                getTextField: jest.fn().mockReturnValue({
                    setText: jest.fn()
                }),
                getButton: jest.fn().mockReturnValue({
                    setImage: jest.fn()
                }),
                flatten: jest.fn()
            }),
            embedPng: jest.fn(),
            save: jest.fn().mockResolvedValue(Buffer.from('pdf-content'))
        };
        PDFDocument.load.mockResolvedValue(mockPdfDoc);
        PDFDocument.embedPng = jest.fn().mockResolvedValue('mocked-image');

        // Mock de la función `writeFile`
        fs.writeFile.mockImplementation((path, data, callback) => {
            callback(null);
        });

        // Ejecutar el test
        const fechaAtraso = new Date('2023-10-28');
        const pdfFileName = await PDFController.fillForm('12345678-9', fechaAtraso);

        // Verificaciones
        expect(db.query).toHaveBeenCalledWith(expect.any(String), '12345678-9', expect.any(Function));
        expect(fs.readFileSync).toHaveBeenCalledTimes(2); // Verificar que se leen el PDF base y el logo
        expect(mockPdfDoc.getForm().getTextField).toHaveBeenCalled(); // Verificar que se llenan los campos
        expect(mockPdfDoc.getForm().getButton).toHaveBeenCalled(); // Verificar que se asigna el logo
        expect(mockPdfDoc.save).toHaveBeenCalled(); // Verificar que se guarda el PDF
        expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('SalidaPDF'), expect.any(Buffer), expect.any(Function));
        expect(pdfFileName).toContain('SalidaPDF'); // Verificar que se retorna la ruta del archivo
    });

    it('debería manejar un error en la base de datos', async () => {
        db.query.mockImplementation((query, rut, callback) => {
            callback(new Error('Error en la base de datos'));
        });

        await expect(PDFController.fillForm('12345678-9', new Date())).rejects.toEqual('Error al generar PDF. No se pudieron consultar los datos del alumno');
    });

    it('debería manejar un error al escribir el archivo PDF', async () => {
        // Mock de la respuesta de la base de datos y otros mocks necesarios
        const mockDatosAlumno = {
            RUT_ALUMNO: '12345678-9',
            NOMBRE_ALUMNO: 'Juan',
            SEGUNDO_NOMBRE_ALUMNO: 'Carlos',
            APELLIDO_PATERNO_ALUMNO: 'Perez',
            APELLIDO_MATERNO_ALUMNO: 'Gomez'
        };
        db.query.mockImplementation((query, rut, callback) => {
            callback(null, [mockDatosAlumno]);
        });
        fs.readFileSync.mockReturnValue(Buffer.from('mock-pdf-or-image-data'));
        const mockPdfDoc = {
            getForm: jest.fn().mockReturnValue({
                getTextField: jest.fn().mockReturnValue({ setText: jest.fn() }),
                getButton: jest.fn().mockReturnValue({ setImage: jest.fn() }),
                flatten: jest.fn()
            }),
            embedPng: jest.fn(),
            save: jest.fn().mockResolvedValue(Buffer.from('pdf-content'))
        };
        PDFDocument.load.mockResolvedValue(mockPdfDoc);

        // Forzamos un error en `writeFile`
        fs.writeFile.mockImplementation((path, data, callback) => {
            callback(new Error('Error al escribir el archivo PDF'));
        });

        await expect(PDFController.fillForm('12345678-9', new Date())).rejects.toEqual('Error al escribir el archivo PDF');
    });
});