
// FUNCIONES CONSTRUCTORAS

function Libro(id, titulo, autor, categoria, valorMultaPorDia) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.categoria = categoria;
    this.valorMultaPorDia = valorMultaPorDia;
    this.disponible = true;
}

function Prestamo(idLibro, tituloLibro, autorLibro, valorLibro) {
    this.id = Date.now();
    this.idLibro = idLibro;
    this.tituloLibro = tituloLibro;
    this.autorLibro = autorLibro;
    this.valorLibro = valorLibro;

    const hoy = new Date();
    this.fechaRetiro = hoy.toLocaleDateString();

    const fechaEstimada = new Date(hoy);
    fechaEstimada.setDate(fechaEstimada.getDate() + 14);
    this.fechaDevolucionEstimada = fechaEstimada.toLocaleDateString();

    this.fechaDevolucionReal = null;
    this.diasAtrasado = 0;
    this.moraTotal = 0;
    this.estado = "activo";
}


// CARGA DESDE JSON 
const DATOS_INICIALES = {
    "libros": [
        { "id": 1, "titulo": "El Quijote", "autor": "Miguel de Cervantes", "categoria": "Novela", "valorMultaPorDia": 500 },
        { "id": 2, "titulo": "Cien Años de Soledad", "autor": "Gabriel García Márquez", "categoria": "Novela", "valorMultaPorDia": 400 },
        { "id": 3, "titulo": "La Sombra del Viento", "autor": "Carlos Ruiz Zafón", "categoria": "Novela", "valorMultaPorDia": 300 },
        { "id": 4, "titulo": "El Principito", "autor": "Antoine de Saint-Exupéry", "categoria": "Infantil", "valorMultaPorDia": 200 },
        { "id": 5, "titulo": "Harry Potter y la Piedra Filosofal", "autor": "J.K. Rowling", "categoria": "Infantil", "valorMultaPorDia": 250 },
        { "id": 6, "titulo": "El Código Da Vinci", "autor": "Dan Brown", "categoria": "Misterio", "valorMultaPorDia": 350 },
        { "id": 7, "titulo": "La Casa de los Espíritus", "autor": "Isabel Allende", "categoria": "Novela", "valorMultaPorDia": 450 },
        { "id": 8, "titulo": "El Alquimista", "autor": "Paulo Coelho", "categoria": "Novela", "valorMultaPorDia": 300 },
        { "id": 9, "titulo": "Don Juan Tenorio", "autor": "José Zorrilla", "categoria": "Teatro", "valorMultaPorDia": 150 },
        { "id": 10, "titulo": "El Hobbit", "autor": "J.R.R. Tolkien", "categoria": "Fantasía", "valorMultaPorDia": 400 },
        { "id": 11, "titulo": "Moby Dick", "autor": "Herman Melville", "categoria": "Novela", "valorMultaPorDia": 350 },
        { "id": 12, "titulo": "La Divina Comedia", "autor": "Dante Alighieri", "categoria": "Poesía", "valorMultaPorDia": 450 },
        { "id": 13, "titulo": "El Retrato de Dorian Gray", "autor": "Oscar Wilde", "categoria": "Novela", "valorMultaPorDia": 300 },
        { "id": 14, "titulo": "Cumbres Borrascosas", "autor": "Emily Brontë", "categoria": "Novela", "valorMultaPorDia": 350 },
        { "id": 15, "titulo": "El Gran Gatsby", "autor": "F. Scott Fitzgerald", "categoria": "Novela", "valorMultaPorDia": 400 },
        { "id": 16, "titulo": "La Metamorfosis", "autor": "Franz Kafka", "categoria": "Novela", "valorMultaPorDia": 250 },
        { "id": 17, "titulo": "El Viejo y el Mar", "autor": "Ernest Hemingway", "categoria": "Novela", "valorMultaPorDia": 300 },
        { "id": 18, "titulo": "La Odisea", "autor": "Homero", "categoria": "Épica", "valorMultaPorDia": 450 },
        { "id": 19, "titulo": "El Amor en los Tiempos del Cólera", "autor": "Gabriel García Márquez", "categoria": "Novela", "valorMultaPorDia": 400 },
        { "id": 20, "titulo": "Rayuela", "autor": "Julio Cortázar", "categoria": "Novela", "valorMultaPorDia": 500 }
    ]
};

// INICIALIZACIÓN DE DATOS USANDO EL JSON
let catalogoLibros = DATOS_INICIALES.libros.map(libroJSON =>
    new Libro(
        libroJSON.id,
        libroJSON.titulo,
        libroJSON.autor,
        libroJSON.categoria,
        libroJSON.valorMultaPorDia
    )
);



