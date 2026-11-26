/* ==========================================================================
   VEKTOR 360 - SCRIPT PRINCIPAL
   ========================================================================== */

let usuarioActivo = null;       // Usuario que inicio sesion
let moduloActual = 'dashboard';   // Vista actualmente abierta
let editandoId = null;          // Clave o ID al editar
let historialDeshacer = [];    // Copias anteriores para deshacer
let modoOscuro = false;         // Estado del tema visual

const RUTA_BANNER = 'img/banner.png';

// Modulos visibles segun el campo "cargo" del usuario
const MODULOS_POR_CARGO = {
    'administrador': ['dashboard', 'vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita', 'reportes', 'sql-info'],
    'admin.': ['dashboard', 'vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita', 'reportes', 'sql-info'],
    'encargado de taller': ['dashboard', 'vehiculos', 'repuestos', 'incidentes', 'trabajan'],
    'jefa de logística': ['dashboard', 'vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita', 'reportes'],
    'gerente de logística': ['dashboard', 'vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita', 'reportes'],
    'chofer': ['dashboard', 'vehiculos', 'incidentes']
};

// Modulos donde el usuario puede crear/editar/borrar segun su cargo
const EDICION_POR_CARGO = {
    'administrador': ['vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita'],
    'admin.': ['vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita'],
    'encargado de taller': ['vehiculos', 'repuestos', 'incidentes', 'trabajan'],
    'jefa de logística': ['vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita'],
    'gerente de logística': ['vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita'],
    'chofer': ['incidentes'] // Solo puede registrar/gestionar incidentes
};

// Datos iniciales en memoria (se sincronizan con PHP cuando existen los endpoints)
const datos = {
    usuario: [
        { id_usuarios: 1, DNI: '35489123', nombre: 'Administrador Vektor', cargo: 'Administrador', email: 'admin@vektor360.com', contraseña: 'P4$$W0RD' },
        { id_usuarios: 2, DNI: '28994112', nombre: 'Esteban Dominguez', cargo: 'Encargado de Taller', email: 'edtaller@vektor360.com', contraseña: 'P4$$W0RD' },
        { id_usuarios: 3, DNI: '32115488', nombre: 'Mariana Gomez', cargo: 'Jefa de Logística', email: 'mgomez@vektor360.com', contraseña: 'P4$$W0RD' },
        { id_usuarios: 3, DNI: '47888362', nombre: 'Benjamín Widman', cargo: 'ADMIN.', email: 'bwidman@vektor360.com', contraseña: 'P4$$W0RD' },
        { id_usuarios: 5, DNI: '30456789', nombre: 'Lucas Fernandez', cargo: 'Chofer', email: 'lfernandez@vektor360.com', contraseña: 'P4$$W0RD' }
    ],
    chofer: [
        { nro_legajo: 101, licencia: 'B1-998822', id_usuarios: 1 },
        { nro_legajo: 102, licencia: 'E2-443322', id_usuarios: 2 },
        { nro_legajo: 111, licencia: 'E2-774411', id_usuarios: 5 }
    ],
    vehiculos: [],
    proveedor: [
        { id_proveedor: 1, razon_social: 'Repuestos del Litoral S.A.', telefono: '011-4555-1234', email: 'ventas@litoralsat.com' },
        { id_proveedor: 2, razon_social: 'Frenos y Partes Norte', telefono: '0341-4888-9999', email: 'contacto@frenosnorte.com' }
    ],
    repuestos: [
        { cod_repuesto: 'REP-001', Stock: 15, Stock_minimo: 5, Costo_unitario: 12500.00, id_usuarios: 2 },
        { cod_repuesto: 'REP-002', Stock: 3, Stock_minimo: 8, Costo_unitario: 45000.50, id_usuarios: 2 },
        { cod_repuesto: 'REP-003', Stock: 25, Stock_minimo: 10, Costo_unitario: 3200.00, id_usuarios: 2 }
    ],
    incidentes: [],
    trabajan: [
        { id_trabajan: 1, id_incidentes: 2, cod_repuesto: 'REP-002', id_usuarios: 2, fecha: '2026-10-26 10:00:00', cantidad: 1 }
    ],
    solicita: [
        { id_solicita: 1, id_proveedor: 2, cod_repuesto: 'REP-002', id_usuarios: 2, fecha: '2026-10-27 09:30:00', cantidad: 10, estado: 'Pendiente' }
    ]
};

function normalizarCargo() {
    return String(usuarioActivo?.cargo || '').toLowerCase().trim();
}

function puedeVerModulo(mod) {
    if (!usuarioActivo) return false;
    const lista = MODULOS_POR_CARGO[normalizarCargo()] || ['dashboard'];
    return lista.includes(mod);
}

function puedeEditarModulo(mod = moduloActual) {
    if (!usuarioActivo) return false;
    const lista = EDICION_POR_CARGO[normalizarCargo()] || [];
    return lista.includes(mod);
}

function aplicarPermisosEnPantalla() {
    // Filtra items del menu lateral segun rango
    document.querySelectorAll('.lista-lateral li').forEach(li => {
        const mod = li.getAttribute('data-mod');
        li.classList.toggle('oculto', !puedeVerModulo(mod));
    });

    // Oculta seccion Gerencia si no ve reportes ni sql-info
    const seccionGerencia = document.getElementById('seccion-gerencia');
    if (seccionGerencia) {
        seccionGerencia.classList.toggle('oculto', !puedeVerModulo('reportes') && !puedeVerModulo('sql-info'));
    }

    // Oculta menus superiores de Inventario o Informes si no aplica
    document.getElementById('menu-grupo-inventario')?.classList.toggle('oculto', !puedeVerModulo('repuestos'));
    document.getElementById('menu-grupo-informes')?.classList.toggle('oculto', !puedeVerModulo('reportes'));
}

