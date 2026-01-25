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


