/* ==========================================================================
   VEKTOR 360 - SCRIPT PRINCIPAL
   ========================================================================== */

/* --------------------------------------------------------------------------
   SECCIÓN 1: ESTADO GLOBAL Y MATRIZ DE PERMISOS POR CARGO
   -------------------------------------------------------------------------- */
let usuarioActivo = null;       // Datos del usuario autenticado desde MySQL
let moduloActual = 'dashboard';   // Módulo activo en pantalla
let editandoId = null;          // Clave primaria del registro en edición (null si es alta)
let modoOscuro = false;         // Indica si está activo el tema oscuro

const RUTA_BANNER = 'img/banner.png';
const REQ = '<span class="req">*</span>';

const MODULOS_POR_CARGO = {
    'administrador': ['dashboard', 'vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita', 'reportes', 'sql-info'],
    'admin.': ['dashboard', 'vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita', 'reportes', 'sql-info'],
    'encargado de taller': ['dashboard', 'vehiculos', 'repuestos', 'incidentes', 'trabajan'],
    'jefa de logística': ['dashboard', 'vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita', 'reportes'],
    'gerente de logística': ['dashboard', 'vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita', 'reportes'],
    'chofer': ['dashboard', 'vehiculos', 'incidentes']
};

const EDICION_POR_CARGO = {
    'administrador': ['vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita'],
    'admin.': ['vehiculos', 'choferes', 'usuarios', 'proveedores', 'repuestos', 'incidentes', 'trabajan', 'solicita'],
    'encargado de taller': ['vehiculos', 'repuestos', 'incidentes', 'trabajan'],
    'jefa de logística': ['vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita'],
    'gerente de logística': ['vehiculos', 'choferes', 'proveedores', 'repuestos', 'solicita'],
    'chofer': ['incidentes']
};

const datos = {
    usuario: [],
    chofer: [],
    vehiculos: [],
    proveedor: [],
    repuestos: [],
    incidentes: [],
    trabajan: [],
    solicita: []
};

/* --------------------------------------------------------------------------
   UTILIDADES DE FECHA LOCAL (EVITA CONVERSIÓN A UTC)
   -------------------------------------------------------------------------- */
