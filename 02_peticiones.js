function getCentros() {
 
  const token = ensureToken(false); 
  const res = fetchJSONWithAuth(URL_CENTROS, token);

  // name como clave, id como valor. Se hace asi porque sino con el desplegable es una locura
  const centros = new Map();
  for (var centro of res) {
    centros.set(centro.name, Math.round(centro.id));
  }


  return centros;
}


function getTelefAlumno(alumnoId) {
  const token = ensureToken(false);
  const res = fetchJSONWithAuth(URL_ALUMNO + alumnoId, token);

  return res.telefono;
}