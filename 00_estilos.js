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
