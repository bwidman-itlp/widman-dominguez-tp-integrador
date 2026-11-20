/* ==========================================================================
   VEKTOR 360 - SCRIPT PRINCIPAL
   ========================================================================== */

let usuarioActivo = null;
let moduloActual = 'dashboard';
let editandoId = null;
let historialDeshacer = [];
let modoOscuro = false;

// Coloca tu imagen en img/banner.png para mostrarla en el banner superior del dashboard
const RUTA_BANNER = 'img/banner.png';

function toggleSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}

// ==================== MENÚS DESPLEGABLES ====================
function toggleMenuDropdown(idMenu) {
    const target = document.getElementById(idMenu);
    const yaAbierto = target && !target.classList.contains('hidden');
    cerrarMenus();
    if (target && !yaAbierto) {
        target.classList.remove('hidden');
    }
}

function cerrarMenus() {
    document.querySelectorAll('.dropdown-panel').forEach(p => p.classList.add('hidden'));
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-dropdown')) {
        cerrarMenus();
    }
});

// ==================== TEMA OSCURO / CLARO ====================
function alternarTema() {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('dark-theme', modoOscuro);
    const btnTema = document.getElementById('btn-menu-tema');
    if (btnTema) {
        btnTema.textContent = modoOscuro ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro';
    }
    if (moduloActual === 'dashboard') {
        renderizarModulo();
    }
}

// ==================== HISTORIAL DESHACER ====================
function guardarSnapshot() {
    historialDeshacer.push(JSON.stringify(db));
    if (historialDeshacer.length > 20) historialDeshacer.shift();
}

function deshacerCambio() {
    if (historialDeshacer.length === 0) {
        alert('No hay cambios recientes para deshacer.');
        return;
    }
    const anterior = JSON.parse(historialDeshacer.pop());
    Object.assign(db, anterior);
    renderizarModulo();
    alert('Se deshizo el último cambio.');
}

// ==================== BASE DE DATOS LOCAL / RESPALDO ====================
const db = {
    usuario: [
        { id_usuarios: 1, DNI: '12345678', nombre: 'Administrador Vektor', cargo: 'Administrador', email: 'admin@vektor360.com', contraseña: 'P4$$W0RD' },
        { id_usuarios: 2, DNI: '87654321', nombre: 'Esteban Dominguez', cargo: 'Encargado de Taller', email: 'edtaller@vektor360.com', contraseña: 'P4$$W0RD' }
    ],
    chofer: [
        { nro_legajo: 101, licencia: 'B1-998822', id_usuarios: 1 },
        { nro_legajo: 102, licencia: 'E2-443322', id_usuarios: 2 }
    ],
    vehiculos: [
        { patente: 'AC222BB', modelo: 'Actros 2645', marca: 'Mercedes-Benz', año: 2020, km_actuales: 280000, Estado: 'Disponible' },
        { patente: 'AF111AA', modelo: 'FH 460', marca: 'Volvo', año: 2022, km_actuales: 160000, Estado: 'En Taller' },
        { patente: 'AG789ZZ', modelo: 'R500', marca: 'Scania', año: 2024, km_actuales: 45000, Estado: 'Disponible' }
    ],
    proveedor: [
        { id_proveedor: 1, razon_social: 'Repuestos del Litoral S.A.', telefono: '011-4555-1234', email: 'ventas@litoralsat.com' },
        { id_proveedor: 2, razon_social: 'Frenos y Partes Norte', telefono: '0341-4888-9999', email: 'contacto@frenosnorte.com' }
    ],
    repuestos: [
        { cod_repuesto: 'REP-001', Stock: 15, Stock_minimo: 5, Costo_unitario: 12500.00, id_usuarios: 2 },
        { cod_repuesto: 'REP-002', Stock: 3, Stock_minimo: 8, Costo_unitario: 45000.50, id_usuarios: 2 },
        { cod_repuesto: 'REP-003', Stock: 25, Stock_minimo: 10, Costo_unitario: 3200.00, id_usuarios: 2 }
    ],
    incidentes: [
        { id_incidentes: 1, fecha: '2026-10-24 08:00:00', detalles: 'Desgaste prematuro de neumáticos en el eje delantero', lugar: 'Autopista Bs As - Rosario Km 120', Estado: 'Pendiente', patente_id: 'AG789ZZ', nro_legajo_id: 101 },
        { id_incidentes: 2, fecha: '2026-10-25 16:45:00', detalles: 'Falla eléctrica en el tablero de instrumentos', lugar: 'Tres Arroyos', Estado: 'En Reparación', patente_id: 'AF111AA', nro_legajo_id: 102 }
    ],
    trabajan: [
        { id_trabajan: 1, id_incidentes: 2, cod_repuesto: 'REP-002', id_usuarios: 2, fecha: '2026-10-26 10:00:00', cantidad: 1 }
    ],
    solicita: [
        { id_solicita: 1, id_proveedor: 2, cod_repuesto: 'REP-002', id_usuarios: 2, fecha: '2026-10-27 09:30:00', cantidad: 10, estado: 'Pendiente' }
    ]
};

setInterval(() => {
    const reloj = document.getElementById('status-clock');
    if (reloj) reloj.textContent = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
}, 1000);

// ==================== INICIO DE SESIÓN ====================
function iniciarSesion() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorBox = document.getElementById('login-error');

    const usuario = db.usuario.find(u => u.email === email && u.contraseña === pass);

    if (!usuario) {
        errorBox.classList.remove('hidden');
        return;
    }

    errorBox.classList.add('hidden');
    usuarioActivo = usuario;

    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('app-window').classList.remove('hidden');
    document.getElementById('user-badge').textContent = `Usuario: ${usuario.nombre} (${usuario.cargo})`;
    document.getElementById('status-role').textContent = `Rol Activo: ${usuario.cargo}`;

    cargarDatosDesdePHP();
    cambiarModulo('dashboard');
}

