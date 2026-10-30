/* motion.js — movimiento de Acierta con GSAP: entrada escalonada, cifras que cuentan, barras que crecen, mapa que se arma,
   indicador del menú. 29/10/2026: una sola entrada por vista, corta (≤ 8 elementos, 40 ms entre ellos), sin rebotes; las cifras cuentan desde el 72 % para no marear.
   Respeta prefers-reduced-motion: sin animación, todo queda en su estado final. Si GSAP no carga, el panel funciona igual. */
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = id => document.getElementById(id), vis = el => el && el.offsetParent !== null;
  let g = null;
  function cargarGsap() {
    return new Promise(res => {
      if (window.gsap) return res(true);
      const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'; s.integrity = 'sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt'; s.crossOrigin = 'anonymous'; s.onload = () => res(true); s.onerror = () => res(false);
      document.head.appendChild(s); setTimeout(() => res(!!window.gsap), 4000);
    });
  }
  // cifra que cuenta: anima el primer número del nodo conservando separadores, decimales, prefijo y sufijo
  function contar(el, dur) {
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.nodeValue)) || (el.firstElementChild && /\d/.test(el.firstElementChild.textContent) && !el.firstElementChild.children.length ? el.firstElementChild.firstChild : null);
    if (!tn) return; const m = tn.nodeValue.match(/^(\D*?)(\d[\d,]*)(\.\d+)?(.*)$/s); if (!m) return;
    const fin = parseFloat((m[2] + (m[3] || '')).replace(/,/g, '')), dec = m[3] ? m[3].length - 1 : 0, o = { v: fin * .72 }, txt = tn.nodeValue;
    if (!isFinite(fin) || !fin) return;
    g.to(o, { v: fin, duration: Math.min(dur || .9, .9), ease: 'power3.out', onUpdate: () => { tn.nodeValue = m[1] + o.v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + m[4]; }, onComplete: () => { tn.nodeValue = txt; } });
  }
  const sube = (els, o) => { els = els.slice(0, 8); return els.length && g.fromTo(els, { opacity: 0, y: 10 }, Object.assign({ opacity: 1, y: 0, duration: .32, ease: 'power3.out', stagger: .04, clearProps: 'transform,opacity', overwrite: true }, o || {})); };
  function barras(els) { els.forEach(b => { const w = b.style.width; if (!w || w === '0%') return; g.fromTo(b, { width: 0 }, { width: w, duration: .6, ease: 'power3.out', delay: .1, overwrite: true }); }); }

  let ult = null, chipsDe = '';
  function vista() {
    indicador();
    if (!g || RM.matches) return;
    const h = location.hash, hero0 = $('hero'), ch0 = vis(hero0) ? [...hero0.querySelectorAll('.chip')] : [];
    if (h === ult) {   // re-render de la misma vista (p. ej. llegan las alertas): no se repite la entrada; solo entran los avisos nuevos
      if (ch0.length && chipsDe !== h) { chipsDe = h; g.fromTo(ch0, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .32, stagger: .04, ease: 'power3.out', clearProps: 'transform,opacity' }); ch0.forEach(c => { const n = c.querySelector('b'); if (n) contar(n, 1.3); }); }
      return; }
    ult = h; chipsDe = ch0.length ? h : '';
    const q = s => [...document.querySelectorAll(s)].filter(vis);
    // inicio / explorar
    const tiles = q('#tiles .tile');
    if (tiles.length) { sube(tiles, { stagger: .04 }); tiles.forEach(t => { const n = t.querySelector('.num'); if (n) contar(n, 1.2); const pc = t.style.getPropertyValue('--pc'); if (pc) g.fromTo(t, { '--pc': '0%' }, { '--pc': pc, duration: .6, ease: 'power3.out', delay: .1 }); }); }
    const hero = $('hero');
    if (vis(hero)) { g.fromTo(hero, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .32, ease: 'power3.out', clearProps: 'transform,opacity' }); const b = hero.querySelector('.gauge .c b'); if (b) contar(b, 1.4);
      const ch = [...hero.querySelectorAll('.chip')]; if (ch.length) { g.fromTo(ch, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .32, stagger: .04, delay: .25, ease: 'power3.out', clearProps: 'transform,opacity' }); ch.forEach(c => { const n = c.querySelector('b'); if (n) contar(n, 1.3); }); } }
    if (vis($('rowmapa'))) g.fromTo($('rowmapa'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .32, delay: .1, ease: 'power3.out', clearProps: 'transform,opacity' });
    if (vis($('tcard'))) { g.fromTo($('tcard'), { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: .32, delay: .15, ease: 'power3.out', clearProps: 'transform,opacity' }); filas($('tcard')); }
    sube(q('#lens a'), { stagger: .04 });
    // alertas
    const al = q('#alertas .al').slice(0, 8); if (al.length) { g.fromTo(al, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .32, stagger: .04, ease: 'power3.out', clearProps: 'transform,opacity' }); al.forEach(a => { const n = a.querySelector('.n'); if (n) contar(n, 1.2); }); }
    // módulos y legal
    const mh = q('#modp .mod-hero')[0]; if (mh) { g.fromTo(mh, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: .32, ease: 'power3.out', clearProps: 'transform,opacity' }); g.fromTo(mh.querySelectorAll('.mod-k,h2,p,.mod-busca,.chips'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .32, stagger: .04, delay: .15, ease: 'power3.out', clearProps: 'transform,opacity' }); }
    const mf = q('#modp .mod-f'); if (mf.length) g.fromTo(mf, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .32, stagger: .04, delay: .3, ease: 'power3.out', clearProps: 'transform,opacity' });
    sube(q('#modp .legal, #mod-radar, #cmp > *, #cart > *, #ent > *'), { stagger: .04, delay: .1 });
    // fichas UE / CUI
    fichas();
  }
  function filas(c) { const tr = [...c.querySelectorAll('tr.l')].slice(0, 8); if (tr.length) g.fromTo(tr, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: .3, stagger: .03, delay: .15, ease: 'power3.out', clearProps: 'transform,opacity', overwrite: true }); const rb = c.querySelectorAll('.rb i'); barras([...rb].slice(0, 14)); }
  function fichas() {
    if (!g || RM.matches) return;
    const u = $('uep'), f = $('ficha');
    if (vis(u)) { sube([...u.children], { stagger: .04 }); sube([...u.querySelectorAll('.ri-kpi,.go-btn,.pnl')], { stagger: .04, delay: .15 }); u.querySelectorAll('.ri-kpi .n').forEach(n => contar(n, 1.1)); barras([...u.querySelectorAll('.ri-bar')]); }
    if (vis(f)) { sube([...f.children], { stagger: .04 }); barras([...f.querySelectorAll('.bar-track i')]); }
  }
  // mapa: los departamentos aparecen en cascada desde el centro
  function mapa() {
    // 22/10/2026 · CUELGUE CORREGIDO: si el mapa llega por la red cuando la persona ya cambió de vista, queda escondido; GSAP, para medir
    // un SVG escondido, lo saca y lo vuelve a poner en el documento, eso disparaba de nuevo el vigilante del mapa y se armaba un bucle
    // infinito. Ahora: (1) un mapa que no se ve no se anima; (2) el vigilante solo reacciona a un mapa nuevo (no a los movimientos de GSAP)
    // y como mucho una vez por cuadro.
    const m = $('mapa'); if (!g || RM.matches || !m || !vis(m)) return; const ps = m.querySelectorAll('path'); if (!ps.length) return;
    g.fromTo(ps, { opacity: 0, scale: .92, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .4, ease: 'power3.out', stagger: { each: .012, from: 'center' }, clearProps: 'transform,opacity', overwrite: true });
    g.fromTo($('mapa').querySelectorAll('text'), { opacity: 0 }, { opacity: 1, duration: .4, delay: .5, clearProps: 'opacity' });
  }
  // indicador dorado del menú: se desliza hasta la sección activa
  function indicador() {
    const secs = $('secs'); if (!secs) return; let ind = $('nav-ind'); if (!ind) { ind = document.createElement('i'); ind.id = 'nav-ind'; ind.setAttribute('aria-hidden', 'true'); secs.appendChild(ind); secs.classList.add('ind'); }
    const on = secs.querySelector(':scope > a.on'); if (!on) { ind.style.opacity = 0; return; }
    // barra lateral: el indicador se desliza en vertical hasta la sección activa
    const p = { y: on.offsetTop + 6, height: Math.max(16, on.offsetHeight - 12), opacity: 1 };
    if (g && !RM.matches && ind.style.opacity === '1') g.to(ind, Object.assign({ duration: .32, ease: 'power3.out', overwrite: true }, p)); else { ind.style.transform = `translateY(${p.y}px)`; ind.style.height = p.height + 'px'; ind.style.opacity = 1; if (g) g.set(ind, { y: p.y }); }
  }
  function arranca() {
    indicador();   // 29/10/2026: sin fondo de partículas (rediseño): la portada entra con una sola secuencia en CSS
    // engancha el enrutador: después de cada go() se anima la vista que quedó
    if (typeof window.go === 'function' && !window.go.__m) { const _go = window.go; window.go = async function () { const r = await _go.apply(this, arguments); try { vista(); } catch (e) { } return r; }; window.go.__m = 1; }
    const mp = $('mapa'); if (mp) { let pend = 0;
      // un mapa nuevo llega de golpe (innerHTML: muchos nodos en un solo registro); GSAP mueve de a uno: eso se ignora
      new MutationObserver(ms => { if (pend || !ms.some(r => r.addedNodes.length > 1)) return; pend = requestAnimationFrame(() => { pend = 0; mapa(); }); }).observe(mp, { childList: true }); }
    // las fichas UE/CUI terminan de pintarse después (datos asíncronos): se animan al llegar su contenido, una vez por vista
    const u = $('uep'); if (u) { let k = ''; new MutationObserver(() => { const w = $('uep-wrap'); if (w && w.children.length && k !== location.hash) { k = location.hash; fichas(); } }).observe(u, { childList: true, subtree: true }); }
    addEventListener('resize', indicador);
    cargarGsap().then(ok => { if (!ok) return; g = window.gsap; document.documentElement.classList.add('gsap'); vista(); mapa(); });
  }
  if (document.readyState === 'complete') arranca(); else addEventListener('load', arranca);
  window.Motion = { vista, contar: el => g && !RM.matches && contar(el) };
})();
