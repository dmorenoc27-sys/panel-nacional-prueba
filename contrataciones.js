/* contrataciones.js — vista "Contrataciones" de una unidad ejecutora (todos los niveles, con y sin clave).
   Datos: Web/data/contrat/<ue>.json (Scripts/proveedores.py → generar_entidades): adjudicaciones del SEACE 2018→ por objeto
   (Obras, Bienes, Servicios, Consultoría de obra), tipo de proceso, proveedor, contratos resueltos, penalidades y arbitrajes.
   Contrataciones.ui(el, u, {obras: html de obras vinculadas a inversiones (SEACE por CUI), onCui(cui)}) */
(function () {
  const S = v => v == null ? '—' : 'S/ ' + (v >= 1e6 ? (v / 1e6).toFixed(1) + ' M' : v.toLocaleString('es-PE', { maximumFractionDigits: 0 }));
  const D = f => f ? f.slice(8, 10) + '/' + f.slice(5, 7) + '/' + f.slice(0, 4) : '—';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const OBJ = { O: ['Obras', '🏗️', '#1E5AA8'], B: ['Bienes', '📦', '#00897B'], S: ['Servicios', '🛠️', '#6A1B9A'], C: ['Consultoría de obra', '📐', '#B8860B'], X: ['Otros', '📄', '#8A94A6'] };
  const ORDEN = ['O', 'B', 'S', 'C', 'X'];
  const ANIO = new Date().getFullYear();
  const tile = (k, r, act) => `<div class="card" style="padding:12px 14px;border-left:5px solid ${OBJ[k][2]}"><div style="font-size:10px;font-weight:800;color:var(--mut);text-transform:uppercase;letter-spacing:.6px">${OBJ[k][1]} ${OBJ[k][0]}</div>
      <div style="font-size:19px;font-weight:800;color:${OBJ[k][2]};line-height:1.15;margin-top:3px">${r ? S(r[1]) : '—'}</div>
      <div style="font-size:11px;color:var(--ink2)">${r ? `${r[0]} proceso${r[0] > 1 ? 's' : ''} adjudicado${r[0] > 1 ? 's' : ''} desde 2018` : 'sin procesos desde 2018'}</div>
      <div style="font-size:10.5px;color:var(--ink);margin-top:2px">${ANIO}: ${act ? `<b>${act[0]}</b> · ${S(act[1])}` : '<span class="mutx">ninguno</span>'}</div></div>`;
  const lbl = (t, s) => `<div class="pd-lbl" style="margin-top:14px">${t}${s ? `<small>${s}</small>` : ''}</div>`;
  const tag = (t, k) => `<span class="tag ${k}">${t}</span>`;
  const prov = (ruc, nombre) => `<a class="fc" data-ruc="${esc(ruc)}" title="Verificar sanciones e historial del RUC ${esc(ruc)}" style="cursor:pointer">${esc(nombre || ruc)}</a>`;

  // ponytail: estilos del modulo inyectados una vez (paneles con profundidad, hover, estado activo y entrada animada del detalle)
  function css() {
    if (document.getElementById('ct-css')) return;
    const st = document.createElement('style'); st.id = 'ct-css'; st.textContent = `
      .ct-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .ct-bars i{position:relative}.ct-bars i em{position:absolute;left:0;right:0;bottom:0;background:#1B9E5A;border-radius:inherit}@media(max-width:1100px){.ct-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.ct-grid{grid-template-columns:1fr}}
      .ct-p{position:relative;overflow:hidden;background:#fff;border-radius:14px;padding:10px 14px 9px;border:1px solid rgba(15,42,67,.08);border-left:5px solid var(--c);box-shadow:0 1px 2px rgba(15,42,67,.06),0 6px 16px -8px rgba(15,42,67,.18);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s ease;user-select:none}
      .ct-p:hover{transform:translateY(-3px);box-shadow:0 2px 4px rgba(15,42,67,.08),0 14px 28px -10px rgba(15,42,67,.32)}
      .ct-p:active{transform:translateY(-1px) scale(.995)}
      .ct-p.on{background:linear-gradient(135deg,var(--c) 0%,color-mix(in srgb,var(--c) 78%,#0F2A43) 100%);color:#fff;border-color:transparent;box-shadow:0 10px 26px -8px color-mix(in srgb,var(--c) 70%,transparent)}
      .ct-p.on .ct-k,.ct-p.on .ct-s,.ct-p.on .ct-y{color:rgba(255,255,255,.85)}.ct-p.on .ct-v{color:#fff}
      .ct-p::after{content:'▾';position:absolute;right:11px;top:8px;font-size:14px;color:var(--mut);transition:transform .25s ease}.ct-p.on::after{transform:rotate(180deg);color:#fff}
      .ct-k{font-size:10px;font-weight:800;color:var(--mut);text-transform:uppercase;letter-spacing:.7px;padding-right:16px}.ct-v{font-size:19px;font-weight:800;color:var(--c);line-height:1.1;margin-top:3px;font-variant-numeric:tabular-nums}
      .ct-s{font-size:11px;color:var(--ink2);margin-top:2px}.ct-y{font-size:10.5px;color:var(--ink);margin-top:3px}
      .ct-det{margin-top:12px;border-radius:14px;background:#fff;border:1px solid rgba(15,42,67,.08);box-shadow:0 8px 24px -12px rgba(15,42,67,.25);padding:14px 16px;animation:ctIn .28s ease}
      .ct-det .pd-lbl:first-child{margin-top:0}
      @keyframes ctIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
      .ct-hero{position:relative;overflow:hidden;border-radius:16px;background:radial-gradient(900px 300px at 10% -20%,rgba(255,255,255,.14),transparent 60%),linear-gradient(135deg,#164A8C 0%,#1E5AA8 55%,#2F6FC2 100%);color:#fff;padding:18px 20px;box-shadow:0 14px 34px -14px rgba(22,74,140,.5)}
      .ct-hero input{transition:box-shadow .2s ease,transform .2s ease}.ct-hero input:focus{outline:0;box-shadow:0 0 0 4px rgba(255,255,255,.45);transform:scale(1.01)}
      .ct-top{display:flex;gap:12px;align-items:center;margin:0 0 10px;padding:7px 14px;background:linear-gradient(135deg,#fff 60%,#EDF3FC);border:1px solid var(--line);border-left:5px solid var(--p);border-radius:12px;box-shadow:var(--sh)}
      .ct-top .ct-mod{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:var(--p)}
      .ct-top .ct-nom{font-size:17px;font-weight:800;color:var(--p2);line-height:1.15;margin:2px 0}
      .ct-top .btn{white-space:nowrap}
      .ct-top select{padding:7px 12px;border:1.5px solid var(--p);border-radius:999px;font:inherit;font-size:12.5px;font-weight:700;color:var(--p2);background:#fff;cursor:pointer}
      .ct-strip{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 10px}
      .ct-strip .tag{font-size:11px;padding:3px 9px;box-shadow:0 1px 2px rgba(15,42,67,.08)}
      .ct-bars{display:flex;gap:6px;align-items:flex-end;height:96px;padding:8px 4px 0}.ct-bars>div{flex:1;text-align:center;font-size:10px;color:var(--ink2)}.ct-bars i{display:block;border-radius:5px 5px 0 0;margin:2px 5px 0;background:var(--c,var(--p2));transform-origin:bottom;animation:ctGrow .5s ease both}
      @keyframes ctGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
      .ct-seg button{padding:4px 10px;font-size:11.5px;border-radius:999px;transition:background .15s,color .15s}.ct-seg button.on{background:var(--p2);color:#fff}`;
    document.head.appendChild(st);
  }
  // cuenta regresiva de los montos al pintar (movimiento sin librerias)
  function countUp(el) {
    el.querySelectorAll('[data-n]').forEach(x => { const v = +x.dataset.n, t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - k, 3); x.textContent = S(v * e); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  }
  const barras = (pares, col, sel) => { const mx = Math.max(...pares.map(p => p[1])) || 1; return `<div class="ct-bars" style="--c:${col}">${pares.map(([k, v, n]) => `<div title="${k}: ${n} proceso${n === 1 ? '' : 's'} · ${S(v)}" style="${sel && k !== sel ? 'opacity:.35' : ''}"><div style="font-size:9.5px;font-weight:700;color:var(--ink)">${v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : v || ''}</div><i style="height:${Math.max(3, Math.round(56 * v / mx))}px"></i>${k}</div>`).join('')}</div>`; };

  // PAC: barras por mes; la parte verde son los procesos que ya tienen buena pro
  const MESN = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  const barsPA = pares => { const mx = Math.max(...pares.map(p => p[1])) || 1; return `<div class="ct-bars" style="--c:#5C6BC0">${pares.map(([m, n, a]) => `<div title="${m}: ${n} programado${n === 1 ? '' : 's'}${a != null ? ` · ${a} con buena pro` : ''}"><div style="font-size:9.5px;font-weight:700;color:var(--ink)">${n || ''}</div><i style="height:${Math.max(3, Math.round(56 * n / mx))}px">${a ? `<em style="height:${Math.round(100 * a / n)}%"></em>` : ''}</i>${m}</div>`).join('')}</div>`; };
  const NIV = { E: 'Gobierno Nacional', R: 'Gobierno Regional', M: 'Gobierno Local', L: 'Gobierno Local' };
  // cabecera fija del modulo: siempre se ve que entidad se analiza y en que modulo estamos; Atras cierra, Limpiar deja todo como al entrar
  const cabecera = (u, sub, opts, sel) => `<div class="ct-top">${opts.onAtras ? '<button type="button" class="ov-volver" id="ct-atras"><span class="ov-fl" aria-hidden="true">←</span>Volver</button>' : ''}<div style="flex:1;min-width:0"><div class="ct-mod">📑 Contrataciones · SEACE</div><div class="mutx" style="font-size:11.5px">${esc(u.nombre || ('UE ' + u.cod))} · UE ${esc(u.cod)}${sub ? ' · ' + sub : ''}</div></div>${sel || ''}<button class="btn" id="ct-limpiar" title="Cerrar paneles y borrar la búsqueda de proveedor">🧹 Limpiar</button></div>`;
  function vista(el, u, d, opts, Y) {
    css(); Y = Y || '';   // Y = anio elegido en la cabecera ('' = todos): TODO el modulo se recalcula para ese anio
    const anios = Object.keys(d.anios || {}).sort(), act = (d.anios || {})[String(ANIO)] || {};
    const yr = v => String(v || '').slice(0, 4) === Y;
    const res = Y ? (d.anios[Y] || {}) : d.res, procs = Y ? d.proc.filter(p => yr(p[0])) : d.proc;
    const pen = Y ? (d.pen || []).filter(x => yr(x[0])) : (d.pen || []), arb = Y ? (d.arb || []).filter(x => yr(x[0])) : (d.arb || []);
    const resueltos = procs.filter(p => p[10]);
    const n_res = Y ? resueltos.length : (d.n_res || 0), m_res = Y ? resueltos.reduce((a, p) => a + (p[7] || 0), 0) : d.m_res, pen_tot = Y ? (pen.length ? [pen.length, pen.reduce((a, x) => a + (x[4] || 0), 0)] : null) : d.pen_tot;
    const sancDe = new Map((d.prov || []).map(p => [p[0], p[4]]));
    const provs = Y ? [...procs.reduce((m, p) => { const o = m.get(p[5]) || [p[5], p[6], 0, 0, sancDe.get(p[5]) || 0]; o[2]++; o[3] += p[7] || 0; return m.set(p[5], o); }, new Map()).values()].sort((a, b) => b[3] - a[3]).slice(0, 15) : (d.prov || []);
    const totN = ORDEN.reduce((a, k) => a + (res[k] ? res[k][0] : 0), 0), totM = ORDEN.reduce((a, k) => a + (res[k] ? res[k][1] : 0), 0);
    const tipos = Y ? [...procs.reduce((m, p) => { const o = m.get(p[2] || '—') || [0, 0]; o[0]++; o[1] += p[7] || 0; return m.set(p[2] || '—', o); }, new Map()).entries()].sort((a, b) => b[1][1] - a[1][1]) : Object.entries(d.tipos || {}).sort((a, b) => b[1][1] - a[1][1]);
    const nObras = opts.obras ? (opts.obras.match(/<tr class="l"/g) || []).length : 0;
    const sanc = provs.filter(p => p[4]).length;
    const nAl = n_res + (pen_tot ? pen_tot[0] : 0) + arb.length;
    const desde = Y ? `en ${Y}` : 'desde 2018', rango = Y || `2018–${ANIO}`;
    // PAC del anio elegido (o el ultimo publicado hasta el actual)
    const pacAnios = Object.keys(d.pac || {}).sort(); let pacSel = '';
    const pacDe = () => Y || pacSel || pacAnios.filter(y => +y <= ANIO).pop() || pacAnios[pacAnios.length - 1] || '';
    const hoyM = new Date().getMonth() + 1;
    const estPA = (y, it) => it[6] ? ['Adjudicado', 'ok'] : !it[1] ? ['Sin mes', 'warn'] : +y > ANIO || (+y === ANIO && it[1] >= hoyM) ? ['Programado', 'warn'] : +y === ANIO ? ['Mes previsto pasado, sin buena pro', 'warn'] : ['Sin buena pro', 'warn'];
    const pac0 = d.pac && d.pac[pacDe()];
    // ---- paneles ----
    const panel = (k, col, ico, titulo, valor, sub, anio) => `<div class="ct-p" data-p="${k}" style="--c:${col}"><div class="ct-k">${ico} ${titulo}</div><div class="ct-v">${valor}</div><div class="ct-s">${sub}</div>${anio != null ? `<div class="ct-y">${anio}</div>` : ''}</div>`;
    const grid = `<div class="ct-grid">
      ${ORDEN.slice(0, 4).map(k => { const r = res[k], a = act[k], t = d.res[k]; return panel(k, OBJ[k][2], OBJ[k][1], OBJ[k][0], r ? `<span data-n="${r[1]}">${S(r[1])}</span>` : '—', r ? `${r[0]} proceso${r[0] > 1 ? 's' : ''} adjudicado${r[0] > 1 ? 's' : ''} ${desde}` : `sin procesos ${desde}`, Y ? `2018–${ANIO}: ${t ? `<b>${t[0]}</b> · ${S(t[1])}` : 'ninguno'}` : `${ANIO}: ${a ? `<b>${a[0]}</b> · ${S(a[1])}` : '<span style="opacity:.7">ninguno</span>'}`); }).join('')}
      ${panel('AL', nAl ? '#D64545' : '#1B9E5A', '⚠️', 'Alertas contractuales', nAl ? `${n_res} resuelto${n_res === 1 ? '' : 's'}` : 'Sin alertas', `${pen_tot ? `${pen_tot[0]} penalidad${pen_tot[0] > 1 ? 'es' : ''} · ${S(pen_tot[1])}` : 'sin penalidades'} · ${arb.length ? `${arb.length} arbitraje${arb.length > 1 ? 's' : ''}` : 'sin arbitrajes'}${Y ? ` · ${Y}` : ''}`, m_res ? `Monto de contratos resueltos: ${S(m_res)}` : null)}
      ${panel('PR', sanc ? '#E39B1E' : '#00838F', '🏢', 'Proveedores', `${provs.length} principal${provs.length === 1 ? '' : 'es'}`, `por monto adjudicado ${Y || `2018 a ${ANIO}`}`, sanc ? `<b style="color:inherit">${sanc} con sanción</b> del Tribunal` : 'ninguno sancionado')}
      ${panel('EV', '#1E5AA8', '📈', 'Evolución y procedimientos', `<span data-n="${totM}">${S(totM)}</span>`, `${totN} proceso${totN === 1 ? '' : 's'} · ${Y || `${anios[0] || 2018}–${anios[anios.length - 1] || ANIO}`}`, `${tipos.length} tipo${tipos.length === 1 ? '' : 's'} de procedimiento · corte ${D(d.corte)}`)}
      ${panel('PA', '#5C6BC0', '📅', `Plan Anual (PAC)${pac0 ? ' ' + pacDe() : ''}`, pac0 ? `${pac0.n} proceso${pac0.n === 1 ? '' : 's'}` : '—', pac0 ? `programados · <b style="color:inherit">${pac0.adj}</b> con buena pro${(p => p && p.n >= 10 && pac0.n < p.n / 3 ? ` · <b style="color:#D64545">PAC con bastantes menos procesos que el año anterior: verificar si existe una versión posterior</b> ${p.n} en PAC ${+pacDe() - 1}` : '')((d.pac || {})[String(+pacDe() - 1)])}` : `sin PAC registrado${Y ? ' en ' + Y : ''}`, pac0 ? `versión ${pac0.ver} · publicado ${D(pac0.fpub)}` : (d.pacF && !d.pacF['pac_' + ANIO] ? `<b style="color:#D64545">PAC ${ANIO} aún no disponible en el panel</b>` : null))}
      ${panel('OB', '#37474F', '🛣️', 'Obras por inversión (CUI)', nObras ? `${nObras} obra${nObras > 1 ? 's' : ''}` : '—', 'contratista, firma y plazo por CUI · SEACE', nObras ? 'clic para ver el detalle por inversión' : 'sin procesos de obra vinculados')}
    </div>`;
    // ---- detalles ----
    let filtro = 'T', q = '', anioF = Y;
    const filas = () => procs.filter(p => (filtro === 'T' || p[1] === filtro) && (!anioF || String(p[0] || '').slice(0, 4) === anioF) && (!q || (p[4] + ' ' + p[6] + ' ' + p[3] + ' ' + p[5]).toLowerCase().includes(q)));
    const filaP = p => `<tr${p[10] ? ' style="background:#FDF2F2"' : ''}><td>${D(p[0])}</td><td><span class="tag" style="background:${OBJ[p[1]][2]}1F;color:${OBJ[p[1]][2]}">${OBJ[p[1]][0]}</span></td><td style="white-space:normal;font-size:10.5px"><b>${esc(p[2])}</b><br><small class="mutx">${esc(p[3])}</small></td><td style="white-space:normal;font-size:10.5px">${esc(p[4])}${p[9] ? ` <a class="fc" data-cui="${esc(p[9])}" style="cursor:pointer;font-weight:700">CUI ${esc(p[9])}</a>` : ''}</td><td style="white-space:normal">${prov(p[5], p[6])}</td><td>${S(p[7])}</td><td>${p[10] ? tag('RESUELTO', 'bad') : tag(p[8] || '—', /Contratado|Consentido/.test(p[8]) ? 'ok' : 'warn')}</td></tr>`;
    const tabla = () => { const L = filas(); return L.length ? `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>Buena pro</th><th>Objeto</th><th>Proceso</th><th>Descripción</th><th>Proveedor</th><th>Monto</th><th>Estado</th></tr>${L.map(filaP).join('')}</table></div><p class="mutx" style="font-size:10.5px">${L.length} proceso${L.length === 1 ? '' : 's'}${L.length !== procs.length ? ` de ${procs.length}` : ''} · ordenados por fecha de buena pro, del más reciente al más antiguo${d.proc.length >= 2000 ? ' · se muestran los 2,000 más recientes' : ''}</p>` : '<p class="mutx" style="font-size:12px;padding:8px 4px">Ningún proceso con ese filtro.</p>'; };
    const listado = k => `${lbl(k === 'T' ? 'Procesos adjudicados' : `Procesos de ${OBJ[k][0].toLowerCase()}`, 'buena pro · SEACE 2018 en adelante')}
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        ${Y ? '' : `<select id="ct-y" title="Año de la buena pro" style="padding:6px 10px;border:1.5px solid var(--line);border-radius:999px;font:inherit;font-size:12px;background:#fff"><option value="">Todos los años</option>${[...anios].reverse().map(y => { const r = d.anios[y] || {}, n = (k === 'T' ? ORDEN : [k]).reduce((a, x) => a + (r[x] ? r[x][0] : 0), 0); return n ? `<option value="${y}"${y === anioF ? ' selected' : ''}>${y} (${n})</option>` : ''; }).join('')}</select>`}
        <input type="search" id="ct-q" placeholder="Buscar por descripción, proveedor, RUC o nomenclatura…" style="flex:1;min-width:220px;padding:6px 10px;border:1.5px solid var(--line);border-radius:999px;font:inherit;font-size:12px"></div><div id="ct-tabla"></div>`;
    const detObj = k => { const r = res[k]; const pares = anios.map(y => [y, (d.anios[y][k] || [0, 0])[1], (d.anios[y][k] || [0, 0])[0]]); return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start"><div><div class="pd-lbl">${OBJ[k][1]} ${OBJ[k][0]} por año<small>monto adjudicado${Y ? ` · ${Y} resaltado` : ''}</small></div>${d.res[k] ? barras(pares, OBJ[k][2], Y) : '<p class="mutx">Sin procesos.</p>'}</div>
      <div><div class="pd-lbl">Resumen<small>${rango}</small></div><div class="pd-row"><b>Procesos</b><span>${r ? r[0] : 0}</span></div><div class="pd-row"><b>Adjudicado</b><span>${r ? S(r[1]) : '—'}</span></div><div class="pd-row"><b>Promedio</b><span>${r && r[0] ? S(r[1] / r[0]) : '—'}</span></div>${Y ? '' : `<div class="pd-row"><b>${ANIO}</b><span>${act[k] ? `${act[k][0]} · ${S(act[k][1])}` : 'ninguno'}</span></div>`}<div class="pd-row"><b>Resueltos</b><span>${resueltos.filter(p => p[1] === k).length}</span></div></div></div>` + listado(k); };
    const detAL = () => (resueltos.length ? lbl('Contratos resueltos', `${n_res} · ${S(m_res)} · adjudicaciones cuyo contrato fue resuelto`) + `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>Buena pro</th><th>Objeto</th><th>Proceso</th><th>Descripción</th><th>Proveedor</th><th>Monto</th><th>Estado</th></tr>${resueltos.map(filaP).join('')}</table></div>` : '') +
      (pen.length ? lbl('Penalidades aplicadas por la entidad', `${pen_tot[0]} · ${S(pen_tot[1])}`) + `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>Fecha</th><th>Proveedor</th><th>Objeto</th><th>Tipo</th><th>Motivo</th><th>Monto</th></tr>${pen.map(p => `<tr><td>${D(p[0])}</td><td style="white-space:normal">${prov(p[1], p[2])}</td><td>${esc(p[6])}</td><td>${esc(p[3])}</td><td style="white-space:normal;font-size:10px">${esc(p[5])}</td><td>${S(p[4])}</td></tr>`).join('')}</table></div>` : '') +
      (arb.length ? lbl('Arbitrajes', 'controversias registradas en el SEACE') + `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>Inicio</th><th>Contratista</th><th>Contrato</th><th>Monto</th><th>Demandante</th><th>Laudo</th></tr>${arb.map(a => `<tr><td>${D(a[0])}</td><td>${prov(a[1], a[1])}</td><td style="white-space:normal">${esc(a[2])}${a[6] ? ` <small class="mutx">· ${esc(a[6])}</small>` : ''}</td><td>${S(a[3])}</td><td>${esc(a[4])}</td><td>${a[5] ? D(a[5]) : tag('en trámite', 'warn')}</td></tr>`).join('')}</table></div>` : '') || '<p class="mutx" style="padding:6px 0">Sin contratos resueltos, penalidades ni arbitrajes registrados para esta entidad ${desde}.</p>';
    const detPR = () => provs.length ? lbl('Principales proveedores', `por monto adjudicado ${Y || 'desde 2018'} · clic en el nombre para verificar sanciones e historial`) + `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>#</th><th>Proveedor</th><th>RUC</th><th>Procesos</th><th>Adjudicado</th><th>Participación</th><th>Situación</th></tr>${provs.map((p, i) => `<tr><td>${i + 1}</td><td style="white-space:normal">${prov(p[0], p[1])}</td><td>${esc(p[0])}</td><td>${p[2]}</td><td>${S(p[3])}</td><td><span class="bar" style="display:inline-block;width:${Math.round(80 * p[3] / (provs[0][3] || 1))}px;height:6px;background:var(--p2);border-radius:3px;vertical-align:middle"></span> ${totM ? (100 * p[3] / totM).toFixed(1) : 0} %</td><td>${p[4] ? tag('con sanción registrada (vigente o cumplida)', 'warn') : tag('sin sanciones', 'ok')}</td></tr>`).join('')}</table></div>` : `<p class="mutx">Sin proveedores adjudicados ${desde}.</p>`;
    const detEV = () => { const pares = anios.map(y => { const r = d.anios[y]; return [y, ORDEN.reduce((a, k) => a + (r[k] ? r[k][1] : 0), 0), ORDEN.reduce((a, k) => a + (r[k] ? r[k][0] : 0), 0)]; });
      return `<div class="pd-lbl">Monto adjudicado por año<small>todos los objetos${Y ? ` · ${Y} resaltado` : ''}</small></div>${barras(pares, '#1E5AA8', Y)}` +
        lbl('Por año y objeto', 'procesos · monto adjudicado') + `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>Año</th>${ORDEN.slice(0, 4).map(k => `<th>${OBJ[k][0]}</th>`).join('')}<th>Total</th></tr>${[...anios].reverse().map(y => { const r = d.anios[y]; const t = ORDEN.reduce((a, k) => [a[0] + (r[k] ? r[k][0] : 0), a[1] + (r[k] ? r[k][1] : 0)], [0, 0]); return `<tr${(Y ? y === Y : +y === ANIO) ? ' class="y"' : ''}><td>${y}</td>${ORDEN.slice(0, 4).map(k => `<td>${r[k] ? `${r[k][0]} · ${S(r[k][1])}` : '—'}</td>`).join('')}<td><b>${t[0]} · ${S(t[1])}</b></td></tr>`; }).join('')}</table></div>` +
        lbl('Por tipo de procedimiento', 'Ley 30225 / Ley 32069') + `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>Procedimiento</th><th>Procesos</th><th>Adjudicado</th><th>Participación</th></tr>${tipos.map(([t, r]) => `<tr><td>${esc(t)}</td><td>${r[0]}</td><td>${S(r[1])}</td><td><span style="display:inline-block;width:${Math.round(90 * r[1] / (tipos[0][1][1] || 1))}px;height:6px;background:var(--p2);border-radius:3px;vertical-align:middle"></span> ${totM ? (100 * r[1] / totM).toFixed(1) : 0} %</td></tr>`).join('')}</table></div>`; };
    const detOB = () => opts.obras ? lbl('Obras vinculadas a las inversiones de la entidad', 'SEACE · proceso, contratista, firma y plazo por CUI') + opts.obras : '<p class="mutx">Sin procesos de obra vinculados a inversiones.</p>';
    const detPA = () => { const y = pacDe(), pac = d.pac && d.pac[y]; const selY = Y || pacAnios.length < 2 ? '' : `<select id="pa-y" style="padding:5px 10px;border:1.5px solid var(--line);border-radius:999px;font:inherit;font-size:12px;background:#fff">${pacAnios.map(a => `<option value="${a}"${a === y ? ' selected' : ''}>PAC ${a}</option>`).join('')}</select>`;
      if (!pac) return `<div style="display:flex;gap:8px;align-items:center">${selY}<p class="mutx" style="margin:0">Sin Plan Anual de Contrataciones registrado en el SEACE para esta entidad${Y ? ` en ${Y}` : ''}.</p></div>`;
      const its = pac.items || [], est = its.map(it => estPA(y, it)[0]), cnt = e => est.filter(x => x === e).length;
      const pares = MESN.slice(1).map((m, i) => [m, pac.mes[i + 1], its.length ? its.filter(it => it[1] === i + 1 && it[6]).length : null]);
      const objs = Object.entries(pac.obj || {}).sort((a, b) => b[1] - a[1]);
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start"><div><div class="pd-lbl" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">Procesos programados por mes ${selY}<small>versión ${pac.ver} publicada el ${D(pac.fpub)}${(d.pacF || {})['pac_' + y] ? ` · archivo OECE verificado el ${D(d.pacF['pac_' + y].visto)}` : ''}${its.length ? ' · en verde los que ya tienen buena pro' : ''}</small></div>${barsPA(pares)}${pac.mes[0] ? `<p class="mutx" style="font-size:10.5px">${pac.mes[0]} sin mes previsto</p>` : ''}</div>
        <div><div class="pd-lbl">Resumen<small>PAC ${y}</small></div><div class="pd-row"><b>Programados</b><span>${pac.n}</span></div><div class="pd-row"><b>Con buena pro</b><span>${pac.adj} · ${pac.n ? Math.round(100 * pac.adj / pac.n) : 0} %</span></div>${its.length ? `<div class="pd-row"><b>Pendientes</b><span>${cnt('Programado') + cnt('Sin mes')}</span></div><div class="pd-row"><b>${+y === ANIO ? 'Mes previsto pasado, sin buena pro registrada' : 'Sin buena pro'}</b><span>${cnt('Mes previsto pasado, sin buena pro') + cnt('Sin buena pro')}</span></div>` : ''}${objs.map(([k, n]) => `<div class="pd-row"><b>${OBJ[k] ? OBJ[k][1] + ' ' + OBJ[k][0] : k}</b><span>${n}</span></div>`).join('')}</div></div>` +
        (its.length ? lbl('Detalle del PAC', `${its.length} proceso${its.length === 1 ? '' : 's'}${its.length >= 600 ? ' (se muestran los 600 primeros por mes)' : ''} · buena pro = adjudicación del mismo año con la misma descripción`) + `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><select id="pa-e" style="padding:6px 10px;border:1.5px solid var(--line);border-radius:999px;font:inherit;font-size:12px;background:#fff"><option value="">Todos los estados</option>${[...new Set(est)].map(e => `<option>${e}</option>`).join('')}</select><input type="search" id="pa-q" placeholder="Buscar por descripción, referencia o procedimiento…" style="flex:1;min-width:220px;padding:6px 10px;border:1.5px solid var(--line);border-radius:999px;font:inherit;font-size:12px"></div><div id="pa-tabla"></div>` : `<p class="mutx" style="font-size:11px">El detalle por proceso se conserva para ${ANIO - 2}–${ANIO + 1}; de los años anteriores solo el resumen.</p>`); };
    const tablaPA = () => { const y = pacDe(), its = ((d.pac || {})[y] || {}).items || [], e = (det.querySelector('#pa-e') || {}).value || '', q = ((det.querySelector('#pa-q') || {}).value || '').trim().toLowerCase();
      const L = its.filter(it => (!e || estPA(y, it)[0] === e) && (!q || (it[4] + ' ' + it[0] + ' ' + it[3]).toLowerCase().includes(q)));
      return L.length ? `<div style="overflow-x:auto"><table class="pd-tbl"><tr><th>Ref.</th><th>Mes</th><th>Objeto</th><th>Procedimiento</th><th>Descripción</th><th>Ítems</th><th>Estado</th></tr>${L.map(it => { const [t, c] = estPA(y, it); return `<tr><td>${esc(it[0])}</td><td>${MESN[it[1]] || '—'}</td><td><span class="tag" style="background:${(OBJ[it[2]] || OBJ.X)[2]}1F;color:${(OBJ[it[2]] || OBJ.X)[2]}">${(OBJ[it[2]] || OBJ.X)[0]}</span></td><td style="white-space:normal;font-size:10.5px">${esc(it[3])}</td><td style="white-space:normal;font-size:10.5px">${esc(it[4])}</td><td>${it[5]}</td><td>${tag(t, c)}</td></tr>`; }).join('')}</table></div>` : '<p class="mutx" style="font-size:12px;padding:8px 4px">Ningún proceso con ese filtro.</p>'; };
    const wirePA = () => { const t = det.querySelector('#pa-tabla'); if (t) t.innerHTML = tablaPA(); ['#pa-e', '#pa-q'].forEach(id => { const x = det.querySelector(id); if (x) x.oninput = x.onchange = () => { t.innerHTML = tablaPA(); }; }); const ys = det.querySelector('#pa-y'); if (ys) ys.onchange = e => { pacSel = e.target.value; det.innerHTML = `<div class="ct-det">${detPA()}</div>`; wirePA(); }; };
    const DET = { AL: detAL, PR: detPR, EV: detEV, OB: detOB, PA: detPA };
    // ---- armado ----
    el.innerHTML = `<div style="padding:8px">
      ${cabecera(u, `${totN} proceso${totN === 1 ? '' : 's'} ${rango}`, opts, `<select id="ct-anio" title="Año: todo el módulo se recalcula"><option value="">Todos los años · 2018–${ANIO}</option>${[...anios].reverse().map(y => { const r = d.anios[y] || {}, n = ORDEN.reduce((a, x) => a + (r[x] ? r[x][0] : 0), 0); return `<option value="${y}"${y === Y ? ' selected' : ''}>${y} · ${n} proceso${n === 1 ? '' : 's'}</option>`; }).join('')}</select>`)}
      <div class="ct-strip"><span class="tag" style="background:#EDF3FC;color:var(--p2)">${totN} proceso${totN === 1 ? '' : 's'} · ${S(totM)} adjudicados ${rango}</span><span class="tag ${n_res ? 'bad' : 'ok'}">${n_res} contrato${n_res === 1 ? '' : 's'} resuelto${n_res === 1 ? '' : 's'}</span><span class="tag ${pen_tot ? 'warn' : 'ok'}">${pen_tot ? `${pen_tot[0]} penalidad${pen_tot[0] > 1 ? 'es' : ''}` : 'sin penalidades'}</span><span class="mutx" style="margin-left:auto;font-size:11px">Clic en un panel para desplegar su detalle · SEACE · corte ${D(d.corte)}</span></div>
      <div id="ct-prov" style="margin:0 0 12px"></div>
      ${grid}<div id="ct-det"></div>
      <p class="mutx" style="font-size:10px;margin-top:10px">Fuente: OECE · CONOSCE datos abiertos (Plan Anual de Contrataciones, adjudicaciones, contratos, penalidades y arbitrajes del SEACE, 2018 en adelante). El PAC abierto no incluye montos. Las contrataciones iguales o inferiores a 8 UIT y las órdenes de compra y de servicio no están incluidas en los conjuntos de datos que usa Acierta; en Mi entidad se analizan con el SIAF.${(d.alertas || []).length ? ` <b style="color:#D64545" title="${esc(d.alertas.join('\n'))}">⚠ ${d.alertas.length} fuente${d.alertas.length === 1 ? '' : 's'} del OECE sin actualizar </b>` : ' Fuentes consultadas en la última actualización.'}</p></div>`;
    countUp(el);
    const det = el.querySelector('#ct-det'); let abierto = null;
    const wire = () => {
      el.querySelectorAll('[data-ruc]').forEach(a => a.onclick = () => { const inp = el.querySelector('#prov-ruc'); if (inp) { inp.value = a.dataset.ruc; el.querySelector('#prov-form').requestSubmit ? el.querySelector('#prov-form').requestSubmit() : el.querySelector('#prov-form').dispatchEvent(new Event('submit', { cancelable: true })); } });
      el.querySelectorAll('[data-cui]').forEach(a => a.onclick = () => opts.onCui && opts.onCui(a.dataset.cui));
      det.querySelectorAll('tr.l').forEach(tr => tr.onclick = () => opts.onCui && opts.onCui((tr.dataset.k || tr.dataset.sf || '').replace(/^cui:/, '')));
    };
    const pintarTabla = () => { const t = det.querySelector('#ct-tabla'); if (t) { t.innerHTML = tabla(); det.querySelectorAll('.ct-seg button').forEach(b => b.classList.toggle('on', b.dataset.f === filtro)); wire(); } };
    const abrir = k => {
      el.querySelectorAll('.ct-p').forEach(p => p.classList.toggle('on', p.dataset.p === k && abierto !== k));
      if (abierto === k) { abierto = null; det.innerHTML = ''; return; }
      abierto = k; filtro = ORDEN.includes(k) ? k : 'T'; q = ''; anioF = Y;
      det.innerHTML = `<div class="ct-det">${DET[k] ? DET[k]() : detObj(k)}</div>`;
      const qi = det.querySelector('#ct-q'); if (qi) qi.oninput = e => { q = e.target.value.trim().toLowerCase(); pintarTabla(); };
      const ys = det.querySelector('#ct-y'); if (ys) ys.onchange = e => { anioF = e.target.value; pintarTabla(); };
      det.querySelectorAll('.ct-seg button').forEach(b => b.onclick = () => { filtro = b.dataset.f; pintarTabla(); });
      pintarTabla(); wire(); if (k === 'PA') wirePA(); det.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    el.querySelectorAll('.ct-p').forEach(p => p.onclick = () => abrir(p.dataset.p));
    const radar = () => { if (window.Proveedores) Proveedores.ui(el.querySelector('#ct-prov'), { compacto: true, onCui: opts.onCui, sugerencias: [...new Map([...(d.prov || []).map(p => [p[0], p[1]]), ...d.proc.map(p => [p[5], p[6]])]).entries()] }); };
    const limpiar = () => { if (Y) return vista(el, u, d, opts, ''); abierto = null; filtro = 'T'; q = ''; anioF = ''; det.innerHTML = ''; el.querySelectorAll('.ct-p').forEach(p => p.classList.remove('on')); radar(); el.scrollIntoView({ block: 'start' }); };
    el.querySelector('#ct-anio').onchange = e => { vista(el, u, d, opts, e.target.value); el.scrollIntoView({ block: 'start' }); };
    const ba = el.querySelector('#ct-atras'); if (ba) ba.onclick = () => opts.onAtras();
    el.querySelector('#ct-limpiar').onclick = limpiar;
    radar(); return;
    if (window.Proveedores) Proveedores.ui(el.querySelector('#ct-prov'), { compacto: true, onCui: opts.onCui, sugerencias: [...new Map([...(d.prov || []).map(p => [p[0], p[1]]), ...d.proc.map(p => [p[5], p[6]])]).entries()] });
  }
  async function ui(el, u, opts) {
    opts = opts || {};
    el.innerHTML = '<p class="mutx" style="padding:12px">Reuniendo las contrataciones de la entidad…</p>';
    let d = null;
    try { const [r, ri] = await Promise.all([fetch(`data/contrat/${u.cod}.json`), fetch('data/contrat/index.json')]); if (r.ok) d = await r.json(); if (d && ri.ok) { const ix = await ri.json(); d.corte = ix.corte || d.corte; d.pacF = ix.pac || {}; d.alertas = ix.alertas || []; } } catch (e) { }
    if (!d) {
      css(); el.innerHTML = `<div style="padding:8px">${cabecera(u, '', opts)}<div class="card" style="padding:18px;text-align:center"><div style="font-size:28px">📑</div><b style="color:var(--p2)">Sin procesos de selección registrados en el SEACE desde 2018 para esta unidad ejecutora</b><p class="mutx" style="font-size:11.5px;margin:6px 0 0">Puede que contrate solo por órdenes de compra (iguales o inferiores a 8 UIT) o que sus procesos los lleve otra unidad (sede central del pliego).</p></div>
        ${opts.obras ? lbl('Obras vinculadas a las inversiones de la entidad', 'SEACE · por CUI') + opts.obras : ''}${lbl('Verificar un proveedor', 'sanciones, inhabilitaciones, penalidades y contratos resueltos por RUC')}<div id="ct-prov"></div></div>`;
      el.querySelectorAll('[data-cui]').forEach(a => a.onclick = () => opts.onCui && opts.onCui(a.dataset.cui));
      const radar0 = () => { if (window.Proveedores) Proveedores.ui(el.querySelector('#ct-prov'), { compacto: true, onCui: opts.onCui }); }; radar0();
      const ba = el.querySelector('#ct-atras'); if (ba) ba.onclick = () => opts.onAtras(); el.querySelector('#ct-limpiar').onclick = radar0;
      return;
    }
    vista(el, u, d, opts);
  }
  window.Contrataciones = { ui };
})();