// Array donde se almacenan todos los préstamos realizados.
let prestamos = [];

//// DATOS DE PRUEBA PARA TESTEAR EL SISTEMA DE MULTAS
// (Se pueden activar durante el desarrollo).
        // 👇       
// if (prestamos.length === 0) {
// prestamos.push({
//     tituloLibro: "Libro de prueba",
//     fechaRetiro: "01/11/2025",
//     estado:"activo",
//     valorLibro: 2000
// });
// }


// PERSISTENCIA (Sincronización y Carga)

//Esta función guarda los datos actuales del sistema en el localStorage, así los préstamos y el catálogo no se pierden cuando recargo la página.

function sincronizarStorage() {
    localStorage.setItem('prestamosBiblioteca', JSON.stringify(prestamos));

    // También guardo el catálogo por si agrego libros nuevos
    localStorage.setItem('catalogoLibros', JSON.stringify(catalogoLibros));
}

//Cuando se abre la página intento recuperar los datos guardados en localStorage.
//Si existen, los cargos en los arrays para continuar trabajando en ellos.

function cargarDatos() {
    const guardados = localStorage.getItem('prestamosBiblioteca');
    const librosGuardados = localStorage.getItem('catalogoLibros');

    if (librosGuardados) {
        catalogoLibros = JSON.parse(librosGuardados);
    }

    if (guardados) {
        prestamos = JSON.parse(guardados);
        // Sincronizo disponibilidad
        prestamos.forEach(p => {
            if (p.estado === "activo") {
                const libro = catalogoLibros.find(l => l.id === p.idLibro);
                if (libro) libro.disponible = false;
            }
        });
    }
}


// Invoco la carga apenas abre la página
cargarDatos();


//  FUNCIONES DE INTERACCIÓN (retiro y devolución)

const visor = document.getElementById('visorResultados');

function mostrarEnVisor(contenido) {
    visor.innerHTML = contenido;
}

function retirarLibro() {
    let mensaje = `
    <div class ="viso-bloque">
        <p class = "titulo-seccion">CATÁLOGO DE DISPONIBLES</p>
    </div>`;

    const disponibles = catalogoLibros.filter(libro => libro.disponible);

    if (disponibles.length === 0) {
        mostrarEstadoVacio("No hay ejemplares disponibles para retirar.");
        return;
    }

    disponibles.forEach((libro) => {
        //informo al socio el costo y la posible mora(5%)
        const moraReferencia = (libro.valorMultaPorDia * 0.05).toFixed(2);

        mensaje += `
            <div class="item-resultado"> 
            <div class = "linea-libro">
                <span class = "numero-libro">
                    ${libro.id.toString().padStart(2, '0')}
                    </span>
                <span class = "titulo-libro">${libro.titulo.toUpperCase()}</span>
            </div>
            <div class = "detalle-libro">Costo :<strong class = "precio"> $${libro.valorMultaPorDia}</strong> | 
                Mora: <span class = "mora"> $${moraReferencia}/día</span> </div>
            </div>`;
    });

    mensaje += `
    <p class = "texto-ayuda">* Ingresá el N° y confirmá el retiro</p>`;

    mostrarEnVisor(mensaje);
}


