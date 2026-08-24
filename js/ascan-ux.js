document.addEventListener('DOMContentLoaded', () => {
    if (window.M) {
        M.Modal.init(document.querySelectorAll('.modal'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }
    actualizarResumen();
});

const autosaveIndicator = document.getElementById('autosaveIndicator')
/* ===== DATA ===== */
const defs = {
    parte: {
        label: 'Parte',
        type: 'text'
    },
    serie: {
        label: 'Serie',
        type: 'text'
    },
    cantidad: {
        label: 'Cantidad',
        type: 'number',
        min: '0',
        step: 'any',
        inputMode: 'decimal'
    },
    ubicacion: {
        label: 'Ubicación',
        type: 'text'
    },
    lote: {
        label: 'Lote',
        type: 'text'
    }
}
let listas = [],
    listaActiva = null

const STORAGE_KEY = 'scanner_inventario_datos'
const byId = id => document.getElementById(id)
const makeId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

/* ===== SCANNER AUTO FOCUS ===== */
function enfocarCampoActivo() {
    if (!listaActiva || document.querySelector('.modal.open')) return;

    const inputs = [...document.querySelectorAll('#formEscaneo input')];
    if (!inputs.length) return;

    const target = inputs.find(i => !i.value.trim()) || inputs[inputs.length - 1];
    target.focus();
    target.select();
}

/* ===== STORAGE ===== */
function guardarDatos() {
    actualizarResumen()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        listas,
        listaActivaId: listaActiva?.id
    }))
    autosaveIndicator.style.display = 'block'
    clearTimeout(autosaveIndicator._t)
    autosaveIndicator._t = setTimeout(() => autosaveIndicator.style.display = 'none', 1500)
}

function cargarDatos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        listas = Array.isArray(parsed.listas) ? parsed.listas : []
        listaActiva = listas.find(l => l.id === parsed.listaActivaId) || listas[0] || null
    } catch (error) {
        console.error('No se pudieron cargar los datos guardados:', error)
        listas = []
        listaActiva = null
        localStorage.removeItem(STORAGE_KEY)
    }
}

/* ===== CONFIG / LISTS ===== */
function abrirConfiguracion() {
    M.Modal.getInstance(modalConfig).open()
}

function crearLista() {
    const checks = [...modalConfig.querySelectorAll('input[type=checkbox]:checked')]
    const campos = checks.map(c => ({
        key: c.value,
        ...defs[c.value]
    }))

    const extra = campoPersonalizado.value.trim()
    if (extra) {
        campos.splice(campos.length - 1, 0, {
            key: 'c_' + Date.now(),
            label: extra,
            type: 'text'
        })
    }

    listas.push({
        id: makeId(),
        nombre: `Lista ${listas.length+1}`,
        campos: JSON.parse(JSON.stringify(campos)),
        filas: []
    })

    campoPersonalizado.value = ''
    guardarDatos()
    seleccionarLista(listas[listas.length - 1].id)

    M.Modal.getInstance(modalConfig).close()
}


/* ===== TABS ===== */
function renderTabs() {
    syncTablaConDatos(false)
    tabs.replaceChildren()
    listas.forEach(l => {
        const chip = document.createElement('div')
        chip.className = 'chip ' + (listaActiva && l.id === listaActiva.id ? 'blue' : '')
        chip.tabIndex = 0
        chip.setAttribute('role', 'button')
        chip.setAttribute('aria-label', `Abrir ${l.nombre}. Doble clic para renombrar.`)

        const name = document.createElement('span')
        name.className = 'chip-name'
        name.textContent = l.nombre
        const remove = document.createElement('button')
        remove.type = 'button'
        remove.className = 'chip-delete'
        remove.textContent = '×'
        remove.setAttribute('aria-label', `Eliminar ${l.nombre}`)
        remove.onclick = e => { e.stopPropagation(); eliminarLista(l.id) }

        chip.append(name, remove)
        chip.onclick = () => seleccionarLista(l.id)
        chip.ondblclick = e => { e.preventDefault(); abrirRenombrarLista(l.id) }
        chip.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seleccionarLista(l.id) }
            if (e.key === 'F2') { e.preventDefault(); abrirRenombrarLista(l.id) }
        }
        tabs.appendChild(chip)
    })
}

