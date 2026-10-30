/* cierre.js — módulo "Cierre de gestión" (transferencia 2026): una pantalla con las fechas que manda la Contraloría
   y los pendientes que conviene ordenar antes del 31/12. Herramienta de apoyo, no de control.
   Datos públicos: alertas.json filtrado por unidad ejecutora. Con SIAF (solo en Mi entidad): bloque alertas y bloque cierre del paquete cifrado.
   Uso: Cierre.ui(elemento, {ue, nombre, nivel, alertas, corteAlertas, siaf, onCui, onAtras}) */
(function () {
  // ---- Fechas: una sola constante editable. Pendiente para diciembre: revisar si sale un decreto de días no laborables
  // para enero de 2027 y, si sale, ajustar las fechas de enero (marcadas con asterisco). ----
  const FECHAS = [
    { f: '2026-09-30', t: 'Corte del Informe Inicial de Rendición de Cuentas de Titulares por cese en el cargo', c: 'Corte inicial' },
    { f: '2026-10-22', t: 'Último día para enviar el Informe Inicial (15 días hábiles)', c: 'Envío del informe inicial', ast: 1 },
    { f: '2026-10-29', t: 'Publicación del Informe Inicial en los canales institucionales (5 días hábiles desde el envío, si se envió el 22/10)', c: 'Publicación del informe inicial', ast: 1 },
    { f: '2026-12-31', t: 'Corte del Informe Final y del Informe de Transferencia de Gestión', c: 'Corte final' },
    { f: '2027-01-06', t: 'Último día para enviar ambos informes (3 días hábiles)', c: 'Envío de informes finales', ast: 1 },
    { f: '2027-01-08', t: 'Último día para firmar el Acta de Transferencia (5 días hábiles)', c: 'Firma del acta', ast: 1 },
    { f: '2027-01-12', t: 'Envío del Acta a la Contraloría y remisión del acta e informes firmados a la Oficina General de Administración (2 días hábiles desde la firma, si se firma el 08/01)', c: 'Acta a la Contraloría', ast: 1 },
    { f: '2027-01-15', t: 'Publicación del Acta y los informes (5 días hábiles desde la firma, si se firma el 08/01)', c: 'Publicación', ast: 1 }
  ];
  // ---- Semáforo: una sola constante editable. Rojo = algún caso antiguo o de monto alto. ----
  const UMBRALES = { monto_alto: 1000000, dias_antiguo: 90 };
  // 29/10 (revisores): el umbral de monto se escala con el PIM de inversiones de la entidad (1 %, entre S/ 100 mil y S/ 1 millón) para que un municipio pequeño no vea todo en verde ni uno grande todo en rojo
  const umbralMonto = ctx => { const pim = (ctx.cuis || []).reduce((a, c) => a + (c.pim || 0), 0); return pim ? Math.min(1e6, Math.max(1e5, Math.round(pim * 0.01 / 1e4) * 1e4)) : UMBRALES.monto_alto; };

  const SIG = { CUI: 'Código Único de Inversiones', SIAF: 'Sistema Integrado de Administración Financiera', SEACE: 'Sistema Electrónico de Contrataciones del Estado', MEF: 'Ministerio de Economía y Finanzas', SUNAT: 'Superintendencia Nacional de Aduanas y de Administración Tributaria', 'F12-B': 'Formato 12-B: seguimiento de la ejecución de inversiones' };
  const ab = s => `<abbr title="${SIG[s]}">${s}</abbr>`;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const S = n => 'S/ ' + Math.round(n || 0).toLocaleString('es-PE');
  const SM = n => Math.abs(n) >= 1e6 ? 'S/ ' + (n / 1e6).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' M' : S(n);
  const dmy = f => f ? f.slice(8, 10) + '/' + f.slice(5, 7) + '/' + f.slice(0, 4) : '';
  const hoyISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const dif = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
  const corto = s => { s = String(s || ''); return s.length > 90 ? s.slice(0, 88) + '…' : s; };
  const fechaDe = (txt, re) => { const m = String(txt || '').match(re); return m ? m[1] : null; };

  // ---- Los 11 pendientes (fase 1). área = sistema administrativo para el texto del informe (Anexo N° 3, Sección III, numeral 3.1) ----
  const PEND = {
    plazo_vencido: { n: 1, t: 'Obras con plazo contractual vencido', acc: 'Se sugiere revisar si corresponde ampliación de plazo o penalidad, según el contrato', med: 'saldo del presupuesto del año sin devengar', area: 'Sistema Nacional de Programación Multianual y Gestión de Inversiones', pub: 1 },
    contr_sin_dev: { n: 2, t: 'Contratos firmados sin devengado', acc: 'Revisar valorizaciones y registrar el devengado', med: 'monto del contrato', area: 'Sistema Nacional de Abastecimiento', pub: 1 },
    por_cerrar: { n: 3, t: 'Obras casi terminadas sin cerrar', acc: 'Liquidar y registrar el cierre', med: 'saldo del presupuesto del año sin devengar', area: 'Sistema Nacional de Programación Multianual y Gestión de Inversiones', pub: 1 },
    prog: { n: 4, t: 'Ejecución fuera de lo programado en el Formato 12-B', acc: 'Actualizar la programación en el Formato 12-B', med: 'saldo del presupuesto del año sin devengar', area: 'Sistema Nacional de Programación Multianual y Gestión de Inversiones', pub: 1 },
    rezago: { n: 5, t: 'Inversiones con presupuesto y avance muy bajo', acc: 'Revisar el cronograma y reprogramar el saldo', med: 'saldo del presupuesto del año sin devengar', area: 'Sistema Nacional de Programación Multianual y Gestión de Inversiones', pub: 1 },
    dev_sin_girar: { n: 6, t: 'Devengado sin girar', acc: 'Se sugiere girar o, si el devengado no correspondía, evaluar su rebaja con sustento', med: 'devengado pendiente de giro', area: 'Sistema Nacional de Tesorería' },
    comp_sin_devengar: { n: 7, t: 'Comprometido sin devengar', acc: 'Devengar o rebajar el compromiso', med: 'compromiso pendiente de devengar', area: 'Sistema Nacional de Presupuesto Público' },
    cert_sin_comp: { n: 8, t: 'Certificación sin compromiso', acc: 'Comprometer o rebajar la certificación', med: 'certificación sin comprometer', area: 'Sistema Nacional de Presupuesto Público' },
    rendiciones: { n: 9, t: 'Rendiciones pendientes', acc: 'Rendir o devolver', med: 'monto de la rendición', area: 'Sistema Nacional de Tesorería', tab: ['RENDICION', 'RENDICION_DETALLE'] },
    saldos: { n: 10, t: 'Saldos bancarios y conciliaciones sin cerrar', acc: 'Conciliar y sustentar el saldo', med: 'saldo de la cuenta', area: 'Sistema Nacional de Contabilidad', tab: ['SALDO_BANCO', 'CONCILIACION'] },
    sunat: { n: 11, t: 'Deuda tributaria registrada (SUNAT)', acc: 'Se sugiere verificar el estado de la deuda y, de corresponder, pagar, fraccionar o sustentar', med: 'monto notificado', area: 'Sistema Nacional de Tesorería', tab: ['DEUDA_CORRIENTE_SUNAT', 'DEUDA_FR_SUNAT'] }
  };
  const TARJ = [
    { id: 'obras', t: 'Obras e inversiones', ic: 'flag', p: ['plazo_vencido', 'por_cerrar', 'prog', 'rezago'], fr: 'obras e inversiones que convendría ordenar antes del cierre' },
    { id: 'contratos', t: 'Contratos', ic: 'doc', p: ['contr_sin_dev'], fr: 'contratos firmados que aún no registran devengado este año' },
    { id: 'ppto', t: 'Presupuesto', ic: 'wallet', p: ['comp_sin_devengar', 'cert_sin_comp'], fr: 'compromisos y certificaciones que podrían requerir rebaja o regularización' },
    { id: 'caja', t: 'Pagos y caja', ic: 'cash', p: ['dev_sin_girar', 'saldos'], fr: 'pagos por girar y saldos en cuentas por conciliar' },
    { id: 'rend', t: 'Rendiciones y deudas', ic: 'clipboard', p: ['rendiciones', 'sunat'], fr: 'rendiciones por completar y deudas tributarias registradas' }
  ];

  // ---- filas por pendiente: {que, monto, dias, cui} ----
  function filas(k, ctx) {
    const pub = ctx.alertas || {}, si = ctx.siaf;
    const deUE = l => (l || []).filter(x => String(x.ue) === String(ctx.ue));
    const obra = x => ({ que: `${ab('CUI')} ${esc(x.cui)} · ${esc(corto(x.nombre))}`, txt: `CUI ${x.cui} · ${x.nombre || ''}`, monto: Math.max(0, (x.pim || 0) - (x.dev || 0)), cui: x.cui });
    if (PEND[k].pub) {
      if (!pub[k]) return null;
      return deUE(pub[k]).map(x => {
        const o = obra(x);
        if (k === 'plazo_vencido') { const f = fechaDe(x.det, /vencido el (\d{4}-\d{2}-\d{2})/); o.dias = f ? dif(f, hoyISO()) : null; }
        if (k === 'contr_sin_dev') { const m = String(x.det || '').match(/por S\/ ([\d.]+)/), f = fechaDe(x.det, /firmado el (\d{4}-\d{2}-\d{2})/); if (m) o.monto = +m[1]; o.dias = f ? dif(f, hoyISO()) : null; }
        return o;
      }).sort((a, b) => b.monto - a.monto);
    }
    if (!si) return null;
    const A = si.alertas || {}, C = si.cierre;
    const gl = x => corto(x.glosa || x.prov || ''), glx = x => String(x.glosa || x.prov || '');
    if (k === 'dev_sin_girar' || k === 'comp_sin_devengar') return (A[k] || []).map(x => ({ que: `Expediente ${esc(x.exp)} · ${esc(gl(x))}`, txt: `Expediente ${x.exp} · ${glx(x)}`, monto: x.monto, dias: x.dias }));
    if (k === 'cert_sin_comp') return (A[k] || []).map(x => ({ que: `Certificación ${esc(x.cert)} · ${esc(gl(x))}`, txt: `Certificación ${x.cert} · ${glx(x)}`, monto: x.monto, dias: x.dias }));
    if (!C) return null;   // paquete generado antes de este módulo: hay que volver a procesar el SIAF
    if (k === 'rendiciones') return C.rendiciones.map(x => ({ que: `Rendición ${esc(x.rendicion)} · expediente ${esc(x.exp)}`, txt: `Rendición ${x.rendicion} · expediente ${x.exp}`, monto: x.monto || 0, dias: x.dias }));
    if (k === 'saldos') return C.saldos_banco.map(x => ({ que: `Cuenta ${esc(x.banco)}-${esc(x.cta)} · saldo al mes ${esc(x.mes)}`, txt: `Cuenta ${x.banco}-${x.cta} · saldo al mes ${x.mes}`, monto: Math.abs(x.saldo), dias: null }))
      .concat(C.conciliaciones.map(x => ({ que: `Conciliación ${esc(x.secuencia)} · trimestre ${esc(x.trimestre)} · con observación`, txt: `Conciliación ${x.secuencia} · trimestre ${x.trimestre} · con observación`, monto: 0, dias: x.fecha ? dif(x.fecha, hoyISO()) : null, acc: 'Corregir la observación y volver a conciliar' })));
    if (k === 'sunat') return C.deuda_sunat.map(x => ({ que: `${esc(x.desc || 'Deuda')} · periodo ${esc(x.periodo)} · documento ${esc(x.doc)}`, txt: `${x.desc || 'Deuda'} · periodo ${x.periodo} · documento ${x.doc}`, monto: x.monto, dias: x.dias }))
      .concat(C.fraccionamientos.map(x => ({ que: `Fraccionamiento ${esc(x.cronograma)} · resolución ${esc(x.resolucion)}`, txt: `Fraccionamiento ${x.cronograma} · resolución ${x.resolucion}`, monto: 0, dias: null, acc: 'Verificar que las cuotas estén al día' })));
    return null;
  }
  // sin dato: 'siaf' = solo en Mi entidad; 'reproc' = falta volver a procesar el SIAF; 'vacio' = la base no trae registros del año
  function sinDato(k, ctx) {
    if (PEND[k].pub) return ctx.alertas && ctx.alertas[k] ? null : 'pub';
    if (!ctx.siaf) return 'siaf';
    if (PEND[k].tab) { const C = ctx.siaf.cierre; if (!C) return 'reproc'; if (PEND[k].tab.every(t => !(C.tablas && C.tablas[t] && C.tablas[t].del_anio))) return 'vacio'; }
    return null;
  }
  const rojo = r => (r.monto || 0) >= UMBRALES.monto_alto || (r.dias || 0) >= UMBRALES.dias_antiguo;

  function modelo(ctx) {
    return TARJ.map(c => {
      const ps = c.p.map(k => ({ k, ...PEND[k], sd: sinDato(k, ctx), rows: filas(k, ctx) || [] }));
      const con = ps.filter(p => !p.sd), rows = con.flatMap(p => p.rows);
      const n = rows.length, monto = rows.reduce((s, r) => s + (r.monto || 0), 0);
      const est = !con.length ? 'gris' : !n ? 'verde' : rows.some(rojo) ? 'rojo' : 'ambar';
      return { ...c, ps, n, monto, est };
    });
  }
  const EST = { verde: ['#147A45', '#EAF5EE', 'Sin pendientes'], ambar: ['#7A4F08', '#FDF3E1', 'Hay pendientes'], rojo: ['#B42A2A', '#FBEAEA', 'Pendientes antiguos o de monto alto'], gris: ['#4B5563', '#F1F3F6', 'Sin dato'] };
  const SDTXT = { siaf: 'Se calcula con el SIAF en Mi entidad (con clave).', reproc: 'Falta volver a procesar el SIAF de la entidad para calcularlo.', vacio: 'La base del SIAF de la entidad no trae registros de este año.', pub: 'Dato público aún no disponible.' };

  // ---- estilos (una vez) ----
  function css() {
    if (document.getElementById('cg-css')) return;
    const s = document.createElement('style'); s.id = 'cg-css';
    s.textContent = `.cg{display:flex;flex-direction:column;gap:8px;height:100%;min-height:0;box-sizing:border-box;padding:12px 14px;color:#0F172A}
.cg-h,.cg-tl,.cg-pie{flex:none}.cg-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.cg-h h2{margin:0;font-size:16px;color:#0F2A43}.cg-h .cg-cd{font-size:12.5px;color:#334155}.cg-h .cg-cd b{color:#0F2A43;font-size:15px}
.cg-h .sp{flex:1}.cg .btn{min-height:32px}
.cg-tl{background:#fff;border:1px solid #DCE3EC;border-radius:12px;padding:8px 12px 6px}
.cg-tl .lbl{font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#334155;margin-bottom:6px}
.cg-bar{position:relative;height:6px;border-radius:4px;background:#E2E8F0;margin:22px 6px 10px}.cg-bar .pr{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:#1E5AA8}
.cg-bar i{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;border:2px solid #1E5AA8}.cg-bar i.ok{background:#1E5AA8}
.cg-bar .hoy{position:absolute;top:-7px;width:2px;height:20px;margin-left:-1px;background:#B42A2A}.cg-bar .hoy span{position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:9.5px;font-weight:800;color:#B42A2A;white-space:nowrap}
.cg-hit{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.cg-hit div{font-size:10.5px;line-height:1.25;color:#334155;border-left:3px solid #CBD5E1;padding-left:5px}
.cg-hit div.pas{opacity:.75}.cg-hit div.prox{border-color:#B42A2A;color:#0F172A}.cg-hit b{display:block;font-size:11.5px;color:#0F2A43}
.cg.abierta .cg-tl .nota{display:none}.cg.abierta .cg-bar{margin-bottom:6px}.cg.abierta .cg-hit{display:flex;flex-wrap:wrap;gap:3px 14px}.cg.abierta .cg-hit div{border-left:0;padding:0;font-size:10.5px;white-space:nowrap}.cg.abierta .cg-hit b{display:inline;margin-right:4px}.cg.abierta .cg-hit div.prox{font-weight:700}.cg.abierta .cg-hit div.prox b{color:#B42A2A}.cg-tl .nota{font-size:10.5px;color:#475569;margin-top:6px}
.cg-c{flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
.cg-k{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:4px;border-radius:12px;border:1px solid #DCE3EC;border-top:5px solid var(--c);background:linear-gradient(160deg,#fff 55%,var(--b));padding:10px 12px;min-width:0;min-height:0;overflow:auto}
.cg-k:hover{box-shadow:0 6px 18px rgba(15,42,67,.12)}.cg-k:focus-visible{outline:3px solid #1E5AA8;outline-offset:2px}
.cg-k .t{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:#0F2A43}.cg-k .t .ic{width:18px;height:18px}
.cg-k .sem{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--c)}.cg-k .sem::before{content:'';width:10px;height:10px;border-radius:50%;background:var(--c)}
.cg-k .nm{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.cg-k .n{font-size:28px;font-weight:900;line-height:1;color:var(--c)}.cg-k .m{font-size:14px;font-weight:800;color:#0F2A43}.cg-k .f{font-size:12px;line-height:1.35;color:#334155}.cg-k .sd{font-size:11px;color:#475569}.cg-k ul{list-style:none;margin:auto 0 0;padding:6px 0 0;border-top:1px solid #E2E8F0;display:flex;flex-direction:column;gap:3px}.cg-k li{display:flex;flex-wrap:wrap;justify-content:space-between;gap:0 6px;font-size:11.5px;color:#334155}.cg-k li b{color:#0F2A43;white-space:nowrap}.cg-k li.g{color:#475569}
.cg-x{grid-column:1/-1;display:flex;flex-direction:column;min-height:0;border-radius:12px;border:1px solid #DCE3EC;border-top:5px solid var(--c);background:#fff}
.cg-x .hd{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;border-bottom:1px solid #E2E8F0}.cg-x .hd:focus-visible{outline:3px solid #1E5AA8;outline-offset:-3px}
.cg-x .hd b{font-size:14px;color:#0F2A43}.cg-x .hd .sem{font-size:12px;font-weight:700;color:var(--c)}.cg-x .hd .sp{flex:1}.cg-x .hd small{font-size:11.5px;color:#334155}
.cg-x .bd{flex:1;min-height:0;overflow:auto;padding:4px 14px 10px}
.cg-p{margin-top:10px}.cg-p h3{margin:0 0 4px;font-size:12.5px;color:#0F2A43}.cg-p h3 small{font-weight:600;color:#475569}
.cg-p table{width:100%;border-collapse:collapse;font-size:12px}.cg-p th{text-align:left;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;color:#475569;padding:4px 6px;border-bottom:1px solid #E2E8F0}
.cg-p td{padding:5px 6px;border-bottom:1px solid #F1F5F9;vertical-align:top;white-space:normal;overflow:visible;text-overflow:clip;max-width:none;text-align:left}.cg-p td.m{white-space:nowrap;text-align:right;font-weight:700}.cg-p td.a{color:#0F2A43;font-weight:600}
.cg-p tr.r td.m{color:#B42A2A}.cg-p .ver{margin-top:4px}.cg-p .vac{font-size:12px;color:#475569;margin:2px 0}.cg-p a.cui{color:#1E5AA8;font-weight:700;cursor:pointer;text-decoration:underline}
.cg-pie{font-size:10.5px;line-height:1.4;color:#475569;border-top:1px solid #E2E8F0;padding-top:6px}.cg-pie b{color:#0F2A43}
abbr[title]{text-decoration:underline dotted;cursor:help}
@media (max-width:1100px){.cg-c{grid-template-columns:repeat(3,minmax(0,1fr))}.cg-hit{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-width:700px){.cg{padding:10px;height:auto}.cg-c{flex:none}.cg-c{grid-template-columns:1fr 1fr}.cg-hit{grid-template-columns:1fr 1fr}.cg-k .n{font-size:22px}
 .cg-p table,.cg-p tbody,.cg-p tr,.cg-p td{display:block;width:100%}.cg-p th{display:none}.cg-p tr{border-bottom:1px solid #E2E8F0;padding:4px 0}.cg-p td{border:0;padding:1px 0}.cg-p td.m{text-align:left}}`;
    document.head.appendChild(s);
  }

  function linea(hoy) {
    const a = FECHAS[0].f, z = FECHAS[FECHAS.length - 1].f, tot = dif(a, z), pos = f => Math.max(0, Math.min(100, 100 * dif(a, f) / tot));
    const prox = FECHAS.find(h => h.f >= hoy);
    const cd = prox ? (d => d === 0 ? `<b>Hoy</b>: ${esc(prox.c)}` : `Faltan <b>${d} día${d === 1 ? '' : 's'}</b> para: ${esc(prox.c)} (${dmy(prox.f)}${prox.ast ? '*' : ''})`)(dif(hoy, prox.f)) : 'Todos los plazos de la transferencia ya pasaron.';
    const tl = `<section class="cg-tl" aria-label="Fechas según la Directiva de la Contraloría"><div class="lbl">Fechas según la Directiva de la Contraloría</div>
      <div class="cg-bar" role="img" aria-label="Línea de tiempo del 30/09/2026 al 15/01/2027; hoy ${dmy(hoy)}"><div class="pr" style="width:${pos(hoy)}%"></div>${FECHAS.map(h => `<i class="${h.f <= hoy ? 'ok' : ''}" style="left:${pos(h.f)}%" title="${dmy(h.f)}${h.ast ? '*' : ''} · ${esc(h.t)}"></i>`).join('')}${hoy >= a && hoy <= z ? `<div class="hoy" style="left:${pos(hoy)}%"><span>HOY</span></div>` : ''}</div>
      <div class="cg-hit">${FECHAS.map(h => `<div class="${h.f < hoy ? 'pas' : prox && h.f === prox.f ? 'prox' : ''}" title="${esc(h.t)}"><b>${dmy(h.f)}${h.ast ? '*' : ''}</b>${esc(h.c)}</div>`).join('')}</div>
      <div class="nota">Equipo del titular entrante: hasta 3 días hábiles tras la proclamación; Comisión de Transferencia: hasta 5 días hábiles después. Sin fecha fija: depende de la designación o proclamación de resultados en cada localidad (num. 7.2.2.c y 7.2.3.c.1).</div></section>`;
    return { tl, cd };
  }

  function tarjeta(c) {
    const [col, bg, et] = EST[c.est];
    const sd = c.ps.filter(p => p.sd);
    return `<button type="button" class="cg-k" data-k="${c.id}" aria-expanded="false" style="--c:${col};--b:${bg}">
      <span class="t">${window.Ico ? Ico(c.ic) : ''}${c.t}</span><span class="sem">${et}</span>
      ${c.est === 'gris' ? `<span class="sd">${SDTXT[sd[0].sd]}</span>` : `<span class="nm"><span class="n">${c.n.toLocaleString('es-PE')}</span><span class="m">${SM(c.monto)}</span></span><span class="f">${c.n ? c.fr : 'Nada pendiente con los datos disponibles.'}</span><ul>${c.ps.map(p => p.sd ? `<li class="g"><span>${p.n}. ${p.t}</span><b>sin dato</b></li>` : `<li><span>${p.n}. ${p.t}</span><b>${p.rows.length} · ${SM(p.rows.reduce((s, r) => s + (r.monto || 0), 0))}</b></li>`).join('')}</ul>${sd.length ? `<span class="sd">${sd.map(p => `${p.n}. ${SDTXT[p.sd]}`).join(' ')}</span>` : ''}`}</button>`;
  }

  function detalle(c, verTodo, fuente) {
    const [col, , et] = EST[c.est];
    const sec = c.ps.map(p => {
      const head = `<h3>${p.n}. ${p.t} <small>· ${p.rows.length.toLocaleString('es-PE')} caso${p.rows.length === 1 ? '' : 's'}${p.rows.length ? ' · ' + S(p.rows.reduce((s, r) => s + (r.monto || 0), 0)) + ' (' + p.med + ')' : ''}</small></h3>`;
      if (p.sd) return `<div class="cg-p">${head}<p class="vac">${SDTXT[p.sd]}</p></div>`;
      if (!p.rows.length) return `<div class="cg-p">${head}<p class="vac">Sin casos con los datos disponibles.</p></div>`;
      const todo = verTodo[p.k], vis = todo ? p.rows : p.rows.slice(0, 10);
      return `<div class="cg-p">${head}<table><thead><tr><th scope="col">Qué es</th><th scope="col">Cuánto suma</th><th scope="col">Qué se sugiere hacer</th></tr></thead><tbody>${vis.map(r => `<tr class="${rojo(r) ? 'r' : ''}"><td>${r.cui ? `<a class="cui" data-cui="${esc(r.cui)}" tabindex="0" role="button">${r.que}</a>` : r.que}${r.dias != null ? ` <small>· ${r.dias} días</small>` : ''}</td><td class="m">${r.monto ? S(r.monto) : '—'}</td><td class="a">${esc(r.acc || p.acc)}</td></tr>`).join('')}</tbody></table>
        ${p.rows.length > 10 ? `<button type="button" class="btn ver" data-ver="${p.k}">${todo ? 'Ver solo los 10 mayores' : `Ver todos (${p.rows.length.toLocaleString('es-PE')})`}</button>` : ''}</div>`;
    }).join('');
    return `<div class="cg-x" style="--c:${col}"><button type="button" class="hd" data-k="${c.id}" aria-expanded="true"><b>${c.t}</b><span class="sem">● ${et}</span><span class="sp"></span><small>${fuente(c)}</small><small aria-hidden="true">▲ contraer</small></button><div class="bd">${sec}</div></div>`;
  }

  // ---- exportación: borrador de "Asuntos de prioritaria atención" agrupado por área ----
  function borrador(ctx, mod) {
    const filasX = [], areas = {};
    mod.forEach(c => c.ps.forEach(p => {
      if (p.sd || !p.rows.length) return;
      const f = p.pub ? `MEF y SEACE, consultados al ${ctx.corteAlertas || ''}` : `SIAF de la entidad, corte ${ctx.siaf && ctx.siaf.corte || ''}`;
      (areas[p.area] = areas[p.area] || []).push({ p, f });
      // 29/10: columnas del Anexo N° 3 (N°, Tema, Asuntos relevantes, Medidas de atención, Prioridad); la prioridad es sugerida por el semáforo (rojo: Urgente, 30 días; resto: Indispensable, 3 meses) y la ajusta la entidad
      p.rows.forEach((r, i) => filasX.push([p.area, filasX.length + 1, p.t, r.txt + (r.monto ? ` (${S(r.monto)})` : '') + (r.dias != null ? ` · ${r.dias} días` : ''), 'Se sugiere: ' + (r.acc || p.acc), rojo(r) ? 'Urgente (primeros 30 días)' : 'Indispensable (primeros 3 meses)', f]));
    }));
    return { filasX, areas };
  }
  async function jszip() {
    if (window.JSZip) return;
    await new Promise((ok, err) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.integrity = 'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG'; s.crossOrigin = 'anonymous'; s.onload = ok; s.onerror = err; document.head.appendChild(s); });
  }
  const xe = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  async function word(ctx, mod, nombreArch) {
    await jszip();
    const { areas } = borrador(ctx, mod);
    const P = (t, o) => `<w:p>${o && o.h ? `<w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr>` : ''}<w:r>${o && (o.b || o.h) ? `<w:rPr><w:b/>${o.h ? '<w:sz w:val="26"/>' : ''}</w:rPr>` : ''}<w:t xml:space="preserve">${xe(t)}</w:t></w:r></w:p>`;
    let body = P('Anexo N° 3, Sección III, numeral 3.1: Asuntos de prioritaria atención de los sistemas administrativos · BORRADOR PARA REVISAR', { h: 1 })
      + P(`${ctx.nombre} · pliego/UE ${ctx.ue} (el informe se consolida a nivel de pliego; este insumo cubre la unidad ejecutora indicada)`) + P(`Preparado el ${dmy(hoyISO())} con Acierta (herramienta de apoyo, no oficial). Revise cada cifra antes de registrarla en el aplicativo de la Contraloría.`);
    Object.entries(areas).forEach(([a, ls]) => {
      body += P(`${a}`, { h: 1 });
      ls.forEach(({ p, f }) => {
        const tot = p.rows.reduce((s, r) => s + (r.monto || 0), 0);
        body += P(`${p.t}: ${p.rows.length} caso${p.rows.length === 1 ? '' : 's'}${tot ? ` por ${S(tot)} (${p.med})` : ''}. Se sugiere: ${p.acc}. Fuente: ${f}.`, { b: 1 });
        p.rows.slice(0, 30).forEach(r => body += P(`• ${r.txt}${r.monto ? ': ' + S(r.monto) : ''}${r.dias != null ? ` · ${r.dias} días` : ''}. Se sugiere: ${r.acc || p.acc}. Prioridad sugerida: ${rojo(r) ? 'Urgente (primeros 30 días)' : 'Indispensable (primeros 3 meses)'}.`));
        if (p.rows.length > 30) body += P(`• … y ${p.rows.length - 30} casos más (ver el Excel).`);
      });
    });
    if ((ctx.cuis || []).length) body += P(`Anexo de inversiones: ${ctx.cuis.length} CUI con PIM ${ctx.anio || ''}, una fila por inversión con costo, ejecución, avance físico, Formato 12-B y qué declarar, en la hoja "Anexo inversiones" del Excel que acompaña este borrador.`, { b: 1 });
    body += P(`Las fechas y los días se calcularon con los feriados nacionales al ${dmy(hoyISO())}; verificar frente a días no laborables regionales o locales. El Anexo N° 3 clasifica la prioridad en Urgente (primeros 30 días), Indispensable (primeros 3 meses) y Necesario (6 a 12 meses); la prioridad sugerida aquí la define la entidad.`);
    body += P('Herramienta de apoyo, no oficial. No reemplaza el aplicativo de la Contraloría ni constituye opinión de control. El panel no determina responsabilidades; ordena lo que los registros públicos muestran, y cada cifra es un insumo referencial que la entidad verifica en el SIAF y el Banco de Inversiones. El Informe de Transferencia de Gestión lo suscribe el titular saliente e informa, entre otros, los asuntos urgentes de atención prioritaria (Directiva N° 016-2022-CG/PREVI, num. 7.2); se sugiere que lo que no alcance a regularizarse antes del 31/12 se consigne en la Sección III, numeral 3.1, con su medida de atención y prioridad.', { b: 1 });
    const z = new JSZip();
    z.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    z.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    z.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`);
    const blob = await z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombreArch + '.docx'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  // ---- anexo de inversiones: una fila por CUI con lo que el informe de transferencia debe declarar; situación con las reglas del panel (RD 0002-2025-EF/63.01) ----
  const SIT = { culminada: 'Culminada: verificar el registro del Formato 09, Sección B, dentro de los 60 días calendario de la culminación física (Directiva 001-2019-EF/63.01, num. 29.3, texto de la RD 0002-2025-EF/63.01)', ejecucion: 'En ejecución: declarar avance físico y financiero, contrato vigente y saldo por ejecutar', expediente: 'En expediente técnico o estudio: declarar estado del expediente y fecha prevista de inicio', viable: 'Viable sin iniciar: declarar si está en el PMI y si tiene presupuesto', paralizada: 'Paralizada o suspendida: declarar causa, plazo y acciones (Formato 12-B)' };
  function anexo(ctx) {
    const n2 = v => v == null || v === '' ? '' : Math.round(Number(v) * 100) / 100;
    const est = c => ctx.estadoInv ? ctx.estadoInv(c) : 'ejecucion';
    const filas = (ctx.cuis || []).slice().sort((a, b) => (b.pim || 0) - (a.pim || 0)).map(c => { const e = est(c), pim = c.pim || 0, dev = c.dev || 0; return [
      c.cui, c.nombre || '', c.tipo || '', c.estado || '', c.situacion || '', n2(c.costo), n2(c.dev_acum_ant), n2(pim), n2(dev), pim ? Math.round(dev * 1000 / pim) / 10 : '', n2(c.avance_fisico), c.f8 || '', c.ult_f12b ? String(c.ult_f12b).slice(0, 10) : '', c.ini_fisica || '', c.fin_fisica || '', c.pfa != null ? n2(c.pfa) : '', c.problema || '', SIT[e] || '']; });
    return [['CUI', 'Nombre de la inversión', 'Tipo', 'Estado (Banco de Inversiones)', 'Situación', 'Costo actualizado (S/)', 'Devengado acumulado años anteriores (S/)', `PIM ${ctx.anio || ''} (S/)`, `Devengado ${ctx.anio || ''} (S/)`, '% ejecución del PIM', 'Avance físico (%)', 'Formato 08 (etapa)', 'Último Formato 12-B', 'Inicio físico', 'Término físico vigente', 'Avance físico F12-B (%)', 'Último problema reportado (F12-B)', 'Situación para el informe y qué declarar'], ...filas];
  }
  function excel(ctx, mod, nombreArch) {
    const { filasX } = borrador(ctx, mod);
    const ws = XLSX.utils.aoa_to_sheet([['Sistema administrativo', 'N°', 'Tema', 'Asuntos relevantes', 'Medidas y acciones de atención inmediata (sugeridas)', 'Prioridad (sugerida)', 'Fuente y fecha de consulta'], ...filasX]);
    ws['!cols'] = [{ wch: 44 }, { wch: 5 }, { wch: 34 }, { wch: 80 }, { wch: 50 }, { wch: 28 }, { wch: 40 }];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Prioritaria atención');
    const ax = anexo(ctx);
    if (ax.length > 1) { const wa = XLSX.utils.aoa_to_sheet([[`Anexo de inversiones · ${ctx.nombre} · UE ${ctx.ue} · fuentes MEF (Consulta Amigable, Banco de Inversiones, Formato 12-B) al ${ctx.corteAlertas || '—'} · insumo referencial, verificar en el SIAF y el Banco de Inversiones`], [], ...ax]); wa['!cols'] = [{ wch: 10 }, { wch: 60 }, { wch: 10 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 50 }, { wch: 70 }]; XLSX.utils.book_append_sheet(wb, wa, 'Anexo inversiones'); }
    XLSX.writeFile(wb, nombreArch + '.xlsx');
  }

  function ui(el, ctx) {
    UMBRALES.monto_alto = umbralMonto(ctx);
    css();
    const hoy = hoyISO(), mod = modelo(ctx), st = { abierta: null, todo: {} };
    const { tl, cd } = linea(hoy);
    const fuente = c => c.ps.some(p => p.pub) && c.ps.some(p => !p.pub) ? `Fuentes: ${ab('MEF')}/${ab('SEACE')} al ${esc(ctx.corteAlertas || '—')} · ${ab('SIAF')} al ${esc(ctx.siaf ? ctx.siaf.corte : '—')}` : c.ps.some(p => p.pub) ? `Fuente: ${ab('MEF')} (Consulta Amigable, Banco de Inversiones, ${ab('F12-B')}) y ${ab('SEACE')}, consultados al ${esc(ctx.corteAlertas || '—')}` : `Fuente: ${ab('SIAF')} de la entidad${ctx.siaf ? ', corte ' + esc(ctx.siaf.corte) : ''}`;
    const nombreArch = `asuntos_prioritaria_atencion_${ctx.ue}_${hoy}`;
    function pintar() {
      const c = st.abierta && mod.find(x => x.id === st.abierta);
      el.innerHTML = `<div class="cg${c ? ' abierta' : ''}">
        <div class="cg-h"><h2>Transferencia de gestión 2026</h2><span class="cg-cd" aria-live="polite">${cd}</span><span class="sp"></span>
          <button type="button" class="btn p" id="cg-prep">Preparar insumo para el numeral 3.1</button>${ctx.onAtras ? '<button type="button" class="ov-volver" id="cg-atras"><span class="ov-fl" aria-hidden="true">←</span>Volver</button>' : ''}</div>
        ${tl}
        <section class="cg-c" aria-label="Pendientes por ordenar">${c ? detalle(c, st.todo, fuente) : mod.map(tarjeta).join('')}</section>
        <div class="cg-pie"><b>Herramienta de apoyo, no oficial. No reemplaza el aplicativo de la Contraloría ni constituye opinión de control. El Informe de Transferencia de Gestión lo suscribe el titular saliente e informa, entre otros, los asuntos urgentes de atención prioritaria (Directiva N° 016-2022-CG/PREVI, num. 7.2); se sugiere que lo que no alcance a regularizarse antes del 31/12 se consigne en la Sección III, numeral 3.1, con su medida de atención y prioridad.</b><br>
        Base: Directiva N° 016-2022-CG/PREVI "Rendición de Cuentas de Titulares y Transferencia de Gestión" (R.C. 267-2022-CG), modificada por R.C. 344-2026-CG (03/07/2026). Cifras públicas: ${ab('MEF')} y ${ab('SEACE')} consultados al ${esc(ctx.corteAlertas || '—')}${ctx.siaf ? ` · ${ab('SIAF')} de la entidad con corte al ${esc(ctx.siaf.corte)}` : ''}. Semáforo rojo: algún caso con ${S(UMBRALES.monto_alto)} o más (1 % del PIM de inversiones de la entidad, entre S/ 100 mil y S/ 1 millón), o con ${UMBRALES.dias_antiguo} días o más.<br>
        * Fecha calculada con los feriados nacionales. Puede variar por feriados regionales o locales y por días no laborables que se declaren para el sector público; en ese caso rige el cómputo de días hábiles de la localidad.</div></div>`;
      el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { st.abierta = st.abierta === b.dataset.k ? null : b.dataset.k; pintar(); const f = el.querySelector(`[data-k="${b.dataset.k}"]`); if (f) f.focus(); });
      el.querySelectorAll('[data-ver]').forEach(b => b.onclick = () => { st.todo[b.dataset.ver] = !st.todo[b.dataset.ver]; pintar(); });
      el.querySelectorAll('a.cui').forEach(a => { const go = () => ctx.onCui && ctx.onCui(a.dataset.cui); a.onclick = go; a.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
      if (el.querySelector('#cg-atras')) el.querySelector('#cg-atras').onclick = () => { if (st.abierta) { st.abierta = null; pintar(); } else ctx.onAtras(); };
      el.querySelector('#cg-prep').onclick = () => {
        const run = async () => { try { excel(ctx, mod, nombreArch); await word(ctx, mod, nombreArch); } catch (e) { console.error(e); if (window.toast) toast('No se pudo preparar el borrador'); } };
        window.CorteReporte ? CorteReporte.exportar(ctx.ue, ctx.nombre, run) : run();
      };
    }
    pintar();
    return { modelo: mod };
  }
  window.Cierre = { FECHAS, UMBRALES, ui, modelo, _borrador: borrador, _anexo: anexo };
})();