function cerrarSesion() {
    usuarioActivo = null;
    document.getElementById('app-window').classList.add('hidden');
    document.getElementById('login-overlay').classList.remove('hidden');
}

// ==================== CONEXIÓN CON PHP ====================
async function cargarDatosDesdePHP() {
    try {
        const resVeh = await fetch('api/vehiculos.php');
        const dataVeh = await resVeh.json();
        if (dataVeh.status === 'ok' && Array.isArray(dataVeh.data) && dataVeh.data.length > 0) {
            db.vehiculos = dataVeh.data;
        }

        const resInc = await fetch('api/reporte_incidentes.php');
        const dataInc = await resInc.json();
        if (dataInc.status === 'ok' && Array.isArray(dataInc.data) && dataInc.data.length > 0) {
            db.incidentes = dataInc.data;
        }
        renderizarModulo();
    } catch (e) {
        renderizarModulo();
    }
}

// ==================== NAVEGACIÓN ====================
function cambiarModulo(mod) {
    moduloActual = mod;
    editandoId = null;

    document.querySelectorAll('.sidebar-list li').forEach(li => {
        li.classList.toggle('active', li.getAttribute('data-mod') === mod);
    });

    const contentArea = document.getElementById('content-area');
    const modHeader = document.getElementById('module-header');
    const filterBar = document.getElementById('filter-bar');
    const summaryPanel = document.getElementById('bottom-summary');

    if (mod === 'dashboard') {
        contentArea.classList.add('dashboard-mode');
        modHeader.classList.add('hidden');
        filterBar.classList.add('hidden');
        summaryPanel.classList.add('hidden');
    } else if (mod === 'reportes' || mod === 'sql-info') {
        contentArea.classList.remove('dashboard-mode');
        modHeader.classList.remove('hidden');
        filterBar.classList.add('hidden');
        summaryPanel.classList.add('hidden');
    } else {
        contentArea.classList.remove('dashboard-mode');
        modHeader.classList.remove('hidden');
        filterBar.classList.remove('hidden');
        summaryPanel.classList.remove('hidden');
        limpiarFiltros(false);
    }

    renderizarModulo();
}

function limpiarFiltros(rerender = true) {
    const s = document.getElementById('search-input');
    const f = document.getElementById('status-filter');
    if (s) s.value = '';
    if (f) f.value = 'TODOS';
    if (rerender) renderizarModulo();
}

function enfocarBuscador() {
    if (moduloActual === 'dashboard' || moduloActual === 'reportes' || moduloActual === 'sql-info') {
        cambiarModulo('vehiculos');
    }
    const input = document.getElementById('search-input');
    if (input) input.focus();
}

function filtrarTablaActual() {
    renderizarModulo();
}

// ==================== EXPORTAR A EXCEL (.xls) ====================
function exportarExcel(tabla) {
    let filas = [];
    let nombreArchivo = `vektor360_${tabla}.xls`;

    if (tabla === 'vehiculos') {
        filas = [['Patente', 'Marca', 'Modelo', 'Año', 'KM Actuales', 'Estado']];
        db.vehiculos.forEach(v => filas.push([v.patente, v.marca, v.modelo, v.año, v.km_actuales, v.Estado]));
    } else if (tabla === 'repuestos') {
        filas = [['Codigo', 'Stock', 'Stock Minimo', 'Costo Unitario']];
        db.repuestos.forEach(r => filas.push([r.cod_repuesto, r.Stock, r.Stock_minimo, r.Costo_unitario]));
    } else if (tabla === 'incidentes') {
        filas = [['ID', 'Fecha', 'Patente', 'Legajo', 'Lugar', 'Detalles', 'Estado']];
        db.incidentes.forEach(i => filas.push([i.id_incidentes, i.fecha, i.patente_id, i.nro_legajo_id, i.lugar, i.detalles, i.Estado]));
    } else if (tabla === 'choferes') {
        filas = [['Nro Legajo', 'Licencia', 'ID Usuario']];
        db.chofer.forEach(c => filas.push([c.nro_legajo, c.licencia, c.id_usuarios || '']));
    }

    let tablaHtml = '<table border="1">';
    filas.forEach(fila => {
        tablaHtml += '<tr>' + fila.map(celda => `<td>${String(celda).replace(/</g, '<')}</td>`).join('') + '</tr>';
    });
    tablaHtml += '</table>';

    const blob = new Blob(
        ['\uFEFF' + `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${tablaHtml}</body></html>`],
        { type: 'application/vnd.ms-excel;charset=utf-8;' }
    );
    descargarBlob(blob, nombreArchivo);
}

// ==================== GENERAR INFORMES (.txt) ====================
function descargarInformeTxt(tipo) {
    const fechaStr = new Date().toLocaleString();
    let contenido = `====================================================\nVEKTOR 360 - INFORME DEL SISTEMA\nFecha: ${fechaStr}\n====================================================\n\n`;

    if (tipo === 'general') {
        contenido += `RESUMEN GENERAL\n- Vehiculos registrados: ${db.vehiculos.length}\n- Choferes activos: ${db.chofer.length}\n- Repuestos en inventario: ${db.repuestos.length}\n- Incidentes registrados: ${db.incidentes.length}\n- Ordenes de taller: ${db.trabajan.length}\n- Solicitudes de compra: ${db.solicita.length}\n\nDETALLE DE VEHICULOS:\n`;
        db.vehiculos.forEach(v => {
            contenido += `  * ${v.patente} | ${v.marca} ${v.modelo} (${v.año}) | ${Number(v.km_actuales).toLocaleString()} km | Estado: ${v.Estado}\n`;
        });
    } else if (tipo === 'stock') {
        contenido += `INFORME DE INVENTARIO Y STOCK\n\n`;
        db.repuestos.forEach(r => {
            const alerta = Number(r.Stock) <= Number(r.Stock_minimo) ? ' [STOCK BAJO]' : ' [OK]';
            contenido += `  * ${r.cod_repuesto} | Stock: ${r.Stock} (Min: ${r.Stock_minimo}) | Costo: $${Number(r.Costo_unitario).toLocaleString()}${alerta}\n`;
        });
    } else if (tipo === 'incidentes') {
        contenido += `INFORME DE INCIDENTES\n\n`;
        db.incidentes.forEach(i => {
            contenido += `  * #${i.id_incidentes} | ${i.fecha} | Unidad: ${i.patente_id} | Chofer: #${i.nro_legajo_id} | Estado: ${i.Estado}\n    Lugar: ${i.lugar}\n    Detalle: ${i.detalles}\n\n`;
        });
    }

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8;' });
    descargarBlob(blob, `informe_vektor360_${tipo}.txt`);
}

function descargarBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== RENDERIZADO ====================
function renderizarModulo() {
    const view = document.getElementById('dynamic-view');
    const title = document.getElementById('module-title');
    const tag = document.getElementById('module-info-tag');
    const summary = document.getElementById('bottom-summary');

    const q = (document.getElementById('search-input')?.value || '').toLowerCase();
    const st = document.getElementById('status-filter')?.value || 'TODOS';

    // 1. DASHBOARD CON EL MISMO COLOR DEL RESTO DE LA PÁGINA
    if (moduloActual === 'dashboard') {
        const stockBajo = db.repuestos.filter(r => Number(r.Stock) <= Number(r.Stock_minimo)).length;
        const incAbiertos = db.incidentes.filter(i => i.Estado !== 'Resuelto' && i.Estado !== 'Solucionado').length;

        const bg = modoOscuro ? '#1B1B1B' : '#F4F5F7';
        const cardBg = modoOscuro ? '#262626' : '#FFFFFF';
        const borderCol = modoOscuro ? '#383838' : '#DCDFE4';
        const txtMain = modoOscuro ? '#EAEAEA' : '#222222';
        const txtMuted = modoOscuro ? '#A0A0A0' : '#666666';
        const bannerBg = modoOscuro ? '#242424' : '#FFFFFF';

        view.innerHTML = `
            <div style="min-height:100%; background:${bg}; color:${txtMain}; padding:22px 26px;">
                
                <!-- ESPACIO PARA BANNER -->
                <div style="width:100%; min-height:90px; background:${bannerBg}; border:1px dashed ${borderCol}; margin-bottom:20px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img src="${RUTA_BANNER}" alt="Banner" style="width:100%; max-height:150px; object-fit:cover; display:block;" onload="this.nextElementSibling.style.display='none'" onerror="this.style.display='none'">
                    <div style="text-align:center; color:${txtMuted}; padding:16px;">
                    </div>
                </div>

                <h1 style="font-size:22px; font-weight:600; color:${txtMain}; margin-bottom:16px;">VEKTOR <span style="color:#9E1418;">360</span></h1>

                <!-- FILA SUPERIOR DE 2 CUADROS -->
                <div style="display:grid; grid-template-columns:repeat(2, minmax(220px, 280px)); gap:16px; margin-bottom:22px;">
                    <div onclick="cambiarModulo('vehiculos')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:18px; min-height:165px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;">
                        <div>
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="${txtMain}" stroke-width="2">
                                <rect x="1" y="4" width="15" height="12" />
                                <polygon points="16,8 20,8 23,12 23,16 16,16" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                            <h3 style="font-size:15px; font-weight:600; color:${txtMain}; margin:12px 0 6px 0;">Flota</h3>
                            <p style="font-size:12px; color:${txtMuted}; line-height:1.35;">${db.vehiculos.length} unidades registradas en el sistema.</p>
                        </div>
                        <span style="align-self:flex-end; color:${txtMuted}; font-size:13px;">↗</span>
                    </div>

                    <div onclick="cambiarModulo('incidentes')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:18px; min-height:165px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;">
                        <div>
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#9E1418" stroke-width="2">
                                <polygon points="12,2 22,20 2,20" />
                                <line x1="12" y1="9" x2="12" y2="14" />
                                <circle cx="12" cy="17" r="1" fill="#9E1418" />
                            </svg>
                            <h3 style="font-size:15px; font-weight:600; color:${txtMain}; margin:12px 0 6px 0;">Incidentes y Stock</h3>
                            <p style="font-size:12px; color:${txtMuted}; line-height:1.35;">${incAbiertos} incidentes abiertos y ${stockBajo} alertas de stock.</p>
                        </div>
                        <span style="align-self:flex-end; color:${txtMuted}; font-size:13px;">↗</span>
                    </div>
                </div>

                <div style="font-size:14px; font-weight:600; color:${txtMain}; margin-bottom:12px;">Accesos Rápidos</div>

                <!-- GRILLA DE 3 COLUMNAS DE CUADROS -->
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px;">
                    <div onclick="cambiarModulo('vehiculos')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:16px; display:flex; align-items:center; gap:14px; cursor:pointer;">
                        <div style="width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${txtMain}" stroke-width="1.8"><rect x="2" y="5" width="14" height="11"/><path d="M16 9h4l3 4v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="19" cy="18" r="2"/></svg>
                        </div>
                        <div>
                            <h4 style="font-size:13px; font-weight:700; color:${txtMain}; margin-bottom:3px;">VEHÍCULOS (${db.vehiculos.length})</h4>
                            <p style="font-size:11px; color:${txtMuted};">Unidades y patentes</p>
                        </div>
                    </div>

                    <div onclick="cambiarModulo('choferes')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:16px; display:flex; align-items:center; gap:14px; cursor:pointer;">
                        <div style="width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${txtMain}" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
                        </div>
                        <div>
                            <h4 style="font-size:13px; font-weight:700; color:${txtMain}; margin-bottom:3px;">CHOFERES (${db.chofer.length})</h4>
                            <p style="font-size:11px; color:${txtMuted};">Legajos y licencias</p>
                        </div>
                    </div>

                    <div onclick="cambiarModulo('usuarios')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:16px; display:flex; align-items:center; gap:14px; cursor:pointer;">
                        <div style="width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${txtMain}" stroke-width="1.8"><rect x="3" y="4" width="18" height="16"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2 2-3 5-3s5 1 5 3"/></svg>
                        </div>
                        <div>
                            <h4 style="font-size:13px; font-weight:700; color:${txtMain}; margin-bottom:3px;">USUARIOS (${db.usuario.length})</h4>
                            <p style="font-size:11px; color:${txtMuted};">Cuentas y roles</p>
                        </div>
                    </div>

                    <div onclick="cambiarModulo('repuestos')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:16px; display:flex; align-items:center; gap:14px; cursor:pointer;">
                        <div style="width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${txtMain}" stroke-width="1.8"><rect x="3" y="4" width="18" height="16"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                        </div>
                        <div>
                            <h4 style="font-size:13px; font-weight:700; color:${txtMain}; margin-bottom:3px;">REPUESTOS (${db.repuestos.length})</h4>
                            <p style="font-size:11px; color:${txtMuted};">Inventario y stock</p>
                        </div>
                    </div>

                    <div onclick="cambiarModulo('trabajan')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:16px; display:flex; align-items:center; gap:14px; cursor:pointer;">
                        <div style="width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${txtMain}" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        </div>
                        <div>
                            <h4 style="font-size:13px; font-weight:700; color:${txtMain}; margin-bottom:3px;">ÓRDENES TALLER (${db.trabajan.length})</h4>
                            <p style="font-size:11px; color:${txtMuted};">Reparaciones e insumos</p>
                        </div>
                    </div>

                    <div onclick="cambiarModulo('solicita')" style="background:${cardBg}; border:1px solid ${borderCol}; padding:16px; display:flex; align-items:center; gap:14px; cursor:pointer;">
                        <div style="width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#9E1418" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                        </div>
                        <div>
                            <h4 style="font-size:13px; font-weight:700; color:${txtMain}; margin-bottom:3px;">SOLICITUDES COMPRA (${db.solicita.length})</h4>
                            <p style="font-size:11px; color:${txtMuted};">Pedidos a proveedores</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // 2. VEHÍCULOS
    if (moduloActual === 'vehiculos') {
        title.textContent = 'Gestión de Vehículos';
        tag.textContent = 'Tabla: vehiculos';

        const lista = db.vehiculos.filter(v =>
            (st === 'TODOS' || v.Estado === st) &&
            (v.patente.toLowerCase().includes(q) || v.marca.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q))
        );

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>Patente</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Año</th>
                        <th>KM Actuales</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(v => `
                        <tr>
                            <td><strong>${v.patente}</strong></td>
                            <td>${v.marca}</td>
                            <td>${v.modelo}</td>
                            <td>${v.año}</td>
                            <td>${Number(v.km_actuales).toLocaleString()} km</td>
                            <td><span class="badge-estado">${v.Estado}</span></td>
                            <td>
                                <button class="btn-sm btn-edit" onclick="abrirModalEditar('${v.patente}')">Editar</button>
                                <button class="btn-sm btn-del" onclick="eliminarRegistro('${v.patente}')">Baja</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Total Unidades:</span><strong>${db.vehiculos.length}</strong></div>`;
    }

    // 3. CHOFERES
    else if (moduloActual === 'choferes') {
        title.textContent = 'Gestión de Choferes';
        tag.textContent = 'Tabla: chofer';
        const lista = db.chofer.filter(c => String(c.nro_legajo).includes(q) || c.licencia.toLowerCase().includes(q));

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>Nro. Legajo</th>
                        <th>Licencia</th>
                        <th>Usuario Asociado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(c => {
                        const usr = db.usuario.find(u => u.id_usuarios == c.id_usuarios);
                        return `
                        <tr>
                            <td><strong>#${c.nro_legajo}</strong></td>
                            <td>${c.licencia}</td>
                            <td>${usr ? usr.nombre : 'Sin usuario'}</td>
                            <td>
                                <button class="btn-sm btn-edit" onclick="abrirModalEditar(${c.nro_legajo})">Editar</button>
                                <button class="btn-sm btn-del" onclick="eliminarRegistro(${c.nro_legajo})">Baja</button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Total Choferes:</span><strong>${db.chofer.length}</strong></div>`;
    }

    // 4. USUARIOS
    else if (moduloActual === 'usuarios') {
        title.textContent = 'Gestión de Usuarios';
        tag.textContent = 'Tabla: usuario';
        const lista = db.usuario.filter(u => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.cargo.toLowerCase().includes(q));

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>DNI</th>
                        <th>Nombre</th>
                        <th>Cargo</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(u => `
                        <tr>
                            <td><strong>#${u.id_usuarios}</strong></td>
                            <td>${u.DNI}</td>
                            <td>${u.nombre}</td>
                            <td><span class="badge-estado">${u.cargo}</span></td>
                            <td>${u.email}</td>
                            <td>
                                <button class="btn-sm btn-edit" onclick="abrirModalEditar(${u.id_usuarios})">Editar</button>
                                <button class="btn-sm btn-del" onclick="eliminarRegistro(${u.id_usuarios})">Baja</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Total Usuarios:</span><strong>${db.usuario.length}</strong></div>`;
    }

    // 5. PROVEEDORES
    else if (moduloActual === 'proveedores') {
        title.textContent = 'Gestión de Proveedores';
        tag.textContent = 'Tabla: proveedor';
        const lista = db.proveedor.filter(p => p.razon_social.toLowerCase().includes(q));

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Razón Social</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(p => `
                        <tr>
                            <td><strong>#${p.id_proveedor}</strong></td>
                            <td>${p.razon_social}</td>
                            <td>${p.telefono}</td>
                            <td>${p.email}</td>
                            <td>
                                <button class="btn-sm btn-edit" onclick="abrirModalEditar(${p.id_proveedor})">Editar</button>
                                <button class="btn-sm btn-del" onclick="eliminarRegistro(${p.id_proveedor})">Baja</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Total Proveedores:</span><strong>${db.proveedor.length}</strong></div>`;
    }

    // 6. REPUESTOS
    else if (moduloActual === 'repuestos') {
        title.textContent = 'Control de Stock y Repuestos';
        tag.textContent = 'Tabla: repuestos';
        const lista = db.repuestos.filter(r => r.cod_repuesto.toLowerCase().includes(q));

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Stock</th>
                        <th>Stock Mínimo</th>
                        <th>Costo Unitario</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(r => {
                        const bajo = Number(r.Stock) <= Number(r.Stock_minimo);
                        return `
                        <tr>
                            <td><strong>${r.cod_repuesto}</strong></td>
                            <td><strong>${r.Stock}</strong></td>
                            <td>${r.Stock_minimo}</td>
                            <td>$${Number(r.Costo_unitario).toLocaleString()}</td>
                            <td><span class="badge-estado" style="${bajo ? 'background:#9E1418;color:#FFF;' : ''}">${bajo ? 'STOCK BAJO' : 'Normal'}</span></td>
                            <td>
                                <button class="btn-sm btn-edit" onclick="abrirModalEditar('${r.cod_repuesto}')">Ajustar</button>
                                <button class="btn-sm btn-del" onclick="eliminarRegistro('${r.cod_repuesto}')">Baja</button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Ítems en Stock:</span><strong>${db.repuestos.length}</strong></div>`;
    }

    // 7. INCIDENTES
    else if (moduloActual === 'incidentes') {
        title.textContent = 'Registro de Incidentes';
        tag.textContent = 'Tabla: incidentes';
        const lista = db.incidentes.filter(i =>
            (st === 'TODOS' || i.Estado === st) &&
            (i.patente_id.toLowerCase().includes(q) || i.detalles.toLowerCase().includes(q) || i.lugar.toLowerCase().includes(q))
        );

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Patente</th>
                        <th>Legajo</th>
                        <th>Lugar</th>
                        <th>Detalles</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(i => `
                        <tr>
                            <td><strong>#${i.id_incidentes}</strong></td>
                            <td>${i.fecha}</td>
                            <td><strong>${i.patente_id}</strong></td>
                            <td>#${i.nro_legajo_id}</td>
                            <td>${i.lugar}</td>
                            <td>${i.detalles}</td>
                            <td><span class="badge-estado">${i.Estado}</span></td>
                            <td>
                                <button class="btn-sm btn-edit" onclick="abrirModalEditar(${i.id_incidentes})">Estado</button>
                                <button class="btn-sm btn-del" onclick="eliminarRegistro(${i.id_incidentes})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Total Incidentes:</span><strong>${db.incidentes.length}</strong></div>`;
    }

    // 8. ÓRDENES TALLER
    else if (moduloActual === 'trabajan') {
        title.textContent = 'Órdenes de Taller';
        tag.textContent = 'Tabla: trabajan';
        const lista = db.trabajan.filter(t => t.cod_repuesto.toLowerCase().includes(q) || String(t.id_incidentes).includes(q));

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>ID Orden</th>
                        <th>Incidente</th>
                        <th>Repuesto</th>
                        <th>Cantidad</th>
                        <th>Costo</th>
                        <th>Fecha</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(t => {
                        const rep = db.repuestos.find(r => r.cod_repuesto === t.cod_repuesto);
                        const total = rep ? Number(rep.Costo_unitario) * Number(t.cantidad) : 0;
                        return `
                        <tr>
                            <td><strong>OT-${t.id_trabajan}</strong></td>
                            <td>#${t.id_incidentes}</td>
                            <td><strong>${t.cod_repuesto}</strong></td>
                            <td>${t.cantidad} u.</td>
                            <td>$${total.toLocaleString()}</td>
                            <td>${t.fecha}</td>
                            <td><button class="btn-sm btn-del" onclick="eliminarRegistro(${t.id_trabajan})">Eliminar</button></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Órdenes de Taller:</span><strong>${db.trabajan.length}</strong></div>`;
    }

    // 9. SOLICITUDES COMPRA
    else if (moduloActual === 'solicita') {
        title.textContent = 'Solicitudes de Compra';
        tag.textContent = 'Tabla: solicita';
        const lista = db.solicita.filter(s => (st === 'TODOS' || s.estado === st) && s.cod_repuesto.toLowerCase().includes(q));

        view.innerHTML = `
            <table class="erp-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Proveedor</th>
                        <th>Repuesto</th>
                        <th>Cantidad</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(s => {
                        const prov = db.proveedor.find(p => p.id_proveedor == s.id_proveedor);
                        return `
                        <tr>
                            <td><strong>SOL-${s.id_solicita}</strong></td>
                            <td>${prov ? prov.razon_social : 'Proveedor #' + s.id_proveedor}</td>
                            <td><strong>${s.cod_repuesto}</strong></td>
                            <td>${s.cantidad} u.</td>
                            <td>${s.fecha}</td>
                            <td><span class="badge-estado">${s.estado}</span></td>
                            <td>
                                ${s.estado !== 'Recibido' ? `<button class="btn-sm btn-edit" onclick="marcarSolicitudRecibida(${s.id_solicita})">Recibir (+Stock)</button>` : ''}
                                <button class="btn-sm btn-del" onclick="eliminarRegistro(${s.id_solicita})">Eliminar</button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
        summary.innerHTML = `<div class="summary-box"><span>Total Solicitudes:</span><strong>${db.solicita.length}</strong></div>`;
    }

    // 10. INFORME CPK
    else if (moduloActual === 'reportes') {
        title.textContent = 'Costo Por Kilómetro (CPK)';
        tag.textContent = 'Informe Operativo';
        const options = db.vehiculos.map(v => `<option value="${v.patente}">${v.patente} - ${v.marca} ${v.modelo}</option>`).join('');
        view.innerHTML = `
            <div style="padding: 20px;">
                <div class="filter-bar" style="margin-bottom:15px;">
                    <div class="form-group" style="margin:0"><label>Vehículo:</label><select id="cpk-pat">${options}</select></div>
                    <button class="btn-bordo" onclick="calcularCPK()">Calcular CPK</button>
                </div>
                <div id="cpk-res" style="padding:15px; border:1px solid var(--win-border);"></div>
            </div>
        `;
    }

    // 11. INFO SQL
    else if (moduloActual === 'sql-info') {
        title.textContent = 'Base de Datos';
        tag.textContent = 'vektor360.2';
        view.innerHTML = `
            <div style="padding: 20px; height:100%;">
                <h3>Base de datos: vektor360.2</h3>
                <p style="margin-top:8px;">Conexión mediante scripts PHP en la carpeta <code>api/</code>.</p>
            </div>
        `;
    }
}

function calcularCPK() {
    const pat = document.getElementById('cpk-pat').value;
    const veh = db.vehiculos.find(v => v.patente === pat);
    if (!veh) return;
    const costoTotal = Number(veh.km_actuales) * 0.45;
    const cpk = costoTotal / Number(veh.km_actuales);
    document.getElementById('cpk-res').innerHTML = `
        <h4>Resultado CPK: ${veh.patente} (${veh.marca} ${veh.modelo})</h4>
        <p style="margin-top:6px;"><strong>Kilometraje Actual:</strong> ${Number(veh.km_actuales).toLocaleString()} km</p>
        <p><strong>Costo Operativo Estimado:</strong> $${costoTotal.toLocaleString()}</p>
        <p style="font-size:15px; color:#9E1418; margin-top:8px;"><strong>Costo Por Kilómetro: $${cpk.toFixed(4)} / km</strong></p>
    `;
}

// ==================== MODAL ABM ====================
function abrirModalNuevo() {
    if (moduloActual === 'dashboard' || moduloActual === 'reportes' || moduloActual === 'sql-info') {
        cambiarModulo('vehiculos');
    }
    editandoId = null;
    abrirFormulario(null);
}

function abrirModalEditar(id) {
    editandoId = id;
    let item = null;
    if (moduloActual === 'vehiculos') item = db.vehiculos.find(x => x.patente === id);
    if (moduloActual === 'choferes') item = db.chofer.find(x => x.nro_legajo == id);
    if (moduloActual === 'usuarios') item = db.usuario.find(x => x.id_usuarios == id);
    if (moduloActual === 'proveedores') item = db.proveedor.find(x => x.id_proveedor == id);
    if (moduloActual === 'repuestos') item = db.repuestos.find(x => x.cod_repuesto === id);
    if (moduloActual === 'incidentes') item = db.incidentes.find(x => x.id_incidentes == id);
    abrirFormulario(item);
}

function abrirFormulario(item) {
    const modal = document.getElementById('abm-modal');
    const fields = document.getElementById('modal-fields');
    const err = document.getElementById('modal-error');
    err.classList.add('hidden');
    modal.classList.remove('hidden');

    if (moduloActual === 'vehiculos') {
        document.getElementById('modal-title').textContent = item ? `Editar Vehículo ${item.patente}` : 'Nuevo Vehículo';
        fields.innerHTML = `
            <div class="form-group"><label>Patente:</label><input type="text" id="m-pat" value="${item ? item.patente : ''}" ${item ? 'disabled' : ''} required></div>
            <div class="form-group"><label>Marca:</label><input type="text" id="m-marca" value="${item ? item.marca : ''}" required></div>
            <div class="form-group"><label>Modelo:</label><input type="text" id="m-modelo" value="${item ? item.modelo : ''}" required></div>
            <div class="form-group"><label>Año:</label><input type="number" id="m-anio" value="${item ? item.año : 2024}" required></div>
            <div class="form-group"><label>KM Actuales:</label><input type="number" id="m-km" value="${item ? item.km_actuales : 0}" required></div>
            <div class="form-group"><label>Estado:</label>
                <select id="m-est">
                    <option ${item?.Estado==='Disponible'?'selected':''}>Disponible</option>
                    <option ${item?.Estado==='En Ruta'?'selected':''}>En Ruta</option>
                    <option ${item?.Estado==='En Taller'?'selected':''}>En Taller</option>
                    <option ${item?.Estado==='Fuera de Servicio'?'selected':''}>Fuera de Servicio</option>
                </select>
            </div>
        `;
    } else if (moduloActual === 'choferes') {
        document.getElementById('modal-title').textContent = item ? `Editar Chofer #${item.nro_legajo}` : 'Nuevo Chofer';
        fields.innerHTML = `
            <div class="form-group"><label>Nro. Legajo:</label><input type="number" id="m-leg" value="${item ? item.nro_legajo : 103}" ${item ? 'disabled' : ''} required></div>
            <div class="form-group"><label>Licencia:</label><input type="text" id="m-lic" value="${item ? item.licencia : ''}" required></div>
            <div class="form-group"><label>Usuario:</label>
                <select id="m-usr">
                    <option value="">-- Ninguno --</option>
                    ${db.usuario.map(u => `<option value="${u.id_usuarios}" ${item?.id_usuarios == u.id_usuarios ? 'selected' : ''}>${u.nombre}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (moduloActual === 'usuarios') {
        document.getElementById('modal-title').textContent = item ? `Editar Usuario #${item.id_usuarios}` : 'Nuevo Usuario';
        fields.innerHTML = `
            <div class="form-group"><label>DNI:</label><input type="text" id="m-dni" value="${item ? item.DNI : ''}" required></div>
            <div class="form-group"><label>Nombre:</label><input type="text" id="m-nom" value="${item ? item.nombre : ''}" required></div>
            <div class="form-group"><label>Cargo:</label>
                <select id="m-cargo">
                    <option ${item?.cargo==='Administrador'?'selected':''}>Administrador</option>
                    <option ${item?.cargo==='Encargado de Taller'?'selected':''}>Encargado de Taller</option>
                    <option ${item?.cargo==='Chofer'?'selected':''}>Chofer</option>
                    <option ${item?.cargo==='Gerente de Logística'?'selected':''}>Gerente de Logística</option>
                </select>
            </div>
            <div class="form-group"><label>Email:</label><input type="email" id="m-email" value="${item ? item.email : ''}" required></div>
            <div class="form-group"><label>Contraseña:</label><input type="text" id="m-pass" value="${item ? item.contraseña : 'P4$$W0RD'}" required></div>
        `;
    } else if (moduloActual === 'proveedores') {
        document.getElementById('modal-title').textContent = item ? `Editar Proveedor` : 'Nuevo Proveedor';
        fields.innerHTML = `
            <div class="form-group"><label>Razón Social:</label><input type="text" id="m-razon" value="${item ? item.razon_social : ''}" required></div>
            <div class="form-group"><label>Teléfono:</label><input type="text" id="m-tel" value="${item ? item.telefono : ''}" required></div>
            <div class="form-group"><label>Email:</label><input type="email" id="m-email" value="${item ? item.email : ''}" required></div>
        `;
    } else if (moduloActual === 'repuestos') {
        document.getElementById('modal-title').textContent = item ? `Ajustar Repuesto ${item.cod_repuesto}` : 'Nuevo Repuesto';
        fields.innerHTML = `
            <div class="form-group"><label>Código Repuesto:</label><input type="text" id="m-cod" value="${item ? item.cod_repuesto : 'REP-004'}" ${item ? 'disabled' : ''} required></div>
            <div class="form-group"><label>Stock Físico:</label><input type="number" id="m-stock" value="${item ? item.Stock : 10}" required></div>
            <div class="form-group"><label>Stock Mínimo:</label><input type="number" id="m-min" value="${item ? item.Stock_minimo : 5}" required></div>
            <div class="form-group"><label>Costo Unitario ($):</label><input type="number" step="0.01" id="m-costo" value="${item ? item.Costo_unitario : 8500}" required></div>
        `;
    } else if (moduloActual === 'incidentes') {
        document.getElementById('modal-title').textContent = item ? `Actualizar Incidente #${item.id_incidentes}` : 'Registrar Incidente';
        fields.innerHTML = `
            <div class="form-group"><label>Patente Vehículo:</label>
                <select id="m-pat">${db.vehiculos.map(v => `<option value="${v.patente}" ${item?.patente_id===v.patente?'selected':''}>${v.patente} (${v.Estado})</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>Legajo Chofer:</label>
                <select id="m-leg">${db.chofer.map(c => `<option value="${c.nro_legajo}" ${item?.nro_legajo_id==c.nro_legajo?'selected':''}>Legajo #${c.nro_legajo}</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>Lugar:</label><input type="text" id="m-lugar" value="${item ? item.lugar : ''}" required></div>
            <div class="form-group"><label>Detalles:</label><textarea id="m-det" rows="3" required>${item ? item.detalles : ''}</textarea></div>
            <div class="form-group"><label>Estado:</label>
                <select id="m-est">
                    <option ${item?.Estado==='Pendiente'?'selected':''}>Pendiente</option>
                    <option ${item?.Estado==='En Reparación'?'selected':''}>En Reparación</option>
                    <option ${item?.Estado==='Solucionado'?'selected':''}>Solucionado</option>
                </select>
            </div>
        `;
    } else if (moduloActual === 'trabajan') {
        document.getElementById('modal-title').textContent = 'Nueva Orden de Taller';
        fields.innerHTML = `
            <div class="form-group"><label>Incidente:</label>
                <select id="m-inc">${db.incidentes.map(i => `<option value="${i.id_incidentes}">#${i.id_incidentes} - ${i.patente_id}</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>Repuesto:</label>
                <select id="m-rep">${db.repuestos.map(r => `<option value="${r.cod_repuesto}">${r.cod_repuesto} (Stock: ${r.Stock})</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>Cantidad:</label><input type="number" id="m-cant" value="1" min="1" required></div>
        `;
    } else if (moduloActual === 'solicita') {
        document.getElementById('modal-title').textContent = 'Nueva Solicitud de Compra';
        fields.innerHTML = `
            <div class="form-group"><label>Proveedor:</label>
                <select id="m-prov">${db.proveedor.map(p => `<option value="${p.id_proveedor}">${p.razon_social}</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>Repuesto:</label>
                <select id="m-rep">${db.repuestos.map(r => `<option value="${r.cod_repuesto}">${r.cod_repuesto} (Stock: ${r.Stock})</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>Cantidad:</label><input type="number" id="m-cant" value="10" min="1" required></div>
        `;
    }
}

function cerrarModal() {
    document.getElementById('abm-modal').classList.add('hidden');
}

async function guardarRegistro(e) {
    e.preventDefault();
    const err = document.getElementById('modal-error');
    err.classList.add('hidden');
    guardarSnapshot();

    if (moduloActual === 'vehiculos') {
        const patente = editandoId || document.getElementById('m-pat').value.toUpperCase().trim();
        const obj = {
            patente,
            marca: document.getElementById('m-marca').value.trim(),
            modelo: document.getElementById('m-modelo').value.trim(),
            año: Number(document.getElementById('m-anio').value),
            km_actuales: Number(document.getElementById('m-km').value),
            Estado: document.getElementById('m-est').value
        };
        try {
            await fetch('api/vehiculos.php', {
                method: editandoId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            });
        } catch (ex) {}
        if (editandoId) {
            const idx = db.vehiculos.findIndex(v => v.patente === editandoId);
            if (idx >= 0) db.vehiculos[idx] = obj;
        } else {
            db.vehiculos.push(obj);
        }
    } else if (moduloActual === 'choferes') {
        const leg = editandoId || Number(document.getElementById('m-leg').value);
        const obj = { nro_legajo: leg, licencia: document.getElementById('m-lic').value.trim(), id_usuarios: document.getElementById('m-usr').value || null };
        if (editandoId) db.chofer[db.chofer.findIndex(c => c.nro_legajo == editandoId)] = obj;
        else db.chofer.push(obj);
    } else if (moduloActual === 'usuarios') {
        const obj = {
            id_usuarios: editandoId || (db.usuario.length + 1),
            DNI: document.getElementById('m-dni').value.trim(),
            nombre: document.getElementById('m-nom').value.trim(),
            cargo: document.getElementById('m-cargo').value,
            email: document.getElementById('m-email').value.trim(),
            contraseña: document.getElementById('m-pass').value
        };
        if (editandoId) db.usuario[db.usuario.findIndex(u => u.id_usuarios == editandoId)] = obj;
        else db.usuario.push(obj);
    } else if (moduloActual === 'proveedores') {
        const obj = {
            id_proveedor: editandoId || (db.proveedor.length + 1),
            razon_social: document.getElementById('m-razon').value.trim(),
            telefono: document.getElementById('m-tel').value.trim(),
            email: document.getElementById('m-email').value.trim()
        };
        if (editandoId) db.proveedor[db.proveedor.findIndex(p => p.id_proveedor == editandoId)] = obj;
        else db.proveedor.push(obj);
    } else if (moduloActual === 'repuestos') {
        const cod = editandoId || document.getElementById('m-cod').value.toUpperCase().trim();
        const obj = {
            cod_repuesto: cod,
            Stock: Number(document.getElementById('m-stock').value),
            Stock_minimo: Number(document.getElementById('m-min').value),
            Costo_unitario: Number(document.getElementById('m-costo').value),
            id_usuarios: usuarioActivo.id_usuarios
        };
        if (editandoId) db.repuestos[db.repuestos.findIndex(r => r.cod_repuesto === editandoId)] = obj;
        else db.repuestos.push(obj);
    } else if (moduloActual === 'incidentes') {
        const obj = {
            id_incidentes: editandoId || (db.incidentes.length + 1),
            fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
            patente_id: document.getElementById('m-pat').value,
            nro_legajo_id: Number(document.getElementById('m-leg').value),
            lugar: document.getElementById('m-lugar').value.trim(),
            detalles: document.getElementById('m-det').value.trim(),
            Estado: document.getElementById('m-est').value
        };
        try {
            await fetch('api/reporte_incidentes.php', {
                method: editandoId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            });
        } catch (ex) {}
        if (editandoId) db.incidentes[db.incidentes.findIndex(i => i.id_incidentes == editandoId)] = obj;
        else db.incidentes.push(obj);
    } else if (moduloActual === 'trabajan') {
        const cod = document.getElementById('m-rep').value;
        const cant = Number(document.getElementById('m-cant').value);
        const rep = db.repuestos.find(r => r.cod_repuesto === cod);
        if (!rep || cant > Number(rep.Stock)) {
            historialDeshacer.pop();
            err.textContent = `Stock insuficiente (Disponible: ${rep ? rep.Stock : 0}).`;
            err.classList.remove('hidden');
            return;
        }
        rep.Stock -= cant;
        db.trabajan.push({
            id_trabajan: db.trabajan.length + 1,
            id_incidentes: Number(document.getElementById('m-inc').value),
            cod_repuesto: cod,
            id_usuarios: usuarioActivo.id_usuarios,
            fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
            cantidad: cant
        });
    } else if (moduloActual === 'solicita') {
        db.solicita.push({
            id_solicita: db.solicita.length + 1,
            id_proveedor: Number(document.getElementById('m-prov').value),
            cod_repuesto: document.getElementById('m-rep').value,
            id_usuarios: usuarioActivo.id_usuarios,
            fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
            cantidad: Number(document.getElementById('m-cant').value),
            estado: 'Pendiente'
        });
    }

    cerrarModal();
    renderizarModulo();
}

function marcarSolicitudRecibida(id) {
    const sol = db.solicita.find(s => s.id_solicita == id);
    if (!sol || sol.estado === 'Recibido') return;
    guardarSnapshot();
    sol.estado = 'Recibido';
    const rep = db.repuestos.find(r => r.cod_repuesto === sol.cod_repuesto);
    if (rep) rep.Stock = Number(rep.Stock) + Number(sol.cantidad);
    renderizarModulo();
}

async function eliminarRegistro(id) {
    if (!confirm(`¿Confirma eliminar el registro ${id}?`)) return;
    guardarSnapshot();
    if (moduloActual === 'vehiculos') {
        try { await fetch(`api/vehiculos.php?patente=${id}`, { method: 'DELETE' }); } catch (e) {}
        db.vehiculos = db.vehiculos.filter(v => v.patente !== id);
    } else if (moduloActual === 'choferes') {
        db.chofer = db.chofer.filter(c => c.nro_legajo != id);
    } else if (moduloActual === 'usuarios') {
        db.usuario = db.usuario.filter(u => u.id_usuarios != id);
    } else if (moduloActual === 'proveedores') {
        db.proveedor = db.proveedor.filter(p => p.id_proveedor != id);
    } else if (moduloActual === 'repuestos') {
        db.repuestos = db.repuestos.filter(r => r.cod_repuesto !== id);
    } else if (moduloActual === 'incidentes') {
        try { await fetch(`api/reporte_incidentes.php?id_incidentes=${id}`, { method: 'DELETE' }); } catch (e) {}
        db.incidentes = db.incidentes.filter(i => i.id_incidentes != id);
    } else if (moduloActual === 'trabajan') {
        db.trabajan = db.trabajan.filter(t => t.id_trabajan != id);
    } else if (moduloActual === 'solicita') {
        db.solicita = db.solicita.filter(s => s.id_solicita != id);
    }
    renderizarModulo();
}