function seleccionarLista(id) {
    syncTablaConDatos()

    listaActiva = listas.find(l => l.id === id)

    // CLEAR UI BEFORE SYNC
    cuerpoTabla.innerHTML = ''

    btnCopiar.disabled = btnPivot.disabled = btnExportar.disabled = btnCompartir.disabled = !listaActiva

    renderTabs()
    construirFormulario()
    renderTabla()
    guardarDatos()

    setTimeout(enfocarCampoActivo, 100)
}

function eliminarLista(id) {
    materialConfirm('¿Eliminar la lista completa?', 'Eliminar lista').then(ok => {
        if (!ok) return
        listas = listas.filter(l => l.id !== id)
        listaActiva = listas[0] || null
        guardarDatos();
        renderTabs();
        construirFormulario();
        renderTabla()
    })
}

function renombrarLista(id) {
    syncTablaConDatos()
    const lista = listas.find(l => l.id === id)
    if (!lista) return

    const nuevoNombre = prompt('Nuevo nombre de la lista:', lista.nombre)
    if (!nuevoNombre || !nuevoNombre.trim()) return

    lista.nombre = nuevoNombre.trim()
    guardarDatos()
    renderTabs()
}

/* ===== FORM ===== */
function construirFormulario() {
    formEscaneo.innerHTML = '';
    encabezadoTabla.innerHTML = ''
    if (!listaActiva) return
    listaActiva.campos.forEach((c, i) => {
        const col = document.createElement('div')
        col.className = 'input-field col s12'
        const inp = document.createElement('input')
        inp.id = c.key;
        inp.type = c.type
        if (c.min !== undefined) inp.min = c.min
        if (c.step) inp.step = c.step
        if (c.inputMode) inp.inputMode = c.inputMode
        inp.autocomplete = 'off'
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault()

                const inputs = [...formEscaneo.querySelectorAll('input')]

                // If last field → auto add row
                if (i === inputs.length - 1) {

                    //  AUTO ADD
                    agregarFila()

                    setTimeout(enfocarCampoActivo, 50)

                } else {
                    inputs[i + 1].focus()
                    inputs[i + 1].select()
                }
            }
        })
        const lbl = document.createElement('label')
        lbl.htmlFor = c.key;
        lbl.textContent = c.label
        const step = document.createElement('span')
        step.className = 'scan-step'
        step.textContent = i + 1
        step.setAttribute('aria-hidden', 'true')
        col.append(step, inp, lbl);
        formEscaneo.appendChild(col)
        encabezadoTabla.appendChild(Object.assign(document.createElement('th'), {
            textContent: c.label
        }))
    })
    encabezadoTabla.innerHTML += '<th>Hora</th><th></th>'
    M.updateTextFields()
}

/* ===== ROWS ===== */
function syncTablaConDatos(save = true) {
    if (!listaActiva) return

    const rows = document.querySelectorAll('#cuerpoTabla tr')

    rows.forEach((tr, i) => {
        if (!listaActiva.filas[i]) return

        const fila = listaActiva.filas[i]
        const celdas = tr.querySelectorAll('td[contenteditable]')

        celdas.forEach((td, j) => {
            const campo = listaActiva.campos[j]
            if (!campo) return

            const key = campo.key
            const valorDOM = td.textContent.trim()

            if (fila[key] !== valorDOM) {
                fila[key] = valorDOM
            }
        })
    })

    if (save) guardarDatos()
}

function agregarFila() {
    syncTablaConDatos()
    // Force save current edit
    if (document.activeElement) {
        document.activeElement.blur()
    }

    if (!listaActiva) return
    const fila = {}
    for (const c of listaActiva.campos) {
        const v = document.getElementById(c.key).value.trim()
        if ((c.key === 'parte' || c.key === 'cantidad') && !v) {
            const input = document.getElementById(c.key)
            input.classList.add('field-error')
            input.focus()
            showScanStatus(`Falta ${c.label}`, true)
            setTimeout(() => input.classList.remove('field-error'), 1600)
            return
        }
        fila[c.key] = v
    }
    fila.tiempo = new Date().toISOString()
    listaActiva.filas.unshift(fila)
    guardarDatos()
    construirFormulario()
    renderTabla()
    showScanStatus("Escaneado")
}