function obtenerFechaHoraLocalSQL(fecha = new Date()) {
    const pad = n => String(n).padStart(2, '0');
    const anio = fecha.getFullYear();
    const mes = pad(fecha.getMonth() + 1);
    const dia = pad(fecha.getDate());
    const horas = pad(fecha.getHours());
    const minutos = pad(fecha.getMinutes());
    const segundos = pad(fecha.getSeconds());
    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

/* --------------------------------------------------------------------------
   SECCIÓN 2: CONTROL DE ACCESO Y VISIBILIDAD POR RANGO
   -------------------------------------------------------------------------- */
function normalizarCargo() {
    return String(usuarioActivo?.cargo || '').toLowerCase().trim();
}

function puedeVerModulo(mod) {
    if (!usuarioActivo) return false;
    return (MODULOS_POR_CARGO[normalizarCargo()] || ['dashboard']).includes(mod);
}

function puedeEditarModulo(mod = moduloActual) {
    if (!usuarioActivo) return false;
    return (EDICION_POR_CARGO[normalizarCargo()] || []).includes(mod);
}

function aplicarPermisosEnPantalla() {
    document.querySelectorAll('.lista-lateral li').forEach(li => {
        const mod = li.getAttribute('data-mod');
        li.classList.toggle('oculto', !puedeVerModulo(mod));
    });

    const seccionGerencia = document.getElementById('seccion-gerencia');
    if (seccionGerencia) {
        seccionGerencia.classList.toggle('oculto', !puedeVerModulo('reportes') && !puedeVerModulo('sql-info'));
    }

    document.getElementById('menu-grupo-inventario')?.classList.toggle('oculto', !puedeVerModulo('repuestos'));
    document.getElementById('menu-grupo-informes')?.classList.toggle('oculto', !puedeVerModulo('reportes'));
}

function actualizarBotonesEdicion() {
    const habilitado = puedeEditarModulo(moduloActual);
    document.getElementById('boton-agregar-registro')?.classList.toggle('oculto', !habilitado);
    document.getElementById('boton-barra-nuevo')?.classList.toggle('oculto', !habilitado);
    document.getElementById('menu-nuevo-reg')?.classList.toggle('oculto', !habilitado);
}

/* --------------------------------------------------------------------------
   SECCIÓN 3: INTERFAZ, MENÚS, TEMA Y RELOJ
   -------------------------------------------------------------------------- */
function alternarBarraLateral() {
    document.getElementById('barra-lateral')?.classList.toggle('contraida');
}

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

function alternarTema() {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('tema-oscuro', modoOscuro);
    const botonTema = document.getElementById('boton-menu-tema');
    if (botonTema) botonTema.textContent = modoOscuro ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro';
}

setInterval(() => {
    const reloj = document.getElementById('estado-reloj');
    if (reloj) reloj.textContent = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
}, 1000);

/* --------------------------------------------------------------------------
   SECCIÓN 4: AUTENTICACIÓN, PERSISTENCIA DE SESIÓN Y SINCRONIZACIÓN
   -------------------------------------------------------------------------- */
const CLAVE_SESION_STORAGE = 'vektor360_usuario_activo';

function activarInterfazUsuario(usuario) {
    usuarioActivo = usuario;
    sessionStorage.setItem(CLAVE_SESION_STORAGE, JSON.stringify(usuario));

    document.getElementById('capa-ingreso').classList.add('oculto');
    document.getElementById('ventana-aplicacion').classList.remove('oculto');
    document.getElementById('etiqueta-usuario').textContent = `Usuario: ${usuarioActivo.nombre} (${usuarioActivo.cargo})`;
    document.getElementById('estado-rol').textContent = `Rol Activo: ${usuarioActivo.cargo}`;

    aplicarPermisosEnPantalla();
}

async function iniciarSesion() {
    const correo = document.getElementById('correo-ingreso').value.trim();
    const clave = document.getElementById('clave-ingreso').value.trim();
    const cajaError = document.getElementById('error-ingreso');

    try {
        const resp = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email: correo, contraseña: clave })
        });
        const json = await resp.json();

        if (!resp.ok || json.status !== 'ok' || !json.usuario) {
            cajaError.textContent = json.message || 'Credenciales no válidas. Reintente';
            cajaError.classList.remove('oculto');
            return;
        }

        cajaError.classList.add('oculto');
        activarInterfazUsuario(json.usuario);
        await cargarDatosDesdePHP();
        cambiarModulo('dashboard');
    } catch (e) {
        cajaError.textContent = 'No se pudo conectar con el servidor PHP.';
        cajaError.classList.remove('oculto');
    }
}

async function cerrarSesion() {
    try {
        await fetch('api/login.php', { method: 'DELETE', credentials: 'same-origin' });
    } catch (e) {}
    usuarioActivo = null;
    sessionStorage.removeItem(CLAVE_SESION_STORAGE);
    document.getElementById('ventana-aplicacion').classList.add('oculto');
    document.getElementById('capa-ingreso').classList.remove('oculto');
}

async function restaurarSesionAlCargar() {
    const guardado = sessionStorage.getItem(CLAVE_SESION_STORAGE);
    if (!guardado) return;

    try {
        const usuarioGuardado = JSON.parse(guardado);
        if (!usuarioGuardado || !usuarioGuardado.id_usuarios) {
            sessionStorage.removeItem(CLAVE_SESION_STORAGE);
            return;
        }

        // Validamos con el servidor PHP que la sesión siga vigente
        const resp = await fetch('api/login.php', { method: 'GET', credentials: 'same-origin' });
        if (resp.status === 401) {
            sessionStorage.removeItem(CLAVE_SESION_STORAGE);
            return;
        }

        let usuarioFinal = usuarioGuardado;
        if (resp.ok) {
            const json = await resp.json();
            if (json.status === 'ok' && json.usuario) {
                usuarioFinal = json.usuario;
            }
        }

        activarInterfazUsuario(usuarioFinal);
        await cargarDatosDesdePHP();
        cambiarModulo('dashboard');
    } catch (e) {
        sessionStorage.removeItem(CLAVE_SESION_STORAGE);
    }
}

document.addEventListener('DOMContentLoaded', restaurarSesionAlCargar);

