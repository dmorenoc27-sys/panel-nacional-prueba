/* reporte_ue.js — Reporte PPT "a medida" de una unidad ejecutora (primer caso: UE 118 MINEDU).
   No dibuja nada: toma la plantilla oficial de la entidad (Web/reportes/<ue>.pptx, su mismo PPT) y solo cambia los
   textos y filas de tabla que son datos (PIA/PIM/devengado/programado, costos, beneficiarios, avances, fechas).
   Todo lo demás (tamaños, colores, fotos, mapas, textos institucionales) queda byte a byte igual.
   Corre en el navegador (JSZip cargado bajo demanda) y en Node para pruebas.
   API: ReporteUE.generar(zip, cfg, datos, corte) -> zip modificado; ReporteUE.armar(cfg, datos, corte) -> D (para probar). */
(function (root) {
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  const ACENTOS = { 'SAN MARTIN': 'San Martín', 'JUNIN': 'Junín', 'ANCASH': 'Áncash', 'APURIMAC': 'Apurímac', 'HUANUCO': 'Huánuco', 'LIMA': 'Lima' };
  // ---------- formatos ----------
  const miles = v => { const n = Math.round((v || 0) / 1000); return n < 0 ? '(' + Math.abs(n).toLocaleString('en-US') + ')' : n.toLocaleString('en-US'); };
  const ent = v => Math.round(v || 0).toLocaleString('en-US');
  const dec2 = v => (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const mill = (v, d, coma) => { const s = ((v || 0) / 1e6).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); return coma ? s.replace(/,/g, '#').replace('.', ',').replace(/#/g, '.') : s; };
  const pct1 = (a, b) => (b ? 100 * a / b : 0).toFixed(1) + '%';
  const fechaDMY = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}/${m[2]}/${m[1]}` : (s ? String(s) : 'Pendiente'); };
  const titulo = s => String(s || '').toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()).replace(/\s(De|Del|Y|La|Los|Las)\s/g, m => m.toLowerCase());
  const region = d => d ? (ACENTOS[String(d).toUpperCase()] || titulo(d)) : '—';
  const corto = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s; };
  // situación del 12-B: viene como "[14/09/2026] - En ejecución de obra ... narrativa larga"; se deja corta para la columna Estado
  const estado12b = (s, n) => corto(String(s || '').replace(/^\[\d{2}\/\d{2}\/\d{4}\]\s*-\s*/, ''), n || 120);
  const milBenef = (v, d) => ((v || 0) / 1000).toFixed(d).replace('.', ',') + ' mil beneficiarios';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- fecha de corte ----------
  // corte = {mes: 6}  -> cierre de junio (devengado mensual de Consulta Amigable, exacto para cualquier mes ya cerrado)
  // corte = {fecha: '2026-09-21', datos: <json diario>} -> foto diaria guardada por reportes.py
  // corte = null -> hoy (datos actuales)
  function resolverCorte(corte, datos) {
    const hoy = datos.corte || new Date().toISOString().slice(0, 10);
    if (corte && corte.mes) {
      const m = corte.mes, anio = datos.anio, ult = new Date(anio, m, 0).getDate();
      return { mes: m, fecha: `${anio}-${String(m).padStart(2, '0')}-${String(ult).padStart(2, '0')}`, porMes: true, datos };
    }
    const f = (corte && corte.fecha) || hoy, d = (corte && corte.datos) || datos;
    return { mes: +f.slice(5, 7), fecha: f, porMes: false, datos: d };
  }
  const ejecAl = (c, k) => k.porMes ? c.m.slice(0, k.mes).reduce((a, b) => a + b, 0) : (c.dev || 0);
  const progResto = (c, k) => (c.prog || []).slice(k.mes).reduce((a, b) => a + b, 0);

  // ---------- armar datos ----------
  function armar(cfg, datos, corte) {
    const k = resolverCorte(corte, datos), porCui = {};
    (k.datos.cuis || []).forEach(c => porCui[c.cui] = c);
    const fila = (c, alias) => {
      const ejec = ejecAl(c, k), prog = progResto(c, k), tot = ejec + prog;
      return { cui: c.cui, nombre: alias || corto(c.nombre_bi || c.nombre, 60), pia: c.pia || 0, pim: c.pim || 0, ejec, prog, tot, saldo: (c.pim || 0) - tot, c };
    };
    const sumar = filas => filas.reduce((t, f) => ({ pia: t.pia + f.pia, pim: t.pim + f.pim, ejec: t.ejec + f.ejec, prog: t.prog + f.prog, tot: t.tot + f.tot, saldo: t.saldo + f.saldo }), { pia: 0, pim: 0, ejec: 0, prog: 0, tot: 0, saldo: 0 });
    const porFuente = (cuis, nombres) => {
      const acc = {};
      cuis.forEach(c => Object.entries(c.ff || {}).forEach(([cod, f]) => {
        const nom = nombres[cod] || f.nombre; acc[nom] = acc[nom] || { nombre: nom, pia: 0, pim: 0, ejec: 0, prog: 0 };
        acc[nom].pia += f.pia || 0; acc[nom].pim += f.pim || 0; acc[nom].ejec += k.porMes ? f.m.slice(0, k.mes).reduce((a, b) => a + b, 0) : (f.dev || 0);
      }));
      // ponytail: la programación del 12-B no viene por fuente; quien llama la reparte proporcional al PIM de cada fuente
      const orden = [...new Set(Object.values(nombres))];
      return orden.map(n => acc[n]).filter(Boolean).concat(Object.values(acc).filter(f => !orden.includes(f.nombre)));
    };
    const usados = new Set();
    const programas = cfg.programas.map(p => {
      const filas = p.cuis.filter(x => porCui[x.cui] && !x.sin_ppto).map(x => { usados.add(x.cui); return fila(porCui[x.cui], x.alias); });
      const tot = sumar(filas);
      const cuisP = p.cuis.map(x => porCui[x.cui]).filter(Boolean);
      const fuentes = porFuente(cuisP.filter(c => c.pim), cfg.fuentes || {}).map(f => {
        const progF = tot.pim ? tot.prog * f.pim / tot.pim : 0;
        return { ...f, prog: progF, saldo: f.pim - f.ejec - progF };
      });
      const costo = cuisP.reduce((a, c) => a + (c.costo || 0), 0);
      const comps = (p.componentes || []).map(id => ({ id, costo: p.cuis.filter(x => x.comp === id && porCui[x.cui]).reduce((a, x) => a + (porCui[x.cui].costo || 0), 0) }));
      // ponytail: el Banco no separa por componente el costo del CUI de gestión; comp_fijo = {"C1": {"monto": 31300000, "resta_de": "C4"}}
      Object.entries(p.comp_fijo || {}).forEach(([id, f]) => { const c = comps.find(x => x.id === id), d = comps.find(x => x.id === f.resta_de); if (c) c.costo += f.monto; if (d) d.costo -= f.monto; });
      const cartera = (p.cartera || []).map(cui => { const x = p.cuis.find(y => y.cui === cui) || {}; const c = porCui[cui]; return c ? { ...x, c } : null; }).filter(Boolean);
      const mapa = p.cuis.filter(x => x.mapa && porCui[x.cui]).map(x => ({ ...x, c: porCui[x.cui] }));
      const benef = cartera.reduce((a, r) => a + (r.c.benef || 0), 0), costoCart = cartera.reduce((a, r) => a + (r.c.costo || 0), 0);
      return { ...p, filas, tot, fuentes, costo, comps, cartera, mapa, benef, costoCart, kpi: { pim: tot.pim, ejec: tot.ejec, prog: tot.prog, saldo: tot.saldo } };
    });
    const todos = (k.datos.cuis || []).filter(c => c.pim || c.pia);
    const consolidado = porFuente(todos, cfg.fuentes_consolidado || cfg.fuentes || {});
    const progT = todos.reduce((a, c) => a + progResto(c, k), 0), pimT = todos.reduce((a, c) => a + (c.pim || 0), 0);
    consolidado.forEach(f => { f.prog = pimT ? progT * f.pim / pimT : 0; f.tot = f.ejec + f.prog; f.saldo = f.pim - f.tot; });
    const consTot = consolidado.reduce((t, f) => ({ pia: t.pia + f.pia, pim: t.pim + f.pim, ejec: t.ejec + f.ejec, prog: t.prog + f.prog, tot: t.tot + f.tot, saldo: t.saldo + f.saldo }), { pia: 0, pim: 0, ejec: 0, prog: 0, tot: 0, saldo: 0 });
    const noListados = todos.filter(c => !usados.has(c.cui)).map(c => c.cui);
    return { corte: k, programas, consolidado, consTot, noListados, conProg: !!k.datos.con_programacion, misionales: cfg.misionales && porCui[cfg.misionales.cui] };
  }

  // ---------- XML ----------
  function bloque(xml, nombre) {   // <p:sp> o <p:graphicFrame> cuyo cNvPr name="nombre"
    const re = new RegExp('<p:(sp|graphicFrame)>(?:(?!</p:\\1>).)*?name="' + nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"(?:(?!</p:\\1>).)*?</p:\\1>', 's');
    const m = re.exec(xml); return m ? { i: m.index, j: m.index + m[0].length, s: m[0] } : null;
  }
  function conRuns(s, vals) {   // reemplaza el i-ésimo <a:t>…</a:t>; null = no tocar
    let i = 0; return s.replace(/<a:t>([^<]*)<\/a:t>/g, (m, t) => { const v = vals[i++]; return v == null ? m : '<a:t>' + esc(v) + '</a:t>'; });
  }
  function setRuns(xml, nombre, vals) {
    const b = bloque(xml, nombre); if (!b) { console.warn('reporte: no está la forma', nombre); return xml; }
    return xml.slice(0, b.i) + conRuns(b.s, vals) + xml.slice(b.j);
  }
  const celdas = tr => tr.match(/<a:tc(?:\s[^>]*)?>.*?<\/a:tc>/gs) || [];
  function celdaTexto(tc, texto) {   // deja un solo párrafo con un solo run; si la celda no tenía run, lo crea copiando el endParaRPr
    if (/<a:r>/.test(tc)) {
      let quedo = false, primera = true;   // se conserva solo el primer párrafo que tenga run (los demás párrafos sobrarían como líneas vacías)
      tc = tc.replace(/<a:p>.*?<\/a:p>/gs, p => { if (quedo || !/<a:r>/.test(p)) return ''; quedo = true; return p; });
      return tc.replace(/<a:r>.*?<\/a:r>/gs, r => { if (!primera) return ''; primera = false; return r.replace(/<a:t>[^<]*<\/a:t>/, '<a:t>' + esc(texto) + '</a:t>'); }).replace(/<a:br\/>/g, '');
    }
    return tc.replace(/<a:endParaRPr([^>]*)>(.*?)<\/a:endParaRPr>/s, (m, a, inner) => `<a:r><a:rPr${a}>${inner}</a:rPr><a:t>${esc(texto)}</a:t></a:r>` + m)
             .replace(/<a:endParaRPr[^>]*\/>/, m => `<a:r><a:rPr${m.slice(13, -2)}></a:rPr><a:t>${esc(texto)}</a:t></a:r>` + m);
  }
  function filaTextos(tr, textos) {   // textos[i] = string | null (no tocar)
    let i = 0; return tr.replace(/<a:tc(?:\s[^>]*)?>.*?<\/a:tc>/gs, tc => { const t = textos[i++]; return t == null ? tc : celdaTexto(tc, t); });
  }
  // reescribe la tabla: filas de cabecera (arriba) y de pie (abajo) se conservan y solo cambian sus textos; el cuerpo se
  // regenera clonando la fila modelo (iModelo, relativa al cuerpo) tantas veces como datos haya.
  function setTabla(xml, nombre, { arriba = 1, abajo = 0, modelo = 0, cabeceras = [], cuerpo = [], pie = [] }) {
    const b = bloque(xml, nombre); if (!b) { console.warn('reporte: no está la tabla', nombre); return xml; }
    const trs = b.s.match(/<a:tr\s[^>]*>.*?<\/a:tr>/gs) || [];
    const head = trs.slice(0, arriba), body = trs.slice(arriba, trs.length - abajo), foot = abajo ? trs.slice(-abajo) : [];
    const plantilla = body[Math.min(modelo, body.length - 1)];
    const nuevo = head.map((tr, i) => cabeceras[i] ? filaTextos(tr, cabeceras[i]) : tr)
      .concat(cuerpo.map(f => filaTextos(plantilla, f)))
      .concat(foot.map((tr, i) => pie[i] ? filaTextos(tr, pie[i]) : tr)).join('');
    const s = b.s.replace(/(<a:tbl>.*?<\/a:tblGrid>)(.*)(<\/a:tbl>)/s, (m, a, _, c) => a + nuevo + c);
    return xml.slice(0, b.i) + s + xml.slice(b.j);
  }

  // ---------- parches por lámina ----------
  function lamPpto(xml, p, D, cfg) {
    const k = D.corte, mes = MESES[k.mes - 1], sig = k.mes < 12 ? ABR[k.mes] + '-Dic' : '—';
    const lblEjec = k.porMes ? mes : 'al ' + fechaDMY(k.fecha).slice(0, 5);
    xml = setRuns(xml, 'TextBox 3', [`Montos en S/ miles, redondeados al millar. Devengado ${k.porMes ? 'al cierre de ' + mes.toLowerCase() : 'al ' + fechaDMY(k.fecha)}; PIA, PIM y programación F12-B vigentes a la fecha de generación. El programado por fuente se distribuye en proporción al PIM de cada fuente (el F12-B no programa por fuente).`]);
    const F = f => [f.cui, f.nombre, miles(f.pia), miles(f.pim), miles(f.ejec), miles(f.prog), miles(f.tot), miles(f.saldo)];
    xml = setTabla(xml, 'Table 4', { arriba: 1, abajo: 1, modelo: 2, cuerpo: p.filas.map(F),
      pie: [[null, 'TOTAL', miles(p.tot.pia), miles(p.tot.pim), miles(p.tot.ejec), miles(p.tot.prog), miles(p.tot.tot), miles(p.tot.saldo)]] });
    // cabecera: "Ejec." / "Junio" y "Prog." / "Jul-Dic" son dos runs de una misma celda
    xml = xml.replace(/<a:t>Junio<\/a:t>/, '<a:t>' + esc(lblEjec) + '</a:t>').replace(/<a:t>Jul-Dic<\/a:t>/, '<a:t>' + esc(sig) + '</a:t>');
    const kp = p.kpi;
    xml = setRuns(xml, 'Rounded Rectangle 5', ['PIM', 'S/ ' + miles(kp.pim)]);
    const b6 = bloque(xml, 'Rounded Rectangle 6');
    if (b6) { const n = (b6.s.match(/<a:t>/g) || []).length; const v = n >= 5 ? ['Ejecutado', ' a ', k.porMes ? mes.toLowerCase() : fechaDMY(k.fecha).slice(0, 5), 'S/ ' + miles(kp.ejec), pct1(kp.ejec, kp.pim) + ' del PIM'] : ['Ejecutado a ' + (k.porMes ? mes.toLowerCase() : fechaDMY(k.fecha).slice(0, 5)), 'S/ ' + miles(kp.ejec), pct1(kp.ejec, kp.pim) + ' del PIM']; xml = setRuns(xml, 'Rounded Rectangle 6', v); }
    xml = setRuns(xml, 'Rounded Rectangle 7', ['Programado ' + sig.toLowerCase(), 'S/ ' + miles(kp.prog)]);
    xml = setRuns(xml, 'Rounded Rectangle 8', ['Saldo', 'S/ ' + miles(kp.saldo), pct1(kp.saldo, kp.pim) + ' del PIM']);
    (p.razones || []).slice(0, 3).forEach((r, i) => { const nom = 'Rounded Rectangle ' + (10 + i), b = bloque(xml, nom); if (!b) return; const n = (b.s.match(/<a:t>/g) || []).length; xml = setRuns(xml, nom, n >= 2 ? [(i + 1) + '.  ', r] : [(i + 1) + '. ' + r]); });
    xml = setTabla(xml, 'Table 14', { arriba: 1, abajo: 0, modelo: 0, cuerpo: p.fuentes.map(f => [f.nombre, miles(f.pim), miles(f.ejec), miles(f.saldo)]) });
    if (bloque(xml, 'Tabla 2')) {   // consolidado UE (solo en la lámina del segundo programa)
      const filas = D.consolidado.map(f => [f.nombre, miles(f.pia), miles(f.pim), miles(f.ejec), miles(f.prog), miles(f.tot), miles(f.saldo)]);
      const t = D.consTot;
      xml = setTabla(xml, 'Tabla 2', { arriba: 1, abajo: 1, modelo: 0, cuerpo: filas, pie: [['TOTAL', miles(t.pia), miles(t.pim), miles(t.ejec), miles(t.prog), miles(t.tot), miles(t.saldo)]] });
    }
    return xml;
  }
  function lamCartera(xml, p, D, conFechas) {
    const filas = p.cartera.map(r => {
      const c = r.c, estado = r.estado || estado12b(c.situ_act, conFechas ? 120 : 60) || c.situacion || '—';
      return conFechas
        ? [c.cui, r.nombre || corto(c.nombre_bi || c.nombre, 140), region(c.dpto), dec2(c.costo), ent(c.benef), fechaDMY(c.ini), fechaDMY(c.fin), (c.av_fis == null ? '—' : (+c.av_fis).toFixed(2) + '%'), (c.av_ejec == null ? '—' : (+c.av_ejec).toFixed(1) + '%'), estado]
        : [c.cui, r.nombre || corto(c.nombre_bi || c.nombre, 220), region(c.dpto), dec2(c.costo), ent(c.benef), estado];
    });
    return setTabla(xml, conFechas ? 'Table 3' : 'Tabla 4', { arriba: 1, abajo: 0, modelo: 0, cuerpo: filas });
  }
  function lamMapa(xml, p, D, dec) {
    p.mapa.forEach(x => {
      xml = setRuns(xml, x.mapa[0], [mill(x.c.costo, 2, true) + ' Millones']);
      xml = setRuns(xml, x.mapa[1], [milBenef(x.c.benef, dec)]);
    });
    const b = bloque(xml, 'Google Shape;151;p32');
    if (b) { const n = (b.s.match(/<a:t>/g) || []).length; xml = setRuns(xml, 'Google Shape;151;p32', n >= 3 ? [null, mill(p.costoCart, 1), null] : [null, mill(p.costoCart, 1) + ' Millones']); }
    const b2 = bloque(xml, 'Google Shape;153;p32');
    if (b2) { const n = (b2.s.match(/<a:t>/g) || []).length, v = (p.benef / 1000).toFixed(2).replace('.', ','); xml = setRuns(xml, 'Google Shape;153;p32', n >= 4 ? [v, '', ' mil', null] : [v + ' mil', null]); }
    return xml;
  }
  function setAncho(xml, nombre, cx) {   // ancho (EMU) de una forma: barras de componentes de la lámina 4
    const b = bloque(xml, nombre); if (!b) return xml;
    return xml.slice(0, b.i) + b.s.replace(/(<a:ext cx=")\d+(")/, `$1${Math.max(1, Math.round(cx))}$2`) + xml.slice(b.j);
  }
  const ancho = (xml, nombre) => { const b = bloque(xml, nombre), m = b && b.s.match(/<a:ext cx="(\d+)"/); return m ? +m[1] : 0; };
  function lamCostos(xml, D, cfg) {   // lámina 4: costo actualizado por programa y componentes
    const f = fechaDMY(D.corte.fecha);
    const [a, b] = D.programas;
    const bloqueProg = (p, iTit, iSol, iUsd, iVs, iComp, barras) => {
      if (!p) return;
      const tc = p.tc || cfg.tc || 3.418;
      xml = setRuns(xml, 'Text ' + iTit, ['COSTO ACTUALIZADO AL ' + f]);
      xml = setRuns(xml, 'Text ' + iSol, ['S/ ' + mill(p.costo, 1) + ' M']);
      xml = setRuns(xml, 'Text ' + iUsd, ['US$ ' + mill(p.costo / tc, 1) + ' M']);
      if (p.costo_inicial) { const d = p.costo - p.costo_inicial; xml = setRuns(xml, 'Text ' + iVs, [(d >= 0 ? '+' : '–') + 'S/ ' + mill(Math.abs(d), 1) + ' M | ' + (d >= 0 ? '+' : '–') + pct1(Math.abs(d), p.costo_inicial) + ' ' + (p.vs || 'vs. costo inicial')]); }
      p.comps.forEach((c, i) => {
        const nom = 'Text ' + iComp[i]; if (bloque(xml, nom)) xml = setRuns(xml, nom, ['S/ ' + mill(c.costo, 1) + ' M (' + pct1(c.costo, p.costo) + ')']);
        const [pista, relleno] = barras[i] || []; if (relleno) xml = setAncho(xml, 'Shape ' + relleno, ancho(xml, 'Shape ' + pista) * (p.costo ? c.costo / p.costo : 0));
      });
    };
    bloqueProg(a, 7, 9, 10, 11, [16, 20, 24, 28], [[14, 15], [18, 19], [22, 23], [26, 27]]);
    bloqueProg(b, 43, 45, 46, 47, [52, 56, 60], [[50, 51], [54, 55], [58, 59]]);
    return xml;
  }
  function lamMisionales(xml, D) {
    const c = D.misionales; if (!c) return xml;
    const b = bloque(xml, 'Google Shape;151;p32'); if (!b) return xml;
    const n = (b.s.match(/<a:t>/g) || []).length;
    return setRuns(xml, 'Google Shape;151;p32', n >= 3 ? [null, mill(c.costo, 2), null] : [null, mill(c.costo, 2) + ' Millones']);
  }

  async function generar(zip, cfg, datos, corte) {
    const D = armar(cfg, datos, corte);
    const lam = async (n, fn) => { const p = `ppt/slides/slide${n}.xml`, f = zip.file(p); if (!f) return; zip.file(p, fn(await f.async('string'))); };
    for (const p of D.programas) {
      if (p.slide_ppto) await lam(p.slide_ppto, x => lamPpto(x, p, D, cfg));
      if (p.slide_cartera) await lam(p.slide_cartera, x => lamCartera(x, p, D, p.slide_cartera === D.programas[0].slide_cartera));
      if (p.slide_mapa) await lam(p.slide_mapa, x => lamMapa(x, p, D, p === D.programas[0] ? 1 : 2));
    }
    await lam(4, x => lamCostos(x, D, cfg));
    if (cfg.misionales) await lam(cfg.misionales.slide, x => lamMisionales(x, D));
    return { zip, D };
  }

  // cortes disponibles para el selector: meses cerrados del año (exactos) + fotos diarias guardadas
  function cortes(datos, fechasDiarias) {
    const hoy = datos.corte || new Date().toISOString().slice(0, 10), anio = datos.anio, mesHoy = +hoy.slice(5, 7);
    const meses = []; for (let m = 1; m < mesHoy; m++) meses.push({ mes: m, etiqueta: 'Cierre de ' + MESES[m - 1].toLowerCase() + ' ' + anio });
    return { meses: meses.reverse(), dias: (fechasDiarias || []).slice().sort().reverse() };
  }

  root.ReporteUE = { armar, generar, cortes, resolverCorte, MESES, _x: { setRuns, setTabla, bloque, miles, mill } };
})(typeof window !== 'undefined' ? window : globalThis);