/* ===== TABLE ===== */
function renderTabla() {
    cuerpoTabla.innerHTML = ''
    if (!listaActiva) return
    listaActiva.filas.forEach((r, i) => {
        const tr = document.createElement('tr')
        if (i === 0) {
            tr.classList.add('new-row')

            setTimeout(() => {
                tr.classList.remove('new-row')
            }, 1200)
        }
        listaActiva.campos.forEach(c => {
            const td = document.createElement('td')

            // IMPORTANT: prevents line breaks and HTML
            td.setAttribute('contenteditable', 'plaintext-only')

            td.textContent = r[c.key] ?? ''

            // SAVE WHILE TYPING
            td.oninput = () => {
                const val = td.textContent.trim()
                r[c.key] = val
                guardarDatos()
            }

            // ENTER = SAVE + EXIT + RETURN TO INPUT FORM
            td.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()

                    // remove any accidental line breaks
                    td.textContent = td.textContent.replace(/\n/g, '').trim()

                    const val = td.textContent
                    r[c.key] = val
                    guardarDatos()

                    td.blur()

                    //  go back to scanner input
                    setTimeout(() => {
                        enfocarCampoActivo()
                    }, 20)
                }

                //  ESC = cancel edit and return
                if (e.key === 'Escape') {
                    e.preventDefault()

                    td.textContent = r[c.key] ?? ''
                    td.blur()

                    setTimeout(() => {
                        enfocarCampoActivo()
                    }, 20)
                }
            })
            tr.appendChild(td)
        })
        const timeCell = document.createElement('td')
        const parsedTime = new Date(r.tiempo)
        timeCell.textContent = Number.isNaN(parsedTime.getTime()) ? '—' : parsedTime.toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})
        tr.appendChild(timeCell)
        const b = document.createElement('button')
        b.className = 'btn-small red row-delete'
        b.type = 'button'
        b.setAttribute('aria-label', `Eliminar registro ${i + 1}`)
        b.textContent = '×'
        b.onclick = () => materialConfirm('¿Eliminar fila?', 'Confirmar eliminación').then(ok => {
            if (ok) {
                listaActiva.filas.splice(i, 1)
                guardarDatos();
                renderTabla()
            }
        })
        const td = document.createElement('td')
        td.appendChild(b)
        tr.appendChild(td)
        cuerpoTabla.appendChild(tr)
    })
    renderDataExplorer()
}

/* ===== DATA EXPLORER ===== */
function renderDataExplorer() {
    const search = document.getElementById('globalSearch')
    const select = document.getElementById('searchField')
    const details = document.getElementById('listDetails')
    if (!search || !select || !details) return
    details.textContent = listaActiva ? `${listaActiva.filas.length} registros · ${listaActiva.campos.length} campos` : '0 registros · 0 campos'
    const current = select.value
    select.replaceChildren(new Option('Todos los campos', 'all'))
    if (listaActiva) listaActiva.campos.forEach(c => select.add(new Option(c.label, c.key)))
    select.value = [...select.options].some(o => o.value === current) ? current : 'all'
    applyDataSearch()
}
function applyDataSearch() {
    const search = document.getElementById('globalSearch')
    const select = document.getElementById('searchField')
    const summary = document.getElementById('searchSummary')
    const mobile = document.getElementById('mobileRecords')
    if (!search || !select || !summary || !mobile) return
    const query = search.value.trim().toLocaleLowerCase('es-MX')
    const field = select.value
    const rows = listaActiva?.filas || []
    const matches = rows.map((r,index) => ({r,index})).filter(({r}) => {
        if (!query) return true
        const keys = field === 'all' ? [...listaActiva.campos.map(c => c.key), 'tiempo'] : [field]
        return keys.some(key => String(r[key] ?? '').toLocaleLowerCase('es-MX').includes(query))
    })
    document.querySelectorAll('#cuerpoTabla tr').forEach((tr,index) => { tr.hidden = !matches.some(m => m.index === index) })
    summary.textContent = query ? `${matches.length} de ${rows.length} registros encontrados` : `${rows.length} registros`
    mobile.replaceChildren()
    if (!matches.length) {
        const empty = document.createElement('div'); empty.className='no-results'; empty.textContent='No se encontraron registros.'; mobile.appendChild(empty); return
    }
    matches.forEach(({r,index},position) => {
        const card=document.createElement('article'); card.className='mobile-record'
        const head=document.createElement('div'); head.className='mobile-record-head'
        const number=document.createElement('span'); number.className='record-number'; number.textContent=`#${String(position+1).padStart(2,'0')}`
        const del=document.createElement('button'); del.type='button'; del.className='mobile-delete'; del.textContent='×'; del.setAttribute('aria-label',`Eliminar registro ${position+1}`)
        del.onclick=()=>materialConfirm('¿Eliminar fila?','Confirmar eliminación').then(ok=>{if(ok){listaActiva.filas.splice(index,1);guardarDatos();renderTabla()}})
        head.append(number,del)
        const grid=document.createElement('div'); grid.className='mobile-record-grid'
        listaActiva.campos.forEach(c=>{const box=document.createElement('div');box.className='mobile-field';const label=document.createElement('small');label.textContent=c.label;const value=document.createElement('strong');value.textContent=r[c.key]||'—';box.append(label,value);grid.appendChild(box)})
        const time=document.createElement('div');time.className='mobile-field';const tl=document.createElement('small');tl.textContent='Hora';const tv=document.createElement('strong');const dt=new Date(r.tiempo);tv.textContent=Number.isNaN(dt.getTime())?'—':dt.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});time.append(tl,tv);grid.appendChild(time)
        card.append(head,grid);mobile.appendChild(card)
    })
}
document.getElementById('globalSearch')?.addEventListener('input', applyDataSearch)
document.getElementById('searchField')?.addEventListener('change', applyDataSearch)

