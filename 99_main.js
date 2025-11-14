function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📘 Alumnos")
    .addItem("Refrescar lista de centros", "loadCentros")
    .addItem("Cargar alumnos del centro seleccionado", "escribirCursosYAlumnosPorCentro")
    .addItem("Crear/actualizar libro del centro", "actualizarLibroCentro")
    .addItem("Test processar assistencias", "listarAlumnosForAllCenters")
    .addToUi();

  loadCentros();
}

function crearTriggerSemanal() {
  ScriptApp.newTrigger("processarAssistenciasForAllCenters")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY) // día que quieras
    .atHour(8)                           // hora que quieras (hora del proyecto)
    .create();
  
  ScriptApp.newTrigger("listarAlumnosForAllCenters")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
}