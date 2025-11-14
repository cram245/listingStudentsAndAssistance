// libro_id libro del que se van a reiniciar las check_box
// span_checkbox numero de columnas entre checkbox i checkbox
// escribe los resultados de las checkboxes en una hoja llamada assistencias y reinicia los valores de las checkboxes
function processarAssistencias(libro_id, span_checkbox) {
  const ss = SpreadsheetApp.openById(libro_id);
  const sheetAlumnos = ss.getSheetByName("Alumnos");
  const sheetAssistencia = ss.getSheetByName("Assistencias");
  
  const filaInicial = 9;
  const ultimaFila = sheetAlumnos.getLastRow();
  const ultimaColumna = sheetAlumnos.getLastColumn();

  const nombresAlumnos = sheetAssistencia.getRange(1, 1, sheetAssistencia.getLastRow() == 0 ? 2 : sheetAssistencia.getLastRow(), 1).getValues()[0];

  // Creamos un mapa: valor → fila
  const mapaAlumnos = {};
  nombresAlumnos.forEach((val, rowIndex) => {
    mapaAlumnos[val] = rowIndex + 1;
  });
  
  

  // el primer checkbox esta en span_checkbox y apartir de ahi hay que contar también la columna de espacio
  for (let col = span_checkbox; col <= ultimaColumna; col += span_checkbox + 1) {
    
    let filasParaGuardar = [];

    for (let fila = filaInicial; fila <= ultimaFila; fila++) {
      const fecha = getLastWeekDateFromCatalanDayName(sheetAlumnos.getRange(fila - 3, col + 1 - span_checkbox).getValue());
      const celda = sheetAlumnos.getRange(fila, col);
      const validacion = celda.getDataValidation();

      // Solo procesamos si realmente es un checkbox
      if (validacion && validacion.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.CHECKBOX) {
        const valor = celda.getValue();
        const nombreAlumno = sheetAlumnos.getRange(fila, col + 1 - span_checkbox).getValue();

        filasParaGuardar.push([fecha, nombreAlumno, valor ? "Presente" : "Ausente"]);
        celda.setValue(false); // reiniciamos la celda
      }
    }
    escribirAssistencias(sheetAssistencia, filasParaGuardar, mapaAlumnos);
  }

  sheetAssistencia.autoResizeColumn(1);
}

function escribirAssistencias(sheetAssistencia, filasParaGuardar, mapaAlumnos) {
  
  if (filasParaGuardar.length == 0) return;

  const lastCol = sheetAssistencia.getLastColumn() == 0 ? 2 : sheetAssistencia.getLastColumn() + 1; // esta columna es en la que escribiremos
  let lastRow = sheetAssistencia.getLastRow() == 0 ? 2 : sheetAssistencia.getLastRow(); // para que no escriba nunca en la primera linea

  // escribimos el dia
  const celda = sheetAssistencia.getRange(1, lastCol);
  celda.setValue(filasParaGuardar[0][0]);

  // miramos si el alumno ya existe
  for (let fila of filasParaGuardar) {
    const nombreAlumno = fila[1];

    // si no existe el alumno lo creamos
    if (!(nombreAlumno in mapaAlumnos)) {
      mapaAlumnos[nombreAlumno] = ++lastRow;
      sheetAssistencia.getRange(lastRow, 1).setValue(fila[1]);
    }

    const row = mapaAlumnos[nombreAlumno];
    sheetAssistencia.getRange(row, lastCol).setValue(fila[2]);
  }

  sheetAssistencia.autoResizeColumn(lastCol);
}

function processarAssistenciasForAllCenters() {
  const centros = new Map(getCentros());
  const nombreLibros = Array.from(centros.keys()).map(v => "Alumnos " + String(v));
  const idLibros = obtenerIdsDeLibros(nombreLibros);
  
  for (let id of idLibros) {
    if (id != null) {
      processarAssistencias(id, 3);
    }
  }
}
