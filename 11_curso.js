class Curso {

    constructor(datos) {
        if (typeof datos === "string") {
            datos = JSON.parse(datos);
        }

        this.id = datos.id;
        this.centro = datos.centro;
        this.cursonombre = datos.cursonombre; // nombre del curso
        this.nombre = datos.nombre; // aqui esta el dia y el time slot
        this.alumnos = new Set();
        this.diaSem = this.getDia(); // dias de la semana en el que se hace el curso, tmb se acepta sin dia, siempre es un array no vacío
        this.timeSlot = this.getTimeSlot();
    }



    getDia() {

        const diasEncontrados = CATALAN_DAYS.filter(dia => {
            return this.nombre.toLowerCase().includes(dia.toLowerCase());
        });

        if (diasEncontrados.length > 0)
            return diasEncontrados;
        return ["Sense dia"];
    }

    getTimeSlot() {
        
        for (const timeSlot of CATALAN_TIME_SLOT) {
            if (this.nombre.includes(timeSlot))
                return timeSlot;
        }

        return "Sense timeslot";
    }
}