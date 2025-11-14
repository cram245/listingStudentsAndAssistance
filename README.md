📘 Gestión de Alumnos, Cursos y Asistencias

Google Apps Script + Google Sheets

Este proyecto proporciona un sistema automatizado para listar alumnos, asignar cursos y gestionar asistencias en diferentes centros educativos utilizando Google Apps Script y Google Sheets.
La solución permite centralizar y sincronizar la información de múltiples centros, automatizar tareas repetitivas y generar informes precisos de asistencia semanal.

📌 Descripción

Este proyecto automatiza la gestión de:
- Listados de alumnos por centro
- Cursos y grupos asignados
- Registro y procesamiento de asistencias semanales

Toda la información se almacena en diferentes hojas de cálculo del tipo:
Alumnos <NombreCentro>


El script identifica cada uno de estos libros, actualiza la información y sincroniza asistencias semanales automáticamente.
El objetivo principal es eliminar trabajo manual repetitivo y permitir una gestión simple, consistente y escalable.

✨ Características
🏫 Multicentro

Lectura automática de centros desde una fuente principal (mapa o tabla).
Apertura dinámica de libros “Alumnos <Centro>”.
Gestión independiente por centro.

👨‍🎓 Gestión de alumnos y cursos

Listado automático de alumnos por curso.
Organización jerárquica flexible (grupo → curso → centro).
Funciones reutilizables para agregar, actualizar o eliminar registros.

📝 Control de asistencias

Detección de días de la semana mediante coincidencia parcial en catalán (ex.: “dilluns”, “dimarts”…).
Cálculo de fechas exactas para asistencias de la semana pasada.
Consolidación automática en hojas de historial.

🔎 Interacción con Google Drive

Búsqueda dinámica de libros por nombre.
Detección de libros inexistentes.
Manejo seguro de errores (archivo no encontrado, permisos, etc.).

⏱️ Automatización total con triggers

Programación semanal o diaria para actualizar asistencia.
Reprocesado automático sin intervención humana.

🔧 Funcionamiento

Se obtiene la lista de centros mediante getCentros().
Para cada centro se construye el nombre del libro:
"Alumnos <NombreCentro>"

obtenerIdsDeLibros() localiza el archivo en Google Drive.
Si existe, se abre con SpreadsheetApp.openById().
Se ejecuta escribirCursosYAlumnosPorCentro(), que:
- Lee cursos
- Carga alumnos
- Actualiza asistencias
- Escribe estructura y cambios

Si hay hojas de asistencia semanales:
- Se detectan los días en catalán
- Se calcula la fecha exacta de la semana anterior
- Se insertan los datos en el historial

⚙️ Instalación
1. Clonar el repositorio
git clone https://github.com/<usuario>/<repositorio>.git

2. Instalar CLASP (si aún no lo tienes)
npm install -g @google/clasp

3. Iniciar sesión
clasp login

4. Enlazar con un proyecto Apps Script existente
clasp clone <SCRIPT_ID>

O desplegar hacia Apps Script:
clasp push

🛠️ Tecnologías usadas
Google Apps Script (JavaScript)

Google Sheets

Google Drive API

Google Workspace Triggers

CLASP (Apps Script CLI)