function actualizarBotonesEdicion() {
    const habilitado = puedeEditarModulo(moduloActual);
    document.getElementById('boton-agregar-registro')?.classList.toggle('oculto', !habilitado);
    document.getElementById('boton-barra-nuevo')?.classList.toggle('oculto', !habilitado);
    document.getElementById('menu-nuevo-reg')?.classList.toggle('oculto', !habilitado);
}

function alternarBarraLateral() {
    document.getElementById('barra-lateral')?.classList.toggle('contraida');
}

// ==================== MENUS DESPLEGABLES ====================
function alternarMenuDesplegable(idMenu) {
    const destino = document.getElementById(idMenu);
    const yaAbierto = destino && !destino.classList.contains('oculto');
    cerrarMenus();
    if (destino && !yaAbierto) destino.classList.remove('oculto');
}

function cerrarMenus() {
    document.querySelectorAll('.panel-desplegable').forEach(panel => panel.classList.add('oculto'));
}

document.addEventListener('click', (evento) => {
    if (!evento.target.closest('.menu-desplegable')) cerrarMenus();
});

// ==================== TEMA OSCURO / CLARO ====================
function alternarTema() {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('tema-oscuro', modoOscuro);
    const botonTema = document.getElementById('boton-menu-tema');
    if (botonTema) botonTema.textContent = modoOscuro ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro';
}

// ==================== HISTORIAL DESHACER ====================
function guardarCopiaEstado() {
    historialDeshacer.push(JSON.stringify(datos));
    if (historialDeshacer.length > 20) historialDeshacer.shift();
}

function deshacerCambio() {
    if (historialDeshacer.length === 0) return alert('No hay cambios recientes para deshacer.');
    Object.assign(datos, JSON.parse(historialDeshacer.pop()));
    renderizarModulo();
    alert('Se deshizo el último cambio.');
}

setInterval(() => {
    const reloj = document.getElementById('estado-reloj');
    if (reloj) reloj.textContent = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
}, 1000);

// ==================== INICIO DE SESION ====================
async function iniciarSesion() {
    const correo = document.getElementById('correo-ingreso').value.trim(); // Toma email del input
    const clave = document.getElementById('clave-ingreso').value.trim(); // Toma clave del input
    const cajaError = document.getElementById('error-ingreso');

    let usuario = null;

    try {
        // Consulta directa a MySQL vía PHP
        const resp = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: correo, contraseña: clave })
        });
        const json = await resp.json();
        if (resp.ok && json.status === 'ok' && json.usuario) {
            usuario = json.usuario; // Usuario validado desde la BD
        }
    } catch (e) {
        // Respaldo local si se abre sin servidor PHP activo
        usuario = datos.usuario.find(u => u.email === correo && u.contraseña === clave) || null;
    }

    if (!usuario) { // Si falló la validación
        cajaError.classList.remove('oculto');
        return;
    }

    cajaError.classList.add('oculto'); // Limpia error previo
    usuarioActivo = usuario; // Guarda usuario y su cargo para permisos

    document.getElementById('capa-ingreso').classList.add('oculto'); // Oculta pantalla de login
    document.getElementById('ventana-aplicacion').classList.remove('oculto'); // Muestra el sistema
    document.getElementById('etiqueta-usuario').textContent = `Usuario: ${usuario.nombre} (${usuario.cargo})`;
    document.getElementById('estado-rol').textContent = `Rol Activo: ${usuario.cargo}`;

    aplicarPermisosEnPantalla(); // Aplica módulos visibles según el cargo
    cargarDatosDesdePHP(); // Sincroniza vehículos e incidentes
    cambiarModulo('dashboard');
}

function cerrarSesion() {
    usuarioActivo = null;
    document.getElementById('ventana-aplicacion').classList.add('oculto');
    document.getElementById('capa-ingreso').classList.remove('oculto');
}

// ==================== CONEXION CON PHP ====================
async function cargarDatosDesdePHP() {
    try {
        const respVeh = await fetch('api/vehiculos.php');
        const jsonVeh = await respVeh.json();
        if (jsonVeh.status === 'ok' && Array.isArray(jsonVeh.data)) datos.vehiculos = jsonVeh.data;

        const respInc = await fetch('api/reporte_incidentes.php');
        const jsonInc = await respInc.json();
        if (jsonInc.status === 'ok' && Array.isArray(jsonInc.data)) datos.incidentes = jsonInc.data;
    } catch (e) {}
    renderizarModulo();
}

// ==================== NAVEGACION Y FILTROS ====================
function cambiarModulo(mod, filtroInicial = '') {
    if (!puedeVerModulo(mod)) mod = 'dashboard'; // Bloquea modulos fuera del rango
    moduloActual = mod;
    editandoId = null;

    document.querySelectorAll('.lista-lateral li').forEach(li => {
        li.classList.toggle('activo', li.getAttribute('data-mod') === mod);
    });

    const areaContenido = document.getElementById('area-contenido');
    const encabezadoMod = document.getElementById('encabezado-modulo');
    const barraFiltros = document.getElementById('barra-filtros');
    const resumenInferior = document.getElementById('resumen-inferior');

    const esDashboard = mod === 'dashboard';
    const esPantallaSimple = mod === 'reportes' || mod === 'sql-info';

    areaContenido.classList.toggle('modo-dashboard', esDashboard);
    encabezadoMod.classList.toggle('oculto', esDashboard);
    barraFiltros.classList.toggle('oculto', esDashboard || esPantallaSimple);
    resumenInferior.classList.toggle('oculto', esDashboard || esPantallaSimple);

    actualizarBotonesEdicion();

    if (!esDashboard && !esPantallaSimple) {
        limpiarFiltros(false);
        if (filtroInicial) {
            const inputBusqueda = document.getElementById('entrada-busqueda');
            if (inputBusqueda) inputBusqueda.value = filtroInicial; // Filtra directo el incidente clickeado
        }
    }
    renderizarModulo();
}

