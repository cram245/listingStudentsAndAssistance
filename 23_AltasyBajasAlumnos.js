function obtenerDatosActuales() {

    const idCentro = getSelectedCenterId();
    const token = ensureToken(false);

    const alumnos = fetchJSONWithAuth(URL_ALUMNOS + encodeURIComponent(idCentro), token);
    const allCourses = fetchJSONWithAuth(URL_CURSOS, token);
    const cursos = getCursosFromCentro(allCourses, getSelectedCenterName()); // es un set con los cursos
  
    addAlumnosToCursos(alumnos, cursos);

    const datos = new Map();

    for (const dia of CATALAN_DAYS) {
        
        const cursosDia = new Map();
        for (const curso of cursos)
            if (curso.diaSem.includes(dia))
                if (curso.alumnos.size > 0) 
                    cursosDia.set(curso.cursonombre, curso.alumnos);
                

        datos.set(dia.toUpperCase(), cursosDia);
    }

    return datos;
}

// map ids to telefonos, idsToCheck es un array
function obtenerTelefonosAlumnos(mapTelefonos, idsToCheck) {

    for (const id of idsToCheck) {
        if (!mapTelefonos.has(id)) { // solo obtenemos los telefonos que aun no tenemos

            const telf = getTelefAlumno(id);
            mapTelefonos.set(id, telf);
        }

    }
    return mapTelefonos
}

// dia, curso y alumnos hacen referencia a los datos antiguos
function escribirDiffsCurso(hoja, row, col, dia, cursoDiaAntiguo, alumnos, datosNuevos, mapTelefonos) {

    if (!datosNuevos.has(dia))
        return row + 1; // hacer algo aqui

    if (!datosNuevos.get(dia).has(cursoDiaAntiguo))
        return row + 1; // hacer algo aqui

    const alumnosNuevos = datosNuevos.get(dia).get(cursoDiaAntiguo); // esto es un set de alumnos
    const nombresNuevosSet = new Set();
    for (const alumno of alumnosNuevos) {
        
        escribirAlumno(hoja.getRange(row, col), alumno.nombreCompleto);
        nombresNuevosSet.add(alumno.nombreCompleto);
        
        if (alumnos.has(alumno.nombreCompleto)) {
            
            if (!mapTelefonos.has(alumno.id)) {
                const telef = getTelefAlumno(alumno.id);
                mapTelefonos.set(alumno.id, telef);
            }
            hoja.getRange(row, col + 1).setValue(mapTelefonos.get(alumno.id));
            marcarExistente(hoja.getRange(row, col, 1, 2));
        }
        
        else { // es una alta ya que no estaba en la semana anterior
            
            
            if (!mapTelefonos.has(alumno.id)) {
                const telef = getTelefAlumno(alumno.id);
                mapTelefonos.set(alumno.id, telef);
            }
            
            hoja.getRange(row, col + 1).setValue(mapTelefonos.get(alumno.id));
            marcarAlta(hoja.getRange(row, col, 1, 2));
        }

        row += 1;
    }

    for (const alumno of alumnos) {
        if (!nombresNuevosSet.has(alumno)) { // es una baja
            escribirAlumno(hoja.getRange(row, col), alumno);
            marcarBaja(hoja.getRange(row, col, 1, 2));
            row += 1;
        }
    }

    return row;
}




function escribirDiffs(datosAntiguos, datosNuevos) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName("CENTROS_DATA");

    const mapTelefonos = new Map();

    if (hoja == null) 
        return showError("ERROR! El libro no tiene una hoja llamada CENTROS_DATA con los datos de estos");

    hoja.getRange("A3:Z").clearContent().clearFormat();

    
    let col = 1;
    for ([dia, mapCursosAlumnos] of datosAntiguos) {
        
        let row = 3;
        if (dia != "SENSE DIA") 
            escirbirDia(hoja.getRange(row, col), dia);
        row += 2;

        for ([curso, alumnos] of mapCursosAlumnos) { // curso es un map con el nombre del curso 
            
            if (curso != "Sin curso") {
                escribirCurso(hoja.getRange(row, col), curso);
                row += 1;
                row = escribirDiffsCurso(hoja, row, col, dia, curso, alumnos, datosNuevos, mapTelefonos);
                row += 1;
            }
        }

        hoja.autoResizeColumn(col);

        col += 3;
    }
}



function getDiffs(datosAntiguos) {

    const datosNuevos = obtenerDatosActuales();
    escribirDiffs(datosAntiguos, datosNuevos);
    

    
    /*
    const objetoLegible = {};

    datosNuevos.forEach((mapCursos, dia) => {
        objetoLegible[dia] = {};

        mapCursos.forEach((setAlumnos, nombreCurso) => {
        
            objetoLegible[dia][nombreCurso] = Array.from(setAlumnos).map(a => a.nombreCompleto);
        });
    });

    // Imprime el resultado con formato de indentación
    console.log(JSON.stringify(objetoLegible, null, 2));
    */
}