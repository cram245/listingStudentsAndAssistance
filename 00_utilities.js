// obtiene un libro si existe, lo crea sino
function obtenerLibro(nombreLibro, ifNotExistCreate = true) {
  const archivos = DriveApp.getFilesByName(nombreLibro);
  let libro = null;

  if (archivos.hasNext()) {
    // Si ya existe, lo abrimos
    const archivo = archivos.next();
    libro = SpreadsheetApp.open(archivo);
    Logger.log("Libro encontrado: " + libro.getUrl());
  } else if (ifNotExistCreate) {
    // Si no existe, lo creamos
    libro = SpreadsheetApp.create(nombreLibro);
    const sheet= libro.getActiveSheet();
    sheet.setName("Alumnos");
    libro.insertSheet("Assistencias");

    Logger.log("Libro creado: " + libro.getUrl());
  }

  return libro;
}

function obtenerIdsDeLibros(nombres) {
  return nombres.map(nombre => {
    const archivos = DriveApp.getFilesByName(nombre);

    if (archivos.hasNext()) {
      const archivo = archivos.next();
      return archivo.getId();
    }

    // No existe
    return null;
  });
}

function obtenerIdDeLibroOrFail(nombre) {

  const archivo = DriveApp.getFilesByName(nombre);
  if (archivo.hasNext())
    return archivo.next().getId();
  
  throw new Error("Libro" + nombre + " no encontrado");
}


function mapToObject(map) {
  var obj = {};
  map.forEach(function (value, key) {
    obj[key] = value;
  });
  return obj;
}

function objectToMap(obj) {
  var map = new Map();
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      map.set(k, obj[k]);
    }
  }
  return map;
}

function getLastWeekDateFromCatalanDayName(name) {

  if (!name) return new Date();

  const today = new Date();
  const text = name.toString().trim().toLowerCase();

  const dias = [
    { nombre: "dilluns",    valor: 1 },
    { nombre: "dimarts",    valor: 2 },
    { nombre: "dimecres",   valor: 3 },
    { nombre: "dijous",     valor: 4 },
    { nombre: "divendres",  valor: 5 },
    { nombre: "dissabte",   valor: 6 },
    { nombre: "diumenge",   valor: 0 },
  ];

  let targetJsDay = null;

  for (const dia of dias) {
    if (text.includes(dia.nombre)) {
      targetJsDay = dia.valor;
      break;
    }
  }

  if (targetJsDay === null) return today;
  

  const todayJsDay = today.getDay();
  const todayMondayIndex = (todayJsDay + 6) % 7;

  const startOfThisWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - todayMondayIndex
  );

  const targetMondayIndex = (targetJsDay + 6) % 7;

  const thisWeekTarget = new Date(
    startOfThisWeek.getFullYear(),
    startOfThisWeek.getMonth(),
    startOfThisWeek.getDate() + targetMondayIndex
  );

  const lastWeekTarget = new Date(
    thisWeekTarget.getFullYear(),
    thisWeekTarget.getMonth(),
    thisWeekTarget.getDate() - 7
  );

  const result = new Date(
    lastWeekTarget.getFullYear(),
    lastWeekTarget.getMonth(),
    lastWeekTarget.getDate()
  );

  return result;
}


// borra toda la fila origen y la combina con la fila destino
function mezclarFilas(hoja, filaOrigen, filaDestino) {
  const lastCol = hoja.getLastColumn();
  
  const origen = hoja.getRange(filaOrigen, 1, 1, lastCol).getValues()[0];
  const destino = hoja.getRange(filaDestino, 1, 1, lastCol).getValues()[0];

  const combinado = destino.map((v, i) => v !== "" ? v : origen[i]);

  hoja.getRange(filaDestino, 1, 1, lastCol).setValues([combinado]);
  hoja.getRange(filaOrigen, 1, 1, lastCol).clearContent(); // opcional
}
