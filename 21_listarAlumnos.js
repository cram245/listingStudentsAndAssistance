// aqui mergeamos los cursos con las promociones de cursos de varios dias
function addAlumnosToCursos(alumnos, cursos) {
  for (const a of alumnos) {

    const alumno = new Alumno(a);
    for (const curso of alumno.cursos) {
  
      const realCurso = obtenerNombreCurso(curso);
      
      for (const aux of cursos)
        if (aux.nombre == realCurso)
          aux.alumnos.add(alumno);
    }
  }
}

function getCursosFromCentro(allCursos, nombreCentro) {

  const cursos = new Set();

  for (const c of allCursos) {
    const curso = new Curso(c);
    
    if (curso.centro.localeCompare(nombreCentro) == 0)
      cursos.add(curso);
  }

  return cursos;
}

// escribe alumnos y cursos de un solo dia
function escribirAlumnosPorGrupo(hoja, row, col, cursos) {
  for (const curso of cursos) {
    

    if (curso.alumnos.size > 0) {
      escribirCurso(hoja.getRange(row, col), curso.cursonombre);
      row += 1;  

      const alumnosSet = curso.alumnos;
      const alumnosOrdenados = Array.from(alumnosSet).sort((a, b) => {
        
        const cmpLast = a.apellidos.localeCompare(b.apellidos);
        return cmpLast !== 0 ? cmpLast : a.nombre.localeCompare(b.nombre);
      });

      for (const alumno of alumnosOrdenados) {
        escribirAlumno(hoja.getRange(row, col), alumno.nombreCompleto);
        hoja.getRange(row, col + 1).setValue(alumno.cursoEscolar);
        
        // si se desea obtener los telefonos de los alumnos descommentar
        //hoja.getRange(row, col + 2).setValue(getTelefAlumno(alumno.id));
        row += 1;
      }
      
      const rangoCheckboxes = hoja.getRange(row - alumnosOrdenados.length, col + 2, alumnosOrdenados.length, 1);
      rangoCheckboxes.insertCheckboxes();

      row += 1; // línea en blanco
    }
    
  }

  hoja.autoResizeColumn(col);       // nombre
  hoja.autoResizeColumn(col + 1);   // curso
  hoja.setColumnWidth(col + 2, 20); // check box
  hoja.setColumnWidth(col + 3, 40); // espacio entre dias

  return row;
}

function escribirCursosYAlumnosPorCentro(ss = SpreadsheetApp.getActiveSpreadsheet(), idCentro = getSelectedCenterId()) {
  
  const hoja = ss.getSheetByName("ALUMNOS") || ss.getActiveSheet();
  const token = ensureToken(false);
  
  /** @type {Array<Object>} */
  const alumnos = fetchJSONWithAuth(URL_ALUMNOS + encodeURIComponent(idCentro), token);

  const allCourses = fetchJSONWithAuth(URL_CURSOS, token);
  const cursos = getCursosFromCentro(allCourses, hoja.getRange('A1').getValue()); // es un set con los cursos
  
  addAlumnosToCursos(alumnos, cursos);



  // limpia contenidos desde la fila 3
  hoja.getRange("A3:Z").clearContent().clearFormat().clearDataValidations(); 

  
  if (cursos.length === 0) {
    hoja.getRange(row, 1).setValue("No se encontraron alumnos para ese centro.");
    return;
  }

  // escribimos los datos, cada columna sera para cada dia
  let col = 1;
  for (const dia of CATALAN_DAYS) {

    const mapCursosDelDia = new Map(); // la key es el time slot y el value es un set con todos los cursos en ese time slot
    
    let row = 6;

    for (const curso of cursos) {
      
      if (curso.diaSem.includes(dia)) {

        if (!mapCursosDelDia.has(curso.timeSlot)) mapCursosDelDia.set(curso.timeSlot, new Set());
        mapCursosDelDia.get(curso.timeSlot).add(curso);
      }
    }
    
    
    if (mapCursosDelDia.size > 0) {

      if (dia != "Sense dia") {
        escirbirDia(hoja.getRange(row, col), dia)
        
      }
      
      row += 2; // dejamos dos de espacio


      for (timeSlot of CATALAN_TIME_SLOT) {
        if (mapCursosDelDia.has(timeSlot)) {
          
          if (timeSlot != "Sense timeslot") {
            escribirTimeSlot(hoja.getRange(row, col), timeSlot);
            row += 2;
          }
          
          row = escribirAlumnosPorGrupo(hoja, row, col, mapCursosDelDia.get(timeSlot));
        }
      }

      col += 4; // nombre alumno mas edad mas checkbox mas una de espacio
      
    }
  }

  // Título y fecha de actualización de alumnos
  const now = new Date();
  hoja.getRange("A3").setValue(`Última actualización alumnos: ${now}`);
}