const PDFDocumentLib = require('pdf-lib')
const PDFDocument = PDFDocumentLib.PDFDocument
const db = require('../config/db')
const fs = require('node:fs');

exports.fillForm = async (rutAlumno, fechaAtraso) => {
  const query = 'SELECT RUT_ALUMNO, NOMBRE_ALUMNO, SEGUNDO_NOMBRE_ALUMNO, APELLIDO_PATERNO_ALUMNO, APELLIDO_MATERNO_ALUMNO FROM alumnos WHERE RUT_ALUMNO = ? ';
  let datosAlumno = null

  db.query(query, rutAlumno, async (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al generar PDF. No se pudieron consultar los datos del alumno' });
      }
  datosAlumno = results[0]

  


  // const formUrl = 'frontend\\src\\assets\\images\\form.pdf'
  // let formPdfBytes = null
  // fs.readFile(formUrl, null, (err, data) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   formPdfBytes = data
  // });
  // console.log("4")

  // const logoUrl = 'frontend\\src\\assets\\images\\logo.png'
  // let logoImageBytes = null
// fs.readFile(logoUrl, null, (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
  // }
//   logoImageBytes = data
// });

  const formPdfBytes = fs.readFileSync('..//Plataforma_Atrasos/frontend/src/assets/images/form.pdf')
  const logoImageBytes = fs.readFileSync('..//Plataforma_Atrasos/frontend/src/assets/images/logo.png')



  const pdfDoc = await PDFDocument.load(formPdfBytes)


  const logoImage = await pdfDoc.embedPng(logoImageBytes)

  const form = pdfDoc.getForm()

  const colegioField = form.getTextField('colegio')
  const fechaField = form.getTextField('fecha')
  const cuerpoField = form.getTextField('cuerpo')
  //const atrasoField = form.getTextField('atraso')

  
  const logoImageField = form.getButton('logo')


  colegioField.setText('INSUCO')
 
 fechaField.setText(fechaAtraso.toLocaleString())

  cuerpoField.setText("Estimado Apoderado(a), \n\nLe informarmos que su pupilo(a) " + [datosAlumno.NOMBRE_ALUMNO, datosAlumno.SEGUNDO_NOMBRE_ALUMNO, datosAlumno.APELLIDO_PATERNO_ALUMNO, datosAlumno.APELLIDO_MATERNO_ALUMNO].reduce((acc, cv) => 
    acc + cv + " "
  ,"") + "RUT " + datosAlumno.RUT_ALUMNO + " ha registrado un atraso con fecha " + fechaAtraso.toLocaleString() + ".")
 //atrasoField.setText('Notificacion de Atraso')

  logoImageField.setImage(logoImage)

  form.flatten()
  const pdfBytes = await pdfDoc.save()

  const pdfFileName = `../Plataforma_Atrasos/src/SalidaPDF/${datosAlumno.RUT_ALUMNO}.pdf`
  fs.writeFile(pdfFileName, pdfBytes, err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });
});
}