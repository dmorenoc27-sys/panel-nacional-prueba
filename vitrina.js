/* vitrina.js — 30/10/2026 (estrategia comercial de David): sin contrato se ve solo lo que ya publica el MEF y una pista de lo que
   Acierta encontró; el detalle (listas, CUI, alertas, contrataciones, proveedores, calendario, Excel, PPT, SIAF) es para entidades
   con contrato o en prueba. El candado real esta en el servidor: data/, reportes/ y pi/ van detras de Cloudflare Access; esta pantalla
   solo muestra que hay detras y como pedirlo. Para la demo o pruebas: ?vitrina en la URL fuerza el modo sin acceso. */
(function () {
  const MAIL = 'consultas@arkaproyectos.com.pe';
  const NIVN = { M: ['municipalidades', 'Municipalidad'], R: ['gobiernos regionales', 'Gobierno regional'], E: ['entidades del Gobierno nacional', 'Gobierno nacional'] };
  const N = v => (v || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  const M = v => 'S/ ' + ((v || 0) / 1e6).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' M';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sem = av => av >= 70 ? 'ok' : av >= 40 ? 'warn' : 'bad';
  const MODS = [
    ['Inversiones públicas', 'Cada CUI con su avance, mapa, ficha y lo que toca cerrar'],
    ['Alertas', 'Cuáles son las inversiones que conviene revisar hoy y por qué'],
    ['Contrataciones', 'Qué se contrató, con quién y qué contratos tienen problemas'],
    ['Proveedores', 'Sanciones, penalidades y contratos resueltos de cada RUC'],
    ['Calendario de plazos', 'F12-B, devengado, girado y PMI, con semáforo'],
    ['Presupuesto y tesorería', 'Lo que queda por ejecutar y cuánto podrás pagar cada mes'],
    ['Expediente PPT y Excel', 'Listos para el despacho, a la fecha de corte'],
    ['Mi entidad con tu SIAF', 'Expediente por expediente, cargado por tu propia entidad'],
  ];
  let acceso = null, revisar = null;
  const forzada = /[?&]vitrina\b/.test(location.search) || /[?&]vitrina\b/.test(location.hash);
  function listo() {
    if (acceso !== null) return Promise.resolve(acceso === false);
    if (forzada) { acceso = false; return Promise.resolve(true); }
    return (window.ACCESO || Promise.resolve(true)).then(ok => { acceso = !!ok; return !acceso; });
  }
  function conteos() {
    if (!revisar) revisar = fetch('pub/revisar.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
    return revisar;
  }
  const cta = (asunto, txt) => `<div class="vt-cta">
      <a class="btn p" href="mailto:${MAIL}?subject=${encodeURIComponent(asunto)}" data-vt="prueba">${txt || 'Ver cuáles son y por qué: prueba 7 días con tu correo institucional'}</a>
      <a class="btn" href="/entrar/" data-vt="entrar">Ya tengo acceso: ingresar</a></div>`;
  const BAJO = 'Preparamos para tu equipo el detalle de cada inversión: nombre, CUI, motivo y próximos plazos. Así puedes anticiparte con tiempo y decidir con información verificada a diario contra el MEF. Actívalo gratis por 7 días con tu correo institucional.';
  const MOT = { prob: 'con una dificultad declarada en el Formato 12-B', sinET: 'sin expediente técnico registrado', sinEjec: 'con presupuesto y sin ejecución este año', prog: 'por debajo de lo programado en el Formato 12-B', pagos: 'con pagos pendientes de girar' };
  let fecha = null;
  const consulta = () => fecha || (fecha = fetch('pub/resumen.json').then(r => r.json()).then(r => { const c = String(r.corte || '').slice(0, 10).split('-'); return c.length === 3 ? `${c[2]}/${c[1]}/${c[0]}` : ''; }).catch(() => ''));
  const candado = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="9.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
  const mods = () => `<ul class="vt-mods">${MODS.map(([t, d]) => `<li><span class="vt-lk">${candado}</span><b>${t}</b><small>${d}</small></li>`).join('')}</ul>`;

  /* ficha publica de una entidad (30/10, David): abierta hasta el tablero de la entidad, igual que la version con acceso
     (encabezado, cifras del MEF, indice y los modulos con sus numeros); todo lo que hay debajo de cada modulo va con candado */
  let fic = null;
  const fichas = () => fic || (fic = fetch('pub/fichas.json').then(r => r.ok ? r.json() : {}).catch(() => ({})));
  const NIVH = { M: 'Gobiernos locales', R: 'Gobiernos regionales', E: 'Gobierno nacional' };
  const TITULOS = { inv: 'Inversiones públicas', sea: 'Contrataciones', pres: 'Presupuesto', pi: 'Incentivos y metas', al: 'Alertas', flujo: 'Tesorería', prov: 'Proveedores', cierre: 'Transferencia de gestión', cal: 'Calendario de plazos', idx: 'Índice de seguimiento Acierta', ppt: 'Expediente PPT', mapa: 'Mapa de inversiones', ges: 'Seguimiento de inversiones', norma: 'Reglamento 2026' };
  function candadoDetalle(id, U, rv) {
    const RU = window.ResumenInversionUtil, t = TITULOS[id] || 'Detalle de la entidad';
    const mot = id === 'al' && rv && typeof rv === 'object' ? Object.keys(MOT).filter(k => rv[k]).sort((a, b) => rv[b] - rv[a]) : [];
    const html = `<div class="vt-sola vt-ov"><span class="vt-lk vt-lk-g">${candado}</span>
      <h2 class="vt-ovh">${id === 'al' && rv ? `${N(typeof rv === 'number' ? rv : rv.n)} inversiones conviene revisar hoy` : `${esc(t)}: este detalle es para las entidades con Acierta`}</h2>
      ${mot.length ? `<ul class="vt-mot">${mot.map(k => `<li><b>${N(rv[k])}</b> ${MOT[k]}</li>`).join('')}</ul>` : ''}
      <p>${BAJO}</p>${cta('Acierta: ' + t + ' para ' + U.nombre + ' (UE ' + U.cod + ')')}</div>`;
    if (RU) RU.verDetalleResumen('🔒', `${t.toUpperCase()} · ${esc(U.nombre)}`, html);
    try { window.track && track('vitrina', { ue: U.cod, modulo: id }); } catch (e) { }
  }
  async function ue(el, U) {
    const [cts, fcs] = await Promise.all([conteos(), fichas()]);
    const rv = cts[U.cod] || 0, n = typeof rv === 'number' ? rv : (rv.n || 0), F = fcs[U.cod] || {};
    const av = U.pim ? 100 * U.dev / U.pim : 0, TIT = window.TIT || (x => x), anio = typeof ANIO !== 'undefined' ? ANIO : new Date().getFullYear();
    try { localStorage.setItem('ultima_ue', JSON.stringify({ cod: U.cod, nombre: U.nombre })); } catch (e) { }
    el.innerHTML = `<div class="card" style="flex:0 0 auto;padding:0"><div class="pd-hdr" style="border-radius:var(--rad)"><div class="pd-cui">${NIVH[U.nivel] || ''}${U.dpto ? ' · ' + esc(U.dpto) : ''}${U.nivel === 'M' && U.prov_n ? ' · Provincia de ' + esc(U.prov_n) : ''}${U.nivel === 'M' && U.dist_n && /DISTRITAL/i.test(U.nombre || '') ? ' · Distrito de ' + esc(U.dist_n) : ''}</div><h1 class="pd-title">${esc(TIT(U.nombre))}</h1><div class="pd-badges"><span class="pd-badge ${sem(av)}">avance ${av.toFixed(1)} %</span><span class="pd-badge">${N(U.n_cui)} inversiones ${anio}</span>${n ? `<span class="pd-badge bad">${N(n)} para revisar</span>` : ''}</div></div></div>
      <div class="card" style="flex:1;min-height:0;padding:0"><div class="wrap" id="uep-wrap" style="padding:0"></div></div>`;
    const w = el.querySelector('#uep-wrap');
    if (typeof window.ResumenInversion !== 'function') return;
    const T = { pim: U.pim, cert: U.cert, comp_anual: U.comp, comp: U.comp, dev: U.dev, gir: U.gir };
    const items = Array.from({ length: U.n_cui || 0 }, () => ({ act_proy: '', c: {} }));   // solo cuantas son; el detalle de cada una va con candado
    const kpi = (id, TT, extra) => { const RU = window.ResumenInversionUtil; if (!RU) return; const pim1 = U.pim || 1, F2 = v => 'S/ ' + Number(v || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
      const bar = (l, v, pc) => `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;margin-bottom:3px"><span>${l}</span><span>${F2(v)}${pc != null ? ' · ' + Math.round(pc) + ' %' : ''}</span></div><div class="vt-bar" style="--c:var(--p)"><i style="width:${pc != null ? Math.min(pc, 100) : 100}%"></i></div></div>`;
      if (id === 'fuentes') return RU.verDetalleResumen('🏦', 'POR FUENTE DE FINANCIAMIENTO', (extra || []).map(f => `<div style="margin-bottom:14px"><b>${esc(f.nombre)}</b>${bar('PIM', f.pim)}${bar('Devengado', f.dev, f.pim ? 100 * f.dev / f.pim : null)}</div>`).join('') || '<p>Sin fuentes con presupuesto.</p>');
      if (id === 'benef') return RU.verDetalleResumen('👥', 'BENEFICIARIOS DIRECTOS', `<p>Hasta ${N(F.ben)} habitantes: es el dato de la inversión con más beneficiarios declarados en el MEF (no se suman entre inversiones porque la misma población se repite) · ${N(F.bn)} de ${N(U.n_cui)} con dato registrado.</p>`);
      RU.verDetalleResumen('📊', 'EJECUCIÓN PRESUPUESTAL', bar('PIM', U.pim) + bar('Certificación', U.cert, 100 * U.cert / pim1) + bar('Comprometido', U.comp, 100 * U.comp / pim1) + bar('Devengado', U.dev, 100 * U.dev / pim1) + bar('Girado', U.gir, 100 * U.gir / pim1) + '<p style="font-size:11px;color:var(--mut)">Fuente: Transparencia Económica, MEF</p>'); };
    window.ResumenInversion(w, T, items, { nivel: U.nivel, ue: U.cod, nombre: U.nombre, cierre: U.nivel === 'M' || U.nivel === 'R', fts: F.f || [],
      beneficiarios: U.n_cui ? { total: F.ben || 0, conDato: F.bn || 0 } : null, nAlertas: n, indice: F.idx == null ? null : F.idx,
      onNav: id => candadoDetalle(id, U, rv), onKpi: kpi, onCuiGoto: () => candadoDetalle('inv', U, rv), onEstSel: () => candadoDetalle('inv', U, rv) });
    // lo que el tablero abre por dentro (cartera, mapa, cada inversion) tambien va con candado
    w.addEventListener('click', e => { const t = e.target.closest('[data-go],[data-sub],[data-inv-goto],[data-est],.ca-card');
      if (!t || !w.contains(t) || t.closest('.vt-ov')) return; e.preventDefault(); e.stopImmediatePropagation(); candadoDetalle(t.dataset.go || t.dataset.sub || 'inv', U, rv); }, true);
    try { window.track && track('vitrina', { ue: U.cod }); } catch (e) { }
  }

  /* cualquier vista de detalle sin contrato */
  function bloqueo(el, titulo, texto) {
    el.innerHTML = `<section class="vt card vt-sola" aria-label="${esc(titulo)}">
      <span class="vt-lk vt-lk-g">${candado}</span><h1 class="pd-title">${esc(titulo)}</h1>
      <p>${esc(texto || BAJO)}</p>
      ${mods()}${cta('Acierta: quiero ver ' + titulo)}</section>`;
    try { window.track && track('vitrina', { vista: titulo }); } catch (e) { }
  }

  /* tablas de rankings y listas del tablero: en su lugar, el aviso */
  function tablas(lista, ambito) {
    const t = document.getElementById('tabla'); if (!t) return;
    const ls = (lista || []).filter(u => u.pim > 0).map(u => ({ u, av: 100 * u.dev / u.pim })).sort((a, b) => b.av - a.av);
    let ult = null; try { ult = JSON.parse(localStorage.getItem('ultima_ue') || 'null'); } catch (e) { }
    const iu = ult ? ls.findIndex(x => x.u.cod === String(ult.cod)) : -1;
    // 30/10 (David): el ranking va completo y abierto (cifras publicas del MEF); cada entidad abre su ficha publica y muestra cuantas
    // inversiones conviene revisar. Lo que sigue con candado es cuales son, sus motivos y todo el detalle.
    const fila = (x, i, yo, rv) => { const n = rv ? (typeof rv === 'number' ? rv : rv.n) : 0;
      return `<a class="vt-rk${yo ? ' yo' : ''}" href="#/ue/${esc(x.u.cod)}"${yo ? ' id="vt-yo"' : ''}><span class="vt-n">${N(i + 1)}</span><span class="vt-nom" title="${esc(x.u.nombre)}">${esc(x.u.nombre)}</span><span class="vt-b ${sem(x.av)}"><i style="width:${Math.min(100, x.av).toFixed(1)}%"></i></span><b>${x.av.toFixed(1)} %</b><span class="vt-rv">${n ? `${candado}${N(n)} por revisar` : ''}</span></a>`; };
    t.innerHTML = `<div class="vt-tab vt-full"><div class="vt-cab"><p class="vt-tt"><b>Ranking de ejecución${ambito ? ' · ' + esc(ambito) : ''}</b> · ${N(ls.length)} entidades, por avance (devengado / PIM). Cada una abre su ficha.</p>
      ${cta('Acierta: quiero ver qué revisar en mi entidad', 'Ver cuáles son y por qué: prueba 7 días')}</div>
      <div class="vt-rks" role="list">${ls.slice(0, 60).map((x, i) => fila(x, i, i === iu)).join('')}</div></div>`;
    const caja = t.querySelector('.vt-rks');
    conteos().then(rv => {   // con los conteos, la lista completa (por tramos para no trabar la pantalla en 1,894 filas)
      caja.innerHTML = ls.map((x, i) => fila(x, i, i === iu, rv[x.u.cod])).join('');
      const yo = caja.querySelector('#vt-yo'); let sc = caja;
      while (sc && sc !== document.body && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
      if (yo && sc && sc !== document.body) sc.scrollTop += yo.getBoundingClientRect().top - sc.getBoundingClientRect().top - sc.clientHeight / 2;
    });
    document.querySelectorAll('#filt,#tabs').forEach(x => x.hidden = true);
  }
  window.Vitrina = { listo, ue, bloqueo, tablas, conteos, get activa() { return acceso === false; } };
})();