function irAIncidenteDesdeOrden(idIncidente) {
    if (!puedeVerModulo('incidentes')) return alert('Tu rango no tiene acceso a Incidentes.');
    cambiarModulo('incidentes', String(idIncidente)); // Salta a incidentes filtrando por ese ID
}

function limpiarFiltros(rerender = true) {
    const busqueda = document.getElementById('entrada-busqueda');
    const estado = document.getElementById('filtro-estado');
    if (busqueda) busqueda.value = '';
    if (estado) estado.value = 'TODOS';
    if (rerender) renderizarModulo();
}

function enfocarBuscador() {
    if (['dashboard', 'reportes', 'sql-info'].includes(moduloActual)) cambiarModulo('vehiculos');
    document.getElementById('entrada-busqueda')?.focus();
}

function filtrarTablaActual() {
    renderizarModulo();
}

// ==================== EXPORTAR A EXCEL (.xls) ====================
function exportarExcel(tabla) {
    const tablas = {
        vehiculos: [['Patente', 'Marca', 'Modelo', 'Año', 'KM Actuales', 'Estado'], ...datos.vehiculos.map(v => [v.patente, v.marca, v.modelo, v.año, v.km_actuales, v.Estado])],
        repuestos: [['Codigo', 'Stock', 'Stock Minimo', 'Costo Unitario'], ...datos.repuestos.map(r => [r.cod_repuesto, r.Stock, r.Stock_minimo, r.Costo_unitario])],
        incidentes: [['ID', 'Fecha', 'Patente', 'Legajo', 'Lugar', 'Detalles', 'Estado'], ...datos.incidentes.map(i => [i.id_incidentes, i.fecha, i.patente_id, i.nro_legajo_id, i.lugar, i.detalles, i.Estado])],
        choferes: [['Nro Legajo', 'Licencia', 'ID Usuario'], ...datos.chofer.map(c => [c.nro_legajo, c.licencia, c.id_usuarios || ''])]
    };
    const filas = tablas[tabla];
    if (!filas) return;

    const escapar = val => String(val ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tablaHtml = `<table border="1">${filas.map(fila => `<tr>${fila.map(celda => `<td>${escapar(celda)}</td>`).join('')}</tr>`).join('')}</table>`;
    const blob = new Blob(['\uFEFF' + tablaHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    descargarBlob(blob, `vektor360_${tabla}.xls`);
}

// ==================== GENERAR INFORMES (.txt) ====================
function descargarInformeTxt(tipo) {
    let texto = `VEKTOR 360 - INFORME (${tipo.toUpperCase()})\nFecha: ${new Date().toLocaleString()}\n\n`;

    if (tipo === 'general') {
        texto += `Vehiculos: ${datos.vehiculos.length} | Choferes: ${datos.chofer.length} | Repuestos: ${datos.repuestos.length} | Incidentes: ${datos.incidentes.length}\n\n`;
        datos.vehiculos.forEach(v => {
            texto += `* ${v.patente} | ${v.marca} ${v.modelo} (${v.año}) | ${Number(v.km_actuales).toLocaleString()} km | ${v.Estado}\n`;
        });
    } else if (tipo === 'stock') {
        datos.repuestos.forEach(r => {
            const alerta = Number(r.Stock) <= Number(r.Stock_minimo) ? ' [STOCK BAJO]' : ' [OK]';
            texto += `* ${r.cod_repuesto} | Stock: ${r.Stock} (Min: ${r.Stock_minimo}) | $${Number(r.Costo_unitario).toLocaleString()}${alerta}\n`;
        });
    } else if (tipo === 'incidentes') {
        datos.incidentes.forEach(i => {
            texto += `* #${i.id_incidentes} | ${i.fecha} | ${i.patente_id} | ${i.lugar} | ${i.Estado} -> ${i.detalles}\n`;
        });
    }

    descargarBlob(new Blob([texto], { type: 'text/plain;charset=utf-8;' }), `informe_vektor360_${tipo}.txt`);
}

function descargarBlob(blob, nombreArchivo) {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
}

// ==================== RENDERIZADO ====================
function leerEstado(item) {
    return (item.Estado ?? item.estado ?? '').toLowerCase();
}

function renderizarModulo() {
    const vista = document.getElementById('vista-dinamica');
    const titulo = document.getElementById('titulo-modulo');
    const etiqueta = document.getElementById('etiqueta-info-modulo');
    const resumen = document.getElementById('resumen-inferior');
    etiqueta.textContent = '';

    const textoBuscado = (document.getElementById('entrada-busqueda')?.value || '').toLowerCase();
    const estadoFiltro = (document.getElementById('filtro-estado')?.value || 'TODOS').toLowerCase();
    const pasaEstado = item => estadoFiltro === 'todos' || leerEstado(item) === estadoFiltro;
    const editables = puedeEditarModulo(moduloActual);

    if (moduloActual === 'dashboard') {
        const stockBajo = datos.repuestos.filter(r => Number(r.Stock) <= Number(r.Stock_minimo)).length;
        const incAbiertos = datos.incidentes.filter(i => !['resuelto', 'solucionado'].includes(leerEstado(i))).length;

        const accesos = [
            ['vehiculos', `VEHÍCULOS (${datos.vehiculos.length})`, 'Unidades y patentes'],
            ['choferes', `CHOFERES (${datos.chofer.length})`, 'Legajos y licencias'],
            ['usuarios', `USUARIOS (${datos.usuario.length})`, 'Cuentas y roles'],
            ['repuestos', `REPUESTOS (${datos.repuestos.length})`, 'Inventario y stock'],
            ['trabajan', `ÓRDENES TALLER (${datos.trabajan.length})`, 'Reparaciones e insumos'],
            ['solicita', `SOLICITUDES COMPRA (${datos.solicita.length})`, 'Pedidos a proveedores']
        ].filter(([mod]) => puedeVerModulo(mod)); // Solo muestra accesos habilitados para el cargo

        vista.innerHTML = `
            <div class="tablero-dashboard">
                <div class="banner-dashboard">
                    <img src="${RUTA_BANNER}" alt="Banner" onerror="this.style.display='none'">
                </div>
                <h1 class="titulo-dashboard">VEKTOR <span>360</span></h1>
                <div class="grilla-superior-dashboard">
                    ${puedeVerModulo('vehiculos') ? `
                    <div class="tarjeta-dashboard" onclick="cambiarModulo('vehiculos')">
                        <div><h3>Flota</h3><p>${datos.vehiculos.length} unidades registradas en el sistema.</p></div>
                        <span class="flecha-dashboard">↗</span>
                    </div>` : ''}
                    ${puedeVerModulo('incidentes') ? `
                    <div class="tarjeta-dashboard" onclick="cambiarModulo('incidentes')">
                        <div><h3>Incidentes y Stock</h3><p>${incAbiertos} incidentes abiertos y ${stockBajo} alertas de stock.</p></div>
                        <span class="flecha-dashboard">↗</span>
                    </div>` : ''}
                </div>
                <div class="subtitulo-dashboard">Accesos Rápidos</div>
                <div class="grilla-accesos-dashboard">
                    ${accesos.map(([mod, tit, desc]) => `
                        <div class="tarjeta-acceso-dashboard" onclick="cambiarModulo('${mod}')">
                            <h4>${tit}</h4><p>${desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        return;
    }

    if (moduloActual === 'vehiculos') {
        titulo.textContent = 'Gestión de Vehículos';
        const lista = datos.vehiculos.filter(v => pasaEstado(v) && `${v.patente} ${v.marca} ${v.modelo}`.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>Patente</th><th>Marca</th><th>Modelo</th><th>Año</th><th>KM Actuales</th><th>Estado</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(v => `
                    <tr>
                        <td><strong>${v.patente}</strong></td><td>${v.marca}</td><td>${v.modelo}</td><td>${v.año}</td>
                        <td>${Number(v.km_actuales).toLocaleString()} km</td>
                        <td><span class="etiqueta-estado">${v.Estado}</span></td>
                        ${editables ? `<td>
                            <button class="boton-chico boton-editar" onclick="abrirModalEditar('${v.patente}')">Editar</button>
                            <button class="boton-chico boton-eliminar" onclick="eliminarRegistro('${v.patente}')">Baja</button>
                        </td>` : ''}
                    </tr>`).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Total Unidades:</span><strong>${datos.vehiculos.length}</strong></div>`;
    } else if (moduloActual === 'choferes') {
        titulo.textContent = 'Gestión de Choferes';
        const lista = datos.chofer.filter(c => `${c.nro_legajo} ${c.licencia}`.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>Nro. Legajo</th><th>Licencia</th><th>Usuario Asociado</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(c => {
                    const usr = datos.usuario.find(u => u.id_usuarios == c.id_usuarios);
                    return `<tr>
                        <td><strong>#${c.nro_legajo}</strong></td><td>${c.licencia}</td><td>${usr ? usr.nombre : 'Sin usuario'}</td>
                        ${editables ? `<td>
                            <button class="boton-chico boton-editar" onclick="abrirModalEditar(${c.nro_legajo})">Editar</button>
                            <button class="boton-chico boton-eliminar" onclick="eliminarRegistro(${c.nro_legajo})">Baja</button>
                        </td>` : ''}
                    </tr>`;
                }).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Total Choferes:</span><strong>${datos.chofer.length}</strong></div>`;
    } else if (moduloActual === 'usuarios') {
        titulo.textContent = 'Gestión de Usuarios';
        const lista = datos.usuario.filter(u => `${u.nombre} ${u.email} ${u.cargo}`.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>ID</th><th>DNI</th><th>Nombre</th><th>Cargo</th><th>Email</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(u => `<tr>
                    <td><strong>#${u.id_usuarios}</strong></td><td>${u.DNI}</td><td>${u.nombre}</td>
                    <td><span class="etiqueta-estado">${u.cargo}</span></td><td>${u.email}</td>
                    ${editables ? `<td>
                        <button class="boton-chico boton-editar" onclick="abrirModalEditar(${u.id_usuarios})">Editar</button>
                        <button class="boton-chico boton-eliminar" onclick="eliminarRegistro(${u.id_usuarios})">Baja</button>
                    </td>` : ''}
                </tr>`).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Total Usuarios:</span><strong>${datos.usuario.length}</strong></div>`;
    } else if (moduloActual === 'proveedores') {
        titulo.textContent = 'Gestión de Proveedores';
        const lista = datos.proveedor.filter(p => p.razon_social.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>ID</th><th>Razón Social</th><th>Teléfono</th><th>Email</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(p => `<tr>
                    <td><strong>#${p.id_proveedor}</strong></td><td>${p.razon_social}</td><td>${p.telefono}</td><td>${p.email}</td>
                    ${editables ? `<td>
                        <button class="boton-chico boton-editar" onclick="abrirModalEditar(${p.id_proveedor})">Editar</button>
                        <button class="boton-chico boton-eliminar" onclick="eliminarRegistro(${p.id_proveedor})">Baja</button>
                    </td>` : ''}
                </tr>`).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Total Proveedores:</span><strong>${datos.proveedor.length}</strong></div>`;
    } else if (moduloActual === 'repuestos') {
        titulo.textContent = 'Control de Stock y Repuestos';
        const lista = datos.repuestos.filter(r => r.cod_repuesto.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>Código</th><th>Stock</th><th>Stock Mínimo</th><th>Costo Unitario</th><th>Estado</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(r => {
                    const bajo = Number(r.Stock) <= Number(r.Stock_minimo);
                    return `<tr>
                        <td><strong>${r.cod_repuesto}</strong></td><td><strong>${r.Stock}</strong></td><td>${r.Stock_minimo}</td>
                        <td>$${Number(r.Costo_unitario).toLocaleString()}</td>
                        <td><span class="etiqueta-estado ${bajo ? 'etiqueta-alerta' : ''}">${bajo ? 'STOCK BAJO' : 'Normal'}</span></td>
                        ${editables ? `<td>
                            <button class="boton-chico boton-editar" onclick="abrirModalEditar('${r.cod_repuesto}')">Ajustar</button>
                            <button class="boton-chico boton-eliminar" onclick="eliminarRegistro('${r.cod_repuesto}')">Baja</button>
                        </td>` : ''}
                    </tr>`;
                }).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Ítems en Stock:</span><strong>${datos.repuestos.length}</strong></div>`;
    } else if (moduloActual === 'incidentes') {
        titulo.textContent = 'Registro de Incidentes';
        const lista = datos.incidentes.filter(i => pasaEstado(i) && `${i.id_incidentes} ${i.patente_id} ${i.detalles} ${i.lugar}`.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>ID</th><th>Fecha</th><th>Patente</th><th>Legajo</th><th>Lugar</th><th>Detalles</th><th>Estado</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(i => `<tr>
                    <td><strong>#${i.id_incidentes}</strong></td><td>${i.fecha}</td><td><strong>${i.patente_id}</strong></td>
                    <td>#${i.nro_legajo_id}</td><td>${i.lugar}</td><td>${i.detalles}</td>
                    <td><span class="etiqueta-estado">${i.Estado}</span></td>
                    ${editables ? `<td>
                        <button class="boton-chico boton-editar" onclick="abrirModalEditar(${i.id_incidentes})">Estado</button>
                        <button class="boton-chico boton-eliminar" onclick="eliminarRegistro(${i.id_incidentes})">Eliminar</button>
                    </td>` : ''}
                </tr>`).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Total Incidentes:</span><strong>${datos.incidentes.length}</strong></div>`;
    } else if (moduloActual === 'trabajan') {
        titulo.textContent = 'Órdenes de Taller';
        const lista = datos.trabajan.filter(t => `${t.cod_repuesto} ${t.id_incidentes}`.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>ID Orden</th><th>Incidente</th><th>Repuesto</th><th>Cantidad</th><th>Costo</th><th>Fecha</th>${editables ? '<th>Acción</th>' : ''}</tr></thead>
                <tbody>${lista.map(t => {
                    const rep = datos.repuestos.find(r => r.cod_repuesto === t.cod_repuesto);
                    const total = rep ? Number(rep.Costo_unitario) * Number(t.cantidad) : 0;
                    const inc = datos.incidentes.find(i => i.id_incidentes == t.id_incidentes);
                    const etiquetaInc = inc ? `#${t.id_incidentes} (${inc.patente_id})` : `#${t.id_incidentes}`;
                    return `<tr>
                        <td><strong>OT-${t.id_trabajan}</strong></td>
                        <td><button type="button" class="enlace-tabla" onclick="irAIncidenteDesdeOrden(${t.id_incidentes})" title="Ver incidente en su tabla">${etiquetaInc}</button></td>
                        <td><strong>${t.cod_repuesto}</strong></td>
                        <td>${t.cantidad} u.</td><td>$${total.toLocaleString()}</td><td>${t.fecha}</td>
                        ${editables ? `<td><button class="boton-chico boton-eliminar" onclick="eliminarRegistro(${t.id_trabajan})">Eliminar</button></td>` : ''}
                    </tr>`;
                }).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Órdenes de Taller:</span><strong>${datos.trabajan.length}</strong></div>`;
    } else if (moduloActual === 'solicita') {
        titulo.textContent = 'Solicitudes de Compra';
        const lista = datos.solicita.filter(s => pasaEstado(s) && s.cod_repuesto.toLowerCase().includes(textoBuscado));
        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>ID</th><th>Proveedor</th><th>Repuesto</th><th>Cantidad</th><th>Fecha</th><th>Estado</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(s => {
                    const prov = datos.proveedor.find(p => p.id_proveedor == s.id_proveedor);
                    return `<tr>
                        <td><strong>SOL-${s.id_solicita}</strong></td>
                        <td>${prov ? prov.razon_social : `Proveedor #${s.id_proveedor}`}</td>
                        <td><strong>${s.cod_repuesto}</strong></td><td>${s.cantidad} u.</td><td>${s.fecha}</td>
                        <td><span class="etiqueta-estado">${s.estado}</span></td>
                        ${editables ? `<td>
                            ${s.estado !== 'Recibido' ? `<button class="boton-chico boton-editar" onclick="marcarSolicitudRecibida(${s.id_solicita})">Recibir (+Stock)</button>` : ''}
                            <button class="boton-chico boton-eliminar" onclick="eliminarRegistro(${s.id_solicita})">Eliminar</button>
                        </td>` : ''}
                    </tr>`;
                }).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Total Solicitudes:</span><strong>${datos.solicita.length}</strong></div>`;
    } else if (moduloActual === 'reportes') {
        titulo.textContent = 'Costo Por Kilómetro (CPK)';
        const opciones = datos.vehiculos.map(v => `<option value="${v.patente}">${v.patente} - ${v.marca} ${v.modelo}</option>`).join('');
        vista.innerHTML = `
            <div class="contenedor-reporte-cpk">
                <div class="barra-filtros">
                    <div class="grupo-campo"><label for="cpk-patente">Vehículo:</label><select id="cpk-patente">${opciones}</select></div>
                    <button class="boton-bordo" onclick="calcularCPK()">Calcular CPK</button>
                </div>
                <div id="cpk-res" class="caja-cpk"></div>
            </div>`;
    } else if (moduloActual === 'sql-info') {
        titulo.textContent = 'Base de Datos';
        etiqueta.textContent = 'vektor360.2';
        vista.innerHTML = `<div class="contenedor-reporte-cpk"><h3>Base de datos: vektor360.2</h3><p>Conexión mediante scripts PHP en api/vehiculos.php y api/reporte_incidentes.php.</p></div>`;
    }
}

function calcularCPK() {
    const patente = document.getElementById('cpk-patente').value;
    const veh = datos.vehiculos.find(v => v.patente === patente);
    if (!veh || !Number(veh.km_actuales)) return;
    const costoTotal = Number(veh.km_actuales) * 0.45;
    const cpk = costoTotal / Number(veh.km_actuales);
    document.getElementById('cpk-res').innerHTML = `
        <h4>Resultado CPK: ${veh.patente} (${veh.marca} ${veh.modelo})</h4>
        <p><strong>Kilometraje Actual:</strong> ${Number(veh.km_actuales).toLocaleString()} km</p>
        <p><strong>Costo Operativo Estimado:</strong> $${costoTotal.toLocaleString()}</p>
        <p class="cpk-destacado"><strong>Costo Por Kilómetro: $${cpk.toFixed(4)} / km</strong></p>`;
}

// ==================== MODAL ABM ====================
function abrirModalNuevo() {
    if (!puedeEditarModulo(moduloActual)) return alert('Tu rango no tiene permiso para crear en este módulo.');
    if (['dashboard', 'reportes', 'sql-info'].includes(moduloActual)) cambiarModulo('vehiculos');
    editandoId = null;
    abrirFormulario(null);
}

function abrirModalEditar(id) {
    if (!puedeEditarModulo(moduloActual)) return alert('Tu rango no tiene permiso para editar en este módulo.');
    editandoId = id;
    const items = {
        vehiculos: datos.vehiculos.find(x => x.patente === id),
        choferes: datos.chofer.find(x => x.nro_legajo == id),
        usuarios: datos.usuario.find(x => x.id_usuarios == id),
        proveedores: datos.proveedor.find(x => x.id_proveedor == id),
        repuestos: datos.repuestos.find(x => x.cod_repuesto === id),
        incidentes: datos.incidentes.find(x => x.id_incidentes == id)
    };
    abrirFormulario(items[moduloActual] || null);
}

function abrirFormulario(item) {
    document.getElementById('modal-abm').classList.remove('oculto');
    document.getElementById('error-modal').classList.add('oculto');
    const campos = document.getElementById('campos-modal');
    const tituloModal = document.getElementById('titulo-modal');

    if (moduloActual === 'vehiculos') {
        tituloModal.textContent = item ? `Editar Vehículo ${item.patente}` : 'Nuevo Vehículo';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Patente:</label><input type="text" id="m-pat" value="${item?.patente || ''}" ${item ? 'disabled' : ''} required></div>
            <div class="grupo-campo"><label>Marca:</label><input type="text" id="m-marca" value="${item?.marca || ''}" required></div>
            <div class="grupo-campo"><label>Modelo:</label><input type="text" id="m-modelo" value="${item?.modelo || ''}" required></div>
            <div class="grupo-campo"><label>Año:</label><input type="number" id="m-anio" value="${item?.año || 2024}" required></div>
            <div class="grupo-campo"><label>KM Actuales:</label><input type="number" id="m-km" value="${item?.km_actuales || 0}" required></div>
            <div class="grupo-campo"><label>Estado:</label>
                <select id="m-est">${['Disponible', 'En Ruta', 'En Taller', 'Fuera de Servicio'].map(e => `<option ${item?.Estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select>
            </div>`;
    } else if (moduloActual === 'choferes') {
        tituloModal.textContent = item ? `Editar Chofer #${item.nro_legajo}` : 'Nuevo Chofer';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Nro. Legajo:</label><input type="number" id="m-leg" value="${item?.nro_legajo || 103}" ${item ? 'disabled' : ''} required></div>
            <div class="grupo-campo"><label>Licencia:</label><input type="text" id="m-lic" value="${item?.licencia || ''}" required></div>
            <div class="grupo-campo"><label>Usuario:</label>
                <select id="m-usr"><option value="">-- Ninguno --</option>${datos.usuario.map(u => `<option value="${u.id_usuarios}" ${item?.id_usuarios == u.id_usuarios ? 'selected' : ''}>${u.nombre}</option>`).join('')}</select>
            </div>`;
    } else if (moduloActual === 'usuarios') {
        tituloModal.textContent = item ? `Editar Usuario #${item.id_usuarios}` : 'Nuevo Usuario';
        campos.innerHTML = `
            <div class="grupo-campo"><label>DNI:</label><input type="text" id="m-dni" value="${item?.DNI || ''}" required></div>
            <div class="grupo-campo"><label>Nombre:</label><input type="text" id="m-nom" value="${item?.nombre || ''}" required></div>
            <div class="grupo-campo"><label>Cargo:</label>
                <select id="m-cargo">${['Administrador', 'Encargado de Taller', 'Chofer', 'Gerente de Logística'].map(c => `<option ${item?.cargo === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
            </div>
            <div class="grupo-campo"><label>Email:</label><input type="email" id="m-email" value="${item?.email || ''}" required></div>
            <div class="grupo-campo"><label>Contraseña:</label><input type="text" id="m-pass" value="${item?.contraseña || 'P4$$W0RD'}" required></div>`;
    } else if (moduloActual === 'proveedores') {
        tituloModal.textContent = item ? 'Editar Proveedor' : 'Nuevo Proveedor';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Razón Social:</label><input type="text" id="m-razon" value="${item?.razon_social || ''}" required></div>
            <div class="grupo-campo"><label>Teléfono:</label><input type="text" id="m-tel" value="${item?.telefono || ''}" required></div>
            <div class="grupo-campo"><label>Email:</label><input type="email" id="m-email" value="${item?.email || ''}" required></div>`;
    } else if (moduloActual === 'repuestos') {
        tituloModal.textContent = item ? `Ajustar Repuesto ${item.cod_repuesto}` : 'Nuevo Repuesto';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Código Repuesto:</label><input type="text" id="m-cod" value="${item?.cod_repuesto || 'REP-004'}" ${item ? 'disabled' : ''} required></div>
            <div class="grupo-campo"><label>Stock Físico:</label><input type="number" id="m-stock" value="${item?.Stock ?? 10}" required></div>
            <div class="grupo-campo"><label>Stock Mínimo:</label><input type="number" id="m-min" value="${item?.Stock_minimo ?? 5}" required></div>
            <div class="grupo-campo"><label>Costo Unitario ($):</label><input type="number" step="0.01" id="m-costo" value="${item?.Costo_unitario ?? 8500}" required></div>`;
    } else if (moduloActual === 'incidentes') {
        tituloModal.textContent = item ? `Actualizar Incidente #${item.id_incidentes}` : 'Registrar Incidente';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Patente Vehículo:</label><select id="m-pat">${datos.vehiculos.map(v => `<option value="${v.patente}" ${item?.patente_id === v.patente ? 'selected' : ''}>${v.patente} (${v.Estado})</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Legajo Chofer:</label><select id="m-leg">${datos.chofer.map(c => `<option value="${c.nro_legajo}" ${item?.nro_legajo_id == c.nro_legajo ? 'selected' : ''}>Legajo #${c.nro_legajo}</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Lugar:</label><input type="text" id="m-lugar" value="${item?.lugar || ''}" required></div>
            <div class="grupo-campo"><label>Detalles:</label><textarea id="m-det" rows="3" required>${item?.detalles || ''}</textarea></div>
            <div class="grupo-campo"><label>Estado:</label>
                <select id="m-est">${['Pendiente', 'En Reparación', 'Solucionado'].map(e => `<option ${item?.Estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select>
            </div>`;
    } else if (moduloActual === 'trabajan') {
        tituloModal.textContent = 'Nueva Orden de Taller';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Incidente:</label><select id="m-inc">${datos.incidentes.map(i => `<option value="${i.id_incidentes}">#${i.id_incidentes} - ${i.patente_id}</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Repuesto:</label><select id="m-rep">${datos.repuestos.map(r => `<option value="${r.cod_repuesto}">${r.cod_repuesto} (Stock: ${r.Stock})</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Cantidad:</label><input type="number" id="m-cant" value="1" min="1" required></div>`;
    } else if (moduloActual === 'solicita') {
        tituloModal.textContent = 'Nueva Solicitud de Compra';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Proveedor:</label><select id="m-prov">${datos.proveedor.map(p => `<option value="${p.id_proveedor}">${p.razon_social}</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Repuesto:</label><select id="m-rep">${datos.repuestos.map(r => `<option value="${r.cod_repuesto}">${r.cod_repuesto} (Stock: ${r.Stock})</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Cantidad:</label><input type="number" id="m-cant" value="10" min="1" required></div>`;
    }
}

function cerrarModal() {
    document.getElementById('modal-abm').classList.add('oculto');
}

function guardarEnArreglo(lista, obj, coincide) {
    const idx = lista.findIndex(coincide);
    if (idx >= 0) lista[idx] = obj;
    else lista.push(obj);
}

async function guardarRegistro(evento) {
    evento.preventDefault();
    if (!puedeEditarModulo(moduloActual)) return;

    const cajaError = document.getElementById('error-modal');
    cajaError.classList.add('oculto');
    guardarCopiaEstado();

    const fechaHora = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const idUsuario = usuarioActivo?.id_usuarios || 1;

    if (moduloActual === 'vehiculos') {
        const patente = (editandoId || document.getElementById('m-pat').value).toUpperCase().trim();
        const obj = {
            patente,
            marca: document.getElementById('m-marca').value.trim(),
            modelo: document.getElementById('m-modelo').value.trim(),
            año: Number(document.getElementById('m-anio').value),
            km_actuales: Number(document.getElementById('m-km').value),
            Estado: document.getElementById('m-est').value
        };
        try { await fetch('api/vehiculos.php', { method: editandoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }); } catch (e) {}
        guardarEnArreglo(datos.vehiculos, obj, v => v.patente === patente);
    } else if (moduloActual === 'choferes') {
        const leg = editandoId || Number(document.getElementById('m-leg').value);
        guardarEnArreglo(datos.chofer, { nro_legajo: leg, licencia: document.getElementById('m-lic').value.trim(), id_usuarios: document.getElementById('m-usr').value || null }, c => c.nro_legajo == leg);
    } else if (moduloActual === 'usuarios') {
        const id = editandoId || (datos.usuario.length + 1);
        guardarEnArreglo(datos.usuario, { id_usuarios: id, DNI: document.getElementById('m-dni').value.trim(), nombre: document.getElementById('m-nom').value.trim(), cargo: document.getElementById('m-cargo').value, email: document.getElementById('m-email').value.trim(), contraseña: document.getElementById('m-pass').value }, u => u.id_usuarios == id);
    } else if (moduloActual === 'proveedores') {
        const id = editandoId || (datos.proveedor.length + 1);
        guardarEnArreglo(datos.proveedor, { id_proveedor: id, razon_social: document.getElementById('m-razon').value.trim(), telefono: document.getElementById('m-tel').value.trim(), email: document.getElementById('m-email').value.trim() }, p => p.id_proveedor == id);
    } else if (moduloActual === 'repuestos') {
        const cod = (editandoId || document.getElementById('m-cod').value).toUpperCase().trim();
        guardarEnArreglo(datos.repuestos, { cod_repuesto: cod, Stock: Number(document.getElementById('m-stock').value), Stock_minimo: Number(document.getElementById('m-min').value), Costo_unitario: Number(document.getElementById('m-costo').value), id_usuarios: idUsuario }, r => r.cod_repuesto === cod);
    } else if (moduloActual === 'incidentes') {
        const id = editandoId || (datos.incidentes.length + 1);
        const obj = { id_incidentes: id, fecha: fechaHora, patente_id: document.getElementById('m-pat').value, nro_legajo_id: Number(document.getElementById('m-leg').value), lugar: document.getElementById('m-lugar').value.trim(), detalles: document.getElementById('m-det').value.trim(), Estado: document.getElementById('m-est').value };
        try { await fetch('api/reporte_incidentes.php', { method: editandoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }); } catch (e) {}
        guardarEnArreglo(datos.incidentes, obj, i => i.id_incidentes == id);
    } else if (moduloActual === 'trabajan') {
        const cod = document.getElementById('m-rep').value;
        const cant = Number(document.getElementById('m-cant').value);
        const rep = datos.repuestos.find(r => r.cod_repuesto === cod);
        if (!rep || cant > Number(rep.Stock)) {
            historialDeshacer.pop();
            cajaError.textContent = `Stock insuficiente (Disponible: ${rep ? rep.Stock : 0}).`;
            cajaError.classList.remove('oculto');
            return;
        }
        rep.Stock = Number(rep.Stock) - cant;
        datos.trabajan.push({ id_trabajan: datos.trabajan.length + 1, id_incidentes: Number(document.getElementById('m-inc').value), cod_repuesto: cod, id_usuarios: idUsuario, fecha: fechaHora, cantidad: cant });
    } else if (moduloActual === 'solicita') {
        datos.solicita.push({ id_solicita: datos.solicita.length + 1, id_proveedor: Number(document.getElementById('m-prov').value), cod_repuesto: document.getElementById('m-rep').value, id_usuarios: idUsuario, fecha: fechaHora, cantidad: Number(document.getElementById('m-cant').value), estado: 'Pendiente' });
    }

    cerrarModal();
    renderizarModulo();
}

function marcarSolicitudRecibida(id) {
    if (!puedeEditarModulo('solicita')) return;
    const sol = datos.solicita.find(s => s.id_solicita == id);
    if (!sol || sol.estado === 'Recibido') return;
    guardarCopiaEstado();
    sol.estado = 'Recibido';
    const rep = datos.repuestos.find(r => r.cod_repuesto === sol.cod_repuesto);
    if (rep) rep.Stock = Number(rep.Stock) + Number(sol.cantidad);
    renderizarModulo();
}

async function eliminarRegistro(id) {
    if (!puedeEditarModulo(moduloActual)) return alert('Tu rango no tiene permiso para eliminar en este módulo.');
    if (!confirm(`¿Confirma eliminar el registro ${id}?`)) return;
    guardarCopiaEstado();

    if (moduloActual === 'vehiculos') {
        try { await fetch(`api/vehiculos.php?patente=${encodeURIComponent(id)}`, { method: 'DELETE' }); } catch (e) {}
        datos.vehiculos = datos.vehiculos.filter(v => v.patente !== id);
    } else if (moduloActual === 'choferes') {
        datos.chofer = datos.chofer.filter(c => c.nro_legajo != id);
    } else if (moduloActual === 'usuarios') {
        datos.usuario = datos.usuario.filter(u => u.id_usuarios != id);
    } else if (moduloActual === 'proveedores') {
        datos.proveedor = datos.proveedor.filter(p => p.id_proveedor != id);
    } else if (moduloActual === 'repuestos') {
        datos.repuestos = datos.repuestos.filter(r => r.cod_repuesto !== id);
    } else if (moduloActual === 'incidentes') {
        try { await fetch(`api/reporte_incidentes.php?id_incidentes=${encodeURIComponent(id)}`, { method: 'DELETE' }); } catch (e) {}
        datos.incidentes = datos.incidentes.filter(i => i.id_incidentes != id);
    } else if (moduloActual === 'trabajan') {
        datos.trabajan = datos.trabajan.filter(t => t.id_trabajan != id);
    } else if (moduloActual === 'solicita') {
        datos.solicita = datos.solicita.filter(s => s.id_solicita != id);
    }

    renderizarModulo();
}