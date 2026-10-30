/* reportes_siaf.js — Reportes de Mi entidad (con clave): lo que SOLO el SIAF permite ver.
   Seis reportes construidos a partir de expedientes, fases, certificaciones, PCA, ingresos mensuales y cierre:
   cada uno es una cifra que decide, un gráfico y una lista corta con la acción. Ninguno repite lo que ya está en la vista pública.
   Usa helpers globales ($, N) y window.Ico; se abre desde el tablero de la entidad (botón "Reportes SIAF"). */
(function () {
  const F = n => 'S/ ' + Math.round(n || 0).toLocaleString('es-PE');
  const FM = n => Math.abs(n || 0) >= 1e6 ? 'S/ ' + (n / 1e6).toFixed(1) + ' M' : F(n);
  const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ico = n => window.Ico ? Ico(n) : '';
  const MESN = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const fD = v => v ? String(v).slice(0, 10).split('-').reverse().join('/') : '—';
  const dias = (a, b) => a && b ? Math.round((new Date(String(b).slice(0, 10)) - new Date(String(a).slice(0, 10))) / 864e5) : null;
  // días hábiles entre dos fechas (lunes a viernes; los feriados variables no entran) — Ley 32069 art. 67: pago en 10 días hábiles desde la conformidad
  const habiles = (a, b) => { if (!a || !b) return null; const d = new Date(String(a).slice(0, 10) + 'T00:00:00Z'), f = new Date(String(b).slice(0, 10) + 'T00:00:00Z'); let n = 0; while (d < f) { d.setUTCDate(d.getUTCDate() + 1); const w = d.getUTCDay(); if (w && w !== 6) n++; } return n; };
  const COL = { ok: '#147A45', warn: '#9A6400', bad: '#B42A2A', p: '#1E5AA8', p2: '#143C6B', grid: '#D6DEE8' };
  const med = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

  // ---- gráficos SVG mínimos ----
  function barras(vals, opts) {   // vals: [{l, v, c?}] ; horizontal
    opts = opts || {}; const mx = Math.max(1, ...vals.map(x => x.v)), W = 100;
    return `<div class="rs-bars" role="img" aria-label="${esc(opts.aria || '')}">${vals.map(x => `<div class="rs-bar"><span class="rs-bl" title="${esc(x.l)}">${esc(x.l)}</span><span class="rs-bt"><i style="width:${(100 * x.v / mx).toFixed(1)}%;background:${x.c || COL.p}"></i></span><b>${x.f || FM(x.v)}</b></div>`).join('')}</div>`;
  }
  function columnas(series, opts) {   // series: [{l, v, c?, v2?}] con línea opcional (v2); vertical
    opts = opts || {}; const W = 560, H = 160, p = 28, n = series.length || 1, mx = Math.max(1, ...series.map(x => Math.max(x.v || 0, x.v2 || 0))), bw = (W - p * 2) / n;
    const y = v => H - 22 - (H - 40) * (v || 0) / mx;
    const cols = series.map((x, i) => `<rect x="${(p + i * bw + bw * .15).toFixed(1)}" y="${y(x.v).toFixed(1)}" width="${(bw * .7).toFixed(1)}" height="${(H - 22 - y(x.v)).toFixed(1)}" rx="3" fill="${x.c || COL.p}"><title>${esc(x.l)}: ${FM(x.v)}</title></rect><text x="${(p + i * bw + bw / 2).toFixed(1)}" y="${H - 7}" text-anchor="middle" font-size="10" fill="#5F6B7A">${esc(x.l)}</text>`).join('');
    const linea = series.some(x => x.v2 != null) ? `<polyline fill="none" stroke="${opts.c2 || COL.bad}" stroke-width="2" stroke-dasharray="5 4" points="${series.map((x, i) => x.v2 == null ? null : `${(p + i * bw + bw / 2).toFixed(1)},${y(x.v2).toFixed(1)}`).filter(Boolean).join(' ')}"/>` : '';
    return `<svg class="rs-cols" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || '')}"><line x1="${p}" y1="${H - 22}" x2="${W - p}" y2="${H - 22}" stroke="${COL.grid}"/>${cols}${linea}</svg>${opts.leyenda ? `<div class="rs-leg">${opts.leyenda}</div>` : ''}`;
  }
  const dona = (pct, c, txt) => { const r = 26, cc = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct || 0)); return `<svg class="rs-dona" viewBox="0 0 64 64" role="img" aria-label="${esc(txt)}"><circle cx="32" cy="32" r="${r}" fill="none" stroke="${COL.grid}" stroke-width="8"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(cc * v / 100).toFixed(1)} ${cc.toFixed(1)}" transform="rotate(-90 32 32)"/><text x="32" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="#141B26">${Math.round(v)}%</text></svg>`; };
  const spark = (vals, c) => { const W = 120, H = 34, mx = Math.max(1, ...vals), n = Math.max(1, vals.length - 1); return `<svg class="rs-spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline fill="none" stroke="${c}" stroke-width="2" points="${vals.map((v, i) => `${(i * W / n).toFixed(1)},${(H - 3 - (H - 6) * v / mx).toFixed(1)}`).join(' ')}"/></svg>`; };

  // ---- cálculos (solo con el paquete SIAF E) ----
  function calcular(E) {
    const corte = String(E.corte || '').slice(0, 10), T = E.presupuesto.total, exps = E.expedientes || [];
    const ultima = (e, fase) => e.fases.filter(x => x.ciclo === 'G' && x.fase === fase && x.fecha).map(x => x.fecha).sort().pop() || e.ult_fecha;
    // 1. deuda reconocida a proveedores (devengado no girado) por antigüedad en días hábiles
    const deuda = exps.map(e => ({ e, m: (e.tot.D || 0) - (e.tot.G || 0), d: habiles(ultima(e, 'D'), corte) })).filter(x => x.m > 1);
    const tramos = [['Hasta 10 días hábiles', x => x.d <= 10, COL.ok], ['11 a 30', x => x.d > 10 && x.d <= 30, COL.warn], ['Más de 30', x => x.d > 30, COL.bad]].map(([l, f, c]) => ({ l, v: deuda.filter(f).reduce((s, x) => s + x.m, 0), n: deuda.filter(f).length, c }));
    const porProv = {}; deuda.forEach(x => { const k = x.e.proveedor || x.e.ruc || 'Sin proveedor'; const o = porProv[k] = porProv[k] || { l: k, v: 0, n: 0, d: 0 }; o.v += x.m; o.n++; o.d = Math.max(o.d, x.d || 0); });
    const R1 = { total: deuda.reduce((s, x) => s + x.m, 0), n: deuda.length, vencida: tramos[1].v + tramos[2].v, tramos, prov: Object.values(porProv).sort((a, b) => b.v - a.v).slice(0, 8), top: deuda.sort((a, b) => b.m - a.m).slice(0, 10) };
    // 2. velocidad de pago: días hábiles entre el devengado y el giro, por mes de giro
    const pares = []; exps.forEach(e => { const D = e.fases.filter(x => x.ciclo === 'G' && x.fase === 'D' && x.fecha).map(x => x.fecha).sort(); e.fases.filter(x => x.ciclo === 'G' && x.fase === 'G' && x.fecha).forEach(g => { const d = D.filter(f => f <= g.fecha).pop() || D[0]; if (d) pares.push({ mes: g.fecha.slice(0, 7), h: habiles(d, g.fecha), m: g.monto, e }); }); });
    const meses = [...new Set(pares.map(x => x.mes))].sort().slice(-8);
    const velMes = meses.map(m => { const p = pares.filter(x => x.mes === m); return { l: MESN[+m.slice(5, 7) - 1], v: med(p.map(x => x.h)) || 0, n: p.length, enPlazo: p.filter(x => x.h <= 10).length }; });
    const R2 = { mediana: med(pares.map(x => x.h)), n: pares.length, enPlazo: pares.length ? 100 * pares.filter(x => x.h <= 10).length / pares.length : null, meses: velMes, lentos: pares.filter(x => x.h > 10).sort((a, b) => b.h - a.h).slice(0, 10) };
    // 3. contratos firmados que no avanzan: comprometido sin devengar
    const paradas = exps.map(e => ({ e, m: (e.tot.C || 0) - (e.tot.D || 0), d: dias(ultima(e, 'C'), corte) })).filter(x => x.m > 1).sort((a, b) => b.m - a.m);
    const R3 = { total: paradas.reduce((s, x) => s + x.m, 0), n: paradas.length, viejas: paradas.filter(x => (x.d || 0) > 45), top: paradas.slice(0, 10), tramos: [['Menos de 45 días', x => (x.d || 0) <= 45, COL.ok], ['45 a 90', x => x.d > 45 && x.d <= 90, COL.warn], ['Más de 90', x => x.d > 90, COL.bad]].map(([l, f, c]) => ({ l, v: paradas.filter(f).reduce((s, x) => s + x.m, 0), n: paradas.filter(f).length, c })) };
    // 4. presupuesto reservado sin usar: certificaciones con saldo sin comprometer
    const certs = Object.entries(E.certificaciones || {}).map(([k, c]) => ({ k, c, libre: (c.monto || 0) - (c.comp_anual || 0), d: dias(c.fecha, corte) })).filter(x => x.libre > 1).sort((a, b) => b.libre - a.libre);
    const certTot = Object.values(E.certificaciones || {}).reduce((s, c) => s + (c.monto || 0), 0);
    const R4 = { total: certs.reduce((s, x) => s + x.libre, 0), n: certs.length, certTot, viejas: certs.filter(x => (x.d || 0) > 60).reduce((s, x) => s + x.libre, 0), top: certs.slice(0, 10) };
    // 5. ritmo y cierre: devengado mensual frente al necesario para llegar al PIM; margen de PCA
    const dev = E.mensual?.dev || {}, anio = String(E.anio || corte.slice(0, 4)), mesCorte = +corte.slice(5, 7) || 12;
    const serie = MESN.map((l, i) => ({ l, v: dev[`${anio}-${String(i + 1).padStart(2, '0')}`] || 0 }));
    const devAcum = serie.slice(0, mesCorte).reduce((s, x) => s + x.v, 0), faltan = 12 - mesCorte, saldo = Math.max(0, (T.pim || 0) - (T.dev || 0));
    const ritmo = mesCorte ? devAcum / mesCorte : 0, necesario = faltan ? saldo / faltan : saldo, proy = (T.dev || 0) + ritmo * faltan;
    const pca = (E.pca || []).reduce((o, p) => { o.asig += p.asignado || 0; o.cert += p.certificado || 0; o.comp += p.comprometido || 0; return o; }, { asig: 0, cert: 0, comp: 0 });
    const R5 = { serie: serie.map((x, i) => ({ ...x, v2: i >= mesCorte ? necesario : null, c: i < mesCorte ? COL.p : COL.grid })), ritmo, necesario, proy, pctProy: T.pim ? 100 * proy / T.pim : 0, faltan, saldo, pca, dejaria: Math.max(0, (T.pim || 0) - proy) };
    // 6. ingresos propios: recaudación mensual frente al presupuesto de ingresos
    const I = E.ingresos || { total: {}, clasificadores: [] }, cl = (I.clasificadores || []).filter(c => (c.recaudado || 0) > 0 || (c.pim || 0) > 0);
    const mesesI = MESN.map((l, i) => ({ l, v: cl.reduce((s, c) => s + (c.mensual?.[String(i + 1).padStart(2, '0')] || 0), 0) }));
    const recAcum = I.total?.recaudado || mesesI.reduce((s, x) => s + x.v, 0), pimI = I.total?.pim || cl.reduce((s, c) => s + (c.pim || 0), 0), ritmoI = mesCorte ? recAcum / mesCorte : 0;
    const predial = cl.filter(c => /PREDIAL/i.test(c.nombre || '')), predRec = predial.reduce((s, c) => s + (c.recaudado || 0), 0), predPim = predial.reduce((s, c) => s + (c.pim || 0), 0);
    const R6 = { rec: recAcum, pim: pimI, pct: pimI ? 100 * recAcum / pimI : 0, esperado: 100 * mesCorte / 12, proy: recAcum + ritmoI * faltan, meses: mesesI.map((x, i) => ({ ...x, c: i < mesCorte ? COL.ok : COL.grid })), top: cl.slice().sort((a, b) => (b.recaudado || 0) - (a.recaudado || 0)).slice(0, 8), predial: predial.length ? { rec: predRec, pim: predPim, pct: predPim ? 100 * predRec / predPim : null } : null };
    return { corte, T, mesCorte, R1, R2, R3, R4, R5, R6 };
  }

  // ---- semáforos y titulares de cada reporte ----
  function fichas(C) {
    const { R1, R2, R3, R4, R5, R6, T } = C;
    return [
      { id: 'deuda', ico: 'cash', tit: 'Lo que debe hoy a proveedores', num: FM(R1.total), sub: `${N(R1.n)} expedientes devengados sin girar · ${FM(R1.vencida)} con más de 10 días hábiles`, k: R1.total < 1 ? 'ok' : R1.vencida / R1.total > .5 ? 'bad' : R1.vencida > 0 ? 'warn' : 'ok', sp: R1.tramos.map(x => x.v) },
      { id: 'velocidad', ico: 'clock', tit: 'Velocidad de pago', num: R2.mediana == null ? '—' : `${R2.mediana} día${R2.mediana === 1 ? '' : 's'} hábil${R2.mediana === 1 ? '' : 'es'}`, sub: R2.n ? `del devengado al giro · ${R2.enPlazo.toFixed(0)} % dentro de los 10 días de la Ley 32069` : 'sin giros registrados', k: R2.mediana == null ? 'p' : R2.mediana <= 10 ? 'ok' : R2.mediana <= 20 ? 'warn' : 'bad', sp: R2.meses.map(x => x.v) },
      { id: 'contratos', ico: 'handshake', tit: 'Contratos firmados sin avanzar', num: FM(R3.total), sub: `${N(R3.n)} expedientes comprometidos sin devengar · ${N(R3.viejas.length)} con más de 45 días`, k: R3.total < 1 ? 'ok' : R3.viejas.length / Math.max(1, R3.n) > .5 ? 'bad' : R3.viejas.length ? 'warn' : 'ok', sp: R3.tramos.map(x => x.v) },
      { id: 'reservado', ico: 'lock', tit: 'Presupuesto reservado sin usar', num: FM(R4.total), sub: `${N(R4.n)} certificaciones con saldo · ${FM(R4.viejas)} con más de 60 días`, k: R4.total < 1 ? 'ok' : R4.viejas / Math.max(1, R4.total) > .5 ? 'bad' : R4.viejas > 0 ? 'warn' : 'ok', sp: [R4.certTot - R4.total, R4.total] },
      { id: 'cierre', ico: 'hourglass', tit: 'Cómo cerraría el año', num: `${R5.pctProy.toFixed(0)} % del PIM`, sub: `al ritmo actual (${FM(R5.ritmo)} al mes) · hace falta ${FM(R5.necesario)} al mes para llegar al 100 %`, k: R5.pctProy >= 90 ? 'ok' : R5.pctProy >= 75 ? 'warn' : 'bad', sp: R5.serie.map(x => x.v) },
      { id: 'ingresos', ico: 'coins', tit: 'Ingresos propios', num: `${R6.pct.toFixed(0)} % recaudado`, sub: R6.pim ? `${FM(R6.rec)} de ${FM(R6.pim)} presupuestados · esperado a hoy ${R6.esperado.toFixed(0)} %` : 'sin presupuesto de ingresos registrado', k: !R6.pim ? 'p' : R6.pct >= R6.esperado - 5 ? 'ok' : R6.pct >= R6.esperado - 20 ? 'warn' : 'bad', sp: R6.meses.map(x => x.v) },
      ...(window.FlujoCaja ? [{ id: 'flujo', ico: 'wallet', tit: 'Flujo de caja proyectado', num: 'Excel · PPT', sub: 'caja mes a mes hasta diciembre, por fuente de financiamiento · se descarga con corte de hoy', k: 'p', sp: [1, 1] }] : [])
    ];
  }

  // ---- cuerpo de cada reporte (gráfico + lista + acción) ----
  function cuerpo(id, C, E) {
    const { R1, R2, R3, R4, R5, R6, T, corte } = C, SEM = k => k === 'ok' ? COL.ok : k === 'warn' ? COL.warn : k === 'bad' ? COL.bad : COL.p;
    const exp = e => `<b>${esc(+e.exp || e.exp)}</b>`, tabla = (cab, filas) => `<table class="rs-tbl"><thead><tr>${cab.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${filas.join('')}</tbody></table>`;
    const accion = (t, p) => `<div class="rs-acc">${ico('spark')}<div><b>${t}</b><p>${p}</p></div></div>`;
    if (id === 'flujo') return '<div id="fc-slot"></div>';
    if (id === 'deuda') return `<div class="rs-g2"><div><h3>Por antigüedad del devengado</h3>${barras(R1.tramos.map(x => ({ l: `${x.l} · ${x.n} exp.`, v: x.v, c: x.c })), { aria: 'Deuda por antigüedad' })}</div><div><h3>Proveedores con más por cobrar</h3>${barras(R1.prov.map(x => ({ l: x.l, v: x.v, c: x.d > 10 ? COL.bad : COL.p })), { aria: 'Deuda por proveedor' })}</div></div>
      <h3>Los 10 expedientes con mayor deuda</h3>${tabla(['Expediente', 'Proveedor', 'Glosa', 'Sin girar', 'Días hábiles'], R1.top.map(x => `<tr><td>${exp(x.e)}</td><td>${esc(x.e.proveedor || '—')}</td><td class="rs-gl">${esc((x.e.glosa || '').slice(0, 110))}</td><td class="rs-n">${F(x.m)}</td><td class="rs-n" style="color:${x.d > 10 ? COL.bad : 'inherit'}">${x.d ?? '—'}</td></tr>`))}
      ${accion('Priorizar el devengado más antiguo', `Referencia: la Ley 32069 (art. 67) fija el pago dentro de 10 días hábiles contados desde la conformidad; vencido el plazo pueden corresponder intereses legales. Hoy ${FM(R1.vencida)} llevan más de 10 días hábiles desde el devengado (aproximación: el SIAF no registra la fecha de conformidad; para valorizaciones de obra rige el art. 210.3 del Reglamento, pago hasta el último día del mes de presentación, y en contratos del régimen anterior, 10 días calendario): se sugiere priorizar esos giros en Tesorería y verificar el saldo de caja de la fuente en la programación de pagos (en Recursos Ordinarios, la autorización de giro de la DGTP).`)}`;
    if (id === 'velocidad') return `<div class="rs-g2"><div><h3>Mediana de días hábiles por mes de giro</h3>${columnas(R2.meses.map(x => ({ l: x.l, v: x.v, c: x.v <= 10 ? COL.ok : x.v <= 20 ? COL.warn : COL.bad, v2: 10 })), { aria: 'Velocidad de pago por mes', leyenda: '<i style="background:#B42A2A"></i> línea: 10 días hábiles (Ley 32069)' })}</div><div class="rs-kp"><div><b>${R2.n}</b><small>giros analizados</small></div><div><b>${R2.enPlazo == null ? '—' : R2.enPlazo.toFixed(0) + ' %'}</b><small>pagados dentro de 10 días hábiles</small></div><div><b>${R2.mediana ?? '—'}</b><small>días hábiles (mediana)</small></div></div></div>
      <h3>Pagos más lentos</h3>${tabla(['Expediente', 'Proveedor', 'Mes de giro', 'Monto', 'Días hábiles'], R2.lentos.map(x => `<tr><td>${exp(x.e)}</td><td>${esc(x.e.proveedor || '—')}</td><td>${esc(x.mes)}</td><td class="rs-n">${F(x.m)}</td><td class="rs-n" style="color:${COL.bad}">${x.h}</td></tr>`))}
      ${accion('Acortar el circuito conformidad → devengado → giro', 'Con frecuencia el tiempo se concentra entre la conformidad del área usuaria y el registro del devengado. Fijar un plazo interno de 3 días hábiles para registrar el devengado y girar en el mismo lote semanal; medir este reporte cada mes.')}`;
    if (id === 'contratos') return `<div class="rs-g2"><div><h3>Comprometido sin devengar, por antigüedad</h3>${barras(R3.tramos.map(x => ({ l: `${x.l} · ${x.n} exp.`, v: x.v, c: x.c })), { aria: 'Contratos sin avanzar por antigüedad' })}</div><div class="rs-kp"><div><b>${FM(R3.total)}</b><small>comprometido sin devengar</small></div><div><b>${N(R3.viejas.length)}</b><small>expedientes con más de 45 días</small></div><div><b>${FM(R3.viejas.reduce((s, x) => s + x.m, 0))}</b><small>en esos expedientes</small></div></div></div>
      <h3>Los 10 contratos con mayor saldo</h3>${tabla(['Expediente', 'Proveedor', 'Glosa', 'Sin devengar', 'Días'], R3.top.map(x => `<tr><td>${exp(x.e)}</td><td>${esc(x.e.proveedor || '—')}</td><td class="rs-gl">${esc((x.e.glosa || '').slice(0, 110))}</td><td class="rs-n">${F(x.m)}</td><td class="rs-n" style="color:${x.d > 45 ? COL.bad : 'inherit'}">${x.d ?? '—'}</td></tr>`))}
      ${accion('Cobrar el avance o liberar el compromiso', 'Un compromiso sin devengar por más de 45 días suele ser una entrega sin conformidad, una valorización sin tramitar o un contrato que no se ejecutará. Pedir al área usuaria la conformidad o el informe sobre el estado de la prestación; si el contrato no avanzará, anular el compromiso para reasignar el presupuesto antes del cierre.')}`;
    if (id === 'reservado') return `<div class="rs-g2"><div class="rs-kp rs-kp1"><div>${dona(R4.certTot ? 100 * R4.total / R4.certTot : 0, COL.warn, 'Porcentaje del certificado sin comprometer')}<small>del total certificado sigue sin compromiso</small></div><div><b>${FM(R4.viejas)}</b><small>reservado hace más de 60 días</small></div></div><div><h3>Certificaciones con mayor saldo</h3>${barras(R4.top.slice(0, 8).map(x => ({ l: `${+x.k} · ${(x.c.prov || x.c.glosa || '').slice(0, 40)}`, v: x.libre, c: x.d > 60 ? COL.bad : COL.p })), { aria: 'Certificaciones con saldo' })}</div></div>
      <h3>Detalle</h3>${tabla(['Certificación', 'Fecha', 'Proveedor / glosa', 'Certificado', 'Comprometido', 'Sin usar', 'Días'], R4.top.map(x => `<tr><td><b>${+x.k}</b></td><td>${fD(x.c.fecha)}</td><td class="rs-gl">${esc(x.c.prov || '')} ${esc((x.c.glosa || '').slice(0, 90))}</td><td class="rs-n">${F(x.c.monto)}</td><td class="rs-n">${F(x.c.comp_anual)}</td><td class="rs-n"><b>${F(x.libre)}</b></td><td class="rs-n" style="color:${x.d > 60 ? COL.bad : 'inherit'}">${x.d ?? '—'}</td></tr>`))}
      ${accion('Liberar lo que no se va a contratar', `Una certificación sin compromiso bloquea presupuesto que otra meta podría ejecutar. Revisar con Logística si el proceso sigue en curso; si no, rebajar o anular la certificación (Directiva 0001-2024-EF/50.01, Directiva para la Ejecución Presupuestaria) y reasignar ${FM(R4.viejas)} antes del cierre.`)}`;
    if (id === 'cierre') return `<div class="rs-g2"><div><h3>Devengado mensual frente al ritmo necesario</h3>${columnas(R5.serie, { aria: 'Devengado mensual y ritmo necesario', leyenda: '<i style="background:#1E5AA8"></i> devengado por mes &nbsp; <i style="background:#B42A2A"></i> línea: lo que hace falta cada mes para llegar al PIM' })}</div><div class="rs-kp"><div><b>${R5.pctProy.toFixed(0)} %</b><small>proyección de ejecución al 31 de diciembre</small></div><div><b>${FM(R5.dejaria)}</b><small>quedarían sin ejecutar al ritmo actual</small></div><div><b>${FM(R5.necesario)}</b><small>por devengar cada mes para llegar al 100 %</small></div>${R5.pca.asig ? `<div><b>${FM(R5.pca.asig - R5.pca.comp)}</b><small>margen de PCA (asignado menos comprometido)</small></div>` : ''}</div></div>
      ${accion(R5.pctProy >= 90 ? 'Sostener el ritmo' : 'Cambiar el ritmo o reasignar antes del cierre', R5.pctProy >= 90 ? `Al ritmo actual la entidad cierra cerca del 100 %. Vigilar que el devengado de diciembre quede formalizado y registrado al 31/12 y tenga asignación financiera para girarse hasta el 31 de enero (DL 1441, art. 17.4; Directiva 001-2024-EF/52.06, art. 14.5); lo que siga sin girar se anula de oficio en febrero (RD 012-2025-EF/52.01).` : `Para ejecutar todo el PIM hay que devengar ${FM(R5.necesario)} al mes, ${(R5.necesario / Math.max(1, R5.ritmo)).toFixed(1)} veces el ritmo actual. Lo que no tenga expediente de contratación en curso difícilmente llegará a devengarse este año: conviene decidir ahora qué metas reciben el saldo (${FM(R5.saldo)}) mediante notas modificatorias.`)}`;
    if (id === 'ingresos') return `<div class="rs-g2"><div><h3>Recaudación por mes</h3>${columnas(R6.meses, { aria: 'Recaudación mensual' })}</div><div class="rs-kp"><div>${dona(R6.pct, R6.pct >= R6.esperado - 5 ? COL.ok : COL.warn, 'Avance de la recaudación')}<small>del presupuesto de ingresos recaudado · esperado a hoy ${R6.esperado.toFixed(0)} %</small></div><div><b>${FM(R6.proy)}</b><small>proyección a diciembre al ritmo actual</small></div>${R6.predial ? `<div><b>${R6.predial.pct == null ? FM(R6.predial.rec) : R6.predial.pct.toFixed(0) + ' %'}</b><small>impuesto predial: ${FM(R6.predial.rec)}${R6.predial.pim ? ` de ${FM(R6.predial.pim)}` : ''} (meta 2 del Plan de Incentivos)</small></div>` : ''}</div></div>
      <h3>Qué se recauda</h3>${tabla(['Clasificador', 'Presupuesto', 'Recaudado', 'Avance'], R6.top.map(c => `<tr><td class="rs-gl">${esc(c.nombre || c.clasif)}</td><td class="rs-n">${F(c.pim)}</td><td class="rs-n"><b>${F(c.recaudado)}</b></td><td class="rs-n">${c.pim ? (100 * (c.recaudado || 0) / c.pim).toFixed(0) + ' %' : '—'}</td></tr>`))}
      ${accion('Cobrar antes de fin de año', R6.predial ? 'El MEF mide el predial en el SIAF del 1 de enero al 31 de diciembre: emitir y notificar la cuarta cuota, campañas de descuento por pronto pago y cobranza coactiva de la cartera pesada mueven el indicador 2 del Plan de Incentivos.' : 'La recaudación que falta define cuánto podrá devengar la entidad con recursos propios en el último trimestre: campaña de cobranza y depuración del padrón.')}`;
    return '';
  }

  // ---- interfaz: tablero de reportes y reporte a pantalla completa ----
  function abrir(E, host) {
    const C = calcular(E), fs = fichas(C), u = E._ue || {};
    let ov = $('rs-ov'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'rs-ov'; ov.className = 'sg-ov'; (host || document.body).appendChild(ov);
    const pintar = (id) => {
      const f = id && fs.find(x => x.id === id);
      ov.innerHTML = `<div class="sg-card rs-card" role="dialog" aria-modal="true" aria-label="Reportes SIAF" onclick="event.stopPropagation()">
        <div class="pd-hdr sg-hdr rs-hdr"><div class="pd-cui"><span>REPORTES SIAF</span><span>· ${esc(u.nombre || 'UE ' + E.ue)} · al ${fD(C.corte)}</span></div>
          <div class="pd-title sg-nom">${f ? esc(f.tit) : 'Lo que solo el SIAF permite ver'}</div>
          <div class="fi-acts"><span class="sp"></span>${f ? `${id === 'flujo' ? '' : `<button type="button" class="btn" id="rs-xls">${ico('download')} Excel</button><button type="button" class="btn" id="rs-print">${ico('printer')} Imprimir</button>`}<button type="button" class="ov-volver" id="rs-back"><span class="ov-fl" aria-hidden="true">←</span>Reportes</button>` : `<button type="button" class="ov-volver" id="rs-close"><span class="ov-fl" aria-hidden="true">←</span>Volver</button>`}</div></div>
        <div class="sg-body rs-body" tabindex="0">${f ? `<div class="rs-head ${f.k}"><span class="rs-hi">${ico(f.ico)}</span><div><b>${f.num}</b><small>${esc(f.sub)}</small></div></div>${cuerpo(id, C, E)}` : `<div class="rs-grid">${fs.map((x, i) => `<button type="button" class="rs-tile ${x.k}" data-id="${x.id}" style="--i:${i}"><span class="rs-ti">${ico(x.ico)}</span><span class="rs-tt">${esc(x.tit)}</span><span class="rs-tn">${x.num}</span><span class="rs-ts">${esc(x.sub)}</span>${spark(x.sp, x.k === 'ok' ? COL.ok : x.k === 'warn' ? COL.warn : x.k === 'bad' ? COL.bad : COL.p)}<span class="rs-ta" aria-hidden="true">›</span></button>`).join('')}</div>`}</div>
        <div class="sg-pie">Fuente: SIAF de la entidad (expedientes, fases, certificaciones, PCA e ingresos) al ${fD(C.corte)}. Días hábiles de lunes a viernes. Herramienta de apoyo, no oficial.</div></div>`;
      ov.style.display = 'flex';
      const cerrar = () => { ov.style.display = 'none'; document.removeEventListener('keydown', onKey); };
      const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); if (f) pintar(null); else cerrar(); } };
      document.addEventListener('keydown', onKey);
      ov.onclick = cerrar; if ($('rs-close')) $('rs-close').onclick = cerrar; if ($('rs-back')) $('rs-back').onclick = () => pintar(null);
      ov.querySelectorAll('.rs-tile').forEach(b => b.onclick = () => pintar(b.dataset.id));
      if ($('rs-print')) $('rs-print').onclick = () => window.print();
      if ($('rs-xls')) $('rs-xls').onclick = () => { if (!window.XLSX) return; const rows = [...ov.querySelectorAll('.rs-tbl tr')].map(tr => [...tr.children].map(td => td.innerText.trim())); const ws = XLSX.utils.aoa_to_sheet([[f.tit], [f.num, f.sub], []].concat(rows)); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Reporte'); XLSX.writeFile(wb, `reporte_siaf_${E.ue}_${id}.xlsx`); };
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) ov.querySelectorAll('.rs-tile,.rs-head,.rs-g2>div,.rs-acc').forEach((x, i) => x.animate && x.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 40 + i * 50, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
      if (id === 'flujo' && window.FlujoCaja) FlujoCaja.llenar($('fc-slot'), String(E.ue), u.nombre);
      ov.querySelector('.rs-body').focus({ preventScroll: true });
    };
    pintar(null);
  }
  window.ReportesSIAF = { abrir, calcular, fichas };
})();
