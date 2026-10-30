/* expediente.js — Expediente PPT editable por unidad ejecutora (o de una sola inversión). v2 (22/10/2026)
   Corre en el navegador con PptxGenJS (cargado bajo demanda) y en Node para pruebas.
   construir(px, D) -> Promise<n>: agrega las láminas al objeto PptxGenJS `px`. D = datos ya resueltos (ver index.html: datosExpediente).
   Diseño: mismo estándar que el PPT de Flujo de Caja (Cambria títulos / Calibri texto, portada y cierre oscuros, contenido claro,
   cifras grandes, íconos en círculos, gráficos nativos editables, texto nunca menor de 12 pt). */
(function (root) {
  const W = 13.33, H = 7.5, FH = 'Cambria', FB = 'Calibri';
  const NAVY = '0F2A43', NAVY2 = '163A5C', ORO = 'C9A227', ORO2 = 'E9C46A', AZUL = '1E5AA8', VERDE = '0F6E4F', ROJO = 'B42A2A', AMBAR = 'C77700';
  const TINTA = '1F2A37', MUT = '6B7A8B', HIELO = 'EEF3F9', BORDE = 'DCE4EE', FONDO = 'F6F8FB', CLARO = 'C9D6E5';
  const REG = 'Información en registro';
  const f0 = n => Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  const f1 = n => Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 1 });
  const fM = n => 'S/ ' + Number((n || 0) / 1e6).toLocaleString('es-PE', { maximumFractionDigits: Math.abs(n) >= 1e9 ? 0 : 1 }) + ' M';
  const fS = n => n == null ? REG : 'S/ ' + f0(n);
  const pct = (a, b) => b ? 100 * a / b : 0;
  const sem = v => v >= 70 ? VERDE : v >= 40 ? AMBAR : ROJO;
  const fecha = v => { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}/${m[2]}/${m[1]}` : (v || REG); };
  const corto = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s; };
  const MIN = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en', 'a', 'al', 'con', 'para', 'por', 'o', 'u']);
  // nombres del MEF vienen en MAYÚSCULAS; en una lámina se leen mejor en Tipo Título (siglas de ≤3 letras y códigos se conservan)
  const titulo = s => String(s || '').toLowerCase().replace(/(^|[\s(\/-])([a-záéíóúñ])/g, (m, a, b) => a + b.toUpperCase()).split(' ')
    .map((w, i) => i && MIN.has(w.toLowerCase()) ? w.toLowerCase() : w).join(' ').replace(/\b(Jr|Av|Aa|Hh|Ca|Pv|Cp|Ug|Ie|Ii|Ee|Ptar|Ubs|Ex|Et|Uei|Opmi|Oarr|Ioarr|Gl|Gr|Gn|I{1,3}|Iv|Vi{0,3}|Ix|Xi{0,3})\b\.?/g, m => m.toUpperCase());
  const fis = v => v == null || v < 0 ? null : +v;
  // tamaño de letra que cabe en una línea (Cambria negrita ≈ 0.56 em por carácter); PowerPoint no aplica 'shrink' hasta que se edita el texto
  const ajusta = (txt, w, max) => Math.max(10, Math.min(max, Math.floor(w * 72 / (0.56 * String(txt).length))));
  // fase de ejecución según el Banco de Inversiones (Directiva N.º 001-2019-EF/63.01: ET = Formato 08-A, seguimiento = Formato 12-B, cierre = Formato 09)
  function fase(c, f) {
    f = f || {}; const avF = fis(f.av_fis != null ? f.av_fis : c.avance_fisico), et = f.tiene_et === 'SI' || c.f8 === 'SI' || !!(f.et_fecha || c.et_fecha);
    if (f.cierre === 'SI') return ['CERRADA · F09', VERDE, 'cierre registrado en el Banco de Inversiones'];
    if (f.paralizada === 'SI') return ['PARALIZADA', ROJO, 'declarada paralizada en el F12-B'];
    if (avF != null && avF >= 100) return ['CULMINADA · SIN CIERRE', VERDE, 'obra al 100 %: falta liquidar y registrar el Formato 09'];
    if (avF != null && avF > 0) return ['EN EJECUCIÓN FÍSICA', '1B7F3B', `avance físico ${f1(avF)} % según el F12-B`];
    if (et) return ['CON EXPEDIENTE TÉCNICO', AZUL, 'ET aprobado (Formato 08-A) · sin avance físico registrado'];
    return ['SIN EXPEDIENTE TÉCNICO', AMBAR, 'viable/aprobada · falta elaborar y registrar el ET'];
  }
  const faseCorta = c => c.avance_fisico != null && c.avance_fisico >= 100 ? 'Culminada' : c.avance_fisico > 0 ? 'En ejecución' : c.f8 === 'SI' || c.et_fecha ? 'Con ET' : 'Sin ET';
  const sombra = () => ({ type: 'outer', blur: 6, offset: 2, angle: 90, color: NAVY, opacity: 0.12 });

  // ───────────── íconos de trazo e imágenes de fondo (se rasterizan a PNG: en el navegador con canvas, en Node con sharp) ─────────────
  const ICO = { coins: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>', alert: '<path d="M12 3L2.5 20h19L12 3z"/><path d="M12 10v4"/><path d="M12 17.5v.5"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h6M9.5 17h6"/>', bank: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
    pin: '<path d="M12 21s-7-6.5-7-11.5a7 7 0 0 1 14 0C19 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', list: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    chart: '<path d="M4 20h16"/><path d="M7 16V10M12 16V5M17 16v-8"/>', target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>', users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M15.5 14.5c2.8 0 5.5 2 5.5 5.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 3.5 10.9c-.6.5-1 1.2-1 2.1h-5c0-.9-.4-1.6-1-2.1A6 6 0 0 1 12 3z"/>' };
  const svgIco = n => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICO[n]}</svg>`;
  const svgFondo = (c1, c2) => `<svg xmlns="http://www.w3.org/2000/svg" width="1333" height="750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${c1}"/><stop offset="1" stop-color="#${c2}"/></linearGradient><radialGradient id="r" cx="0.82" cy="0.25" r="0.5"><stop offset="0" stop-color="#C9A227" stop-opacity="0.22"/><stop offset="1" stop-color="#C9A227" stop-opacity="0"/></radialGradient></defs><rect width="1333" height="750" fill="url(#g)"/><rect width="1333" height="750" fill="url(#r)"/></svg>`;
  // jpg=true para fondos degradados: en PNG pesan ~1 MB cada uno y el PPT tarda 10 s más en empaquetarse; en JPEG, 14 KB
  // jpg = color de fondo (hex) para aplanar en JPEG: el PPT pesa 3-4 veces menos y se genera en un tercio del tiempo (los PNG del canvas no se comprimen)
  async function png(svg, w, h, jpg) {
    if (typeof document !== 'undefined') return new Promise((ok, no) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (jpg) { g.fillStyle = '#' + jpg; g.fillRect(0, 0, w, h); } g.drawImage(im, 0, 0, w, h); ok(c.toDataURL(jpg ? 'image/jpeg' : 'image/png', 0.86).replace(/^data:/, '')); }; im.onerror = () => no(new Error('svg')); im.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))); });
    const sharp = require('sharp'), im = sharp(Buffer.from(svg)).resize(w, h); return (jpg ? 'image/jpeg;base64,' : 'image/png;base64,') + (await (jpg ? im.flatten({ background: '#' + jpg }).jpeg({ quality: 86 }) : im.png()).toBuffer()).toString('base64');
  }
  // silueta de cordillera (adorno de portada y cierre), blanca y casi transparente
  const svgMontes = () => `<svg xmlns="http://www.w3.org/2000/svg" width="1333" height="220" viewBox="0 0 1333 220"><path d="M0 220V150L90 95l70 40 110-85 80 60 120-100 90 70 110-55 100 80 90-45 120 65 100-70 90 55 173-60V220z" fill="#FFFFFF" fill-opacity="0.07"/><path d="M0 220v-35l120-55 80 45 130-70 100 55 150-85 110 70 120-40 110 60 130-75 100 50 183-50v130z" fill="#FFFFFF" fill-opacity="0.09"/></svg>`;
  // mapa del Perú (geo/peru_departamentos.json del propio sitio): departamento resaltado y puntos con coordenadas
  function svgMapa(G, dpto, pts, w, h, oscuro) {
    const B = [-81.5, -18.5, -68.5, 0.1], s = Math.min(w / (B[2] - B[0]), h / (B[3] - B[1])), ox = (w - (B[2] - B[0]) * s) / 2, oy = (h - (B[3] - B[1]) * s) / 2;
    const X = lon => (ox + (lon - B[0]) * s).toFixed(1), Y = lat => (oy + (B[3] - lat) * s).toFixed(1);
    const path = g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map(p => p.map(r => 'M' + r.map(([a, b]) => X(a) + ' ' + Y(b)).join('L') + 'Z').join('')).join('');
    const base = oscuro ? '#FFFFFF' : '#' + NAVY, sel = '#' + ORO, fo = oscuro ? 0.1 : 0.07, so = oscuro ? 0.25 : 0.14;
    let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
    (G && G.features || []).forEach(f => { const es = String(f.properties.n || '').toUpperCase() === String(dpto || '').toUpperCase(); out += `<path d="${path(f.geometry)}" fill="${es ? sel : base}" fill-opacity="${es ? 0.9 : fo}" stroke="${base}" stroke-opacity="${so}" stroke-width="${Math.max(1, w / 400)}" stroke-linejoin="round"/>`; });
    const r = Math.max(3, w / 90);
    (pts || []).forEach(([lat, lon, grande]) => { if (lat == null || lon == null) return; out += `<circle cx="${X(lon)}" cy="${Y(lat)}" r="${grande ? r * 1.9 : r}" fill="#${grande ? ROJO : NAVY2}" fill-opacity="${grande ? 1 : 0.75}" stroke="#FFFFFF" stroke-width="${Math.max(1, w / 300)}"/>`; });
    return out + '</svg>';
  }
  // anillo de avance como imagen: un gráfico nativo tarda ~0.5 s por lámina al empaquetar el PPT; una imagen, 0.02 s. Los gráficos del resumen siguen siendo nativos (editables)
  const svgAnillo = (p, color) => { const r = 42, c = 2 * Math.PI * r, f = Math.max(0, Math.min(100, p)) / 100; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#E1E6EC" stroke-width="11"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="#${color}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(c * f).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 50 50)"/></svg>`; };
  const coord = (lat, lon) => lat == null ? REG : `${Math.abs(lat).toFixed(3)}° ${lat < 0 ? 'S' : 'N'},  ${Math.abs(lon).toFixed(3)}° ${lon < 0 ? 'O' : 'E'}`;
  const mediana = a => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
  const AVISO = 'Herramienta de análisis referencial con datos abiertos del MEF. No es una herramienta de decisión ni reemplaza la información oficial de la entidad.';
  let IMG = null;
  async function imagenes(D) {
    if (IMG) return IMG; const o = {};
    if (!D.geo && typeof fetch !== 'undefined' && typeof document !== 'undefined') { try { D.geo = await (await fetch('geo/peru_departamentos.json', { cache: 'force-cache' })).json(); } catch (e) { D.geo = null; } }
    await Promise.all([...Object.keys(ICO).map(async n => { o[n] = await png(svgIco(n), 96, 96); }), (async () => { o.f1 = await png(svgFondo(NAVY, NAVY2), 1333, 750, NAVY); o.f2 = await png(svgFondo(NAVY2, NAVY), 1333, 750, NAVY); o.montes = await png(svgMontes(), 800, 132);
      const A = root.ACIERTA; if (A && A.isoSVG) { const iso = ring => A.isoSVG({ size: 400, ring }).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '); o.logoW = await png(iso('#FFFFFF'), 240, 240); o.logoN = await png(iso('#' + NAVY), 240, 240, FONDO); } })()]);
    return IMG = o;
  }
  const mapaPng = (D, pts, w, h, oscuro) => D.geo ? png(svgMapa(D.geo, D.ue.dpto, pts, w, h, oscuro), w, h, 'FFFFFF') : null;

  // ───────────── piezas ─────────────
  const marca = (s, D, oscuro, x, y, d) => { x = x == null ? W - 3.35 : x; y = y == null ? 0.3 : y; d = d || 0.7; const L = oscuro ? IMG.logoW : IMG.logoN; if (L) s.addImage({ data: L, x, y, w: d, h: d }); T(s, D.marca.toUpperCase(), { x: x + d + 0.05, y, w: 2.0, h: d, fontSize: 14, bold: true, color: oscuro ? 'FFFFFF' : NAVY, charSpacing: 6, valign: 'middle' }); };
  const T = (s, t, o) => s.addText(t, Object.assign({ fontFace: FB, margin: 0, isTextBox: true }, o));
  const circulo = (s, x, y, d, color, ico) => { s.addShape('ellipse', { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 } }); s.addImage({ data: IMG[ico], x: x + d * 0.24, y: y + d * 0.24, w: d * 0.52, h: d * 0.52 }); };
  const tarjeta = (s, x, y, w, h, fill) => s.addShape('roundRect', { x, y, w, h, fill: { color: fill || 'FFFFFF' }, line: { color: BORDE, width: 0.75 }, rectRadius: 0.12, shadow: sombra() });
  const pastilla = (s, x, y, w, h, color, texto) => { s.addShape('roundRect', { x, y, w, h, fill: { color }, line: { color, width: 0 }, rectRadius: 0.5 }); T(s, texto, { x, y, w, h, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', charSpacing: 1.5 }); };
  function pie(s, D, n, total, oscuro) {
    const c = oscuro ? '8FA3B8' : MUT;
    T(s, [{ text: `${titulo(D.ue.nombre)}  ·  datos abiertos del MEF al ${D.corte}${D.anio ? '  ·  año ' + D.anio : ''}`, options: { breakLine: true } }, { text: AVISO, options: {} }], { x: 0.6, y: H - 0.62, w: W - 2.2, h: 0.5, fontSize: 10.5, color: c, valign: 'bottom' });
    if (n) T(s, `${n} / ${total}`, { x: W - 1.6, y: H - 0.42, w: 1.0, h: 0.3, fontSize: 11, color: c, align: 'right' });
  }
  function marco(px, D, tit, sub, n, total, ico, color) {
    const s = px.addSlide(); s.background = { color: FONDO };
    s.addShape('ellipse', { x: W - 2.2, y: -1.6, w: 4.2, h: 4.2, fill: { color: NAVY, transparency: 96 }, line: { color: NAVY, transparency: 100, width: 0 } });
    s.addShape('ellipse', { x: W - 1.3, y: -0.9, w: 2.6, h: 2.6, fill: { color: ORO, transparency: 94 }, line: { color: ORO, transparency: 100, width: 0 } });
    let x = 0.6; if (ico) { circulo(s, 0.6, 0.45, 0.6, color || NAVY, ico); x = 1.4; }
    T(s, tit, { x, y: 0.38, w: 10.2, h: 0.7, fontFace: FH, fontSize: 34, bold: true, color: NAVY, valign: 'middle' });
    if (sub) T(s, sub, { x, y: 1.08, w: 10.6, h: 0.4, fontSize: 15, color: MUT });
    marca(s, D, false);
    pie(s, D, n, total);
    return s;
  }
  function kpi(s, x, y, w, h, ico, color, etiqueta, valor, sub) {
    tarjeta(s, x, y, w, h); circulo(s, x + 0.22, y + 0.22, 0.5, color, ico);
    T(s, etiqueta, { x: x + 0.85, y: y + 0.22, w: w - 1.0, h: 0.5, fontSize: 14, color: MUT, valign: 'middle' });
    T(s, valor, { x: x + 0.22, y: y + 0.8, w: w - 0.4, h: 0.6, fontFace: FH, fontSize: ajusta(valor, w - 0.4, 26), bold: true, color: TINTA, valign: 'middle' });
    if (sub) T(s, sub, { x: x + 0.22, y: y + 1.4, w: w - 0.4, h: 0.3, fontSize: 12.5, color: MUT });
  }
  function dona(s, x, y, w, h, av, etiqueta, color) {
    const c = color || sem(av); s.addChart('doughnut', [{ name: 'Avance', labels: ['Ejecutado', 'Pendiente'], values: [Math.round(av * 10) / 10, Math.max(0, 100 - Math.round(av * 10) / 10)] }],
      { x, y, w, h, holeSize: 72, showLegend: false, showTitle: false, showValue: false, showPercent: false, chartColors: [c, 'E1E6EC'], dataBorder: { pt: 0, color: 'FFFFFF' } });
    T(s, f1(av) + ' %', { x: x + w * 0.15, y: y + h * 0.34, w: w * 0.7, h: h * 0.22, fontFace: FH, fontSize: Math.min(44, Math.round(w * 15)), bold: true, color: TINTA, align: 'center', valign: 'middle', fit: 'shrink' });
    T(s, etiqueta, { x: x + w * 0.15, y: y + h * 0.56, w: w * 0.7, h: 0.3, fontSize: 12, color: MUT, align: 'center' });
  }
  function tabla(s, x, y, w, filas, cols, opts) {
    const head = cols.map(c => ({ text: c.t, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, fontSize: 12, align: c.a || 'left', valign: 'middle', fontFace: FB } }));
    const body = filas.map((r, i) => r.map((v, j) => { const o = typeof v === 'object' && v && v.text != null; return { text: o ? v.text : String(v ?? ''), options: Object.assign({ fontSize: 12, color: TINTA, fontFace: FB, align: cols[j].a || 'left', valign: 'middle', fill: { color: i % 2 ? HIELO : 'FFFFFF' } }, o ? v.options : {}) }; }));
    s.addTable([head, ...body], Object.assign({ x, y, w, colW: cols.map(c => c.w), border: { type: 'solid', pt: 0.5, color: BORDE }, rowH: 0.42, margin: 0.06, autoPage: false }, opts || {}));
  }

  // ───────────── láminas ─────────────
  function portada(px, D) {
    const s = px.addSlide(); s.addImage({ data: IMG.f1, x: 0, y: 0, w: W, h: H }); s.addImage({ data: IMG.montes, x: 0, y: H - 2.2, w: W, h: 2.2 });
    const t = D.ue, av = pct(t.dev, t.pim), esCUI = D.tipo === 'cui';
    if (IMG.logoW) { s.addImage({ data: IMG.logoW, x: 0.75, y: 0.4, w: 1.05, h: 1.05 }); T(s, D.marca.toUpperCase(), { x: 1.9, y: 0.4, w: 4, h: 1.05, fontSize: 18, bold: true, color: 'FFFFFF', charSpacing: 10, valign: 'middle' }); } else T(s, D.marca.toUpperCase(), { x: 0.8, y: 0.6, w: 4, h: 0.5, fontSize: 18, bold: true, color: 'FFFFFF', charSpacing: 10 });
    T(s, (esCUI ? 'FICHA DE INVERSIÓN' : 'EXPEDIENTE DE INVERSIONES') + '  ·  ' + D.anio, { x: 0.8, y: 1.75, w: 8, h: 0.4, fontSize: 14, bold: true, color: ORO2, charSpacing: 3 });
    T(s, titulo(t.nombre), { x: 0.8, y: 2.2, w: 8.0, h: 1.9, fontFace: FH, fontSize: Math.max(24, Math.min(46, Math.floor(2 * 8.0 * 72 / (0.56 * t.nombre.length)))), bold: true, color: 'FFFFFF', valign: 'top' });
    T(s, [t.nivel, titulo(t.dpto), t.cod ? 'Unidad ejecutora ' + t.cod : ''].filter(Boolean).join('  ·  '), { x: 0.8, y: 4.2, w: 8, h: 0.45, fontSize: 16, color: CLARO });
    if (t.pim) {
      [['PIM ' + D.anio, fM(t.pim)], ['Devengado', fM(t.dev)], [esCUI ? 'Avance físico' : 'Inversiones', esCUI ? (fis(D.cuis[0].avance_fisico) != null ? f1(D.cuis[0].avance_fisico) + ' %' : REG) : f0(t.n_cui)]].forEach(([k, v], i) => {
        T(s, k, { x: 0.8 + i * 2.75, y: 5.1, w: 2.6, h: 0.35, fontSize: 14, color: CLARO }); T(s, v, { x: 0.8 + i * 2.75, y: 5.45, w: 2.6, h: 0.7, fontFace: FH, fontSize: 30, bold: true, color: 'FFFFFF', fit: 'shrink' }); });
      // tarjeta derecha: avance de ejecución del año
      s.addShape('roundRect', { x: 9.15, y: 1.75, w: 3.4, h: 3.55, fill: { color: 'FFFFFF', transparency: 90 }, line: { color: 'FFFFFF', transparency: 70, width: 0.75 }, rectRadius: 0.15 });
      T(s, 'Avance de ejecución ' + D.anio, { x: 9.35, y: 1.95, w: 3.0, h: 0.4, fontSize: 14, color: CLARO });
      T(s, f1(av) + ' %', { x: 9.35, y: 2.35, w: 3.0, h: 1.3, fontFace: FH, fontSize: ajusta(f1(av) + ' %', 3.0, 64), bold: true, color: 'FFFFFF', valign: 'middle' });
      T(s, 'devengado sobre el PIM', { x: 9.35, y: 3.6, w: 3.0, h: 0.35, fontSize: 13, color: CLARO });
      pastilla(s, 9.35, 4.3, 3.0, 0.6, sem(av), av >= 70 ? 'RITMO ADECUADO' : av >= 40 ? 'RITMO MODERADO' : 'RITMO LENTO');
    }
    T(s, `Elaborado con ${D.marca}${D.autor ? ' · ' + D.autor : ''} a partir de datos abiertos del MEF (Consulta Amigable y Banco de Inversiones) al ${D.corte}. ${AVISO.replace(/^Herramienta de análisis referencial con datos abiertos del MEF\. /, '')}`, { x: 0.8, y: 6.55, w: 11.8, h: 0.6, fontSize: 12, color: '8FA3B8' });
  }
  function resumen(px, D, n, total) {
    const t = D.ue, av = pct(t.dev, t.pim);
    const s = marco(px, D, `¿Cómo va la ejecución ${D.anio}?`, `${f0(t.n_cui)} inversiones con presupuesto  ·  ${t.nivel}${t.dpto ? '  ·  ' + titulo(t.dpto) : ''}`, n, total, 'chart', AZUL);
    tarjeta(s, 0.6, 1.7, 3.6, 4.6); dona(s, 0.75, 1.85, 3.3, 2.9, av, 'del PIM devengado');
    T(s, [{ text: fM(t.pim - t.dev), options: { fontFace: FH, fontSize: 26, bold: true, color: TINTA, breakLine: true } }, { text: 'saldo por ejecutar en el año', options: { fontSize: 13, color: MUT } }], { x: 0.8, y: 4.85, w: 3.2, h: 1.3, align: 'center', valign: 'middle' });
    const K = [['coins', AZUL, 'PIM ' + D.anio, t.pim, 'presupuesto vigente del año'], ['doc', AZUL, 'Certificado', t.cert, f1(pct(t.cert, t.pim)) + ' % del PIM'], ['link', AZUL, 'Comprometido', t.comp, f1(pct(t.comp, t.pim)) + ' % del PIM'],
      ['check', VERDE, 'Devengado', t.dev, 'avance ' + f1(av) + ' %'], ['bank', VERDE, 'Girado', t.gir, f1(pct(t.gir, t.dev)) + ' % del devengado'], ['clock', ORO, 'Saldo por ejecutar', t.pim - t.dev, f1(100 - av) + ' % del PIM']];
    K.forEach(([ico, c, k, v, sub], i) => kpi(s, 4.45 + (i % 3) * 2.8, 1.7 + Math.floor(i / 3) * 1.95, 2.6, 1.8, ico, c, k, fM(v), sub));
    const A = D.alertas || {}; const B = [['alert', ROJO, 'Grandes rezagadas', (A.rezago || []).length, 'PIM ≥ S/ 5 M y avance < 20 %'], ['clock', AMBAR, 'F12-B desactualizado', (A.f12b || []).length, 'PIM ≥ S/ 5 M sin registro en 90 días'], ['flag', VERDE, 'Obras por cerrar', (A.por_cerrar || []).length, 'avance físico ≥ 90 %: liquidar y cerrar']];
    B.forEach(([ico, c, k, v, sub], i) => { const x = 4.45 + i * 2.8; tarjeta(s, x, 5.6, 2.6, 0.95); circulo(s, x + 0.18, 5.82, 0.5, c, ico); T(s, String(v), { x: x + 0.78, y: 5.65, w: 0.7, h: 0.85, fontFace: FH, fontSize: 28, bold: true, color: c, valign: 'middle' }); T(s, [{ text: k, options: { bold: true, color: TINTA, fontSize: 12.5, breakLine: true } }, { text: sub, options: { color: MUT, fontSize: 10.5 } }], { x: x + 1.45, y: 5.65, w: 1.15, h: 0.85, valign: 'middle' }); });
  }
  function fuentes(px, D, n, total) {
    if (!D.fuentes.length && !D.funciones.length) return n;
    const s = marco(px, D, '¿De dónde sale y a qué va el dinero?', `PIM y devengado ${D.anio} por fuente de financiamiento y por función  ·  millones de soles`, n, total, 'coins', ORO);
    const graf = (x, titulo_, arr, ico, col) => { circulo(s, x, 1.68, 0.44, col, ico); x += 0; const tx = x + 0.6;
      const a = arr.slice(0, 5), lab = a.map(v => corto(titulo(v.nombre).replace(/canon y sobrecanon.*participaciones/i, 'Canon, regalías y participaciones'), 34));
      T(s, titulo_, { x: tx, y: 1.7, w: 5.4, h: 0.4, fontSize: 15, bold: true, color: NAVY, valign: 'middle' });
      s.addChart('bar', [{ name: 'PIM', labels: lab, values: a.map(v => +(v.pim / 1e6).toFixed(1)) }, { name: 'Devengado', labels: lab, values: a.map(v => +(v.dev / 1e6).toFixed(1)) }],
        { x, y: 2.1, w: 6.0, h: 4.3, barDir: 'bar', barGrouping: 'clustered', barGapWidthPct: 60, chartColors: [NAVY, VERDE], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontFace: FB, dataLabelFontSize: 11, dataLabelColor: TINTA, dataLabelFormatCode: '#,##0.0',
          catAxisLabelFontFace: FB, catAxisLabelFontSize: 12, catAxisLabelColor: TINTA, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, catAxisOrientation: 'maxMin', showLegend: true, legendPos: 'b', legendFontFace: FB, legendFontSize: 12, legendColor: MUT });
      // avance por fila, a la derecha del título
      T(s, a.map(v => `${corto(titulo(v.nombre), 32)}: ${f1(pct(v.dev, v.pim))} %`).join('   ·   '), { x, y: 6.45, w: 6.0, h: 0.4, fontSize: 11, color: MUT, fit: 'shrink' });
    };
    if (D.fuentes.length) graf(0.6, 'Fuentes de financiamiento', D.fuentes, 'bank', NAVY); else T(s, REG, { x: 0.6, y: 2.1, w: 6, h: 0.4, fontSize: 13, color: MUT });
    if (D.funciones.length) graf(6.95, 'Funciones (en qué se gasta)', D.funciones, 'target', VERDE); else T(s, REG, { x: 6.95, y: 2.1, w: 6, h: 0.4, fontSize: 13, color: MUT });
    return n + 1;
  }
  function ubicacion(px, D, n, total, mapa) {
    if (!mapa) return n;
    const t = D.ue, geo = D.cuis.filter(c => c.lat != null && c.lon != null), lat = mediana(geo.map(c => c.lat)), lon = mediana(geo.map(c => c.lon));
    const s = marco(px, D, '¿Dónde está la inversión?', `${f0(geo.length)} de ${f0(D.cuis.length)} inversiones con coordenadas en el Banco de Inversiones  ·  ${titulo(t.dpto || '')}`, n, total, 'map', VERDE);
    tarjeta(s, 0.6, 1.7, 5.2, 5.0); s.addImage({ data: mapa, x: 0.8, y: 1.8, w: 4.8, h: 4.8 });
    T(s, 'Cada punto es una inversión con presupuesto; el punto rojo es la sede de la entidad.', { x: 0.8, y: 6.3, w: 4.8, h: 0.35, fontSize: 10.5, color: MUT, align: 'center' });
    const dists = {}; geo.forEach(c => { const k = [c.dist, c.prov].filter(Boolean).map(titulo).join(', ') || 'Sin distrito'; (dists[k] = dists[k] || { n: 0, pim: 0, dev: 0, lat: c.lat, lon: c.lon }); dists[k].n++; dists[k].pim += c.pim || 0; dists[k].dev += c.dev || 0; });
    const top = Object.entries(dists).sort((a, b) => b[1].pim - a[1].pim).slice(0, 7);
    const cab = [['pin', ROJO, 'Sede de la entidad', coord(lat, lon)], ['users', AZUL, 'Ámbito', [t.nivel, titulo(t.dpto || '')].filter(Boolean).join('  ·  ')], ['target', VERDE, 'Distritos con inversión', f0(Object.keys(dists).length)]];
    cab.forEach(([ico, c, k, v], i) => { const x = 6.05 + i * 2.3; tarjeta(s, x, 1.7, 2.2, 1.3); circulo(s, x + 0.18, 1.88, 0.44, c, ico); T(s, k, { x: x + 0.72, y: 1.88, w: 1.4, h: 0.44, fontSize: 12, color: MUT, valign: 'middle' }); T(s, v, { x: x + 0.18, y: 2.38, w: 1.9, h: 0.55, fontFace: FH, fontSize: ajusta(v, 1.9, 16), bold: true, color: TINTA, valign: 'middle' }); });
    tabla(s, 6.05, 3.2, 6.7, top.map(([k, v]) => [corto(k, 34), f0(v.n), fM(v.pim), { text: f1(pct(v.dev, v.pim)) + ' %', options: { bold: true, color: sem(pct(v.dev, v.pim)) } }, coord(v.lat, v.lon)]),
      [{ t: 'Distrito, provincia', w: 2.3 }, { t: 'Inv.', w: 0.6, a: 'right' }, { t: 'PIM', w: 1.1, a: 'right' }, { t: 'Avance', w: 0.9, a: 'right' }, { t: 'Coordenadas', w: 1.8 }], { rowH: 0.4 });
    return n + 1;
  }
  function cartera(px, D, n0, total) {
    const rows = D.cuis, por = 10, pag = Math.max(1, Math.ceil(rows.length / por)); let n = n0;
    const cols = [{ t: 'CUI', w: 1.0 }, { t: 'Inversión', w: 6.3 }, { t: 'PIM', w: 1.3, a: 'right' }, { t: 'Devengado', w: 1.3, a: 'right' }, { t: 'Avance', w: 0.95, a: 'right' }, { t: 'Fase', w: 1.28 }];
    for (let p = 0; p < pag; p++) {
      const s = marco(px, D, `Cartera de inversiones ${D.anio}`, `${f0(rows.length)} inversiones con presupuesto  ·  ordenadas por PIM  ·  página ${p + 1} de ${pag}`, n++, total, 'list', NAVY2);
      const filas = rows.slice(p * por, (p + 1) * por).map(c => { const a = pct(c.dev, c.pim); return [c.cui, corto(titulo(c.nombre), 72), fM(c.pim), fM(c.dev), { text: f1(a) + ' %', options: { bold: true, color: sem(a) } }, faseCorta(c)]; });
      tabla(s, 0.6, 1.7, 12.13, filas, cols);
    }
    return n;
  }
  function alertas(px, D, n, total) {
    const A = D.alertas || {}; const sets = [['alert', ROJO, 'Inversiones grandes rezagadas', 'rezago', 'PIM ≥ S/ 5 M con avance financiero menor al 20 %'], ['clock', AMBAR, 'F12-B desactualizado', 'f12b', 'PIM ≥ S/ 5 M sin registro de seguimiento en 90 días'], ['flag', VERDE, 'Obras por cerrar', 'por_cerrar', 'avance físico ≥ 90 %: corresponde liquidar y cerrar']];
    if (!sets.some(s => (A[s[3]] || []).length)) return n;
    const s = marco(px, D, 'Alertas tempranas', 'lo que conviene revisar primero  ·  criterios automáticos sobre datos abiertos del MEF', n, total, 'alert', ROJO);
    sets.forEach(([ico, c, t, k, sub], i) => {
      const x = 0.6 + i * 4.1, r = (A[k] || []); tarjeta(s, x, 1.7, 3.9, 4.95); circulo(s, x + 0.25, 1.95, 0.6, c, ico);
      T(s, String(r.length), { x: x + 1.0, y: 1.85, w: 1.2, h: 0.8, fontFace: FH, fontSize: 44, bold: true, color: c, valign: 'middle' });
      T(s, [{ text: t, options: { bold: true, color: TINTA, fontSize: 14, breakLine: true } }, { text: sub, options: { color: MUT, fontSize: 11.5 } }], { x: x + 2.1, y: 1.85, w: 1.65, h: 0.8, valign: 'middle' });
      s.addShape('line', { x: x + 0.25, y: 2.85, w: 3.4, h: 0, line: { color: BORDE, width: 0.75 } });
      if (!r.length) { T(s, 'Sin casos.', { x: x + 0.25, y: 3.0, w: 3.4, h: 0.4, fontSize: 13, color: MUT }); return; }
      r.slice(0, 4).forEach((v, j) => { const yy = 3.0 + j * 0.9; T(s, [{ text: 'CUI ' + v.cui + '  ·  ' + fM(v.pim) + (k === 'f12b' && v.ult_f12b ? '  ·  F12-B ' + fecha(v.ult_f12b) : k === 'por_cerrar' && fis(v.avance_fisico) != null ? '  ·  físico ' + f1(v.avance_fisico) + ' %' : '  ·  avance ' + f1(pct(v.dev, v.pim)) + ' %'), options: { bold: true, color: c, fontSize: 12, breakLine: true } }, { text: corto(titulo(v.nombre), 95), options: { color: TINTA, fontSize: 12 } }], { x: x + 0.25, y: yy, w: 3.4, h: 0.85, valign: 'top' }); });
      if (r.length > 4) T(s, `y ${f0(r.length - 4)} más en la cartera`, { x: x + 0.25, y: 6.25, w: 3.4, h: 0.3, fontSize: 12, color: MUT });
    });
    return n + 1;
  }
  function fichaCUI(px, D, c, f, n, total, mapa, anillo) {
    f = f || {}; const av = pct(c.dev, c.pim), avF = fis(f.av_fis != null ? f.av_fis : c.avance_fisico), costo = f.costo || c.costo, devAc = f.dev_acum != null ? f.dev_acum : c.dev_acum_ant;
    const pref = /IOARR/i.test(f.tipo || c.tipo || '') ? 'IOARR' : /PROGRAMA/i.test(f.tipo || c.tipo || '') ? 'Programa de inversión' : 'Proyecto de inversión';
    const [fsTxt, fsCol, fsSub] = fase(c, f);
    const s = px.addSlide(); s.background = { color: FONDO };
    T(s, `${pref.toUpperCase()}  ·  CUI ${c.cui}` + (f.f12b || c.ult_f12b ? `  ·  último F12-B ${fecha(f.f12b || c.ult_f12b)}` : ''), { x: 0.6, y: 0.4, w: 9.0, h: 0.35, fontSize: 13, bold: true, color: ORO, charSpacing: 2 });
    const nom = corto(titulo(f.nombre || c.nombre), 210);
    T(s, nom, { x: 0.6, y: 0.75, w: 9.0, h: 1.05, fontFace: FH, fontSize: nom.length > 150 ? 16 : nom.length > 100 ? 18 : 20, bold: true, color: NAVY, valign: 'top' });
    marca(s, D, false);
    pastilla(s, W - 3.35, 1.05, 2.75, 0.45, fsCol, fsTxt); T(s, fsSub, { x: W - 3.6, y: 1.52, w: 3.0, h: 0.3, fontSize: 10.5, color: MUT, align: 'center' });
    T(s, [f.modalidad && titulo(f.modalidad.split(',')[0]), f.uei && titulo(f.uei), (f.situacion || c.situacion) ? titulo(f.situacion || c.situacion) + ' en el Banco de Inversiones' : ''].filter(Boolean).join('  ·  '), { x: 0.6, y: 1.85, w: 9.0, h: 0.35, fontSize: 12.5, color: MUT });
    // fila didáctica: dos barras de avance (acumulado y del año) + avance físico
    const barra = (x, y, w, p, col) => { s.addShape('roundRect', { x, y, w, h: 0.22, fill: { color: 'E6ECF3' }, line: { color: 'E6ECF3', width: 0 }, rectRadius: 0.11 }); if (p > 0) s.addShape('roundRect', { x, y, w: Math.max(0.22, w * Math.min(100, p) / 100), h: 0.22, fill: { color: col }, line: { color: col, width: 0 }, rectRadius: 0.11 }); };
    const panel = (x, w, ico, col, tit, p, a, b, etA, etB) => {
      tarjeta(s, x, 2.3, w, 1.75); circulo(s, x + 0.22, 2.5, 0.5, col, ico);
      T(s, tit, { x: x + 0.85, y: 2.5, w: w - 1.0, h: 0.5, fontSize: 14, color: MUT, valign: 'middle' });
      T(s, p == null ? REG : f1(p) + ' %', { x: x + 0.22, y: 3.02, w: 1.6, h: 0.5, fontFace: FH, fontSize: p == null ? 12 : 28, bold: true, color: p == null ? MUT : col, valign: 'middle' });
      T(s, [{ text: etA + ' ', options: { color: MUT } }, { text: fS(a), options: { bold: true, color: TINTA, breakLine: true } }, { text: etB + ' ', options: { color: MUT } }, { text: fS(b), options: { bold: true, color: TINTA } }], { x: x + 1.9, y: 2.98, w: w - 2.1, h: 0.6, fontSize: 11.5, valign: 'middle' });
      barra(x + 0.22, 3.68, w - 0.44, p || 0, col);
    };
    panel(0.6, 4.35, 'coins', AZUL, 'Avance financiero acumulado', costo && devAc != null ? pct(devAc, costo) : null, devAc, costo, 'Devengado', 'Costo');
    panel(5.1, 4.35, 'check', VERDE, `Ejecución del año ${D.anio}`, c.pim ? av : null, c.dev, c.pim, 'Devengado', 'PIM');
    tarjeta(s, 9.6, 2.3, 3.13, 1.75);
    if (avF != null) { s.addImage({ data: anillo, x: 9.7, y: 2.4, w: 1.55, h: 1.55 }); T(s, f1(avF) + ' %', { x: 9.7, y: 2.4, w: 1.55, h: 1.55, fontFace: FH, fontSize: ajusta(f1(avF) + ' %', 1.1, 22), bold: true, color: TINTA, align: 'center', valign: 'middle' }); T(s, [{ text: 'Avance físico', options: { bold: true, color: TINTA, fontSize: 13, breakLine: true } }, { text: 'según el último F12-B' + (f.f12b ? ' (' + fecha(f.f12b) + ')' : ''), options: { color: MUT, fontSize: 11 } }], { x: 11.3, y: 2.5, w: 1.35, h: 1.4, valign: 'middle' }); }
    else { circulo(s, 9.82, 2.5, 0.5, MUT, 'target'); T(s, 'Avance físico', { x: 10.45, y: 2.5, w: 2.2, h: 0.5, fontSize: 14, color: MUT, valign: 'middle' }); T(s, [{ text: 'Sin registro', options: { fontFace: FH, fontSize: 22, bold: true, color: MUT, breakLine: true } }, { text: 'no consta en el F12-B', options: { fontSize: 11.5, color: MUT } }], { x: 9.82, y: 3.0, w: 2.8, h: 0.9, valign: 'middle' }); }
    // situación actual
    tarjeta(s, 0.6, 4.2, 6.4, 2.65); circulo(s, 0.8, 4.4, 0.45, VERDE, 'list'); T(s, 'Situación actual (Formato 12-B)' + (f.f12b ? '  ·  ' + fecha(f.f12b) : ''), { x: 1.4, y: 4.4, w: 5.4, h: 0.45, fontSize: 14, bold: true, color: NAVY, valign: 'middle' });
    const situ = (f.situ_act || '').replace(/\s+/g, ' ').trim(); const acc = (f.acciones || c.acc || '').replace(/\s+/g, ' ').trim();
    T(s, situ ? [{ text: corto(situ, 330), options: { color: TINTA, breakLine: !!acc } }, ...(acc ? [{ text: 'Acciones previstas: ', options: { bold: true, color: NAVY } }, { text: corto(acc, 200), options: { color: TINTA } }] : [])] : REG, { x: 0.8, y: 4.95, w: 6.0, h: 1.8, fontSize: 12.5, color: situ ? TINTA : MUT, valign: 'top', paraSpaceAfter: 6 });
    // datos generales + mapa con coordenadas
    tarjeta(s, 7.2, 4.2, 5.53, 2.65);
    const dg = [['calendar', 'Inicio de ejecución', fecha(f.inicio || c.ini_fisica)], ['flag', 'Fin previsto', fecha(f.fin || c.fin_fisica)], ['doc', 'Expediente técnico', f.et_fecha ? fecha(f.et_fecha) + (f.et_monto ? '  ·  ' + fM(f.et_monto) : '') : 'sin registro'], ['users', 'Beneficiarios', f.beneficiarios || c.beneficiarios ? f0(f.beneficiarios || c.beneficiarios) : 'sin registro']];
    dg.forEach(([ico, k, v], i) => { circulo(s, 7.4, 4.42 + i * 0.6, 0.4, NAVY2, ico); T(s, [{ text: k, options: { color: MUT, fontSize: 11, breakLine: true } }, { text: String(v), options: { bold: v !== REG, color: v === REG ? MUT : TINTA, fontSize: 12.5 } }], { x: 7.9, y: 4.35 + i * 0.6, w: 2.6, h: 0.55, valign: 'middle', fit: 'shrink' }); });
    if (mapa) s.addImage({ data: mapa, x: 10.6, y: 4.3, w: 2.0, h: 1.75 }); else circulo(s, 11.35, 4.7, 0.6, MUT, 'pin');
    T(s, [{ text: [c.dist, c.prov, c.dpto].filter(Boolean).map(titulo).join(' / ') || REG, options: { bold: true, color: TINTA, fontSize: 11.5, breakLine: true } }, { text: coord(c.lat, c.lon), options: { color: MUT, fontSize: 11 } }], { x: 10.5, y: 6.05, w: 2.2, h: 0.7, align: 'center', valign: 'top', fit: 'shrink' });
    // componentes (barra inferior)
    const comps = (f.comp || []).slice(0, 3).map(cp => { const tot = cp.a.reduce((s2, a) => s2 + (+a.c || 0), 0); return corto(titulo(cp.n.replace(/^\d+[\.\)\-]?\s*/, '')), 48) + (tot ? '  ·  ' + fM(tot) : ''); });
    if (comps.length) T(s, [{ text: 'Componentes:  ', options: { bold: true, color: NAVY } }, { text: comps.join('    |    '), options: { color: TINTA } }], { x: 0.6, y: 6.92, w: 12.13, h: 0.28, fontSize: 11, fit: 'shrink' });
    T(s, AVISO, { x: 0.6, y: 7.2, w: W - 2.2, h: 0.25, fontSize: 10, color: MUT }); T(s, `${n} / ${total}`, { x: W - 1.6, y: 7.2, w: 1.0, h: 0.25, fontSize: 11, color: MUT, align: 'right' });
  }
  function cierre(px, D, n, total) {
    const t = D.ue, av = pct(t.dev, t.pim), A = D.alertas || {}, mes = new Date().getMonth() + 1, meses = Math.max(1, 12 - mes);
    const s = px.addSlide(); s.addImage({ data: IMG.f2, x: 0, y: 0, w: W, h: H }); s.addImage({ data: IMG.montes, x: 0, y: H - 2.2, w: W, h: 2.2 });
    marca(s, D, true, W - 3.35, 0.45, 0.75); T(s, 'Decisiones sugeridas', { x: 0.8, y: 0.5, w: 9, h: 0.75, fontFace: FH, fontSize: 36, bold: true, color: 'FFFFFF' });
    T(s, `para los ${meses} meses que quedan del ${D.anio}  ·  ${titulo(t.nombre)}`, { x: 0.8, y: 1.25, w: 11.5, h: 0.4, fontSize: 15, color: CLARO });
    const S = [];
    if (av < 40) S.push(['alert', ROJO, 'Acelerar el devengado', `Con ${f1(av)} % de avance, quedan ${fM(t.pim - t.dev)} por ejecutar. Se sugiere priorizar las inversiones con certificación y contrato vigentes para evitar reversión de saldos.`]);
    if ((A.rezago || []).length) S.push(['flag', AMBAR, 'Destrabar las grandes rezagadas', `${f0(A.rezago.length)} inversiones de más de S/ 5 M tienen avance menor al 20 %. Se recomienda revisar en comité la causa (expediente, contratación, terreno) y fijar hitos quincenales.`]);
    if ((A.f12b || []).length) S.push(['clock', AZUL, 'Actualizar el seguimiento (F12-B)', `${f0(A.f12b.length)} inversiones grandes llevan más de 90 días sin registro. El registro mensual es obligación de la UEI y sustenta la programación del gasto.`]);
    if ((A.por_cerrar || []).length) S.push(['check', VERDE, 'Cerrar lo que ya está terminado', `${f0(A.por_cerrar.length)} obras superan el 90 % de avance físico. Se sugiere programar recepción, liquidación y el Formato 09 de cierre para liberar saldos.`]);
    if (pct(t.comp, t.pim) < 60 && S.length < 4) S.push(['link', ORO, 'Asegurar los compromisos', `Solo ${f1(pct(t.comp, t.pim))} % del PIM está comprometido. Se recomienda revisar el plan anual de contrataciones y los procesos pendientes de adjudicar.`]);
    if (!S.length) S.push(['check', VERDE, 'Mantener el ritmo', 'Los indicadores no muestran alertas automáticas. Se sugiere sostener el registro mensual del F12-B y la programación de la cartera.']);
    S.slice(0, 4).forEach(([ico, c, k, txt], i) => { const x = 0.8 + i * 2.98, w = 2.78; s.addShape('roundRect', { x, y: 1.95, w, h: 3.6, fill: { color: 'FFFFFF', transparency: 90 }, line: { color: 'FFFFFF', transparency: 70, width: 0.75 }, rectRadius: 0.15 }); circulo(s, x + 0.25, 2.2, 0.6, c, ico); T(s, k, { x: x + 0.25, y: 2.95, w: w - 0.5, h: 0.7, fontFace: FH, fontSize: 17, bold: true, color: 'FFFFFF', valign: 'top', fit: 'shrink' }); T(s, txt, { x: x + 0.25, y: 3.65, w: w - 0.5, h: 1.8, fontSize: 12.5, color: CLARO, valign: 'top', fit: 'shrink' }); });
    s.addShape('roundRect', { x: 0.8, y: 5.8, w: 11.73, h: 0.85, fill: { color: 'E9C46A', transparency: 85 }, line: { color: 'E9C46A', width: 0.75 }, rectRadius: 0.1 });
    T(s, [{ text: 'Aviso: ', options: { bold: true } }, { text: `estas sugerencias fueron elaboradas con inteligencia artificial a partir de datos abiertos del MEF al ${D.corte}. No constituyen información oficial, no son una herramienta de decisión ni reemplazan el análisis de la entidad; recomendamos su revisión por los responsables antes de tomar cualquier decisión.` }], { x: 1.0, y: 5.85, w: 11.33, h: 0.75, fontSize: 12, color: 'FFFFFF', valign: 'middle' });
    T(s, `Fuentes: MEF – Consulta Amigable (Transparencia Económica) y Banco de Inversiones (Invierte.pe), consultados al ${D.corte}  ·  ${D.marca}${D.autor ? ' · ' + D.autor : ''}`, { x: 0.8, y: 6.85, w: 11.73, h: 0.35, fontSize: 11, color: '8FA3B8' });
    T(s, `${n} / ${total}`, { x: W - 1.6, y: H - 0.5, w: 1.0, h: 0.3, fontSize: 11, color: '8FA3B8', align: 'right' });
  }

  async function construir(px, D) {
    await imagenes(D);
    const mapaDe = async c => c.lat != null ? await mapaPng(D, [[c.lat, c.lon, 1]], 400, 350) : null;
    const anilloDe = async (c, f) => { const v = fis((f || {}).av_fis != null ? f.av_fis : c.avance_fisico); return v == null ? null : await png(svgAnillo(v, sem(v)), 320, 320, 'FFFFFF'); };
    // las imágenes repetidas (logo, íconos) se guardan una sola vez en el archivo: menos peso y la mitad de tiempo de empaquetado
    const dedupe = () => { const seen = new Map(); (px.slides || []).forEach(sl => (sl._relsMedia || []).forEach(r => { if (!r.data) return; if (seen.has(r.data)) r.Target = seen.get(r.data); else seen.set(r.data, r.Target); })); };
    px.defineLayout({ name: 'W', width: W, height: H }); px.layout = 'W';
    px.author = D.autor || D.marca; px.title = (D.tipo === 'cui' ? 'Ficha ' : 'Expediente ') + titulo(D.ue.nombre);
    if (D.tipo === 'cui') { const c = D.cuis[0]; portada(px, D); fichaCUI(px, D, c, D.fichas[c.cui], 2, 2, await mapaDe(c), await anilloDe(c, D.fichas[c.cui])); dedupe(); return 2; }
    const fichas = D.cuis.filter(c => D.fichas[c.cui]).slice(0, D.maxFichas || 30);
    const nCart = Math.max(1, Math.ceil(D.cuis.length / 10)), hayFF = !!(D.fuentes.length || D.funciones.length), hayAl = D.alertas && ['rezago', 'f12b', 'por_cerrar'].some(k => (D.alertas[k] || []).length);
    const geo = D.cuis.filter(c => c.lat != null), mapaUE = geo.length ? await mapaPng(D, [...geo.map(c => [c.lat, c.lon, 0]), [mediana(geo.map(c => c.lat)), mediana(geo.map(c => c.lon)), 1]], 720, 720) : null;
    const total = 3 + (hayFF ? 1 : 0) + (mapaUE ? 1 : 0) + nCart + (hayAl ? 1 : 0) + fichas.length;
    portada(px, D); resumen(px, D, 2, total); let n = fuentes(px, D, 3, total); n = ubicacion(px, D, n, total, mapaUE); n = cartera(px, D, n, total); n = alertas(px, D, n, total);
    for (const c of fichas) fichaCUI(px, D, c, D.fichas[c.cui], n++, total, await mapaDe(c), await anilloDe(c, D.fichas[c.cui]));
    cierre(px, D, n, total); dedupe();
    return total;
  }
  const api = { construir };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Expediente = api;
})(typeof window !== 'undefined' ? window : globalThis);