/* ===== UTIL ===== */
function copiarLista() {
    syncTablaConDatos()
    tituloCopiar.textContent = `Copiar – ${listaActiva.nombre}`
    const l = [listaActiva.campos.map(c => c.label).join('\t')]
    listaActiva.filas.forEach(r => l.push(listaActiva.campos.map(c => r[c.key] || '').join('\t')))
    textoCopiar.value = l.join('\n')
    M.Modal.getInstance(modalCopiar).open()
}

async function writeClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        M.toast({ html: 'Copiado al portapapeles', classes: 'green' })
    } catch {
        const area = document.createElement('textarea')
        area.value = text
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        area.remove()
        M.toast({ html: 'Copiado al portapapeles', classes: 'green' })
    }
}
function copiarTexto() { return writeClipboard(textoCopiar.value) }

function abrirPivot() {
    syncTablaConDatos()
    tituloPivot.textContent = `Resumen – ${listaActiva.nombre}`

    const t = {}
    const l = ['Parte\t Cantidad\t Escaneos'] // headers

    listaActiva.filas.forEach(r => {
        const p = (r.parte || '').trim().toUpperCase()
        const q = parseFloat(r.cantidad || 0)

        if (!p) return

        if (!t[p]) {
            t[p] = {
                count: 0,
                sum: 0
            }
        }

        // COUNT scans
        t[p].count += 1

        // SUM quantity
        t[p].sum += q
    })

    Object.keys(t).forEach(p => {
        l.push(`${p}\t${t[p].sum}\t${t[p].count}`)
    })

    textoPivot.value = l.join('\n')
    M.Modal.getInstance(modalPivot).open()
}

function copiarPivot() {
    syncTablaConDatos()
    writeClipboard(textoPivot.value)
}


/* ===== EXPORT CSV ===== */

function csvValue(value) {
    let text = String(value ?? '')
    if (/^[=+@-]/.test(text)) text = "'" + text
    return `"${text.replace(/"/g, '""')}"`
}
function buildCsv(lista) {
    const headers = lista.campos.map(c => csvValue(c.label))
    const rows = lista.filas.map(r => lista.campos.map(c => csvValue(r[c.key])).join(','))
    return '\ufeff' + [headers.join(','), ...rows].join('\r\n')
}
function safeFilename(name) {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || 'A-Scan'
}


function getFormattedTimestamp() {
    const now = new Date();

    const date = now.toLocaleDateString('sv-SE'); // YYYY-MM-DD
    const time = now.toLocaleTimeString('en-GB'); // HH:MM:SS

    return `${date}_${time.replace(/:/g, '-')}`;
}

