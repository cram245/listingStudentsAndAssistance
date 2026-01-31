// crea o actualiza el libro del centro
function actualizarLibroCentro() {
  
  // Crea o obtiene un libro de Google Sheets con el nombre indicado
  const libro = obtenerLibro("Alumnos " + getSelectedCenterName());
  escribirCursosYAlumnosPorCentro(libro);
}


function getSelectedCenterId() {
  const json = PropertiesService.getScriptProperties().getProperty('centros');
  const centros = new Map(objectToMap(JSON.parse(json)));


  if (!centros || centros.length == 0)
    throw new Error("No hay centros guardados");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getActiveSheet();

  const nombreCentro = hoja.getRange('A1').getValue();
  
  if (!centros.has(nombreCentro))
    throw new Error("Selecciona un centro válido");

  PropertiesService.getScriptProperties().setProperty('idSelectedCenter', centros.get(nombreCentro));

  return centros.get(nombreCentro);
}

function getSelectedCenterName() {
  const json = PropertiesService.getScriptProperties().getProperty('centros');
  const centros = new Map(objectToMap(JSON.parse(json)));

  if (!centros || centros.length == 0)
    throw new Error("No hay centros guardados");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getActiveSheet();

  return hoja.getRange('A1').getValue();
}


function listarAlumnosForAllCenters() {
  
  const centros = new Map(getCentros());
  const nombresCentros = Array.from(centros.keys());
  
  const nombreLibros = Array.from(centros.keys()).map(v => "Alumnos " + String(v));
  const idLibros = obtenerIdsDeLibros(nombreLibros);

  for (let i = 0; i < idLibros.length; i++) {
    const libro_id = idLibros[i];

    if (libro_id != null) {
      const nombreCentro = nombresCentros[i];
      const datosCentro = centros.get(nombreCentro);
      const libro = SpreadsheetApp.openById(libro_id);

      escribirCursosYAlumnosPorCentro(libro, datosCentro);
    }
  }
}


function obtenerCursosConAlumnosColumna(hoja, numCol, startingRow = 1) {

  const lastRow = hoja.getLastRow();

  if (lastRow == 0 || lastRow < startingRow) return {};

  const numFilas = lastRow - startingRow + 1;
  const datos = hoja.getRange(startingRow, numCol, numFilas).getValues().flat();
  const estilos = hoja.getRange(startingRow, numCol, numFilas).getFontWeights().flat(); // los nombres de los cursos estan en negrita

  let cursos = new Map();
  let cursoActual = "Sin curso";
  cursos.set("Sin curso", new Set());

  datos.forEach((texto, i) => {
    if (texto == "" || texto == null) return;

    if (estilos[i] == "bold") { // es el nombre de un curso
      cursoActual = texto;
      cursos.set(cursoActual, new Set());
    }

    else {
      if (CATALAN_DAYS.includes(texto)) return; // nunca se deberia ejecutar esto
      if (CATALAN_TIME_SLOT.includes(texto)) return; // no queremos guardar time slots

      if (!cursos.has(cursoActual)) cursos.set(cursoActual, new Set());  // nunca se deberia ejecutar esto

      cursos.get(cursoActual).add(texto); // añadimos al alumno al curso
    }
  })

  return cursos;
}



function obtenerCursosConAlumnosDeLibro(libro) {

  const hoja = libro.getSheetByName("Alumnos");
  if (hoja == null) 
    return showError("ERROR! El libro no tiene una hoja llamada Alumnos con los datos de estos");

  // empezamos siempre en la fila 6, donde estaran los dias o vacío si era "Sense dia". en la 8 empiezan los otros datos
  // como primero se empiezan por dias conocidos y finalmente nos vamos a los "Sense dia" podemos obtener su padding y cuando acaban

  const startingRow = 6;
  const lastCol = hoja.getLastColumn();

  const datos = new Map(); // las keys son los dias, los values son  un map con los nombres de los cursos de ese dia como keys
  // y como valores un set con los alumnos de ese curso

  
  const textoFila = hoja.getRange(startingRow, 1, 1, lastCol).getValues()[0];
  Logger.log(textoFila);

  for (let col = 1; col <= lastCol; col++) {
    let nombreDia = textoFila[col - 1];

    if (CATALAN_DAYS_UPPER.includes(nombreDia)) { // en esta columna estan los alumnos
      let aux = obtenerCursosConAlumnosColumna(hoja, col, startingRow + 1); // sabemos que en la starting row esta el dia
      datos.set(nombreDia, aux);
    } 

    // tener en cuenta que pueden haber cursos sin dia!!
    /*
    else {

      let celdaContenido = hoja.getRange(startingRow + 2, col).getValue();
      if (celdaContenido !== "") {

        let aux = obtenerCursosConAlumnosColumna(hoja, col, startingRow);
        datos.set("Sense dia", aux);
      }
    }
    */
  }

  return datos;
}

// escribe en una hoja aparte los alumnos que se han apuntado en esta semana (en verde)
// los que ya estaban (en gris) y los que se han borrado (en rojo)
function getDiffsAlumnosCenter() {

  // miramos si existen datos anteriores sobre los que hacer el diff
  const libro = obtenerLibro("Alumnos " + getSelectedCenterName(), false);
  if (libro == null) {
    return showError("ERROR! No existen datos anteriores \n" +
      "El libro con nombre: Alumnos " + getSelectedCenterName() + " debe existir en su drive!");
  }
  
  // obtenemos los datos anteriores, obtenemos un map con los dias de la semana como keys
  // y como values los nombres de los cursos ordenados con los nombres de los alumnos de ese curso en concreto  
  const datos = obtenerCursosConAlumnosDeLibro(libro);


  Logger.log(JSON.stringify(Object.fromEntries(datos), null, 2));
  
  
  
  //escribirDiffs(datos);
  getDiffs(datos);
}



function showError(message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert(message);
} 