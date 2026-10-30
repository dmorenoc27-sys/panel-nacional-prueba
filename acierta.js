/* acierta.js — identidad ACIERTA (Sistema inteligente de gestión pública, de ARKA PROYECTOS) y su intro cinemática.
   window.ACIERTA = { iso, wordmark, lockup, favicon, intro }. Sirve en navegador y en node (solo las funciones de texto).
   Geometría de la flecha: la del preloader de arkaproyectos.com.pe (astil 12 px con punta redondeada, punta con muesca). */
(function (root) {
  const G = {"A": "M0 0L40.15 -72.3L80.3 0L71.1 0L40.15 -56.6L9.2 0Z", "a": "M14.7 -21H51.7L48.7 -29H17.7ZM33 -54.2 45 -26 45.8 -24 56 0H65.5L33 -73.5L0.5 0H10L20.4 -24.6L21.2 -26.4Z", "C": "M13 -35Q13 -43.2 16.6 -49.4Q20.3 -55.5 26.2 -59Q32.1 -62.5 39 -62.5Q44 -62.5 48.2 -61.2Q52.3 -59.9 55.7 -57.6Q59.1 -55.2 61.5 -52.1V-63.3Q57.1 -67.2 51.9 -69.1Q46.7 -71 39 -71Q31.7 -71 25.4 -68.3Q19 -65.7 14.2 -60.9Q9.4 -56 6.7 -49.4Q4 -42.8 4 -35Q4 -27.2 6.7 -20.6Q9.4 -14 14.2 -9.2Q19 -4.3 25.4 -1.6Q31.7 1 39 1Q46.7 1 51.9 -0.9Q57.1 -2.8 61.5 -6.7V-17.9Q59.1 -14.8 55.7 -12.5Q52.3 -10.1 48.2 -8.8Q44 -7.5 39 -7.5Q32.1 -7.5 26.2 -11Q20.3 -14.5 16.6 -20.7Q13 -26.9 13 -35Z", "I": "M8 -70V0H16.5V-70Z", "E": "M12.7 0H48V-8H12.7ZM12.7 -62H48V-70H12.7ZM12.7 -34H46V-42H12.7ZM8 -70V0H16.5V-70Z", "R": "M20.5 -34.5 44.5 0H55L30 -34.5ZM8 -70V0H16.5V-70ZM12.7 -62.5H27Q31.5 -62.5 35 -60.9Q38.4 -59.3 40.4 -56.3Q42.3 -53.3 42.3 -49Q42.3 -44.7 40.4 -41.7Q38.4 -38.7 35 -37.1Q31.5 -35.5 27 -35.5H12.7V-28H27Q33.8 -28 39.2 -30.6Q44.5 -33.1 47.7 -37.9Q50.8 -42.6 50.8 -49Q50.8 -55.5 47.7 -60.2Q44.5 -64.9 39.2 -67.5Q33.8 -70 27 -70H12.7Z", "T": "M1 -62H19V0H27.5V-62H45.5V-70H1Z"};   // C, I, E, R, T, a: Jost 400 (mismo grosor de trazo que el logo ARKA); A: la A del logo maestro de ARKA (calco vectorial) normalizada a caps 70
  const W = {"A": 80.3, "a": 66.0, "C": 68.5, "I": 24.5, "E": 55.0, "R": 56.0, "T": 46.5};
  let uid = 0;
  function wordmark(o) {
    o = o || {}; const ink = o.ink || '#F5F2EA', gold = o.gold || 'url(#dn-gold)', tr = o.tracking == null ? 30 : o.tracking;
    let x = 0, parts = [], i = 0;
    for (const ch of 'ACIERTa') {   // solo la A inicial es el isotipo de ARKA (la A sin travesaño con su triángulo dorado): ARKA acierta; la última A es normal
      const cuerpo = `<path d="${G[ch]}" fill="${ink}"/>` + (i === 0 ? `<polygon class="dn-tri" points="19.35,0 60.95,0 40.15,-38" fill="url(#dn-tri)"/>` : '');   // triángulo semejante a la A (lados paralelos al interior), centrado en su eje
      parts.push(`<g class="dn-l" transform="translate(${x.toFixed(1)},0)">${cuerpo}</g>`); x += W[ch] + tr; i++;
    }
    return { svg: parts.join(''), w: x - tr };
  }
  // isotipo: diana + flecha. Gradientes en userSpaceOnUse para que funcionen también sobre líneas.
  const DEFS = `<linearGradient id="dn-gold" gradientUnits="userSpaceOnUse" x1="0" y1="-75" x2="90" y2="5"><stop offset="0" stop-color="#E9CF7A"/><stop offset=".55" stop-color="#C9A552"/><stop offset="1" stop-color="#9E8038"/></linearGradient>
<linearGradient id="dn-tri" gradientUnits="userSpaceOnUse" x1="0" y1="-38" x2="0" y2="0"><stop offset="0" stop-color="#E3C978"/><stop offset="1" stop-color="#B8953F"/></linearGradient>
<linearGradient id="dn-head" gradientUnits="userSpaceOnUse" x1="140" y1="177" x2="200" y2="222"><stop offset="0" stop-color="#F0D98A"/><stop offset="1" stop-color="#A8883A"/></linearGradient>
<linearGradient id="dn-shaft" gradientUnits="userSpaceOnUse" x1="-60" y1="190" x2="200" y2="210"><stop offset="0" stop-color="#9E8038"/><stop offset=".6" stop-color="#D4B25E"/><stop offset="1" stop-color="#F0D98A"/></linearGradient>
<radialGradient id="dn-core" cx="42%" cy="38%" r="65%"><stop offset="0" stop-color="#F3DC8E"/><stop offset=".55" stop-color="#C9A552"/><stop offset="1" stop-color="#8F7330"/></radialGradient>
<radialGradient id="dn-shadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="dn-wave" gradientUnits="userSpaceOnUse" x1="50" y1="50" x2="350" y2="350"><stop offset="0" stop-color="#F3DC8E"/><stop offset="1" stop-color="#C9A552" stop-opacity=".2"/></linearGradient>
<filter id="dn-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur id="dn-blur-v" stdDeviation="0 0"/></filter>
<filter id="dn-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="dn-soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".28"/></filter>`;
  function iso(o) {
    o = o || {}; const ring = o.ring || '#F5F2EA', pl = o.plumas || ring, sombra = o.sombra !== false;
    return `<g class="dn-target"${sombra ? ' filter="url(#dn-soft)"' : ''}>
 <circle class="dn-ring dn-r1" cx="200" cy="200" r="150" fill="none" stroke="${ring}" stroke-width="16" transform="rotate(-90 200 200)"/>
 <circle class="dn-ring dn-r2" cx="200" cy="200" r="108" fill="none" stroke="#3572BE" stroke-width="16" transform="rotate(-90 200 200)"/>
 <circle class="dn-ring dn-r3" cx="200" cy="200" r="66" fill="none" stroke="#8FB4E0" stroke-width="16" transform="rotate(-90 200 200)"/>
 <circle class="dn-hl" cx="200" cy="200" r="150" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="150 900" transform="rotate(-150 200 200)" opacity=".35"/>
 <circle class="dn-hl" cx="200" cy="200" r="108" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="100 700" transform="rotate(-150 200 200)" opacity=".3"/>
 <g class="dn-core"><circle cx="200" cy="200" r="31" fill="url(#dn-core)"/><circle cx="200" cy="200" r="31" fill="none" stroke="${ring}" stroke-width="3" opacity=".9"/><circle cx="189" cy="188" r="6" fill="#fff" opacity=".55"/></g>
</g>
<g class="dn-arrow" transform="rotate(-28 200 200)"><g class="dn-fly" filter="url(#dn-blur)">
 <line x1="-46" y1="200" x2="150" y2="200" stroke="#0F2A43" stroke-width="18" stroke-linecap="round" opacity=".85"/>
 <line x1="-46" y1="200" x2="150" y2="200" stroke="url(#dn-shaft)" stroke-width="12" stroke-linecap="round"/>
 <line x1="-40" y1="196" x2="140" y2="196" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>
 <polygon points="140,177.5 200,200 140,222.5 151,200" fill="url(#dn-head)" stroke="#0F2A43" stroke-width="2.5" stroke-linejoin="round"/>
 <path d="M-46 200 l-24 -17 M-46 200 l-24 17 M-30 200 l-24 -17 M-30 200 l-24 17" stroke="${pl}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
 <path d="M-46 200 l-24 -17 M-46 200 l-24 17 M-30 200 l-24 -17 M-30 200 l-24 17" stroke="#C9A552" stroke-width="2" stroke-linecap="round" fill="none" opacity=".6"/>
</g></g>`;
  }
  function isoSVG(o) { o = o || {}; const s = o.size || 40; return `<svg viewBox="-30 -20 460 440" width="${s}" height="${s}" aria-label="Acierta"><defs>${DEFS}</defs>${iso(o)}</svg>`; }
  function lockup(o) {
    o = o || {}; const bg = o.bg, ink = o.ink || '#F5F2EA', mut = o.mut || '#8FB4E0', mod = o.mod || '#C6CCD6', gold = o.goldText || '#D4B25E';
    const wm = wordmark({ ink });
    const W = 1500, H = 480;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Jost,Inter,system-ui,sans-serif">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}<defs>${DEFS}</defs>
<g transform="translate(70,30)">${iso({ ring: ink, sombra: !!bg })}</g>
<g transform="translate(560,236) scale(1.55)">${wm.svg}</g>
<rect x="562" y="286" width="44" height="3" rx="1.5" fill="${gold}"/><text x="620" y="296" font-size="20" font-weight="600" letter-spacing="5.5" fill="${mut}">SISTEMA INTELIGENTE DE GESTIÓN PÚBLICA</text>
<text x="562" y="352" font-size="42" font-family="Fraunces,Georgia,serif" font-style="italic" font-weight="500" fill="${ink}">Toda la gestión de tu entidad, <tspan fill="${gold}">en el blanco.</tspan></text>
${['INVERSIONES', 'CONTRATACIONES', 'PRESUPUESTO', 'PLANEAMIENTO', 'SIAF'].reduce((a, t) => { const w = t.length * 12.2 + 40; a.s += `<rect x="${a.x}" y="378" width="${w}" height="34" rx="17" fill="${bg ? 'rgba(255,255,255,.06)' : 'rgba(15,42,67,.05)'}" stroke="${gold}" stroke-opacity=".45"/><circle cx="${a.x + 17}" cy="395" r="3.5" fill="${gold}"/><text x="${a.x + 28}" y="400" font-size="15" font-weight="600" letter-spacing="1.6" fill="${mod}">${t}</text>`; a.x += w + 10; return a; }, { s: '', x: 562 }).s}
</svg>`;
  }
  // ---------- isotipo plano (29/10/2026): dos tintas + dorado, sin filtros ni gradientes; misma geometría que iso() ----------
  function isoFlat(o) { o = o || {}; const s = o.size || 44, claro = !!o.claro, ext = claro ? '#F4F2ED' : '#0E2B57', pluma = claro ? '#F4F2ED' : '#0E2B57', halo = o.halo || (claro ? '#0E2B57' : '#F4F2ED');
    return `<svg viewBox="-80 20 360 360" width="${s}" height="${s}" aria-label="Acierta" role="img"><circle cx="200" cy="200" r="150" fill="none" stroke="${ext}" stroke-width="18"/><circle cx="200" cy="200" r="104" fill="none" stroke="#1D4F9A" stroke-width="18"/><circle cx="200" cy="200" r="58" fill="none" stroke="#ADC7EA" stroke-width="18"/><circle cx="200" cy="200" r="26" fill="#E0A82E"/><g transform="rotate(-28 200 200)"><line x1="-40" y1="200" x2="146" y2="200" stroke="${halo}" stroke-width="20" stroke-linecap="round"/><line x1="-40" y1="200" x2="146" y2="200" stroke="#E0A82E" stroke-width="12" stroke-linecap="round"/><polygon points="138,176 204,200 138,224 150,200" fill="#C48A14"/><path d="M-40 200l-24-17M-40 200l-24 17M-22 200l-24-17M-22 200l-24 17" stroke="${pluma}" stroke-width="7" stroke-linecap="round" fill="none"/></g></svg>`; }
  function favicon() {
    if (typeof document === 'undefined') return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" rx="88" fill="#0E2B57"/><g transform="translate(200,200) scale(.86) translate(-200,-200)">${isoFlat({ claro: true, size: 400 }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`;
    let l = document.querySelector('link[rel="icon"]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.type = 'image/svg+xml'; l.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  // ---------- intro cinemática (GSAP desde cdnjs; si no carga, deja el logo estático) ----------
  const CSS = `
.dn-stage{position:relative;width:100%;height:100%;min-height:420px;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,#173B60 0%,#0F2A43 50%,#08182A 100%);color:#F5F2EA;font-family:Jost,Inter,system-ui,sans-serif;isolation:isolate}
.dn-stage canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0}
.dn-grid{position:absolute;inset:0;z-index:0;background-image:radial-gradient(circle at center,rgba(143,180,224,.12) 0 1px,transparent 1.5px);background-size:34px 34px;mask-image:radial-gradient(ellipse at 50% 45%,#000 20%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse at 50% 45%,#000 20%,transparent 70%);opacity:0}
.dn-lock{position:absolute;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;gap:5.5vw;padding:24px}
.dn-iso{width:min(56vh,460px);height:auto;overflow:visible;transform-style:preserve-3d}
.dn-word{display:flex;flex-direction:column;gap:12px;min-width:0}
.dn-word svg{width:min(44vw,560px);height:auto;overflow:visible}
.dn-word .k{display:flex;align-items:center;gap:12px;font-weight:600;font-size:min(2vh,15px);letter-spacing:.6em;text-transform:uppercase;color:#8FB4E0;opacity:0;white-space:nowrap}
.dn-word .k:before{content:"";width:var(--w,0px);height:2px;background:linear-gradient(90deg,#D4B25E,#F3DC8E);border-radius:2px;flex:none}
.dn-word .f{font-family:Fraunces,Georgia,serif;font-style:italic;font-weight:500;font-size:min(4.6vh,38px);line-height:1.15;color:#F5F2EA;letter-spacing:-.005em;max-width:640px}
.dn-word .f span{display:inline-block;opacity:0;transform:translateY(18px)}
.dn-word .f em{font-style:italic;color:#F3DC8E}
.dn-word .c{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.dn-word .c span{display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px;border:1px solid rgba(212,178,94,.35);background:rgba(255,255,255,.05);font-weight:600;font-size:min(1.9vh,14px);letter-spacing:.06em;color:#F5F2EA;opacity:0;transform:scale(.7);backdrop-filter:blur(4px)}
.dn-word .c span:before{content:"";width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#F3DC8E,#B08D3E);box-shadow:0 0 8px rgba(243,220,142,.7)}
.dn-word .a{display:flex;align-items:center;gap:10px;font-size:min(2.2vh,17px);letter-spacing:.06em;color:#D4B25E;opacity:0;white-space:nowrap;margin-top:6px}
.dn-word .a i{font-family:Fraunces,Georgia,serif;font-style:italic;color:#F5F2EA;font-size:1.15em}
.dn-word .a b{font-weight:700;color:#F5F2EA;letter-spacing:.1em}
.dn-word .a .ai{width:22px;height:22px;flex:none}
.dn-cta{position:absolute;left:0;right:0;bottom:6vh;z-index:2;display:flex;justify-content:center;gap:12px;opacity:0}
.dn-btn{border:0;border-radius:12px;padding:13px 26px;font:inherit;font-weight:700;font-size:15px;cursor:pointer;background:#F9A825;color:#1C1917;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .15s}
.dn-btn:hover{transform:translateY(-2px)}
.dn-btn.g{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.3)}
@media (max-width:760px){.dn-lock{flex-direction:column;gap:18px}.dn-word{align-items:center;text-align:center}.dn-word>svg{width:min(80vw,420px)}.dn-word .k,.dn-word .a{white-space:normal;justify-content:center}.dn-word .c{justify-content:center}.dn-word .f{font-size:min(3.6vh,26px)}}`;
  function cargarGsap() {
    return new Promise(res => {
      if (root.gsap) return res(true);
      const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'; s.integrity = 'sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt'; s.crossOrigin = 'anonymous'; s.onload = () => res(true); s.onerror = () => res(false);
      document.head.appendChild(s); setTimeout(() => res(!!root.gsap), 4000);
    });
  }
  function particulas(cv) {   // bokeh lento de fondo
    const c = cv.getContext('2d'); let w, h, P = [];
    const fit = () => { w = cv.width = cv.clientWidth * devicePixelRatio; h = cv.height = cv.clientHeight * devicePixelRatio; };
    fit(); addEventListener('resize', fit);
    for (let i = 0; i < 46; i++) P.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 3.5, v: .00008 + Math.random() * .00025, a: .08 + Math.random() * .25, g: Math.random() < .3 });
    let on = true; (function f() { if (!on || !cv.isConnected) { on = false; return; } c.clearRect(0, 0, w, h);
      for (const p of P) { p.y -= p.v; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); } c.beginPath(); c.arc(p.x * w, p.y * h, p.r * devicePixelRatio, 0, 7); c.fillStyle = p.g ? `rgba(212,178,94,${p.a})` : `rgba(143,180,224,${p.a})`; c.fill(); }
      requestAnimationFrame(f); })();
  }
  async function intro(el, o) {
    o = o || {};
    if (!document.getElementById('dn-css')) { const st = document.createElement('style'); st.id = 'dn-css'; st.textContent = CSS; document.head.appendChild(st); }
    const wm = wordmark({ ink: '#F5F2EA' });
    el.classList.add('dn-stage');
    el.innerHTML = `<canvas></canvas><div class="dn-grid"></div>
<div class="dn-lock">
 <svg class="dn-iso" viewBox="-40 -30 480 460"><defs>${DEFS}</defs>
  <ellipse class="dn-sh" cx="200" cy="372" rx="150" ry="16" fill="url(#dn-shadow)" opacity="0"/>
  ${iso({ sombra: false })}
  <circle class="dn-flash" cx="200" cy="200" r="34" fill="#FFF3C4" filter="url(#dn-glow)" opacity="0"/>
  <g class="dn-waves">${[0, 1, 2].map(() => `<circle class="dn-wave" cx="200" cy="200" r="150" fill="none" stroke="url(#dn-wave)" stroke-width="3" opacity="0"/>`).join('')}</g>
  <g class="dn-sparks"></g>
 </svg>
 <div class="dn-word">
  <svg viewBox="-4 -78 ${wm.w + 8} 86"><defs>${DEFS}<clipPath id="dn-clip">${wm.svg.replace(/class="dn-l"/g, '')}</clipPath></defs>${wm.svg}<rect class="dn-sheen" x="-200" y="-90" width="120" height="110" fill="url(#dn-sheen-g)" clip-path="url(#dn-clip)" transform="skewX(-20)"/><defs><linearGradient id="dn-sheen-g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>
  <div class="k">Seguimiento de la inversión pública, entidad por entidad</div>
  <div class="f">${(o.frase || 'Toda la gestión de tu entidad, <em>en el blanco.</em>').split(' ').map(w => `<span>${w}</span>`).join(' ')}</div>
  <div class="c"><span>Inversiones</span><span>Contrataciones</span><span>Presupuesto</span><span>Planeamiento</span><span>SIAF</span></div>
  <div class="a"><span>Una herramienta de <b>ARKA PROYECTOS</b></span></div>
 </div>
</div>
${o.botones ? `<div class="dn-cta">${o.botones}</div>` : ''}`;
    particulas(el.querySelector('canvas'));
    const ok = await cargarGsap();
    const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
    const isoEl = $('.dn-iso'), rings = $$('.dn-ring'), letters = $$('.dn-l');
    if (!ok) { $$('.dn-word .k,.dn-word .a,.dn-word .f span,.dn-word .c span').forEach(x => { x.style.opacity = 1; x.style.transform = 'none'; }); $('.dn-word .k').style.setProperty('--w', '44px'); if ($('.dn-cta')) $('.dn-cta').style.opacity = 1; o.onDone && o.onDone(); return; }
    const g = root.gsap;
    rings.forEach(r => { const L = 2 * Math.PI * r.r.baseVal.value; r.style.strokeDasharray = L; r.style.strokeDashoffset = L; });
    g.set($$('.dn-hl,.dn-core'), { opacity: 0 }); g.set($('.dn-fly'), { x: -760, scaleX: 2.2, transformOrigin: '200px 200px' }); g.set(letters, { y: 46, opacity: 0, filter: 'blur(8px)' });
    g.set(isoEl, { transformPerspective: 900, rotateX: 62, rotateY: -10, scale: .72, transformOrigin: '50% 60%' });
    const blur = $('#dn-blur-v');
    const tl = g.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => o.onDone && o.onDone() });
    tl.to($('.dn-grid'), { opacity: 1, duration: 1.2 }, 0)
      .to(rings, { strokeDashoffset: 0, duration: 1.1, stagger: .14, ease: 'power2.inOut' }, .1)
      .to(isoEl, { rotateX: 0, rotateY: 0, scale: 1, duration: 1.5, ease: 'expo.out' }, .15)
      .to($('.dn-sh'), { opacity: 1, duration: 1 }, .6)
      .to($$('.dn-hl,.dn-core'), { opacity: 1, duration: .5, stagger: .06 }, .9)
      .fromTo($('.dn-core'), { scale: 0, transformOrigin: '200px 200px' }, { scale: 1, duration: .6, ease: 'back.out(2.2)' }, .9)
      // vuelo de la flecha: desenfoque de movimiento que se apaga al clavar
      .set(blur, { attr: { stdDeviation: '16 0' } }, 1.25)
      .to($('.dn-fly'), { x: 0, scaleX: 1, duration: .55, ease: 'power4.in' }, 1.25)
      .to(blur, { attr: { stdDeviation: '0 0' }, duration: .25 }, 1.7)
      // impacto
      .fromTo($('.dn-flash'), { opacity: 1, scale: .4, transformOrigin: '200px 200px' }, { opacity: 0, scale: 2.6, duration: .6, ease: 'power2.out' }, 1.8)
      .fromTo($$('.dn-wave'), { opacity: .9, scale: .18, transformOrigin: '200px 200px' }, { opacity: 0, scale: 1.35, duration: 1.2, stagger: .16, ease: 'power2.out' }, 1.8)
      .fromTo($('.dn-target'), { scale: 1 }, { scale: 1.05, duration: .13, yoyo: true, repeat: 1, transformOrigin: '50% 50%', ease: 'power1.inOut' }, 1.8)
      .to(isoEl, { x: '+=5', duration: .04, yoyo: true, repeat: 7 }, 1.8)
      .to(isoEl, { x: 0, duration: .1 }, 2.12)
      // letras: desenfoque -> nitidez, luego brillo metálico
      .to(letters, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .7, stagger: .09, ease: 'expo.out' }, 1.95)
      .fromTo($('.dn-sheen'), { x: -220 }, { x: wm.w + 260, duration: 1.1, ease: 'power2.inOut' }, 2.7)
      .to($('.dn-word .k'), { opacity: 1, letterSpacing: '.3em', duration: 1, ease: 'power3.out' }, 2.55)
      .to($$('.dn-word .f span'), { opacity: 1, y: 0, duration: .6, stagger: .06, ease: 'power3.out' }, 2.8)
      .to($$('.dn-word .c span'), { opacity: 1, scale: 1, duration: .5, stagger: .09, ease: 'back.out(2)' }, 3.3)
      .to($('.dn-word .a'), { opacity: 1, duration: .8 }, 3.8)
      .fromTo($('.dn-word .a .ai'), { rotate: -40, scale: .4, transformOrigin: '50% 50%' }, { rotate: 0, scale: 1, duration: .7, ease: 'back.out(2.5)' }, 3.8);
    if ($('.dn-cta')) tl.to($('.dn-cta'), { opacity: 1, duration: .8 }, 4.1);
    g.to($('.dn-word .k'), { duration: .8, ease: 'power3.out', delay: 2.55, onUpdate: function () { $('.dn-word .k').style.setProperty('--w', (this.progress() * 44) + 'px'); } });
    // chispas doradas del impacto
    const sp = $('.dn-sparks'); const NS = 'http://www.w3.org/2000/svg';
    tl.call(() => { for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, d = 60 + Math.random() * 130, l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', 200); l.setAttribute('y1', 200); l.setAttribute('x2', 200); l.setAttribute('y2', 200); l.setAttribute('stroke', i % 3 ? '#F3DC8E' : '#fff'); l.setAttribute('stroke-width', 1.5 + Math.random() * 2); l.setAttribute('stroke-linecap', 'round'); sp.appendChild(l);
        g.to(l, { attr: { x1: 200 + Math.cos(a) * d * .55, y1: 200 + Math.sin(a) * d * .55, x2: 200 + Math.cos(a) * d, y2: 200 + Math.sin(a) * d }, opacity: 0, duration: .5 + Math.random() * .5, ease: 'power3.out', onComplete: () => l.remove() }); } }, null, 1.8);
    return tl;
  }
  root.ACIERTA = { iso, isoSVG, isoFlat, wordmark, lockup, favicon, intro, DEFS };
})(typeof window !== 'undefined' ? window : globalThis);