function exportarLista() {
    syncTablaConDatos()
    if (!listaActiva) return

    const csv = buildCsv(listaActiva)

    const timestamp = getFormattedTimestamp()
    const filename = `${safeFilename(listaActiva.nombre)}_${timestamp}.csv`

    const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    M.toast({
        html: `Descargado: ${filename}`,
        classes: 'blue'
    })
}

async function shareLista() {
    syncTablaConDatos()
    if (!listaActiva) return

    const csv = buildCsv(listaActiva)

    const timestamp = getFormattedTimestamp()
    const filename = `${safeFilename(listaActiva.nombre)}_${timestamp}.csv`

    const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8'
    })
    const file = new File([blob], filename, {
        type: 'text/csv;charset=utf-8'
    })

    if (navigator.canShare && navigator.canShare({
            files: [file]
        })) {
        try {
            await navigator.share({
                title: 'A-Scan Export',
                text: `Archivo generado: ${filename}`,
                files: [file]
            })

            M.toast({
                html: `Compartido: ${filename}`,
                classes: 'green'
            })

        } catch (err) {
            console.log('Share cancelled')
        }
    } else {
        M.toast({
            html: 'Compartir no disponible',
            classes: 'orange'
        })
    }
}


/* ===== CONFIRM ===== */
function materialConfirm(msg, title = 'Confirmar') {
    return new Promise(res => {
        confirmTitle.textContent = title
        confirmMessage.textContent = msg

        const ok = confirmOk.cloneNode(true)
        const cancel = confirmCancel.cloneNode(true)

        confirmOk.replaceWith(ok)
        confirmCancel.replaceWith(cancel)

        ok.onclick = () => {
            M.Modal.getInstance(modalConfirm).close()
            res(true)
        }

        cancel.onclick = () => {
            M.Modal.getInstance(modalConfirm).close()
            res(false)
        }

        M.Modal.getInstance(modalConfirm).open()
    })
}
/* ===== Rename ===== */
let listaARenombrar = null

function abrirRenombrarLista(id) {
    syncTablaConDatos()
    listaARenombrar = listas.find(l => l.id === id)
    if (!listaARenombrar) return

    nuevoNombreLista.value = listaARenombrar.nombre
    M.updateTextFields()

    M.Modal.getInstance(modalRenombrar).open()
}

function confirmarRenombrar() {
    syncTablaConDatos()
    if (!listaARenombrar) return

    const nombre = nuevoNombreLista.value.trim()
    if (!nombre) return

    listaARenombrar.nombre = nombre
    listaARenombrar = null

    guardarDatos()
    renderTabs()

    M.Modal.getInstance(modalRenombrar).close()
}

function showScanStatus(msg, isError = false) {
    const el = document.getElementById('scanStatus')
    el.textContent = msg
    el.classList.toggle('status-error', isError)

    setTimeout(() => {
        el.textContent = "Escaneo listo"
        el.classList.remove('status-error')
    }, 1000)
}

/* ===== Clean ===== */
function borrarTodosLosDatos() {
    materialConfirm('¿Eliminar TODAS las listas y datos guardados?', 'Borrar todo')
        .then(ok => {
            if (!ok) return;

            listas = [];
            listaActiva = null;

            localStorage.removeItem(STORAGE_KEY);

            renderTabs();
            construirFormulario();
            renderTabla();
            actualizarResumen();
            [btnCopiar, btnPivot, btnExportar, btnCompartir].forEach(btn => btn.disabled = true);
        });
}

/* ===== INIT ===== */
cargarDatos()
renderTabs()
construirFormulario()
renderTabla()

function actualizarResumen() {
    const listCount = document.getElementById('listCount');
    const rowCount = document.getElementById('rowCount');
    if (listCount) listCount.textContent = listas.length;
    if (rowCount) rowCount.textContent = listas.reduce((sum, l) => sum + (l.filas?.length || 0), 0);
    const empty = document.getElementById('emptyWorkspace');
    const workspace = document.getElementById('workspaceContent');
    if (empty) empty.hidden = !!listaActiva;
    if (workspace) workspace.hidden = !listaActiva;
}