async function cargarDatosDesdePHP() {
    const rutas = [
        ['vehiculos', 'api/vehiculos.php'],
        ['chofer', 'api/choferes.php'],
        ['usuario', 'api/usuarios.php'],
        ['proveedor', 'api/proveedores.php'],
        ['repuestos', 'api/repuestos.php'],
        ['incidentes', 'api/reporte_incidentes.php'],
        ['trabajan', 'api/trabajan.php'],
        ['solicita', 'api/solicita.php']
    ];

    for (const [clave, url] of rutas) {
        if (!puedeVerModulo(clave === 'chofer' ? 'choferes' : clave === 'usuario' ? 'usuarios' : clave === 'proveedor' ? 'proveedores' : clave)) {
            continue;
        }
        try {
            const resp = await fetch(url, { credentials: 'same-origin' });
            if (resp.status === 401) {
                alert('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.');
                await cerrarSesion();
                return;
            }
            const json = await resp.json();
            if (resp.ok && json.status === 'ok' && Array.isArray(json.data)) {
                datos[clave] = json.data;
            }
        } catch (e) {}
    }
    renderizarModulo();
}
/* --------------------------------------------------------------------------
   SECCIÓN 5: NAVEGACIÓN ENTRE MÓDULOS Y FILTROS
   -------------------------------------------------------------------------- */
function cambiarModulo(mod, filtroInicial = '') {
    if (!puedeVerModulo(mod)) mod = 'dashboard';
    moduloActual = mod;
    editandoId = null;

    document.querySelectorAll('.lista-lateral li').forEach(li => {
        li.classList.toggle('activo', li.getAttribute('data-mod') === mod);
    });

    const areaContenido = document.getElementById('area-contenido');
    const encabezadoMod = document.getElementById('encabezado-modulo');
    const barraFiltros = document.getElementById('barra-filtros');
    const resumenInferior = document.getElementById('resumen-inferior');
    const filtroBajas = document.getElementById('grupo-filtro-bajas');

    const esDashboard = mod === 'dashboard';
    const esPantallaSimple = mod === 'reportes' || mod === 'sql-info';

    areaContenido.classList.toggle('modo-dashboard', esDashboard);
    encabezadoMod.classList.toggle('oculto', esDashboard);
    barraFiltros.classList.toggle('oculto', esDashboard || esPantallaSimple);
    resumenInferior.classList.toggle('oculto', esDashboard || esPantallaSimple);
    if (filtroBajas) filtroBajas.classList.toggle('oculto', mod !== 'vehiculos');

    actualizarBotonesEdicion();

    if (!esDashboard && !esPantallaSimple) {
        limpiarFiltros(false);
        if (filtroInicial) {
            const inputBusqueda = document.getElementById('entrada-busqueda');
            if (inputBusqueda) inputBusqueda.value = filtroInicial;
        }
    }
    renderizarModulo();
}

function irAIncidenteDesdeOrden(idIncidente) {
    if (!puedeVerModulo('incidentes')) return alert('Tu rango no tiene acceso a Incidentes.');
    cambiarModulo('incidentes', String(idIncidente));
}

function limpiarFiltros(rerender = true) {
    const busqueda = document.getElementById('entrada-busqueda');
    const estado = document.getElementById('filtro-estado');
    const chkBajas = document.getElementById('mostrar-bajas-vehiculos');
    if (busqueda) busqueda.value = '';
    if (estado) estado.value = 'TODOS';
    if (chkBajas) chkBajas.checked = false;
    if (rerender) renderizarModulo();
}

function enfocarBuscador() {
    if (['dashboard', 'reportes', 'sql-info'].includes(moduloActual)) cambiarModulo('vehiculos');
    document.getElementById('entrada-busqueda')?.focus();
}

function filtrarTablaActual() {
    renderizarModulo();
}

/* --------------------------------------------------------------------------
   SECCIÓN 6: EXPORTACIÓN A EXCEL (.xls) E INFORMES EN TEXTO (.txt)
   -------------------------------------------------------------------------- */
