class Alumno {
  constructor(datos) {
    if (typeof datos === "string") {
      datos = JSON.parse(datos);
    }

    
    this.id = datos.id;
    this.nombre = this.capitalizar(datos.nombre);
    this.apellidos = this.capitalizar(datos.apellidos);
    
    this.email = datos.email;
    this.datosAcademicos = datos.datosAcademicos;
    this.enfermedades = datos.enfermedades;
    this.fechaAlta = datos.fechaAlta;
    this.fechaNacimiento = datos.fechaNacimiento;
    this.menorEdad = datos.menorEdad;
    this.participaActividades = datos.participaActividades;
    this.autorizacionImage = datos.autorizacionImage;
    this.salirSolo = datos.salirSolo;
    this.periodicidadPago = datos.periodicidadPago;
    this.tipoPago = datos.tipoPago;
    this.cursos = this.obtenerCursos(datos.cursos);
    this.centros = datos.centros;
    this.estadoMandato = datos.estadoMandato;
    this.fechaVencimientoMandato = datos.fechaVencimientoMandato;
  }

  
  get nombreCompleto() {
    return `${this.nombre} ${this.apellidos}`;
  }

  get edad() {
    
    if (!this.fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  get cursoEscolar() {
    
    let edad = -1;
    
    if (this.fechaNacimiento) {
      const nacimiento = new Date(this.fechaNacimiento);
      const hoy = new Date(); 

      // Determinar el año escolar actual
      const anyActual = hoy.getFullYear();
      const mesActual = hoy.getMonth(); // 0 = enero, 11 = diciembre
      const anyEscolarInicio = mesActual >= 8 ? anyActual : anyActual - 1; // si es septiembre o más, empieza nuevo curso

      // Edad a 31 de diciembre del año de inicio del curso
      const fechaReferencia = new Date(anyEscolarInicio, 11, 31);
      edad = fechaReferencia.getFullYear() - nacimiento.getFullYear();
      const m = fechaReferencia.getMonth() - nacimiento.getMonth();
      if (m < 0 || (m === 0 && fechaReferencia.getDate() < nacimiento.getDate())) {
        edad--;
      }
    }
    
    return NOMBRES_CURSOS[edad] || edad;
  }


  obtenerCursos(cursosString) {
    const cursos = String(cursosString || "")
      .split("##")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const setCursos = new Set();
    
    for (const curso of cursos) {
      const cursosExpand = this.expandCursoPorDias(curso);
      for (const cursoFinal of cursosExpand) {
        if (!setCursos.has(cursoFinal)) setCursos.add(cursoFinal);
      }
    }
    
    return setCursos;
  }
    

  capitalizar(texto) {
    
    texto = texto.trim().toLowerCase();
    let palabras = texto.split(" ");
    let res = "";

    for (let palabra of palabras) {
      res += palabra.charAt(0).toUpperCase() + palabra.slice(1);
      res += " ";
    }
    
    return res.trim();
  }

  /**
  * Expande un curso si en el 3er segmento (separado por ' - ') hay 2+ días.
  * Conserva la base del 3er segmento (p.ej. "Anglès 1r-2n") y crea
  * variantes "… - <base> <Día>" por cada día detectado.
  */
  expandCursoPorDias(cursoStr) {
    const raw = String(cursoStr || "").trim();
    const parts = raw.split(/\s-\s/).map(s => s.trim()); // separa por " - "

    if (parts.length < 3) return [raw];

    const third = parts[2]; // ej: "Anglès 1r-2n Dilluns i Dimecres"
    const matches = third.match(DAY_REGEX) || [];
    const diasUnicos = Array.from(new Set(matches));

    if (diasUnicos.length >= 2) {
      let baseThird = third
        .replace(DAY_REGEX, "")
        .replace(/\bi\b/gi, " ")
        .replace(/\s*,\s*/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      const prefix = parts.slice(0, 2);
      const tail = parts.length > 3 ? parts.slice(3) : [];

      return diasUnicos.map(dia => {
        const thirdFinal = baseThird ? (baseThird + " " + dia).trim() : dia;
        return [...prefix, thirdFinal, ...tail].join(" - ");
      });
    }
    return [raw];
  }
}
