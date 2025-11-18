// crea o actualiza el libro del centro
function actualizarLibroCentro() {
  
  // Crea o obtiene un libro de Google Sheets con el nombre indicado
  const libro = obtenerLibro("Alumnos " + getSelectedCenterName());
  escribirCursosYAlumnosPorCentro(libro);
}

function loadCentros() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getActiveSheet();
  
  const centros = new Map(getCentros());
 
  const values = Array.from(centros.keys()).map(v => String(v));
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values,true)
    .setAllowInvalid(false)
    .build();

  hoja.getRange('A1').setDataValidation(rule);
  if (values.length) hoja.getRange('A1').setValue(values[0]); // dejamos por defecto el primer centro que encontremos
  
  hoja.getRange('A2').setValue("Última actualización centros: " + new Date());

  const props = PropertiesService.getScriptProperties();
  props.setProperty('centros', JSON.stringify(mapToObject(centros)));
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

/* =======================
   Cargar alumnos del centro seleccionado
   ======================= */

function mapAlumnosToCurso(alumnos) {
  
  const cursoToAlumnos = new Map();
  for (const a of alumnos) {

    const alumno = new Alumno(a);
    for (const curso of alumno.cursos) {
      if (!cursoToAlumnos.has(curso)) cursoToAlumnos.set(curso, new Set());
        cursoToAlumnos.get(curso).add(alumno);
    }
  }

  return cursoToAlumnos;
}


function escribirAlumnosPorGrupo(hoja, row, col, cursos, cursoToAlumnos) {
  for (const curso of cursos) {
    
    escribirCurso(hoja.getRange(row, col), curso);
    row++;

    const alumnosSet = cursoToAlumnos.get(curso);
    const alumnosOrdenados = Array.from(alumnosSet).sort((a, b) => {
      
      const cmpLast = a.apellidos.localeCompare(b.apellidos);
      return cmpLast !== 0 ? cmpLast : a.nombre.localeCompare(b.nombre);
    });

    for (const alumno of alumnosOrdenados) {
      hoja.getRange(row, col).setValue(alumno.nombreCompleto);
      hoja.getRange(row, col + 1).setValue(alumno.cursoEscolar);
      row++;
    }
    
    const rangoCheckboxes = hoja.getRange(row - alumnosOrdenados.length, col + 2, alumnosOrdenados.length, 1);
    rangoCheckboxes.insertCheckboxes();

    row++; // línea en blanco
  }

  hoja.autoResizeColumn(col);
  hoja.autoResizeColumn(col + 1);
  hoja.setColumnWidth(col + 2, 20);

  return col + 4; // nombre alumno mas edad mas checkbox mas una de espacio
}

function escribirCursosYAlumnosPorCentro(ss = SpreadsheetApp.getActiveSpreadsheet(), idCentro = getSelectedCenterId()) {
  
  const hoja = ss.getSheetByName("ALUMNOS") || ss.getActiveSheet();
  const token = ensureToken(false);
  
  /** @type {Array<Object>} */
  const alumnos = fetchJSONWithAuth(URL_ALUMNOS + encodeURIComponent(idCentro), token);
  const cursoToAlumnos = mapAlumnosToCurso(alumnos);


  // limpia contenidos desde la fila 3
  hoja.getRange("A3:Z").clearContent().clearFormat().clearDataValidations(); 

  // Título y fecha de actualización de alumnos
  const now = new Date();
  hoja.getRange("A3").setValue(`Última actualización alumnos: ${now}`);

  const cursosOrdenados = Array.from(cursoToAlumnos.keys()).sort((a, b) => a.localeCompare(b));
  
  if (cursosOrdenados.length === 0) {
    hoja.getRange(row, 1).setValue("No se encontraron alumnos para ese centro.");
    return;
  }

  // escribimos los datos, cada columna sera para cada dia
  let col = 1;
  for (const dia of CATALAN_DAYS) {
    let row = 6;
    const cursosDelDia = cursosOrdenados.filter(curso => curso.endsWith(dia));
    if (cursosDelDia.length > 0) {

      escirbirDia(hoja.getRange(row, col), dia)
      row += 2; // dejamos dos de espacio

      col = escribirAlumnosPorGrupo(hoja, row, col, cursosDelDia, cursoToAlumnos);
    }
  }

  // para los cursos que no tienen dia
  const cursosSinDia = cursosOrdenados.filter(curso => !CATALAN_DAYS.some(dia => curso.endsWith(dia)));
  let row = 9;
  col = escribirAlumnosPorGrupo(hoja, row, col, cursosSinDia, cursoToAlumnos);  
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