function procesarRetiro() {
    const inputLibro = document.getElementById('inputNumeroLibro');
    const opcion = parseInt(inputLibro.value);
    //Validaciones iniciales
    if (isNaN(opcion)) {
        mostrarEnVisor(`<div class = "bloque-mensaje">
            <p class = "titulo-aviso">AVISO DEL SISTEMA
            </p>

            <div class = "texto-mensaje">Por favor, ingresá un <strong class = "resaltado">NÚMERO VÁLIDO </strong>para identificar el ejemplar.</div>
            </div>
        `);
        return;
    }

    const libroElegido = catalogoLibros.find(libro => libro.id === opcion);

    if (!libroElegido) {
        mostrarEnVisor(
            `<div class = "bloque-mensaje">
                <p class = "titulo-aviso-suave">Sin registro para mostrar</p>
                <div class = "texto-mensaje">No se encuentra un ejemplar con el N° <strong class = "resaltado">${opcion}</strong> en nuestro cátalogo.</div>
                
            </div>
        `);

        return;
    }

    //El candado de seguridad
    if (libroElegido.disponible === false) {
        mostrarEnVisor(
            `<div class = "bloque-mensaje">
                <p class = "titulo-aviso">ESTADO: NO DISPONIBLE</p>
                <span class = "texto-mensaje">Lo sentimos, el ejemplar de</span>
                <strong class = "resaltado">"${libroElegido.titulo}"</strong>
                <span class = "texto-mensaje">se encuentra actualmente en préstamo.</span>
            </div>
            `);
        return;
    }

    const nuevoPrestamo = new Prestamo(
        libroElegido.id,
        libroElegido.titulo,
        libroElegido.autor,
        libroElegido.valorMultaPorDia
    );

    prestamos.push(nuevoPrestamo);
    libroElegido.disponible = false;

    // Uso mi nueva central de guardado
    sincronizarStorage();

    mostrarEnVisor(
        `<div class = "bloque-mensaje">
                <p class = "titulo-confirmacion">PRÉSTAMO CONFIRMADO</p>

                <div class = "bloque-datos">

                <div class = "linea-info">
                    <span class = "etiqueta">EJEMPLAR:</span>
                    <span  class = "texto-valor"> ${libroElegido.titulo.toUpperCase()}</span>
                </div>

                <div class = "linea-info">
                    <span class = "etiqueta" >VENCIMIENTO:</span>
                    <strong  class = "resaltado">${nuevoPrestamo.fechaDevolucionEstimada}</strong>
                </div>

                <div class = "linea-info">
                    <span class = "etiqueta">COSTO:</span>
                    <span>$${libroElegido.valorMultaPorDia}</span>
                </div>

                <p class = "nota-final">* Se aplicará un 5% de mora diaria tras el vencimiento.</p>
                </div>
            </div>
            `);

    inputLibro.value = "";
    actualizarEstadisticas();
}




function devolverLibro() {
    const inputLibro = document.getElementById('inputNumeroLibro');
    const idABuscar = parseInt(inputLibro.value);

    //Valido el ingreso
    if (isNaN(idABuscar)) {
        mostrarEnVisor(`
            <p class="titulo-aviso">Modalidad de devolución</p>
                <div class="texto-mensaje">
                    <span class="numero-libro">01.</span> Ingresá el número del libro arriba.<br>
                    <span class="numero-libro">02.</span> Presioná el botón <strong class="resaltado">"DEVOLVER LIBRO"</strong>.
                </div>
                `);
        return;
    }

    //busco el prestamo del libro que coincida y este "activo"
    const prestamoEncontrado = prestamos.find(p => p.idLibro === idABuscar && p.estado === "activo");

    if (!prestamoEncontrado) {
        mostrarEnVisor(`
                <div class="bloque-panel bloque-mensaje">
                    <p class="titulo-aviso-suave">Estado de préstamo</p>
                    <div class="texto-mensaje">El ejemplar N°<strong class="resaltado">${idABuscar}</strong>  no tiene un préstamo activo." </strong>.
                </div>
                `);
        inputLibro.value = "";
        return;
    }

    //actualizo el préstamo
    prestamoEncontrado.estado = "devuelto";
    prestamoEncontrado.fechaDevolucionReal = new Date().toLocaleDateString();

    //libero el libro en el catálogo
    const libroEnCatalogo = catalogoLibros.find(l => l.id === idABuscar);
    if (libroEnCatalogo) {
        libroEnCatalogo.disponible = true;
    }

    //Guardo todo en mi funcion sincronizar
    sincronizarStorage();

    //respueta visual
    mostrarEnVisor(
        `<div class = "bloque-datos">DEVOLUCION EXITOSA</div>  
                <p class = "texto-mensaje">
                <strong class = "resaltado">Libro:</strong> ${prestamoEncontrado.tituloLibro}</p>
                
                <p class = "nota-final">Gracias por devolver el libro a la <strong class = "resaltado">Biblioteca del Lector</strong>.</p>
                </div>
                `);

    inputLibro.value = "";
    actualizarEstadisticas();
}



function verHistorialMensual() {

    //validacón si hay algo para mostrar
    if (prestamos.length === 0) {
        mostrarEstadoVacio("No se registran movimientos aún.");
        return;
    }

    const listaHtml = prestamos.map(p => {
        const esActivo = p.estado === "activo";
        const estadoClase = esActivo ? "badge-activo" : "badge-devuelto";

        return `
        <div class = "item-resultado historial-item">
        <div class = "historial-linea">
            <span class = "titulo-libro">${p.tituloLibro.toUpperCase()}</span>
            <span class = "badge-estado ${estadoClase}">${p.estado}</span>
        </div>
        <div class = "historial-fecha">RETIRO: ${p.fechaRetiro} | DEV: ${p.fechaDevolucionReal || 'PENDIENTE'}</div>
        </div>`

    }).join("");

    mostrarEnVisor(`
        <div class = "bloque-panel">
        <p class = "titulo-seccion">REGISTRO DE ACTIVIDAD</p>
        ${listaHtml}
        </div>`);
}


