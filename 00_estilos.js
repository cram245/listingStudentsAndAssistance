function escribirAlumno(celda, nombreAlumno) {
  celda.setValue(nombreAlumno);
}



function escirbirDia(celda, dia) {
  celda.setValue(dia.toLocaleUpperCase());
  celda.setHorizontalAlignment('center');
  celda.setFontSize(14);
  celda.setFontColor('red');
}

function escribirTimeSlot(celda, timeSlot) {
  celda.setValue(timeSlot.toLocaleUpperCase());
  celda.setHorizontalAlignment('center');
  celda.setFontSize(12);
  celda.setFontColor('red');
}

function escribirCurso(celda, curso) {
  //celda.setValue(curso.split("-")[0].trim());
  celda.setValue(curso);
  celda.setFontWeight("bold");
  celda.setHorizontalAlignment('center');
}

function marcarExistente(rango) {
  rango.setBackground("#999999");
}

function marcarAlta(rango) {
  rango.setBackground("#00ff00");
}

function marcarBaja(rango) {
  rango.setBackground("#ff0000");
}