function exportarExcel(tabla) {
    const tablas = {
        vehiculos: [['Patente', 'Marca', 'Modelo', 'Año', 'KM Actuales', 'Estado', 'Activo'], ...datos.vehiculos.map(v => [v.patente, v.marca, v.modelo, v.año, v.km_actuales, v.Estado, v.activo == 0 ? 'Baja' : 'Activo'])],
        repuestos: [['Codigo', 'Stock', 'Stock Minimo', 'Costo Unitario'], ...datos.repuestos.map(r => [r.cod_repuesto, r.Stock, r.Stock_minimo, r.Costo_unitario])],
        incidentes: [['ID', 'Fecha', 'Patente', 'Legajo', 'Lugar', 'Detalles', 'Estado'], ...datos.incidentes.map(i => [i.id_incidentes, i.fecha, i.patente_id, i.nro_legajo_id, i.lugar, i.detalles, i.Estado])],
        choferes: [['Nro Legajo', 'Licencia', 'ID Usuario'], ...datos.chofer.map(c => [c.nro_legajo, c.licencia, c.id_usuarios || ''])]
    };
    const filas = tablas[tabla];
    if (!filas) return;

    const escapar = val => String(val ?? '').replace(/</g, '<').replace(/>/g, '>');
    const tablaHtml = `<table border="1">${filas.map(fila => `<tr>${fila.map(celda => `<td>${escapar(celda)}</td>`).join('')}</tr>`).join('')}</table>`;
    descargarBlob(new Blob(['\uFEFF' + tablaHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' }), `vektor360_${tabla}.xls`);
}

function descargarInformeTxt(tipo) {
    let texto = `VEKTOR 360 - INFORME (${tipo.toUpperCase()})\nFecha: ${new Date().toLocaleString()}\n\n`;

    if (tipo === 'general') {
        const activos = datos.vehiculos.filter(v => v.activo === undefined || Number(v.activo) === 1);
        texto += `Vehiculos Activos: ${activos.length} | Choferes: ${datos.chofer.length} | Repuestos: ${datos.repuestos.length} | Incidentes: ${datos.incidentes.length}\n\n`;
        activos.forEach(v => {
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

/* --------------------------------------------------------------------------
   SECCIÓN 7: RENDERIZADO DE VISTAS, TABLAS Y CÁLCULO CPK
   -------------------------------------------------------------------------- */
function leerEstado(item) {
    return (item.Estado ?? item.estado ?? '').toLowerCase();
}

function esVehiculoActivo(v) {
    return v.activo === undefined || v.activo === null || Number(v.activo) === 1;
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
        const vehiculosActivos = datos.vehiculos.filter(esVehiculoActivo);
        const stockBajo = datos.repuestos.filter(r => Number(r.Stock) <= Number(r.Stock_minimo)).length;
        const incAbiertos = datos.incidentes.filter(i => !['resuelto', 'solucionado'].includes(leerEstado(i))).length;

        const accesos = [
            ['vehiculos', `VEHÍCULOS (${vehiculosActivos.length})`, 'Unidades y patentes activas'],
            ['choferes', `CHOFERES (${datos.chofer.length})`, 'Legajos y licencias'],
            ['usuarios', `USUARIOS (${datos.usuario.length})`, 'Cuentas y roles'],
            ['repuestos', `REPUESTOS (${datos.repuestos.length})`, 'Inventario y stock'],
            ['trabajan', `ÓRDENES TALLER (${datos.trabajan.length})`, 'Reparaciones e insumos'],
            ['solicita', `SOLICITUDES COMPRA (${datos.solicita.length})`, 'Pedidos a proveedores']
        ].filter(([mod]) => puedeVerModulo(mod));

        vista.innerHTML = `
            <div class="tablero-dashboard">
                <div class="banner-dashboard">
                    <img src="${RUTA_BANNER}" alt="Banner" onerror="this.style.display='none'">
                </div>
                <h1 class="titulo-dashboard">VEKTOR <span>360</span></h1>
                <div class="grilla-superior-dashboard">
                    ${puedeVerModulo('vehiculos') ? `
                    <div class="tarjeta-dashboard" onclick="cambiarModulo('vehiculos')">
                        <div><h3>Flota</h3><p>${vehiculosActivos.length} unidades activas registradas en el sistema.</p></div>
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
        const incluirBajas = document.getElementById('mostrar-bajas-vehiculos')?.checked || false;
        const lista = datos.vehiculos.filter(v =>
            (incluirBajas || esVehiculoActivo(v)) &&
            pasaEstado(v) &&
            `${v.patente} ${v.marca} ${v.modelo}`.toLowerCase().includes(textoBuscado)
        );
        const totalActivos = datos.vehiculos.filter(esVehiculoActivo).length;

        vista.innerHTML = `
            <table class="tabla-erp">
                <thead><tr><th>Patente</th><th>Marca</th><th>Modelo</th><th>Año</th><th>KM Actuales</th><th>Estado</th>${editables ? '<th>Acciones</th>' : ''}</tr></thead>
                <tbody>${lista.map(v => {
                    const activo = esVehiculoActivo(v);
                    return `
                    <tr class="${activo ? '' : 'fila-baja'}">
                        <td><strong>${v.patente}</strong> ${activo ? '' : '<span class="etiqueta-estado etiqueta-alerta">BAJA</span>'}</td>
                        <td>${v.marca}</td><td>${v.modelo}</td><td>${v.año}</td>
                        <td>${Number(v.km_actuales).toLocaleString()} km</td>
                        <td><span class="etiqueta-estado">${v.Estado}</span></td>
                        ${editables ? `<td>
                            <button class="boton-chico boton-editar" onclick="abrirModalEditar('${v.patente}')">Editar</button>
                            ${activo ? `<button class="boton-chico boton-eliminar" onclick="eliminarRegistro('${v.patente}')">Baja</button>` : ''}
                        </td>` : ''}
                    </tr>`;
                }).join('')}</tbody>
            </table>`;
        resumen.innerHTML = `<div class="caja-resumen"><span>Unidades Activas:</span><strong>${totalActivos}</strong> (Total histórico: ${datos.vehiculos.length})</div>`;
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
                    <td><strong>#${p.id_proveedor}</strong></td><td>${p.razon_social}</td><td>${p.telefono || ''}</td><td>${p.email || ''}</td>
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
        const opciones = datos.vehiculos.filter(esVehiculoActivo).map(v => `<option value="${v.patente}">${v.patente} - ${v.marca} ${v.modelo}</option>`).join('');
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
        etiqueta.textContent = 'vektor360_3';
        vista.innerHTML = `<div class="contenedor-reporte-cpk"><h3>Base de datos: vektor360_3</h3><p>Todas las tablas sincronizadas con MySQL mediante PHP.</p></div>`;
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

/* --------------------------------------------------------------------------
   SECCIÓN 8: FORMULARIO MODAL Y OPERACIONES ABM CONTRA MYSQL
   -------------------------------------------------------------------------- */
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
            <div class="grupo-campo"><label>Patente: ${REQ}</label><input type="text" id="m-pat" value="${item?.patente || ''}" ${item ? 'disabled' : ''} required></div>
            <div class="grupo-campo"><label>Marca: ${REQ}</label><input type="text" id="m-marca" value="${item?.marca || ''}" required></div>
            <div class="grupo-campo"><label>Modelo: ${REQ}</label><input type="text" id="m-modelo" value="${item?.modelo || ''}" required></div>
            <div class="grupo-campo"><label>Año: ${REQ}</label><input type="number" id="m-anio" min="1980" max="2030" value="${item?.año || 2024}" required></div>
            <div class="grupo-campo"><label>KM Actuales: ${REQ}</label><input type="number" id="m-km" min="0" value="${item?.km_actuales ?? 0}" required></div>
            <div class="grupo-campo"><label>Estado: ${REQ}</label>
                <select id="m-est" required>${['Disponible', 'En Ruta', 'En Taller', 'Fuera de Servicio'].map(e => `<option ${item?.Estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select>
            </div>`;
    } else if (moduloActual === 'choferes') {
        tituloModal.textContent = item ? `Editar Chofer #${item.nro_legajo}` : 'Nuevo Chofer';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Nro. Legajo: ${REQ}</label><input type="number" id="m-leg" min="1" value="${item?.nro_legajo || 113}" ${item ? 'disabled' : ''} required></div>
            <div class="grupo-campo"><label>Licencia: ${REQ}</label><input type="text" id="m-lic" value="${item?.licencia || ''}" required></div>
            <div class="grupo-campo"><label>Usuario (opcional):</label>
                <select id="m-usr"><option value="">-- Ninguno --</option>${datos.usuario.map(u => `<option value="${u.id_usuarios}" ${item?.id_usuarios == u.id_usuarios ? 'selected' : ''}>${u.nombre}</option>`).join('')}</select>
            </div>`;
    } else if (moduloActual === 'usuarios') {
        tituloModal.textContent = item ? `Editar Usuario #${item.id_usuarios}` : 'Nuevo Usuario';
        campos.innerHTML = `
            <div class="grupo-campo"><label>DNI: ${REQ}</label><input type="text" id="m-dni" value="${item?.DNI || ''}" required></div>
            <div class="grupo-campo"><label>Nombre: ${REQ}</label><input type="text" id="m-nom" value="${item?.nombre || ''}" required></div>
            <div class="grupo-campo"><label>Cargo: ${REQ}</label>
                <select id="m-cargo" required>${['Administrador', 'Encargado de Taller', 'Chofer', 'Jefa de Logística', 'Gerente de Logística'].map(c => `<option ${item?.cargo === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
            </div>
            <div class="grupo-campo"><label>Email: ${REQ}</label><input type="email" id="m-email" value="${item?.email || ''}" required></div>
            <div class="grupo-campo"><label>Contraseña: ${item ? '' : REQ}</label><input type="password" id="m-pass" placeholder="${item ? 'Dejar vacío para mantener la actual' : 'Ingrese contraseña'}" ${item ? '' : 'required'}></div>`;
    } else if (moduloActual === 'proveedores') {
        tituloModal.textContent = item ? 'Editar Proveedor' : 'Nuevo Proveedor';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Razón Social: ${REQ}</label><input type="text" id="m-razon" value="${item?.razon_social || ''}" required></div>
            <div class="grupo-campo"><label>Teléfono: ${REQ}</label><input type="text" id="m-tel" value="${item?.telefono || ''}" required></div>
            <div class="grupo-campo"><label>Email: ${REQ}</label><input type="email" id="m-email" value="${item?.email || ''}" required></div>`;
    } else if (moduloActual === 'repuestos') {
        tituloModal.textContent = item ? `Ajustar Repuesto ${item.cod_repuesto}` : 'Nuevo Repuesto';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Código Repuesto: ${REQ}</label><input type="text" id="m-cod" value="${item?.cod_repuesto || 'REP-021'}" ${item ? 'disabled' : ''} required></div>
            <div class="grupo-campo"><label>Stock Físico: ${REQ}</label><input type="number" id="m-stock" min="0" value="${item?.Stock ?? 10}" required></div>
            <div class="grupo-campo"><label>Stock Mínimo: ${REQ}</label><input type="number" id="m-min" min="0" value="${item?.Stock_minimo ?? 5}" required></div>
            <div class="grupo-campo"><label>Costo Unitario ($): ${REQ}</label><input type="number" step="0.01" min="0" id="m-costo" value="${item?.Costo_unitario ?? 8500}" required></div>`;
    } else if (moduloActual === 'incidentes') {
        tituloModal.textContent = item ? `Actualizar Incidente #${item.id_incidentes}` : 'Registrar Incidente';
        const vehiculosDisponibles = datos.vehiculos.filter(v => esVehiculoActivo(v) || item?.patente_id === v.patente);
        campos.innerHTML = `
            <div class="grupo-campo"><label>Patente Vehículo: ${REQ}</label><select id="m-pat" required>${vehiculosDisponibles.map(v => `<option value="${v.patente}" ${item?.patente_id === v.patente ? 'selected' : ''}>${v.patente} (${v.Estado})</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Legajo Chofer: ${REQ}</label><select id="m-leg" required>${datos.chofer.map(c => `<option value="${c.nro_legajo}" ${item?.nro_legajo_id == c.nro_legajo ? 'selected' : ''}>Legajo #${c.nro_legajo}</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Lugar: ${REQ}</label><input type="text" id="m-lugar" value="${item?.lugar || ''}" required></div>
            <div class="grupo-campo"><label>Detalles: ${REQ}</label><textarea id="m-det" rows="3" required>${item?.detalles || ''}</textarea></div>
            <div class="grupo-campo"><label>Estado: ${REQ}</label>
                <select id="m-est" required>${['Pendiente', 'En Reparación', 'Solucionado'].map(e => `<option ${item?.Estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select>
            </div>`;
    } else if (moduloActual === 'trabajan') {
        tituloModal.textContent = 'Nueva Orden de Taller';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Incidente: ${REQ}</label><select id="m-inc" required>${datos.incidentes.map(i => `<option value="${i.id_incidentes}">#${i.id_incidentes} - ${i.patente_id}</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Repuesto: ${REQ}</label><select id="m-rep" required>${datos.repuestos.map(r => `<option value="${r.cod_repuesto}">${r.cod_repuesto} (Stock: ${r.Stock})</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Cantidad: ${REQ}</label><input type="number" id="m-cant" value="1" min="1" required></div>`;
    } else if (moduloActual === 'solicita') {
        tituloModal.textContent = 'Nueva Solicitud de Compra';
        campos.innerHTML = `
            <div class="grupo-campo"><label>Proveedor: ${REQ}</label><select id="m-prov" required>${datos.proveedor.map(p => `<option value="${p.id_proveedor}">${p.razon_social}</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Repuesto: ${REQ}</label><select id="m-rep" required>${datos.repuestos.map(r => `<option value="${r.cod_repuesto}">${r.cod_repuesto} (Stock: ${r.Stock})</option>`).join('')}</select></div>
            <div class="grupo-campo"><label>Cantidad: ${REQ}</label><input type="number" id="m-cant" value="10" min="1" required></div>`;
    }
}

function cerrarModal() {
    document.getElementById('modal-abm').classList.add('oculto');
}

async function guardarRegistro(evento) {
    evento.preventDefault();
    if (!puedeEditarModulo(moduloActual)) return;

    const cajaError = document.getElementById('error-modal');
    const btnGuardar = document.getElementById('boton-guardar-modal');
    cajaError.classList.add('oculto');

    // Fecha y hora local del sistema (no UTC)
    const fechaHora = obtenerFechaHoraLocalSQL();
    const idUsuario = usuarioActivo?.id_usuarios || 1;
    let endpoint = '';
    let payload = {};

    if (moduloActual === 'vehiculos') {
        endpoint = 'api/vehiculos.php';
        payload = {
            patente: (editandoId || document.getElementById('m-pat').value).toUpperCase().trim(),
            marca: document.getElementById('m-marca').value.trim(),
            modelo: document.getElementById('m-modelo').value.trim(),
            año: Number(document.getElementById('m-anio').value),
            km_actuales: Number(document.getElementById('m-km').value),
            Estado: document.getElementById('m-est').value
        };
    } else if (moduloActual === 'choferes') {
        endpoint = 'api/choferes.php';
        payload = {
            nro_legajo: editandoId || Number(document.getElementById('m-leg').value),
            licencia: document.getElementById('m-lic').value.trim(),
            id_usuarios: document.getElementById('m-usr').value || null
        };
    } else if (moduloActual === 'usuarios') {
        endpoint = 'api/usuarios.php';
        payload = {
            id_usuarios: editandoId,
            DNI: document.getElementById('m-dni').value.trim(),
            nombre: document.getElementById('m-nom').value.trim(),
            cargo: document.getElementById('m-cargo').value,
            email: document.getElementById('m-email').value.trim(),
            contraseña: document.getElementById('m-pass').value
        };
    } else if (moduloActual === 'proveedores') {
        endpoint = 'api/proveedores.php';
        payload = {
            id_proveedor: editandoId,
            razon_social: document.getElementById('m-razon').value.trim(),
            telefono: document.getElementById('m-tel').value.trim(),
            email: document.getElementById('m-email').value.trim()
        };
    } else if (moduloActual === 'repuestos') {
        endpoint = 'api/repuestos.php';
        payload = {
            cod_repuesto: (editandoId || document.getElementById('m-cod').value).toUpperCase().trim(),
            Stock: Number(document.getElementById('m-stock').value),
            Stock_minimo: Number(document.getElementById('m-min').value),
            Costo_unitario: Number(document.getElementById('m-costo').value),
            id_usuarios: idUsuario
        };
    } else if (moduloActual === 'incidentes') {
        endpoint = 'api/reporte_incidentes.php';
        const incOriginal = editandoId ? datos.incidentes.find(x => x.id_incidentes == editandoId) : null;
        payload = {
            id_incidentes: editandoId,
            fecha: incOriginal ? incOriginal.fecha : fechaHora,
            patente_id: document.getElementById('m-pat').value,
            nro_legajo_id: Number(document.getElementById('m-leg').value),
            lugar: document.getElementById('m-lugar').value.trim(),
            detalles: document.getElementById('m-det').value.trim(),
            Estado: document.getElementById('m-est').value
        };
    } else if (moduloActual === 'trabajan') {
        endpoint = 'api/trabajan.php';
        payload = {
            id_incidentes: Number(document.getElementById('m-inc').value),
            cod_repuesto: document.getElementById('m-rep').value,
            id_usuarios: idUsuario,
            fecha: fechaHora,
            cantidad: Number(document.getElementById('m-cant').value)
        };
    } else if (moduloActual === 'solicita') {
        endpoint = 'api/solicita.php';
        payload = {
            id_proveedor: Number(document.getElementById('m-prov').value),
            cod_repuesto: document.getElementById('m-rep').value,
            id_usuarios: idUsuario,
            fecha: fechaHora,
            cantidad: Number(document.getElementById('m-cant').value),
            estado: 'Pendiente'
        };
    }

    if (btnGuardar) btnGuardar.disabled = true;

    try {
        const resp = await fetch(endpoint, {
            method: editandoId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        const json = await resp.json();

        if (!resp.ok || json.status !== 'ok') {
            cajaError.textContent = json.message || 'El servidor rechazó la operación en MySQL.';
            cajaError.classList.remove('oculto');
            return;
        }

        cerrarModal();
        await cargarDatosDesdePHP();
    } catch (e) {
        cajaError.textContent = 'Error de comunicación con el servidor al guardar.';
        cajaError.classList.remove('oculto');
    } finally {
        if (btnGuardar) btnGuardar.disabled = false;
    }
}

async function marcarSolicitudRecibida(id) {
    if (!puedeEditarModulo('solicita')) return;
    if (!confirm(`¿Confirma la recepción de la solicitud SOL-${id} y el ingreso al stock?`)) return;

    try {
        const resp = await fetch('api/solicita.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id_solicita: id, estado: 'Recibido' })
        });
        const json = await resp.json();

        if (!resp.ok || json.status !== 'ok') {
            alert(json.message || 'No se pudo actualizar la solicitud en MySQL.');
            return;
        }

        await cargarDatosDesdePHP();
    } catch (e) {
        alert('Error de red al confirmar la recepción en el servidor.');
    }
}

async function eliminarRegistro(id) {
    if (!puedeEditarModulo(moduloActual)) return alert('Tu rango no tiene permiso para eliminar en este módulo.');
    const accionTexto = moduloActual === 'vehiculos' ? 'dar de baja' : 'eliminar';
    if (!confirm(`¿Confirma ${accionTexto} el registro ${id}?`)) return;

    const rutasDelete = {
        vehiculos: `api/vehiculos.php?patente=${encodeURIComponent(id)}`,
        choferes: `api/choferes.php?nro_legajo=${encodeURIComponent(id)}`,
        usuarios: `api/usuarios.php?id_usuarios=${encodeURIComponent(id)}`,
        proveedores: `api/proveedores.php?id_proveedor=${encodeURIComponent(id)}`,
        repuestos: `api/repuestos.php?cod_repuesto=${encodeURIComponent(id)}`,
        incidentes: `api/reporte_incidentes.php?id_incidentes=${encodeURIComponent(id)}`,
        trabajan: `api/trabajan.php?id_trabajan=${encodeURIComponent(id)}`,
        solicita: `api/solicita.php?id_solicita=${encodeURIComponent(id)}`
    };

    const url = rutasDelete[moduloActual];
    if (!url) return;

    try {
        const resp = await fetch(url, { method: 'DELETE', credentials: 'same-origin' });
        const json = await resp.json();

        if (!resp.ok || json.status !== 'ok') {
            alert(json.message || 'MySQL rechazó la eliminación (posibles registros históricos asociados).');
            return;
        }

        await cargarDatosDesdePHP();
    } catch (e) {
        alert('Error de red al intentar eliminar el registro en el servidor.');
    }
}