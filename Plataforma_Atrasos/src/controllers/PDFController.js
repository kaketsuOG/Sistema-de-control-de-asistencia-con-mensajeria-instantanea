const PDFDocumentLib = require('pdf-lib')
const PDFDocument = PDFDocumentLib.PDFDocument
const db = require('../config/db')
const fs = require('node:fs');

exports.fillForm = async (rutAlumno, fechaAtraso) => {
  const query = 'SELECT RUT_ALUMNO, NOMBRE_ALUMNO, SEGUNDO_NOMBRE_ALUMNO, APELLIDO_PATERNO_ALUMNO, APELLIDO_MATERNO_ALUMNO FROM alumnos WHERE RUT_ALUMNO = ? ';
  let datosAlumno = null
  console.log(rutAlumno)
  db.query(query, rutAlumno, async (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al generar PDF. No se pudieron consultar los datos del alumno' });
      }
  datosAlumno = results[0]
  console.log(results)
  

  console.log("3")

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

  const formPdfBytes = fs.readFileSync('C:/Users/juanj/OneDrive/Escritorio/Sistema de Atrasos/Sistema-de-control-de-asistencia-con-mensajeria-instantanea-1/Plataforma_Atrasos/frontend/src/assets/images/form.pdf')
  const logoImageBytes = fs.readFileSync('C:/Users/juanj/OneDrive/Escritorio/Sistema de Atrasos/Sistema-de-control-de-asistencia-con-mensajeria-instantanea-1/Plataforma_Atrasos/frontend/src/assets/images/logo.png')

  console.log("5")

  const pdfDoc = await PDFDocument.load(formPdfBytes)
  console.log("6")

  const logoImage = await pdfDoc.embedPng(logoImageBytes)

  const form = pdfDoc.getForm()

  const colegioField = form.getTextField('colegio')
  const fechaField = form.getTextField('fecha')
  const cuerpoField = form.getTextField('cuerpo')
  //const atrasoField = form.getTextField('atraso')
  console.log("1")
  
  const logoImageField = form.getButton('logo')
  console.log("2")

  colegioField.setText('INSUCO')
 
  console.log(fechaAtraso)
  console.log(datosAlumno)
 fechaField.setText(fechaAtraso.toLocaleString())

  cuerpoField.setText("Estimado Apoderado(a), \n\nLe informarmos que su pupilo(a) " + [datosAlumno.NOMBRE_ALUMNO, datosAlumno.SEGUNDO_NOMBRE_ALUMNO, datosAlumno.APELLIDO_PATERNO_ALUMNO, datosAlumno.APELLIDO_MATERNO_ALUMNO].reduce((acc, cv) => 
    acc + cv + " "
  ,"") + "RUT " + datosAlumno.RUT_ALUMNO + " ha registrado un atraso con fecha " + fechaAtraso.toLocaleString() + ".")
 //atrasoField.setText('Notificacion de Atraso')

  logoImageField.setImage(logoImage)

  console.log("7")
  form.flatten()
  const pdfBytes = await pdfDoc.save()

  fs.writeFile('C:\\Users\\juanj\\OneDrive\\Escritorio\\test.pdf', pdfBytes, err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });
});
}