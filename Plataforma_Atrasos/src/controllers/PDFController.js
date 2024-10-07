const PDFDocumentLib = require('pdf-lib');
const PDFDocument = PDFDocumentLib.PDFDocument;
const db = require('../config/db');
const fs = require('fs');

exports.fillForm = async (rutAlumno, fechaAtraso) => {
  const query = 'SELECT RUT_ALUMNO, NOMBRE_ALUMNO, SEGUNDO_NOMBRE_ALUMNO, APELLIDO_PATERNO_ALUMNO, APELLIDO_MATERNO_ALUMNO FROM alumnos WHERE RUT_ALUMNO = ?';
  let datosAlumno = null;

  return new Promise((resolve, reject) => {
    db.query(query, rutAlumno, async (error, results) => {
      if (error) {
        return reject('Error al generar PDF. No se pudieron consultar los datos del alumno');
      }
      datosAlumno = results[0];

      const formPdfBytes = fs.readFileSync('..//Plataforma_Atrasos/frontend/src/assets/images/form.pdf');
      const logoImageBytes = fs.readFileSync('..//Plataforma_Atrasos/frontend/src/assets/images/logo.png');

      const pdfDoc = await PDFDocument.load(formPdfBytes);
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      const form = pdfDoc.getForm();

      const colegioField = form.getTextField('colegio');
      const fechaField = form.getTextField('fecha');
      const cuerpoField = form.getTextField('cuerpo');

      const logoImageField = form.getButton('logo');

      colegioField.setText('INSUCO');
      fechaField.setText(fechaAtraso.toLocaleString());

      cuerpoField.setText("Estimado Apoderado(a), \n\nLe informarmos que su pupilo(a) " + [datosAlumno.NOMBRE_ALUMNO, datosAlumno.SEGUNDO_NOMBRE_ALUMNO, datosAlumno.APELLIDO_PATERNO_ALUMNO, datosAlumno.APELLIDO_MATERNO_ALUMNO].reduce((acc, cv) =>
        acc + cv + " ", "") + "RUT " + datosAlumno.RUT_ALUMNO + " ha registrado un atraso con fecha " + fechaAtraso.toLocaleString() + ".");

      logoImageField.setImage(logoImage);

      form.flatten();
      const pdfBytes = await pdfDoc.save();

      function generatePDFFileName() {
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}`;
        return `../Plataforma_Atrasos/src/SalidaPDF/${formattedDate}.pdf`;
    }
    
      const pdfFileName = generatePDFFileName();
      fs.writeFile(pdfFileName, pdfBytes, (err) => {
        if (err) {
          return reject('Error al escribir el archivo PDF');
        }
        resolve(pdfFileName); // Devolver la ruta del archivo PDF
      });
    });
  });
};