function actualizarEstadisticas() {
    const visorEstadisticas = document.getElementById('visorEstadisticas');
    const totalMovimientos = prestamos.length;
    const activos = prestamos.filter(p => p.estado === "activo").length;

    visorEstadisticas.innerHTML = `
        <div class = "panel-estadisticas">
            <div class = "bloque-estadistica">
                <p class = "titulo-estadistica">MOVIMIENTOS</p>
                <p class = "numero-estadistica">${totalMovimientos}</p>
            </div>
            <div class = "separador-estadistica"></div>
            <div class = "bloque-estadistica">
                <p class = "titulo-estadistica">Préstamos Activos</p>
                <p class = "numero-estadistica">${activos}</p>
                </div>
            
        </div>`;

}
actualizarEstadisticas();

function verMultasPendientes() {
    const activos = prestamos.filter(p => p.estado === "activo");

    if (activos.length === 0) {
        mostrarEstadoVacio("No tienes préstamos activos.");
        return;
    }

    let contenidoMultas = `
        <div class = "bloque-panel visor-bloque">
            <p class = "titulo-seccion">RESUMEN DE MULTAS</p>
        </div>`;

    activos.forEach(p => {
        // Cálculo de días transcurridos desde el retiro
        const hoy = new Date();
        const fechaPrestamoPartes = p.fechaRetiro.split('/'); // Asumiendo formato DD/MM/AAAA
        const fechaPrestamo = new Date(fechaPrestamoPartes[2], fechaPrestamoPartes[1] - 1, fechaPrestamoPartes[0]
        );

        //calculo cúantos días pasaron desde que se retiró el libro,si supera los 14 días permitidos, se genera una multa por retraso.
        const diferenciaMilisegundos = hoy - fechaPrestamo;
        const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

        // Si pasaron más de 14 días, hay multa (5% del valor por cada día de retraso)
        let multaActual = 0;
        if (diasTranscurridos > 14) {
            const diasRetraso = diasTranscurridos - 14;
            multaActual = (p.valorLibro * 0.05) * diasRetraso;
        }

        const claseMulta = multaActual > 0 ? "multa-atrasada" : "multa-ok";

        contenidoMultas += ` 
        <div class = "item-resultado multa-item">
            <p class = "titulo-libro">
                <strong>${p.tituloLibro}</strong></p>
            
            <p class = "detalle-libro">Días transcurridos: ${diasTranscurridos} / 14 permitidos.</p>
                
            <p class = "estado-multa ${claseMulta}">Multa acumulada: <strong>$${multaActual.toFixed(2)}</strong></p>
                
        </div>`;
    });
    mostrarEnVisor(contenidoMultas);
}

function mostrarMensajeBienvenida() {
    mostrarEnVisor(`
            <div class = "panel-bienvenida">
                <div class = "linea-decorativa"></div>
                    <p class = "titulo-biblioteca">BIBLIOTECA DEL LECTOR</p>
                        <h2 class = "titulo-panel">Panel de gestión Activo</h2>
                    <p class = "texto-bienvenida">Seleccioná una acción en el menú <br> para comenzar a operar el sistema.</p>
                <div class = "linea-decorativa"></div>
            </div>`
    );
}

function mostrarEstadoVacio(mensaje) {

    mostrarEnVisor(`
    <div style="height:100%; min-height:180px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">

        <div style="width:40px; height:1px; background:#f7df1e; opacity:0.4;"></div>

        <p style="color:#888; font-size:1.00rem; letter-spacing:1px; margin:12px 0;">
            ${mensaje}
        </p>

        <div style="width:40px; height:1px; background:#f7df1e; opacity:0.4;"></div>

    </div>
    `);

}
//busco todos los botones del menú y les agrego un evento click.
//cada boton tiene una accion guardada en data-accion.
//según cuál se presione se ejecuta la función correspondiente del sistema

const botones = document.querySelectorAll('.btn-accion');
botones.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const accion = e.target.getAttribute('data-accion');
        switch (accion) {
            case 'ver':
                retirarLibro();
                break;
            case 'devolver':
                devolverLibro();
                break;
            case 'historial':
                verHistorialMensual();
                break;
            case 'multas':
                verMultasPendientes();
                break;
            case 'confirmar':
                procesarRetiro();
                break;
        }
    });
});

//al iniciar la página se muestra el mensaje de bienvenida en el visor
mostrarMensajeBienvenida();