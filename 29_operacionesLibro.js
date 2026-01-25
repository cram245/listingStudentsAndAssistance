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