/* flujo.js — Flujo de caja proyectado de una entidad, descargable desde su ficha como Excel (ExcelJS) y PPT (PptxGenJS).
   Datos: Web/data/flujo/<NN>.json.gz (Scripts/flujo_web.py: motor de flujo_caja.py con datos abiertos del MEF) + data/flujo/index.json.
   Corte: el día en que se genera el reporte (el mes en curso entra con lo ya devengado y la proyección del resto). Ambos archivos
   llevan entidad, qué es, cómo se usa, fecha y hora de generación. API: FlujoCaja.descargar('xlsx'|'pptx', ue, nombre). */
(function () {
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  const NAVY = '0F2A43', AZUL = '1E5AA8', ORO = 'B8860B', GRIS = '5B6B7B', ROJO = 'B42A2A', VERDE = '0F6E4F', CLARO = 'EAF1FB', FONDO = 'F6F8FB';
  const EXCELJS = { src: 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js', integrity: 'sha384-Pqp51FUN2/qzfxZxBCtF0stpc9ONI6MYZpVqmo8m20SoaQCzf+arZvACkLkirlPz' };
  const PPTX = { src: 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', integrity: 'sha384-Cck14aA9cifjYolcnjebXRfWGkz5ltHMBiG4px/j8GS+xQcb7OhNQWZYyWjQ+UwQ' };
  const S = v => (v || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  const M = v => (Math.abs(v || 0) >= 1e6 ? (v / 1e6).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' M' : (Math.abs(v || 0) >= 1e3 ? (v / 1e3).toLocaleString('es-PE', { maximumFractionDigits: 0 }) + ' mil' : S(v)));
  const titulo = s => String(s || '').toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()).replace(/\s(De|Del|Y|La|Los|Las|El)\s/g, m => m.toLowerCase());
  const fDMY = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s || ''); };
  const ahora = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return { txt: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`, tag: `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}` }; };

  function lib(l, test) { return test() ? Promise.resolve() : new Promise((ok, err) => { const s = document.createElement('script'); s.src = l.src; s.integrity = l.integrity; s.crossOrigin = 'anonymous'; s.onload = ok; s.onerror = () => err(new Error('No se pudo cargar la biblioteca')); document.head.appendChild(s); }); }
  async function jgz(u) { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) throw new Error(u); if (!window.DecompressionStream) throw new Error('Este navegador no puede abrir el archivo; usa Chrome o Edge actualizados'); return JSON.parse(await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text()); }
  const CACHE = {};
  async function datos(ue) {
    ue = String(ue); const nn = ue.slice(-2).padStart(2, '0');
    const [idx, shard] = await Promise.all([CACHE.idx || (CACHE.idx = fetch('data/flujo/index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : {})), CACHE[nn] || (CACHE[nn] = jgz(`data/flujo/${nn}.json.gz`))]);
    const d = shard[ue]; if (!d) throw new Error('Esta entidad no tiene flujo de caja (sin presupuesto en el año o sector no disponible)');
    return { d, idx };
  }

  // ---------- modelo: lo que calcula cualquier hoja (por rubro y por mes) ----------
  function modelo(d) {
    const meses = []; for (let m = d.desde; m <= 12; m++) meses.push(m);
    const R = {};
    for (const [rb, r] of Object.entries(d.rubros || {})) {
      const ro = rb === '00';   // Recursos Ordinarios: no hay caja propia, el ingreso iguala al gasto (autorización de giro del Tesoro)
      const gasto = {}, ing = {}; let saldo = r.saldo0 || 0; const fila = [];
      meses.forEach(m => { gasto[m] = 0; });
      (r.sec || []).forEach(s => s.c.forEach(c => Object.entries(c.m).forEach(([m, v]) => { if (gasto[+m] != null) gasto[+m] += v; })));
      meses.forEach(m => { ing[m] = ro ? gasto[m] : ((r.ing && r.ing.proy && r.ing.proy[m]) || 0); });
      let brechaTot = 0;
      meses.forEach(m => { const ini = saldo, fin = ro ? 0 : ini + ing[m] - gasto[m], brecha = Math.max(0, -fin); brechaTot += brecha; fila.push({ m, ini, ing: ing[m], gasto: gasto[m], fin, brecha }); saldo = Math.max(0, fin); });
      const totIng = meses.reduce((a, m) => a + ing[m], 0), totGasto = meses.reduce((a, m) => a + gasto[m], 0);
      R[rb] = { rb, ro, nombre: r.nombre, saldo0: ro ? 0 : (r.saldo0 || 0), ing: totIng, gasto: totGasto, fin: ro ? 0 : fila[fila.length - 1].fin, brecha: brechaTot, meses: fila, exigible: r.exigible || 0, repartido: r.repartido || 0,
                porContratar: (r.por_contratar || []).reduce((a, x) => a + x[1], 0), vencidos: (r.vencidos || []).reduce((a, x) => a + x[1], 0), alerta: r.alerta_saldo, est: r.saldo_est, raw: r };
    }
    const lista = Object.values(R).sort((a, b) => (a.rb === '00') - (b.rb === '00') || b.gasto - a.gasto);
    const caja = lista.filter(r => !r.ro);
    const T = { saldo0: caja.reduce((a, r) => a + r.saldo0, 0), ing: caja.reduce((a, r) => a + r.ing, 0), gasto: lista.reduce((a, r) => a + r.gasto, 0), gastoCaja: caja.reduce((a, r) => a + r.gasto, 0),
                fin: caja.reduce((a, r) => a + r.fin, 0), brecha: caja.reduce((a, r) => a + r.brecha, 0), exigible: lista.reduce((a, r) => a + r.exigible, 0), repartido: lista.reduce((a, r) => a + r.repartido, 0),
                porContratar: lista.reduce((a, r) => a + r.porContratar, 0), vencidos: lista.reduce((a, r) => a + r.vencidos, 0) };
    T.recurrente = Math.max(0, T.gasto - T.exigible - T.repartido);
    const porMes = meses.map(m => { const f = caja.map(r => r.meses.find(x => x.m === m)); return { m, ing: f.reduce((a, x) => a + x.ing, 0), gasto: f.reduce((a, x) => a + x.gasto, 0) + lista.filter(r => r.ro).reduce((a, r) => a + (r.meses.find(x => x.m === m) || {}).gasto, 0), fin: f.reduce((a, x) => a + x.fin, 0), brecha: f.reduce((a, x) => a + x.brecha, 0) }; });
    const conBrecha = caja.filter(r => r.brecha > 1).sort((a, b) => b.brecha - a.brecha);
    const estado = T.brecha > 1 ? (T.brecha > 0.1 * Math.max(1, T.gastoCaja) ? 'rojo' : 'ambar') : 'verde';
    const veredicto = estado === 'verde' ? `Con el saldo estimado y los ingresos previstos, la entidad cubre sus obligaciones de ${MESES[d.desde - 1].toLowerCase()} a diciembre y cerraría con S/ ${M(T.fin)} de caja (incluye recursos de destino específico: canon, donaciones y crédito).`
      : `Hay obligaciones por S/ ${M(T.brecha)} sin cobertura de caja (${conBrecha.map(r => r.nombre).slice(0, 3).join(', ')}): corresponde reprogramar, priorizar o gestionar financiamiento antes de comprometer más.`;
    return { meses, R, lista, caja, T, porMes, conBrecha, estado, veredicto, periodo: `${MESES[d.desde - 1]}–Diciembre ${d.anio}` };
  }

  function acciones(d, mo) {
    const a = [];
    if (mo.T.exigible > 1) a.push(`Programar en el primer mes el pago de la deuda ya devengada y no girada (S/ ${M(mo.T.exigible)}): Ley 32069, art. 67, 10 días hábiles desde la conformidad.`);
    mo.conBrecha.slice(0, 3).forEach(r => a.push(`${r.nombre}: brecha de S/ ${M(r.brecha)}; revisar con Presupuesto y Tesorería qué compromisos se reprograman o qué saldo real tiene la cuenta.`));
    if (mo.T.vencidos > 1) a.push(`Contratos SEACE con plazo vencido por S/ ${M(mo.T.vencidos)}: Logística confirma liquidación, ampliación o controversia antes de reservar caja.`);
    if (mo.T.porContratar > 1) a.push(`Certificaciones sin compromiso por S/ ${M(mo.T.porContratar)}: decidir qué se contrata este año y anular el resto en el cierre.`);
    a.push('Tesorería confirma el saldo inicial de cada rubro con la consulta de saldos y el extracto bancario; el estimado usa solo datos públicos.');
    a.push('Completar la sección VIII (deuda social no registrada, sentencias no comprometidas, caja chica) con RRHH, Procuraduría y Tesorería.');
    return a;
  }

  // ---------- Excel ----------
  async function excel(d, idx, nombreUE) {
    await lib(EXCELJS, () => window.ExcelJS);
    const mo = modelo(d), gen = ahora(), nom = titulo(nombreUE || d.nombre);
    const wb = new ExcelJS.Workbook(); wb.creator = 'ACIERTA · ARKA PROYECTOS'; wb.created = new Date();
    const F = (c, bold, color, size) => ({ name: 'Calibri', size: size || 10, bold: !!bold, color: { argb: 'FF' + (color || '1F2A37') } });
    const fill = c => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + c } });
    const NUM = '#,##0;[Red](#,##0);"–"', borde = { style: 'thin', color: { argb: 'FFD6DEE8' } }, B4 = { top: borde, bottom: borde, left: borde, right: borde };
    const cab = (ws, fila, textos, color) => { textos.forEach((t, i) => { const c = ws.getCell(fila, i + 1); c.value = t; c.font = F(0, 1, 'FFFFFF'); c.fill = fill(color || NAVY); c.alignment = { vertical: 'middle', horizontal: i ? 'center' : 'left', wrapText: true }; c.border = B4; }); ws.getRow(fila).height = 22; };
    const portada = (ws, sub, ancho) => {
      ws.mergeCells(1, 1, 1, ancho); ws.getCell(1, 1).value = 'ACIERTA  ·  Flujo de caja proyectado'; ws.getCell(1, 1).font = F(0, 1, NAVY, 16); ws.getRow(1).height = 30;
      ws.mergeCells(2, 1, 2, ancho); ws.getCell(2, 1).value = `${nom}  (UE ${d.ue})`; ws.getCell(2, 1).font = F(0, 1, AZUL, 12);
      ws.mergeCells(3, 1, 3, ancho); ws.getCell(3, 1).value = sub; ws.getCell(3, 1).font = F(0, 0, GRIS, 10);
      ws.mergeCells(4, 1, 4, ancho); ws.getCell(4, 1).value = `Generado el ${gen.txt} · ${d.corte_txt} · periodo ${mo.periodo}`; ws.getCell(4, 1).font = F(0, 0, GRIS, 9);
    };
    // 1. RESUMEN GERENCIAL
    const ws = wb.addWorksheet('RESUMEN GERENCIAL', { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 46 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 16 }, { width: 14 }];
    portada(ws, 'Qué es: cuánto dinero tendrá la entidad cada mes hasta diciembre, qué obligaciones debe pagar y si alcanza. Datos abiertos del MEF; el saldo inicial es estimado.', 7);
    let r = 6;
    const sem = { verde: ['VERDE · la caja cubre las obligaciones', VERDE], ambar: ['ÁMBAR · brecha moderada, requiere reprogramar', ORO], rojo: ['ROJO · brecha importante, requiere decisión', ROJO] }[mo.estado];
    ws.mergeCells(r, 1, r, 7); ws.getCell(r, 1).value = sem[0]; ws.getCell(r, 1).font = F(0, 1, 'FFFFFF', 12); ws.getCell(r, 1).fill = fill(sem[1]); ws.getCell(r, 1).alignment = { vertical: 'middle' }; ws.getRow(r).height = 26; r++;
    ws.mergeCells(r, 1, r, 7); ws.getCell(r, 1).value = mo.veredicto; ws.getCell(r, 1).alignment = { wrapText: true, vertical: 'top' }; ws.getRow(r).height = 34; r += 2;
    const kpis = [['Saldo inicial estimado (caja propia, sin RO)', mo.T.saldo0], ['Ingresos proyectados del periodo', mo.T.ing], ['Obligaciones proyectadas del periodo (todas las fuentes)', mo.T.gasto],
      ['   · deuda ya devengada y no girada (se paga primero)', mo.T.exigible], ['   · compromisos sin devengar (contratos y órdenes)', mo.T.repartido], ['   · planillas, servicios y gastos recurrentes', mo.T.recurrente],
      ['Saldo proyectado al cierre de diciembre', mo.T.fin], ['Brecha: obligaciones sin cobertura de caja', mo.T.brecha], ['Contratos SEACE con plazo vencido (saldo por confirmar)', mo.T.vencidos], ['Certificado sin compromiso ("por contratar", no suma)', mo.T.porContratar]];
    cab(ws, r, ['Indicador', 'Soles'], AZUL); r++;
    kpis.forEach(([k, v]) => { ws.getCell(r, 1).value = k; ws.getCell(r, 2).value = Math.round(v); ws.getCell(r, 2).numFmt = NUM; ws.getCell(r, 1).border = B4; ws.getCell(r, 2).border = B4; if (!k.startsWith('   ')) ws.getCell(r, 1).font = F(0, 1); if (k.startsWith('Brecha')) { ws.getCell(r, 2).font = F(0, 1, mo.T.brecha > 1 ? ROJO : VERDE); } r++; });
    r++; cab(ws, r, ['Fuente de financiamiento', 'Saldo inicial', 'Ingresos', 'Obligaciones', 'Saldo al cierre', 'Brecha', 'Estado']); r++;
    mo.lista.forEach(x => { const vals = [x.nombre + (x.ro ? ' (sin caja propia: el Tesoro autoriza el giro)' : ''), x.saldo0, x.ing, x.gasto, x.fin, x.brecha, x.ro ? 'Tesoro' : x.brecha > 1 ? 'BRECHA' : 'OK']; vals.forEach((v, i) => { const c = ws.getCell(r, i + 1); c.value = i && i < 6 ? Math.round(v) : v; if (i && i < 6) c.numFmt = NUM; c.border = B4; if (i === 6) { c.alignment = { horizontal: 'center' }; c.font = F(0, 1, v === 'BRECHA' ? ROJO : v === 'OK' ? VERDE : GRIS); } }); r++; });
    r++; cab(ws, r, ['Mes', 'Ingresos', 'Obligaciones', 'Saldo al cierre', 'Brecha']); r++;
    mo.porMes.forEach(x => { [MESES[x.m - 1] + ' ' + d.anio, x.ing, x.gasto, x.fin, x.brecha].forEach((v, i) => { const c = ws.getCell(r, i + 1); c.value = i ? Math.round(v) : v; if (i) c.numFmt = NUM; c.border = B4; if (i === 4 && v > 1) c.font = F(0, 1, ROJO); }); r++; });
    r++; ws.mergeCells(r, 1, r, 7); ws.getCell(r, 1).value = 'QUÉ HACER ESTA SEMANA'; ws.getCell(r, 1).font = F(0, 1, NAVY, 11); r++;
    acciones(d, mo).forEach((t, i) => { ws.mergeCells(r, 1, r, 7); ws.getCell(r, 1).value = `${i + 1}. ${t}`; ws.getCell(r, 1).alignment = { wrapText: true, vertical: 'top' }; ws.getRow(r).height = 30; r++; });
    r++; ws.mergeCells(r, 1, r, 7); ws.getCell(r, 1).value = 'Herramienta de análisis y proyección referencial elaborada con ACIERTA (ARKA PROYECTOS) a partir de datos abiertos del MEF. No sustituye la programación oficial de Tesorería ni constituye pronunciamiento sobre la gestión de la entidad.'; ws.getCell(r, 1).font = F(0, 0, GRIS, 9); ws.getCell(r, 1).alignment = { wrapText: true }; ws.getRow(r).height = 28;
    ws.views = [{ showGridLines: false, state: 'frozen', ySplit: 5 }];
    // 2. CÓMO USAR
    const wu = wb.addWorksheet('CÓMO USAR', { views: [{ showGridLines: false }] }); wu.columns = [{ width: 28 }, { width: 110 }];
    portada(wu, 'Guía de lectura del flujo de caja proyectado.', 2);
    let u = 6;
    const guia = [['1. Empieza por RESUMEN GERENCIAL', 'El semáforo y el veredicto dicen si la caja alcanza. La tabla por fuente muestra dónde está la tensión; la tabla por mes, cuándo.'],
      ['2. Entra a la hoja del rubro con brecha', 'Cada hoja FLUJO <rubro> es el formato de Tesorería: saldo inicial, ingresos del mes, obligaciones por sección (I a VII) y saldo final. Las celdas son editables: reemplaza la proyección por el cronograma real y el total se recalcula.'],
      ['3. Confirma el saldo inicial', 'Es ESTIMADO con datos públicos (saldo de balance incorporado + recaudado del año − girado del año). Tesorería lo sustituye por el saldo real de la cuenta en la celda del saldo inicial.'],
      ['4. Revisa las referencias bajo el total', '"Por contratar" (certificado sin compromiso) no suma al flujo: es un techo. Los contratos SEACE con plazo vencido tampoco: Logística confirma su estado.'],
      ['5. Completa la sección VIII', 'Deuda social no registrada, sentencias no comprometidas, fraccionamientos fuera del SIAF y caja chica no existen en ninguna fuente pública: RRHH, Procuraduría y Tesorería los agregan.'],
      ['6. Usa el PPT para la reunión', 'El botón PPT de la misma ficha genera la presentación ejecutiva con las mismas cifras y la misma fecha de generación.'],
      ['Qué significa cada fila', 'Deuda devengada y no girada: ya se recibió el bien o servicio y falta pagar; va al primer mes. Compromisos sin devengar: contratos u órdenes firmadas, repartidas en los meses que faltan. Planillas, seguros y servicios básicos: promedio de los tres últimos meses cerrados por específica. Pagos de fecha fija: gratificaciones y aguinaldos en julio y diciembre, escolaridad en febrero o marzo, CTS en mayo y noviembre.'],
      ['Recursos Ordinarios', 'No se depositan en cuentas de la entidad: la DGTP autoriza el giro con cargo a la Cuenta Única del Tesoro. Se muestran sus obligaciones sin saldo ni brecha de caja.'],
      ['Actualización', `Las cifras se recalculan cada día con la publicación del MEF; este archivo corresponde al ${gen.txt}. Vuelve a descargarlo desde acierta.pe para un corte nuevo.`]];
    guia.forEach(([k, v]) => { wu.getCell(u, 1).value = k; wu.getCell(u, 1).font = F(0, 1, NAVY); wu.getCell(u, 1).alignment = { vertical: 'top', wrapText: true }; wu.getCell(u, 2).value = v; wu.getCell(u, 2).alignment = { wrapText: true, vertical: 'top' }; wu.getRow(u).height = Math.max(30, Math.ceil(v.length / 105) * 15); u++; });
    // 3. una hoja por rubro (formato Tesorería)
    const NM = mo.meses.length;
    mo.lista.forEach(x => {
      const raw = x.raw, h = wb.addWorksheet(('FLUJO ' + x.rb + ' ' + x.nombre).slice(0, 31).replace(/[\[\]\*\?\/\\:]/g, ' '), { views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 6 }] });
      h.columns = [{ width: 62 }].concat(mo.meses.map(() => ({ width: 15 })), [{ width: 16 }]);
      portada(h, `${x.nombre}${x.ro ? ' · Recursos Ordinarios: sin caja propia, el ingreso iguala al gasto autorizado' : ''}`, NM + 2);
      cab(h, 6, ['Concepto'].concat(mo.meses.map(m => ABR[m - 1] + ' ' + d.anio), ['Total']));
      let f = 7; const put = (txt, vals, est) => { h.getCell(f, 1).value = txt; h.getCell(f, 1).border = B4; let tot = 0; vals.forEach((v, i) => { const c = h.getCell(f, i + 2); c.value = Math.round(v || 0); c.numFmt = NUM; c.border = B4; tot += v || 0; }); const ct = h.getCell(f, NM + 2); ct.value = Math.round(tot); ct.numFmt = NUM; ct.border = B4; if (est) { for (let i = 1; i <= NM + 2; i++) { h.getCell(f, i).font = F(0, 1, est.color || NAVY); h.getCell(f, i).fill = fill(est.fill || CLARO); } } f++; };
      put('1. SALDO INICIAL DE CAJA' + (x.ro ? '' : ' (estimado; Tesorería confirma)'), x.meses.map(m => m.ini), { fill: 'D6E4F6' });
      put('2. INGRESOS PROYECTADOS DEL MES' + (x.ro ? ' (= gasto autorizado)' : ''), x.meses.map(m => m.ing), { fill: 'E3F1E9', color: VERDE });
      if (raw.ing && raw.ing.mensual && Object.keys(raw.ing.mensual).length) { h.getCell(f, 1).value = `   recaudado real del año: S/ ${S(raw.ing.recaudado)} · PIM de ingresos S/ ${S(raw.ing.pim)} · último mes con dato: ${MESES[Math.max(...Object.keys(raw.ing.mensual).map(Number)) - 1]}`; h.getCell(f, 1).font = F(0, 0, GRIS, 9); f++; }
      h.getCell(f, 1).value = '3. OBLIGACIONES POR PAGAR'; h.getCell(f, 1).font = F(0, 1, NAVY); f++;
      (raw.sec || []).forEach(s => { const sub = mo.meses.map(m => s.c.reduce((a, c) => a + (c.m[m] || 0), 0)); put(s.t, sub, { fill: FONDO, color: NAVY }); s.c.forEach(c => put('      ' + c.n, mo.meses.map(m => c.m[m] || 0))); });
      put('TOTAL OBLIGACIONES DEL MES', x.meses.map(m => m.gasto), { fill: 'FFF1D6', color: '7A4F08' });
      if (!x.ro) { put('4. SALDO FINAL DE CAJA (1 + 2 − 3)', x.meses.map(m => m.fin), { fill: 'D6E4F6' }); put('5. BRECHA: obligaciones sin cobertura (se postergan o financian)', x.meses.map(m => m.brecha), { fill: 'F9E0E0', color: ROJO }); }
      f++;
      if ((raw.por_contratar || []).length) { h.getCell(f, 1).value = 'Referencia (no suma): certificado sin compromiso, "por contratar"'; h.getCell(f, 1).font = F(0, 1, GRIS); f++; raw.por_contratar.forEach(([t, v]) => { h.getCell(f, 1).value = '      ' + t; h.getCell(f, 2).value = v; h.getCell(f, 2).numFmt = NUM; h.getCell(f, 1).font = F(0, 0, GRIS, 9); f++; }); f++; }
      if ((raw.vencidos || []).length) { h.getCell(f, 1).value = 'Referencia (no suma): contratos SEACE con plazo vencido, Logística confirma'; h.getCell(f, 1).font = F(0, 1, GRIS); f++; raw.vencidos.forEach(([t, v]) => { h.getCell(f, 1).value = '      ' + t; h.getCell(f, 2).value = v; h.getCell(f, 2).numFmt = NUM; h.getCell(f, 1).font = F(0, 0, GRIS, 9); f++; }); f++; }
      if (x.alerta) { h.mergeCells(f, 1, f, NM + 2); h.getCell(f, 1).value = 'Aviso: ' + x.alerta; h.getCell(f, 1).font = F(0, 0, ROJO, 9); h.getCell(f, 1).alignment = { wrapText: true }; h.getRow(f).height = 28; f++; }
      if (x.est) { h.mergeCells(f, 1, f, NM + 2); h.getCell(f, 1).value = `Saldo inicial estimado: saldo de balance S/ ${S(x.est.saldo_balance)} + recaudado S/ ${S(x.est.recaudado)} − girado S/ ${S(x.est.girado)} = S/ ${S(x.est.valor)} (${x.est.corte}).`; h.getCell(f, 1).font = F(0, 0, GRIS, 9); f++; }
      f++; h.getCell(f, 1).value = 'VIII. A COMPLETAR POR LA ENTIDAD (no existe en fuentes públicas): deuda social no registrada · sentencias no comprometidas · fraccionamientos fuera del SIAF · caja chica'; h.getCell(f, 1).font = F(0, 1, GRIS, 9);
    });
    // 4. CONTRATOS SEACE
    if ((d.seace || []).length) {
      const c = wb.addWorksheet('CONTRATOS SEACE', { views: [{ showGridLines: false, state: 'frozen', ySplit: 6 }] }); c.columns = [{ width: 12 }, { width: 56 }, { width: 40 }, { width: 16 }, { width: 12 }, { width: 16 }, { width: 16 }, { width: 14 }];
      portada(c, 'Contratos de las inversiones de la entidad (portal OCDS del OECE): saldo = monto del contrato − devengado del CUI. Vencidos: plazo terminado antes del último mes con datos.', 8);
      cab(c, 6, ['CUI', 'Inversión', 'Proveedor', 'Contrato', 'Fin', 'Monto', 'Saldo', 'Estado']);
      let f = 7; d.seace.forEach(o => { [o.cui, o.inv, o.prov, o.num, fDMY(o.fin), o.monto, o.saldo, o.vencido ? 'PLAZO VENCIDO' : 'vigente'].forEach((v, i) => { const cl = c.getCell(f, i + 1); cl.value = v; cl.border = B4; if (i === 5 || i === 6) cl.numFmt = NUM; if (i === 7 && o.vencido) cl.font = F(0, 1, ROJO); }); f++; });
    }
    // 5. TRANSFERENCIAS
    const tk = Object.keys(d.transferencias || {});
    if (tk.length) {
      const t = wb.addWorksheet('TRANSFERENCIAS', { views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 6 }] }); t.columns = [{ width: 44 }].concat(ABR.map(() => ({ width: 13 })), [{ width: 15 }]);
      portada(t, 'Lo que el MEF acreditó a la entidad cada mes, por recurso (datos abiertos · Transferencias).', 14);
      cab(t, 6, ['Recurso'].concat(ABR, ['Total'])); let f = 7;
      tk.forEach(k => { const v = d.transferencias[k]; t.getCell(f, 1).value = k; t.getCell(f, 1).border = B4; v.forEach((x, i) => { const c = t.getCell(f, i + 2); c.value = x; c.numFmt = NUM; c.border = B4; }); const ct = t.getCell(f, 14); ct.value = v.reduce((a, b) => a + b, 0); ct.numFmt = NUM; ct.border = B4; f++; });
    }
    // 6. DE DÓNDE SALE + NOTAS
    const n = wb.addWorksheet('DE DÓNDE SALE Y NOTAS', { views: [{ showGridLines: false }] }); n.columns = [{ width: 40 }, { width: 70 }, { width: 60 }];
    portada(n, 'Origen de cada cifra, método de proyección y avisos de esta entidad.', 3);
    let f = 6; cab(n, f, ['Fila', 'Fuente', 'Nota']); f++;
    (idx.fuentes || []).forEach(x => { x.forEach((v, i) => { const c = n.getCell(f, i + 1); c.value = v; c.alignment = { wrapText: true, vertical: 'top' }; c.border = B4; }); n.getRow(f).height = Math.max(30, Math.ceil(String(x[1] || '').length / 68) * 14); f++; });
    f++; n.getCell(f, 1).value = 'AVISOS DE ESTA ENTIDAD'; n.getCell(f, 1).font = F(0, 1, NAVY, 11); f++;
    (d.avisos || []).forEach(a => { n.mergeCells(f, 1, f, 3); n.getCell(f, 1).value = '• ' + a; n.getCell(f, 1).alignment = { wrapText: true }; n.getRow(f).height = Math.max(16, Math.ceil(a.length / 150) * 14); f++; });
    f++; (idx.notas || []).forEach(x => { if (typeof x === 'string') { n.getCell(f, 1).value = x; n.getCell(f, 1).font = F(0, 1, NAVY, 11); } else { n.getCell(f, 1).value = x[0]; n.getCell(f, 1).font = F(0, 1); n.getCell(f, 1).alignment = { vertical: 'top', wrapText: true }; n.mergeCells(f, 2, f, 3); n.getCell(f, 2).value = x[1]; n.getCell(f, 2).alignment = { wrapText: true, vertical: 'top' }; n.getRow(f).height = Math.max(16, Math.ceil(String(x[1]).length / 125) * 14); } f++; });
    wb.eachSheet(h => { h.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } }; h.headerFooter = { oddFooter: `&L&8ACIERTA · Flujo de caja proyectado · ${nom}&R&8Generado el ${gen.txt} · página &P de &N` }; });
    const buf = await wb.xlsx.writeBuffer();
    bajar(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Acierta_FlujoCaja_${d.ue}_${gen.tag}.xlsx`);
  }

  // ---------- PPT ----------
  // Diseño: "sándwich" oscuro (portada y cierre en azul marino, contenido en blanco), cifras grandes como protagonistas, íconos en
  // círculos, gráfico combinado nativo y barras de cobertura dibujadas con formas. Sin barras de cabecera ni líneas decorativas.
  async function ppt(d, idx, nombreUE) {
    await lib(PPTX, () => window.PptxGenJS);
    const mo = modelo(d), gen = ahora(), nom = titulo(nombreUE || d.nombre);
    const P = new PptxGenJS(); P.layout = 'LAYOUT_WIDE'; P.author = 'ACIERTA · ARKA PROYECTOS'; P.title = `Flujo de caja proyectado · ${nom}`;
    const W = 13.33, H = 7.5, FH = 'Cambria', FB = 'Calibri', TINTA = '1F2A37', HIELO = 'EEF3F9', BORDE = 'DCE4EE', MUT = '6B7A8B';
    const sombra = () => ({ type: 'outer', blur: 6, offset: 2, angle: 90, color: '0F2A43', opacity: 0.12 });
    const semC = { verde: VERDE, ambar: ORO, rojo: ROJO }[mo.estado], semT = { verde: 'Caja cubierta', ambar: 'Brecha moderada', rojo: 'Brecha importante' }[mo.estado];
    let nSlide = 0;
    const marco = (s, tit, sub) => {   // lámina clara: título arriba a la izquierda, marca pequeña a la derecha, pie discreto. Sin barras.
      nSlide++; s.background = { color: 'FFFFFF' };
      s.addText(tit, { x: 0.6, y: 0.38, w: 10.2, h: 0.7, fontFace: FH, fontSize: 36, bold: true, color: NAVY, margin: 0, isTextBox: true });
      if (sub) s.addText(sub, { x: 0.6, y: 1.1, w: 10.2, h: 0.42, fontFace: FB, fontSize: 16, color: MUT, margin: 0, isTextBox: true });
      s.addText('ACIERTA', { x: W - 2.6, y: 0.45, w: 2.0, h: 0.4, fontFace: FB, fontSize: 14, bold: true, color: NAVY, align: 'right', charSpacing: 6, margin: 0, isTextBox: true });
      s.addText(`${nom}  ·  generado el ${gen.txt}  ·  ${d.corte_txt}`, { x: 0.6, y: H - 0.5, w: W - 2.2, h: 0.3, fontFace: FB, fontSize: 11, color: MUT, margin: 0, isTextBox: true });
      s.addText(String(nSlide), { x: W - 1.2, y: H - 0.5, w: 0.6, h: 0.3, fontFace: FB, fontSize: 11, color: MUT, align: 'right', margin: 0, isTextBox: true });
    };
    // íconos de trazo (SVG en línea, 24x24) que van dentro de los círculos de color; PowerPoint 2016+ y LibreOffice los dibujan como vector
    const ICO = { coins: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
      up: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>', down: '<path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/>', check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
      alert: '<path d="M12 3L2.5 20h19L12 3z"/><path d="M12 10v4"/><path d="M12 17.5v.5"/>', doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h6M9.5 17h6"/>',
      calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', bank: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',
      people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M15.5 14.5c2.8 0 5.5 2 5.5 5.5"/>',
      link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>', clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>' };
    // los SVG se rasterizan a PNG en el navegador (canvas): PptxGenJS en el navegador no logra la vista previa PNG de un SVG y aborta la descarga
    const svgData = t => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(t)));
    const png = (svg, w, h) => new Promise((ok, no) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h); ok(c.toDataURL('image/png').replace(/^data:/, '')); }; im.onerror = () => no(new Error('svg')); im.src = svgData(svg); });
    const svgIco = n => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICO[n]}</svg>`;
    const svgFondo = (c1, c2) => `<svg xmlns="http://www.w3.org/2000/svg" width="1333" height="750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${c1}"/><stop offset="1" stop-color="#${c2}"/></linearGradient><radialGradient id="r" cx="0.82" cy="0.25" r="0.5"><stop offset="0" stop-color="#C9A227" stop-opacity="0.22"/><stop offset="1" stop-color="#C9A227" stop-opacity="0"/></radialGradient></defs><rect width="1333" height="750" fill="url(#g)"/><rect width="1333" height="750" fill="url(#r)"/></svg>`;
    const IMG = {};
    await Promise.all([...Object.keys(ICO).map(async n => { IMG[n] = await png(svgIco(n), 256, 256); }), (async () => { IMG.f1 = await png(svgFondo('0F2A43', '163A5C'), 1333, 750); IMG.f2 = await png(svgFondo('163A5C', '0F2A43'), 1333, 750); })()]);
    const icono = n => IMG[n];
    const fondo = (s, f) => s.addImage({ data: IMG[f], x: 0, y: 0, w: W, h: H });
    const circulo = (s, x, y, dia, color, glifo, gc) => { if (ICO[glifo]) { s.addShape(P.ShapeType.ellipse, { x, y, w: dia, h: dia, fill: { color }, line: { color, width: 0 } }); s.addImage({ data: icono(glifo), x: x + dia * 0.24, y: y + dia * 0.24, w: dia * 0.52, h: dia * 0.52 }); return; } s.addShape(P.ShapeType.ellipse, { x, y, w: dia, h: dia, fill: { color }, line: { color, width: 0 } }); if (glifo) s.addText(glifo, { x, y, w: dia, h: dia, fontFace: FB, fontSize: Math.round(dia * 22), bold: true, color: gc || 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true }); };
    const tarjeta = (s, x, y, w, h, fill) => s.addShape(P.ShapeType.roundRect, { x, y, w, h, fill: { color: fill || 'FFFFFF' }, line: { color: BORDE, width: 0.75 }, rectRadius: 0.12, shadow: sombra() });
    const dinero = v => 'S/ ' + M(v);

    // 1 · PORTADA (oscura): el dato que importa ya está en la primera lámina
    let s = P.addSlide(); nSlide++; s.background = { color: NAVY }; fondo(s, 'f1');
    s.addText('ACIERTA', { x: 0.8, y: 0.6, w: 4, h: 0.5, fontFace: FB, fontSize: 18, bold: true, color: 'FFFFFF', charSpacing: 10, margin: 0, isTextBox: true });
    s.addText('Flujo de caja proyectado', { x: 0.8, y: 1.9, w: 7.8, h: 1.3, fontFace: FH, fontSize: 48, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
    s.addText(nom, { x: 0.8, y: 3.25, w: 7.8, h: 1.0, fontFace: FB, fontSize: 26, color: 'E9C46A', fit: 'shrink', margin: 0, isTextBox: true });
    s.addText(`Unidad ejecutora ${d.ue}  ·  ${mo.periodo}`, { x: 0.8, y: 4.3, w: 7.8, h: 0.45, fontFace: FB, fontSize: 16, color: 'C9D6E5', margin: 0, isTextBox: true });
    s.addText([{ text: 'Generado el ' + gen.txt, options: { bold: true, breakLine: true } }, { text: d.corte_txt, options: {} }], { x: 0.8, y: 5.45, w: 7.8, h: 0.9, fontFace: FB, fontSize: 14, color: 'C9D6E5', margin: 0, isTextBox: true });
    s.addShape(P.ShapeType.roundRect, { x: 8.9, y: 1.9, w: 3.85, h: 3.5, fill: { color: '163A5C' }, line: { color: '2A5280', width: 0.75 }, rectRadius: 0.16 });
    s.addText('Saldo proyectado al cierre', { x: 9.15, y: 2.08, w: 3.4, h: 0.4, fontFace: FB, fontSize: 14, color: 'C9D6E5', margin: 0, isTextBox: true });
    s.addText(dinero(mo.T.fin), { x: 9.15, y: 2.5, w: 3.4, h: 1.1, fontFace: FH, fontSize: 44, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true, fit: 'shrink' });
    s.addText('diciembre ' + d.anio + ' · caja propia', { x: 9.15, y: 3.55, w: 3.4, h: 0.35, fontFace: FB, fontSize: 13, color: 'C9D6E5', margin: 0, isTextBox: true });
    s.addShape(P.ShapeType.roundRect, { x: 9.15, y: 4.25, w: 3.4, h: 0.75, fill: { color: semC }, line: { color: semC, width: 0 }, rectRadius: 0.38 });
    s.addText(semT.toUpperCase(), { x: 9.15, y: 4.25, w: 3.4, h: 0.75, fontFace: FB, fontSize: 15, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', charSpacing: 2, margin: 0, isTextBox: true });
    s.addText('Herramienta de análisis referencial con datos abiertos del MEF y el portal OCDS del OECE. No sustituye la programación oficial de Tesorería.', { x: 0.8, y: 6.6, w: 11.8, h: 0.6, fontFace: FB, fontSize: 12, color: '8FA3B8', margin: 0, isTextBox: true });

    // 2 · LA RESPUESTA EN UNA PÁGINA: cifra grande + veredicto a la izquierda; seis tarjetas con ícono a la derecha
    s = P.addSlide(); marco(s, 'La respuesta en una página', 'Lo que un gerente necesita saber antes de la reunión');
    const grande = mo.T.brecha > 1 ? ['Brecha de caja', mo.T.brecha, ROJO, 'obligaciones sin cobertura en el periodo'] : ['Saldo al cierre', mo.T.fin, VERDE, 'caja propia proyectada a diciembre'];
    tarjeta(s, 0.6, 1.65, 4.6, 5.0, HIELO);
    circulo(s, 0.95, 1.95, 0.6, grande[2], mo.T.brecha > 1 ? 'alert' : 'check');
    s.addText(grande[0], { x: 1.65, y: 1.98, w: 3.4, h: 0.5, fontFace: FB, fontSize: 16, color: MUT, margin: 0, isTextBox: true, valign: 'middle' });
    s.addText(dinero(grande[1]), { x: 0.95, y: 2.65, w: 4.0, h: 1.3, fontFace: FH, fontSize: 64, bold: true, color: grande[2], margin: 0, isTextBox: true, fit: 'shrink' });
    s.addText(grande[3], { x: 0.95, y: 3.9, w: 3.9, h: 0.4, fontFace: FB, fontSize: 13, color: MUT, margin: 0, isTextBox: true });
    s.addText(mo.veredicto, { x: 0.95, y: 4.4, w: 3.9, h: 2.1, fontFace: FB, fontSize: 15, color: TINTA, margin: 0, isTextBox: true, valign: 'top', fit: 'shrink' });
    const K = [['Saldo inicial estimado', mo.T.saldo0, 'bank', AZUL, 'caja propia, sin RO'], ['Ingresos proyectados', mo.T.ing, 'up', VERDE, mo.periodo], ['Obligaciones proyectadas', mo.T.gasto, 'down', ORO, 'todas las fuentes'],
      ['Deuda devengada no girada', mo.T.exigible, 'clock', NAVY, 'se paga primero'], ['Compromisos sin devengar', mo.T.repartido, 'link', NAVY, 'contratos y órdenes'], ['Gastos recurrentes', mo.T.recurrente, 'people', NAVY, 'planillas, servicios']];
    K.forEach(([t, v, g, c, sub], i) => { const x = 5.55 + (i % 3) * 2.45, y = 1.65 + Math.floor(i / 3) * 2.55; tarjeta(s, x, y, 2.3, 2.4); circulo(s, x + 0.2, y + 0.2, 0.5, c, g);
      s.addText(t, { x: x + 0.2, y: y + 0.82, w: 2.0, h: 0.5, fontFace: FB, fontSize: 14, color: MUT, margin: 0, isTextBox: true, valign: 'top' });
      s.addText(dinero(v), { x: x + 0.2, y: y + 1.3, w: 2.0, h: 0.6, fontFace: FH, fontSize: 26, bold: true, color: TINTA, margin: 0, isTextBox: true, fit: 'shrink' });
      s.addText(sub, { x: x + 0.2, y: y + 1.92, w: 2.0, h: 0.35, fontFace: FB, fontSize: 12.5, color: MUT, margin: 0, isTextBox: true }); });

    // 3 · MES A MES: gráfico combinado (columnas ingresos/obligaciones + línea de saldo) y tres datos al costado
    s = P.addSlide(); marco(s, 'Cómo se mueve la caja mes a mes', 'Caja propia, sin Recursos Ordinarios · soles');
    const lab = mo.porMes.map(x => MESES[x.m - 1]);
    const ejes = { catAxisLabelColor: MUT, valAxisLabelColor: MUT, catAxisLabelFontFace: FB, valAxisLabelFontFace: FB, catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, valGridLine: { color: 'E6ECF3', size: 0.5 }, catGridLine: { style: 'none' }, valAxisLabelFormatCode: '#,##0', dataLabelFontFace: FB, dataLabelFontSize: 11, dataLabelColor: TINTA, dataLabelFormatCode: '#,##0' };
    s.addChart([{ type: P.ChartType.bar, data: [{ name: 'Ingresos', labels: lab, values: mo.porMes.map(x => Math.round(x.ing)) }, { name: 'Obligaciones', labels: lab, values: mo.porMes.map(x => Math.round(x.gasto)) }], options: { barGrouping: 'clustered', chartColors: [VERDE, ORO], showValue: true, dataLabelPosition: 'outEnd' } },
      { type: P.ChartType.line, data: [{ name: 'Saldo al cierre del mes', labels: lab, values: mo.porMes.map(x => Math.round(x.fin)) }], options: { chartColors: [AZUL], lineSize: 3, lineDataSymbol: 'circle', lineDataSymbolSize: 9, showValue: true, dataLabelPosition: 't' } }],
      { x: 0.6, y: 1.55, w: 8.4, h: 5.2, barDir: 'col', showLegend: true, legendPos: 'b', legendFontFace: FB, legendFontSize: 12, legendColor: MUT, ...ejes });
    const peor = mo.porMes.reduce((a, b) => (b.gasto > a.gasto ? b : a)), minSaldo = mo.porMes.reduce((a, b) => (b.fin < a.fin ? b : a));
    const lado = [['Mes más exigente', MESES[peor.m - 1], dinero(peor.gasto) + ' en obligaciones', ORO, 'calendar'], ['Saldo mínimo del periodo', dinero(minSaldo.fin), 'al cierre de ' + MESES[minSaldo.m - 1].toLowerCase(), minSaldo.fin < 0 ? ROJO : AZUL, 'coins'], ['Ingreso mensual previsto', dinero(mo.T.ing / Math.max(1, mo.meses.length)), 'promedio del periodo', VERDE, 'up']];
    lado.forEach(([t, v, sub, c, g], i) => { const y = 1.55 + i * 1.75; tarjeta(s, 9.35, y, 3.4, 1.55); circulo(s, 9.55, y + 0.22, 0.45, c, g);
      s.addText(t, { x: 10.15, y: y + 0.18, w: 2.6, h: 0.5, fontFace: FB, fontSize: 14, color: MUT, margin: 0, isTextBox: true, valign: 'middle' });
      s.addText(v, { x: 9.55, y: y + 0.7, w: 3.05, h: 0.5, fontFace: FH, fontSize: 22, bold: true, color: TINTA, margin: 0, isTextBox: true, fit: 'shrink' });
      s.addText(sub, { x: 9.55, y: y + 1.17, w: 3.05, h: 0.3, fontFace: FB, fontSize: 12.5, color: MUT, margin: 0, isTextBox: true }); });

    // 4 · POR FUENTE: barras de cobertura dibujadas con pista, extremos redondeados y el monto al final de cada barra
    s = P.addSlide(); marco(s, 'Qué fuente sostiene el gasto', 'Obligaciones del periodo frente a lo disponible (saldo inicial + ingresos) · caja propia');
    const fuentes = mo.lista.filter(x => !x.ro).slice(0, 5), maxV = Math.max(1, ...fuentes.map(x => Math.max(x.gasto, x.saldo0 + x.ing)));
    const bx = 4.1, bw = 5.4, fila = Math.min(1.0, 4.9 / Math.max(1, fuentes.length)), bh = 0.3;
    const barra = (y, v, c, etiqueta) => { const w = Math.max(0.08, bw * v / maxV);
      s.addShape(P.ShapeType.roundRect, { x: bx, y, w: bw, h: bh, fill: { color: 'F1F4F8' }, line: { color: 'F1F4F8', width: 0 }, rectRadius: bh / 2 });
      s.addShape(P.ShapeType.roundRect, { x: bx, y, w, h: bh, fill: { color: c }, line: { color: c, width: 0 }, rectRadius: bh / 2 });
      s.addText(etiqueta, { x: bx + bw + 0.12, y: y - 0.02, w: 1.9, h: bh + 0.04, fontFace: FB, fontSize: 12, bold: true, color: c, margin: 0, isTextBox: true, valign: 'middle' }); };
    fuentes.forEach((x, i) => { const y = 1.6 + i * fila, disp = x.saldo0 + x.ing, ok = x.brecha <= 1, cg = ok ? ORO : ROJO;
      s.addText(titulo(x.nombre).replace(/canon y sobrecanon.*participaciones/i, 'Canon, regalías y participaciones'), { x: 0.6, y, w: 3.3, h: fila - 0.15, fontFace: FB, fontSize: 15, bold: true, color: TINTA, margin: 0, isTextBox: true, valign: 'middle', fit: 'shrink' });
      barra(y + 0.1, disp, VERDE, 'Disponible  ' + dinero(disp)); barra(y + 0.5, x.gasto, cg, 'Obligaciones  ' + dinero(x.gasto));
      s.addShape(P.ShapeType.roundRect, { x: 11.55, y: y + 0.22, w: 1.2, h: 0.46, fill: { color: ok ? 'E3F1E9' : 'F9E0E0' }, line: { color: ok ? 'E3F1E9' : 'F9E0E0', width: 0 }, rectRadius: 0.23 });
      s.addText(ok ? 'CUBIERTA' : 'BRECHA', { x: 11.55, y: y + 0.22, w: 1.2, h: 0.46, fontFace: FB, fontSize: 11, bold: true, color: ok ? VERDE : ROJO, align: 'center', valign: 'middle', margin: 0, isTextBox: true }); });
    const ro = mo.lista.find(x => x.ro);
    s.addText((ro ? `Recursos Ordinarios: ${dinero(ro.gasto)} de obligaciones sin caja propia (la DGTP autoriza el giro con cargo a la Cuenta Única del Tesoro). ` : '') + 'El saldo inicial es estimado con datos públicos; Tesorería lo confirma.', { x: 0.6, y: 6.5, w: W - 1.2, h: 0.45, fontFace: FB, fontSize: 12, color: MUT, margin: 0, isTextBox: true });

    // 5 · DE QUÉ ESTÁN HECHAS LAS OBLIGACIONES: dona limpia (sin cifras dentro) + tres filas con porcentaje grande
    s = P.addSlide(); marco(s, 'De qué están hechas las obligaciones', 'Las tres capas del gasto y qué margen de decisión deja cada una');
    const capas = [['Deuda ya devengada y no girada', mo.T.exigible, NAVY, 'Ya se recibió el bien o servicio: se paga en el primer mes (Ley 32069, art. 67). Sin margen.'], ['Compromisos sin devengar', mo.T.repartido, AZUL, 'Contratos y órdenes firmadas, repartidas en los meses que faltan. Se puede reprogramar el calendario.'], ['Planillas, servicios y recurrentes', mo.T.recurrente, ORO, 'Promedio de los tres últimos meses cerrados: remuneraciones, CAS, EsSalud, servicios básicos. Previsible.']];
    s.addChart(P.ChartType.doughnut, [{ name: 'Obligaciones', labels: capas.map(c => c[0]), values: capas.map(c => Math.round(c[1])) }], { x: 0.4, y: 1.45, w: 5.4, h: 5.4, chartColors: capas.map(c => c[2]), holeSize: 58, showLegend: false, showValue: false, showPercent: false, showLabel: false, showTitle: false });
    s.addText(dinero(mo.T.gasto), { x: 1.5, y: 3.6, w: 3.2, h: 0.6, fontFace: FH, fontSize: 26, bold: true, color: TINTA, align: 'center', margin: 0, isTextBox: true, fit: 'shrink' });
    s.addText('obligaciones del periodo', { x: 1.5, y: 4.2, w: 3.2, h: 0.3, fontFace: FB, fontSize: 12, color: MUT, align: 'center', margin: 0, isTextBox: true });
    const capIco = ['clock', 'link', 'people'], totCap = Math.max(1, capas.reduce((a, c) => a + c[1], 0));
    capas.forEach(([t, v, c, tx], i) => { const y = 1.6 + i * 1.65; tarjeta(s, 6.1, y, 6.65, 1.5); circulo(s, 6.3, y + 0.2, 0.55, c, capIco[i]);
      s.addText(Math.round(100 * v / totCap) + ' %', { x: 11.2, y: y + 0.15, w: 1.4, h: 0.6, fontFace: FH, fontSize: 26, bold: true, color: c, align: 'right', margin: 0, isTextBox: true });
      s.addText([{ text: t, options: { bold: true, color: TINTA, fontSize: 16, breakLine: true } }, { text: dinero(v), options: { bold: true, color: c, fontSize: 20 } }], { x: 7.05, y: y + 0.12, w: 4.1, h: 0.75, fontFace: FB, margin: 0, isTextBox: true, valign: 'top' });
      s.addText(tx, { x: 6.3, y: y + 0.88, w: 6.3, h: 0.55, fontFace: FB, fontSize: 12, color: MUT, margin: 0, isTextBox: true, valign: 'top', fit: 'shrink' }); });
    s.addText(`Fuera del total: certificado sin compromiso («por contratar») ${dinero(mo.T.porContratar)} y contratos SEACE con plazo vencido ${dinero(mo.T.vencidos)}.`, { x: 6.1, y: 6.55, w: 6.65, h: 0.4, fontFace: FB, fontSize: 12, color: MUT, margin: 0, isTextBox: true });

    // 6 · RESUMEN TÉCNICO: cuadro por fuente de financiamiento + fila total y los meses (cifras que respaldan las láminas anteriores)
    s = P.addSlide(); marco(s, 'Resumen técnico de cifras', 'Soles · caja propia por fuente de financiamiento y resultado mensual · corte ' + gen.txt);
    const H1 = { bold: true, color: 'FFFFFF', fill: { color: NAVY }, fontFace: FB, fontSize: 12, align: 'center', valign: 'middle' }, N = v => ({ text: M(v), options: { align: 'right' } });
    const filasF = mo.lista.filter(x => !x.ro).slice(0, 6).map(x => [{ text: titulo(x.nombre).replace(/canon y sobrecanon.*participaciones/i, 'Canon, regalías y participaciones'), options: { bold: true } }, N(x.saldo0), N(x.ing), N(x.gasto), N(x.fin), { text: x.brecha > 1 ? 'BRECHA ' + M(x.brecha) : 'Cubierta', options: { align: 'center', bold: true, color: x.brecha > 1 ? ROJO : VERDE } }]);
    if (ro) filasF.push([{ text: 'Recursos Ordinarios (Tesoro)', options: { bold: true, color: MUT } }, { text: '—', options: { align: 'right', color: MUT } }, { text: '—', options: { align: 'right', color: MUT } }, N(ro.gasto), { text: '—', options: { align: 'right', color: MUT } }, { text: 'Giro DGTP', options: { align: 'center', color: MUT } }]);
    const tot = { bold: true, fill: { color: HIELO } };
    filasF.push([{ text: 'TOTAL', options: tot }, { ...N(mo.T.saldo0), options: { ...tot, align: 'right' } }, { ...N(mo.T.ing), options: { ...tot, align: 'right' } }, { ...N(mo.T.gasto), options: { ...tot, align: 'right' } }, { ...N(mo.T.fin), options: { ...tot, align: 'right' } }, { text: mo.T.brecha > 1 ? 'BRECHA ' + M(mo.T.brecha) : 'Cubierta', options: { ...tot, align: 'center', color: mo.T.brecha > 1 ? ROJO : VERDE } }]);
    s.addTable([['Fuente de financiamiento', 'Saldo inicial est.', 'Ingresos proy.', 'Obligaciones', 'Saldo al cierre', 'Cobertura'].map(t => ({ text: t, options: H1 })), ...filasF],
      { x: 0.6, y: 1.55, w: W - 1.2, colW: [3.7, 1.75, 1.75, 1.75, 1.75, 1.43], fontFace: FB, fontSize: 12, color: TINTA, border: { type: 'solid', color: BORDE, pt: 0.5 }, rowH: 0.34, valign: 'middle', margin: [0.04, 0.08, 0.04, 0.08] });
    const yM = 1.55 + 0.34 * (filasF.length + 1) + 0.3;
    s.addTable([['Mes', ...mo.porMes.map(x => MESES[x.m - 1])].map(t => ({ text: t, options: H1 })),
      [{ text: 'Ingresos', options: { bold: true } }, ...mo.porMes.map(x => N(x.ing))], [{ text: 'Obligaciones', options: { bold: true } }, ...mo.porMes.map(x => N(x.gasto))],
      [{ text: 'Saldo al cierre', options: tot }, ...mo.porMes.map(x => ({ ...N(x.fin), options: { ...tot, align: 'right', color: x.fin < 0 ? ROJO : TINTA } }))]],
      { x: 0.6, y: yM, w: W - 1.2, colW: [2.2, ...mo.porMes.map(() => (W - 1.2 - 2.2) / mo.porMes.length)], fontFace: FB, fontSize: 12, color: TINTA, border: { type: 'solid', color: BORDE, pt: 0.5 }, rowH: 0.32, valign: 'middle', margin: [0.04, 0.08, 0.04, 0.08] });
    s.addText('Fuentes: MEF Datos Abiertos (gasto devengado e ingresos diarios, transferencias) y portal OCDS del OECE (contratos). Saldo inicial estimado = saldo de balance + recaudado − girado del año; la entidad lo confirma con su extracto bancario. Cifras referenciales, no oficiales.', { x: 0.6, y: 6.45, w: W - 1.2, h: 0.5, fontFace: FB, fontSize: 11, color: MUT, margin: 0, isTextBox: true });

    // 7 · DECISIONES SUGERIDAS: pasos numerados en dos columnas + aviso de revisión (elaborado con apoyo de IA, no oficial)
    s = P.addSlide(); marco(s, 'Decisiones sugeridas', 'Para revisar con Presupuesto y Tesorería: primero lo que ya se debe, después lo reprogramable');
    const acc = acciones(d, mo).slice(0, 6);
    acc.forEach((t, i) => { const col = i % 2, f = Math.floor(i / 2), x = 0.6 + col * 6.2, y = 1.6 + f * 1.5; tarjeta(s, x, y, 5.95, 1.35, i === 0 ? HIELO : 'FFFFFF'); circulo(s, x + 0.2, y + 0.2, 0.5, i === 0 ? ROJO : NAVY, String(i + 1));
      s.addText(t, { x: x + 0.9, y: y + 0.1, w: 4.9, h: 1.15, fontFace: FB, fontSize: 14, color: TINTA, margin: 0, isTextBox: true, valign: 'middle', fit: 'shrink' }); });
    s.addShape(P.ShapeType.roundRect, { x: 0.6, y: 6.15, w: W - 1.2, h: 0.72, fill: { color: 'FFF7E6' }, line: { color: 'F3DFAE', width: 0.75 }, rectRadius: 0.1 });
    s.addText([{ text: 'Sugerencias, no decisiones oficiales. ', options: { bold: true, color: '8A5A00' } }, { text: 'Este análisis se calculó con reglas fijas sobre datos abiertos del MEF y puede contener errores u omisiones. Es un insumo de trabajo: cada sugerencia se revisa y valida con el área competente de la entidad antes de adoptarla.', options: { color: '6B4E00' } }], { x: 0.8, y: 6.17, w: W - 1.6, h: 0.68, fontFace: FB, fontSize: 12, margin: 0, isTextBox: true, valign: 'middle' });

    // 8 · CIERRE (oscuro)
    s = P.addSlide(); nSlide++; s.background = { color: NAVY }; fondo(s, 'f2');
    s.addText('Decidir con datos, cada mañana.', { x: 0.8, y: 2.3, w: 11.5, h: 1.0, fontFace: FH, fontSize: 40, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
    s.addText('El flujo de caja se recalcula cada día con la publicación del MEF. Este archivo corresponde al corte del ' + gen.txt + '; descarga uno nuevo desde la ficha de la entidad en acierta.pe.', { x: 0.8, y: 3.4, w: 11.0, h: 1.2, fontFace: FB, fontSize: 18, color: 'C9D6E5', margin: 0, isTextBox: true });
    s.addText('acierta.pe  ·  ARKA PROYECTOS', { x: 0.8, y: 5.4, w: 11.5, h: 0.5, fontFace: FB, fontSize: 16, bold: true, color: 'E9C46A', margin: 0, isTextBox: true });
    s.addText('Herramienta de análisis y proyección referencial. No sustituye la programación oficial de Tesorería ni constituye pronunciamiento sobre la gestión de la entidad.', { x: 0.8, y: 6.1, w: 11.5, h: 0.7, fontFace: FB, fontSize: 12.5, color: '8FA3B8', margin: 0, isTextBox: true });
    const blob = await P.write({ outputType: 'blob' });
    bajar(blob, `Acierta_FlujoCaja_${d.ue}_${gen.tag}.pptx`);
  }

  function bajar(blob, nombre) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }
  const aviso = t => { if (window.toast) window.toast(t); else console.log(t); };

  async function descargar(tipo, ue, nombre, btn) {
    const t0 = btn ? btn.innerHTML : null; if (btn) { btn.disabled = true; btn.innerHTML = '<span class="ri-fw">⏳ Generando…</span>'; }
    try { const { d, idx } = await datos(ue); if (tipo === 'pptx') await ppt(d, idx, nombre); else await excel(d, idx, nombre); aviso('Listo: revisa tus descargas'); }
    catch (e) { console.error(e); aviso(e.message || 'No se pudo generar el archivo'); }
    finally { if (btn) { btn.disabled = false; btn.innerHTML = t0; } }
  }
  // bloque para la ficha de la entidad (lo inserta entidad.js bajo "Reporte PPT")
  function bloque(ico) {
    return `<div class="ri-flujo" aria-label="Flujo de caja proyectado"><div class="ri-fh">${ico ? ico('wallet') : ''}<span><b>Flujo de caja proyectado</b><small>caja mes a mes hasta diciembre · corte de hoy</small></span></div>
      <div class="ri-fb"><button type="button" class="ri-fbtn" data-flujo="xlsx" title="Excel editable: resumen gerencial, una hoja por fuente, contratos y fuentes">${ico ? ico('download') : ''}<span>Excel</span></button><button type="button" class="ri-fbtn" data-flujo="pptx" title="Presentación ejecutiva para exponer">${ico ? ico('download') : ''}<span>PPT</span></button></div></div>`;
  }
  // panel "Flujo de caja" (dentro de Reportes SIAF o del detalle de la entidad): resumen + descargas. Reusa las clases rs-* de reportes_siaf.
  async function llenar(root, ue, nombre) {
    if (!root) return;
    const ico = n => window.Ico ? Ico(n) : '', esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    root.innerHTML = '<p class="mutx">Calculando el flujo de caja…</p>';
    let d, idx, mo;
    try { ({ d, idx } = await datos(ue)); mo = modelo(d); }
    catch (e) { root.innerHTML = `<div class="rs-acc">${ico('alert')}<div><b>Flujo de caja no disponible todavía</b><p>Los datos de esta entidad se generan con la publicación diaria del MEF; vuelve a intentarlo más tarde.</p></div></div>`; return; }
    const k = mo.estado === 'verde' ? 'ok' : mo.estado === 'ambar' ? 'warn' : 'bad', D = v => 'S/ ' + M(v);
    root.innerHTML = `<div class="rs-head ${k}"><span class="rs-hi">${ico('wallet')}</span><div><b>${mo.T.brecha > 1 ? 'Brecha de caja ' + D(mo.T.brecha) : 'Saldo al cierre ' + D(mo.T.fin)}</b><small>${esc(mo.veredicto)}</small></div></div>
      <div class="rs-kp"><div><b>${D(mo.T.saldo0)}</b><small>saldo inicial estimado · caja propia</small></div><div><b>${D(mo.T.ing)}</b><small>ingresos proyectados · ${esc(mo.periodo)}</small></div><div><b>${D(mo.T.gasto)}</b><small>obligaciones proyectadas · todas las fuentes</small></div><div><b>${D(mo.T.exigible)}</b><small>deuda devengada no girada · se paga primero</small></div><div><b>${D(mo.T.repartido)}</b><small>compromisos sin devengar</small></div><div><b>${D(mo.T.recurrente)}</b><small>gastos recurrentes (planillas, servicios)</small></div></div>
      <h3>Descargar con corte de hoy</h3>
      <div class="fc-dl"><button type="button" class="fc-btn" data-flujo="xlsx">${ico('download')}<span><b>Excel</b><small>resumen gerencial, una hoja por fuente, contratos SEACE y fuentes · celdas editables</small></span></button><button type="button" class="fc-btn" data-flujo="pptx">${ico('download')}<span><b>PPT</b><small>presentación ejecutiva de 8 láminas para exponer · con decisiones sugeridas y cuadro técnico</small></span></button></div>
      <div class="rs-acc">${ico('spark')}<div><b>Referencial, no oficial</b><p>Proyección con datos abiertos del MEF (gasto e ingresos diarios, transferencias) y el portal OCDS del OECE, calculada con reglas fijas (sin modelo de IA en la consulta): puede contener errores u omisiones. El saldo inicial es estimado (saldo de balance + recaudado − girado); Tesorería lo confirma. Ambos archivos indican la fecha y hora de generación.${d.corte_txt ? ' ' + esc(d.corte_txt) + '.' : ''}</p></div></div>`;
    wire(root, ue, nombre || d.nombre);
  }
  function wire(root, ue, nombre) { root.querySelectorAll('[data-flujo]').forEach(b => b.onclick = () => descargar(b.dataset.flujo, ue, nombre, b)); }
  window.FlujoCaja = { descargar, bloque, wire, llenar, modelo, datos };
})();
