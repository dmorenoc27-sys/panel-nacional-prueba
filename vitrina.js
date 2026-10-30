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

  /* ficha publica de una entidad: lo que ya publica el MEF + puesto + cuantas inversiones conviene revisar (sin decir cuales) */
  async function ue(el, U, UES) {
    const av = U.pim ? 100 * U.dev / U.pim : 0, s = sem(av), niv = NIVN[U.nivel] || NIVN.E;
    const pares = UES.filter(x => x.nivel === U.nivel && x.pim > 0).sort((a, b) => (b.dev / b.pim) - (a.dev / a.pim));
    const pos = pares.findIndex(x => x.cod === U.cod) + 1;
    const rv = (await conteos())[U.cod] || 0, n = typeof rv === 'number' ? rv : (rv.n || 0), f = await consulta();
    const mot = typeof rv === 'object' ? Object.keys(MOT).filter(k => rv[k]).sort((a, b) => rv[b] - rv[a]) : [];
    try { localStorage.setItem('ultima_ue', JSON.stringify({ cod: U.cod, nombre: U.nombre })); } catch (e) { }
    el.innerHTML = `<section class="vt card" aria-label="Ficha pública de ${esc(U.nombre)}">
      <header class="vt-h"><small>${niv[1]}${U.dpto ? ' · ' + esc(U.dpto) : ''}</small><h1 class="pd-title">${esc(U.nombre)}</h1></header>
      <div class="vt-grid">
        <div class="vt-av ${s}"><b>${av.toFixed(1)}<i>%</i></b><span>de su inversión ${new Date().getFullYear()} ejecutada</span>
          <div class="vt-bar"><i style="width:${Math.min(100, av).toFixed(1)}%"></i></div>
          <small>${M(U.dev)} devengados de ${M(U.pim)} · ${N(U.n_cui)} inversiones</small></div>
        <div class="vt-pos"><b>${pos ? N(pos) : '–'}</b><span>de ${N(pares.length)} ${niv[0]}</span><small>puesto por avance de ejecución</small></div>
        <div class="vt-rev"><b>${N(n)}</b><span>${n === 1 ? 'inversión conviene revisar hoy' : 'inversiones conviene revisar hoy'}</span>
          ${mot.length ? `<ul class="vt-mot">${mot.map(k => `<li><b>${N(rv[k])}</b> ${MOT[k]}</li>`).join('')}</ul>` : ''}
          <div class="vt-ghost" aria-hidden="true">${'<i></i>'.repeat(Math.min(3, Math.max(2, n)))}</div>
          <small>${mot.length > 1 ? 'Una inversión puede tener más de un motivo. ' : ''}Con Acierta tu equipo ve cuáles son y qué se sugiere hacer.</small></div>
      </div>
      <div class="vt-pie"><div><h2>Lo que tu entidad ve con Acierta</h2>${mods()}</div>
        <div class="vt-ofe"><p>${BAJO}</p>
        ${cta('Acierta: prueba para ' + U.nombre + ' (UE ' + U.cod + ')')}
        <p class="vt-xl">Llévate el reporte listo en Excel y PowerPoint para tu reunión.</p>
        <p class="vt-f">Datos de la Consulta Amigable y del Banco de Inversiones del MEF consultados el ${f}.</p></div></div>
    </section>`;
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
    const fila = (x, i, yo) => `<a class="vt-rk${yo ? ' yo' : ''}" href="#/ue/${esc(x.u.cod)}"><span class="vt-n">${N(i + 1)}</span><span class="vt-nom" title="${esc(x.u.nombre)}">${esc(x.u.nombre)}</span><span class="vt-b ${sem(x.av)}"><i style="width:${Math.min(100, x.av).toFixed(1)}%"></i></span><b>${x.av.toFixed(1)} %</b></a>`;
    const top = ls.slice(0, 5).map((x, i) => fila(x, i, i === iu)).join('');
    const yo = iu >= 5 ? `<div class="vt-gap" aria-hidden="true">···</div>${fila(ls[iu], iu, true)}` : '';
    const resto = Math.max(0, ls.length - 5 - (iu >= 5 ? 1 : 0));
    t.innerHTML = `<div class="vt-tab"><p class="vt-tt"><b>Ranking de ejecución${ambito ? ' · ' + esc(ambito) : ''}</b> · ${N(ls.length)} entidades, por avance (devengado / PIM)</p>
      <div class="vt-rks">${top}${yo}</div>
      ${resto ? `<div class="vt-blur" aria-hidden="true">${'<i></i>'.repeat(Math.min(3, resto))}</div><p class="vt-mas"><span class="vt-lk">${candado}</span>${N(resto)} entidades más, con sus inversiones y alertas, para las entidades con Acierta.</p>` : ''}
      ${cta('Acierta: quiero ver el ranking completo', 'Ver el ranking completo de tu región')}</div>`;
    document.querySelectorAll('#filt,#tabs').forEach(x => x.hidden = true);
  }
  window.Vitrina = { listo, ue, bloqueo, tablas, conteos, get activa() { return acceso === false; } };
})();
