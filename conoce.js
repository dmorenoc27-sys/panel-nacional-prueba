/* conoce.js — "Conoce el panel": recorrido animado de venta. Se abre solo en la primera visita y desde el menú / pie.
   Sin dependencias: CSS keyframes (opacity/transform) + IntersectionObserver para revelar al hacer scroll.
   window.Conoce = { abrir, cerrar } */
(function () {
  const CSS = `
#cn{position:fixed;inset:0;z-index:10000;overflow:auto;background:#EDF0F4;color:#141B26;font-family:Manrope,system-ui,sans-serif;scroll-behavior:smooth}
#cn *{box-sizing:border-box}
#cn .cn-x{position:fixed;top:14px;right:18px;z-index:2;background:#fff;border:1px solid #D8DFE7;color:#141B26;box-shadow:0 6px 18px -8px rgba(20,27,38,.3);border-radius:999px;padding:8px 16px;font:inherit;font-weight:700;cursor:pointer;backdrop-filter:blur(6px)}
#cn .cn-x:hover{background:#1E5AA8;color:#fff;border-color:#1E5AA8}
#cn .cn-hero{position:relative;height:100vh;min-height:520px;overflow:hidden;isolation:isolate}
#cn .cn-step.w{background:#fff;border-color:#E6EAF0;color:#1C1917;box-shadow:0 8px 24px rgba(15,42,67,.08)}#cn .cn-step.w p{color:#44546A}#cn .cn-step.w:not(:last-child):after{border-color:#1E5AA8}
#cn .cn-s.w .cn-num{background:#fff;border-color:#E6EAF0;color:#0F2A43;box-shadow:0 8px 24px rgba(15,42,67,.08)}#cn .cn-s.w .cn-num small{color:#5D677A}
#cn .cn-bl{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;z-index:-1;animation:cnFloat 14s ease-in-out infinite}
#cn .cn-bl.a{width:520px;height:520px;left:-120px;top:-80px;background:#B9D0EC}
#cn .cn-bl.b{width:460px;height:460px;right:-100px;top:20%;background:#D6E4F6;animation-delay:-5s}
#cn .cn-bl.c{width:420px;height:420px;left:35%;bottom:-160px;background:#9DBCE4;opacity:.35;animation-delay:-9s}
@keyframes cnFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.12)}66%{transform:translate(-40px,50px) scale(.94)}}
#cn .cn-kick{display:inline-block;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;color:#1E5AA8;border:1px solid #B9D0EC;background:#fff;border-radius:999px;padding:6px 14px;margin-bottom:22px}
#cn h1{font-size:clamp(34px,6vw,68px);line-height:1.02;margin:0 0 18px;font-weight:800;letter-spacing:-.025em;max-width:980px;color:#141B26}
#cn h1 em{font-style:normal;color:#1E5AA8}
#cn .cn-sub{font-size:clamp(16px,2vw,21px);color:#5F6B7A;max-width:760px;margin:0 auto 34px;line-height:1.5}
#cn .cn-nums{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin:0 auto 38px}
#cn .cn-num{background:#fff;border:1px solid #D8DFE7;border-radius:16px;padding:14px 22px;min-width:170px;box-shadow:0 6px 18px -8px rgba(20,27,38,.16)}
#cn .cn-num b{display:block;font-size:34px;font-weight:800;color:#1E5AA8;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
#cn .cn-num small{font-size:12px;color:#5F6B7A;text-transform:uppercase;letter-spacing:.08em;font-weight:700}
#cn .cn-cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
#cn .cn-btn{border:0;border-radius:12px;padding:14px 26px;font:inherit;font-weight:800;font-size:16px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:transform .15s,box-shadow .15s}
#cn .cn-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px -10px rgba(30,90,168,.6)}
#cn .cn-btn.p{background:#1E5AA8;color:#fff}
#cn .cn-btn.g{background:#fff;color:#141B26;border:1px solid #D8DFE7}
#cn .cn-cue{position:absolute;top:calc(100vh - 34px);left:50%;z-index:3;transform:translateX(-50%);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#5F6B7A;animation:cnBounce 2s infinite}
@keyframes cnBounce{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}
#cn section.cn-s{padding:80px 20px;max-width:1240px;margin:0 auto}
#cn section.cn-s.w{background:#fff;color:#141B26;max-width:none;border-top:1px solid #E5EAF0;border-bottom:1px solid #E5EAF0}
#cn section.cn-s.w>div{max-width:1240px;margin:0 auto}
#cn h2{font-size:clamp(26px,3.6vw,42px);margin:0 0 8px;font-weight:800;letter-spacing:-.025em;text-align:center;color:#141B26}
#cn .cn-lead{text-align:center;font-size:17px;color:inherit;opacity:.75;max-width:720px;margin:0 auto 42px;line-height:1.5}
#cn .cn-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
#cn .cn-mini{background:#fff;border-radius:18px;box-shadow:0 12px 40px -16px rgba(20,27,38,.2);overflow:hidden;color:#141B26;border:1px solid #D8DFE7}
#cn .cn-mini .cn-t{padding:14px 16px 6px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#1E5AA8}
#cn .cn-mini .cn-d{padding:0 16px 12px;font-size:13px;color:#5D677A;line-height:1.4;min-height:50px}
#cn .cn-scr{margin:0 12px 12px;background:#F5F7FA;border:1px solid #E6EAF0;border-radius:12px;height:190px;position:relative;overflow:hidden;padding:10px}
/* reveal al hacer scroll */
#cn .cn-rv{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
#cn .cn-rv.on{opacity:1;transform:none}
#cn .cn-grid .cn-rv:nth-child(2){transition-delay:.08s}#cn .cn-grid .cn-rv:nth-child(3){transition-delay:.16s}#cn .cn-grid .cn-rv:nth-child(4){transition-delay:.24s}
/* A. resumen: tiles + gauge */
#cn .cn-tiles{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-right:72px}
#cn .cn-tile{background:#fff;border-radius:8px;padding:7px 8px;border:1px solid #E6EAF0;min-width:0}
#cn .cn-tile small{display:block;font-size:9px;letter-spacing:.1em;font-weight:800;color:#5D677A}
#cn .cn-tile b{display:block;font-size:11.5px;font-weight:900;margin:2px 0 4px;font-variant-numeric:tabular-nums;white-space:nowrap}
#cn .cn-bar{height:5px;border-radius:3px;background:#E6EAF0;overflow:hidden}
#cn .cn-bar i{display:block;height:100%;border-radius:3px;background:var(--c,#1E5AA8);transform-origin:left;animation:cnGrow 6s cubic-bezier(.2,.8,.2,1) infinite}
@keyframes cnGrow{0%{transform:scaleX(0)}25%,85%{transform:scaleX(1)}100%{transform:scaleX(0)}}
#cn .cn-gauge{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:66px;height:66px}
#cn .cn-gauge circle.v{stroke-dasharray:198;stroke-dashoffset:198;animation:cnGauge 6s ease-in-out infinite}
@keyframes cnGauge{0%{stroke-dashoffset:198}30%,85%{stroke-dashoffset:89}100%{stroke-dashoffset:198}}
#cn .cn-gauge b{position:absolute;inset:0;display:grid;place-items:center;font-size:13px;font-weight:900;color:#1E5AA8}
/* B. mapa */
#cn .cn-map{width:100%;height:100%}
#cn .cn-map path{fill:#DCE7F5;stroke:#fff;stroke-width:1;animation:cnMap 6s ease-in-out infinite;animation-delay:calc(var(--i) * .12s)}
@keyframes cnMap{0%,10%{fill:#DCE7F5}35%,70%{fill:var(--f,#3572BE)}100%{fill:#DCE7F5}}
#cn .cn-pin{position:absolute;left:52%;top:46%;width:14px;height:14px;border-radius:50%;background:#1E5AA8;border:2px solid #fff;box-shadow:0 0 0 0 rgba(30,90,168,.6);animation:cnPing 1.8s infinite}
@keyframes cnPing{0%{box-shadow:0 0 0 0 rgba(30,90,168,.6)}100%{box-shadow:0 0 0 18px rgba(30,90,168,0)}}
/* C. alertas */
#cn .cn-chip{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #E6EAF0;border-radius:10px;padding:7px 10px;margin-bottom:7px;font-size:12px;opacity:0;animation:cnIn 6s ease infinite;animation-delay:calc(var(--i) * .35s)}
#cn .cn-chip i{width:8px;height:8px;border-radius:50%;background:var(--c);flex:none;animation:cnPulse 1.4s infinite}
#cn .cn-chip b{font-size:15px;min-width:34px;font-variant-numeric:tabular-nums}
@keyframes cnIn{0%{opacity:0;transform:translateX(-14px)}12%,85%{opacity:1;transform:none}100%{opacity:0;transform:translateX(-14px)}}
@keyframes cnPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 45%,transparent)}50%{box-shadow:0 0 0 6px transparent}}
/* D. contrataciones */
#cn .cn-pan{display:grid;grid-template-columns:1fr 1fr;gap:5px}
#cn .cn-p{background:#fff;border:1px solid #E6EAF0;border-left:4px solid var(--c);border-radius:8px;padding:4px 7px;display:flex;justify-content:space-between;align-items:center;font-size:9px;min-width:0;white-space:nowrap;overflow:hidden;font-weight:800;color:#44546A;animation:cnPanel 6s ease infinite;animation-delay:calc(var(--i) * .1s)}
#cn .cn-p b{font-size:11.5px;color:#1C1917}
#cn .cn-p.hot{animation:cnHot 6s ease infinite}
@keyframes cnPanel{0%{opacity:0;transform:translateY(10px)}12%,100%{opacity:1;transform:none}}
@keyframes cnHot{0%{opacity:0;transform:translateY(10px)}12%{opacity:1;transform:none}30%,85%{transform:translateY(-3px);box-shadow:0 8px 18px rgba(30,90,168,.25);background:#EAF1FB}100%{transform:none;box-shadow:none;background:#fff}}
#cn .cn-rows{margin-top:8px}
#cn .cn-row{display:grid;grid-template-columns:1fr auto;gap:8px;background:#fff;border:1px solid #E6EAF0;border-radius:6px;padding:6px 8px;font-size:11px;margin-bottom:5px;opacity:0;animation:cnRow 6s ease infinite;animation-delay:calc(2s + var(--i) * .3s)}
#cn .cn-row b{font-variant-numeric:tabular-nums}
@keyframes cnRow{0%{opacity:0;transform:translateY(8px)}8%,55%{opacity:1;transform:none}65%,100%{opacity:0}}
/* E. radar */
#cn .cn-inp{background:#fff;border:1.5px solid #1E5AA8;border-radius:8px;padding:7px 10px;font-size:13px;display:flex;align-items:center;gap:8px;font-family:ui-monospace,Menlo,monospace}
#cn .cn-inp span{display:inline-block;white-space:nowrap;overflow:hidden;width:11ch;border-right:2px solid #1E5AA8;animation:cnType 6s steps(11) infinite}
@keyframes cnType{0%{width:0}25%,90%{width:11ch}100%{width:0}}
#cn .cn-src{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
#cn .cn-src span{font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:#E4F5EC;color:#1B9E5A;opacity:0;animation:cnTag 6s ease infinite;animation-delay:calc(1.7s + var(--i) * .25s)}
@keyframes cnTag{0%{opacity:0;transform:scale(.6)}8%,70%{opacity:1;transform:none}80%,100%{opacity:0}}
#cn .cn-ver{position:absolute;left:10px;right:10px;bottom:10px;background:#1B9E5A;color:#fff;border-radius:10px;padding:9px 12px;font-weight:800;font-size:12.5px;opacity:0;animation:cnVer 6s ease infinite;text-align:center}
@keyframes cnVer{0%,52%{opacity:0;transform:scale(.85)}58%,88%{opacity:1;transform:none}95%,100%{opacity:0}}
/* F. mi entidad */
#cn .cn-lock{font-size:30px;text-align:center;animation:cnLock 6s ease infinite;transform-origin:center}
@keyframes cnLock{0%,10%{transform:rotate(0)}14%{transform:rotate(-14deg) scale(1.15)}18%{transform:rotate(10deg) scale(1.15)}22%,100%{transform:rotate(0) scale(1)}}
#cn .cn-chain{display:grid;gap:6px;margin-top:6px}
#cn .cn-st{display:grid;grid-template-columns:82px 1fr 58px;gap:8px;align-items:center;font-size:10.5px;font-weight:800;color:#44546A}
#cn .cn-st .cn-bar i{animation:cnFill 6s ease infinite;animation-delay:calc(1.2s + var(--i) * .5s)}
#cn .cn-st b{text-align:right;font-variant-numeric:tabular-nums;color:#1C1917}
@keyframes cnFill{0%{transform:scaleX(0)}15%,85%{transform:scaleX(var(--w,1))}100%{transform:scaleX(0)}}
/* G. exportaciones */
#cn .cn-files{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#cn .cn-f{background:#fff;border:1px solid #E6EAF0;border-radius:10px;padding:10px 8px;text-align:center;font-size:10px;font-weight:800;color:#44546A}
#cn .cn-f .ic{font-size:24px;display:block;margin-bottom:4px}
#cn .cn-f .cn-bar{margin-top:6px}
#cn .cn-f .cn-bar i{animation:cnLoad 6s ease infinite;animation-delay:calc(var(--i) * .6s)}
@keyframes cnLoad{0%{transform:scaleX(0)}30%,90%{transform:scaleX(1)}100%{transform:scaleX(0)}}
#cn .cn-ok{position:absolute;left:10px;right:10px;bottom:10px;background:#fff;border:1px solid #1B9E5A;color:#1C1917;border-radius:10px;padding:8px 10px;font-size:11.5px;font-weight:700;display:flex;gap:8px;align-items:center;opacity:0;animation:cnDone 6s ease infinite}
@keyframes cnDone{0%,42%{opacity:0;transform:translateY(12px)}50%,88%{opacity:1;transform:none}95%,100%{opacity:0}}
/* H. corte */
#cn .cn-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
#cn .cn-cal i{display:block;aspect-ratio:1;border-radius:5px;background:#fff;border:1px solid #E6EAF0;animation:cnDay 6s ease infinite;animation-delay:calc(var(--i) * .06s)}
@keyframes cnDay{0%,8%{background:#fff}14%,80%{background:var(--c,#B9D0EC)}90%,100%{background:#fff}}
#cn .cn-cal i.sel{animation:cnSel 6s ease infinite}
@keyframes cnSel{0%,30%{background:#fff;transform:none}36%,85%{background:#1E5AA8;transform:scale(1.25);box-shadow:0 4px 10px rgba(30,90,168,.5)}95%,100%{background:#fff;transform:none}}
#cn .cn-corte{position:absolute;left:10px;right:10px;bottom:10px;background:#1E5AA8;color:#fff;border-radius:10px;padding:8px 10px;font-size:11.5px;font-weight:700;opacity:0;animation:cnDone 6s ease infinite}
/* como funciona */
#cn .cn-flow{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;position:relative}
#cn .cn-step{background:#fff;border:1px solid #D8DFE7;border-radius:16px;padding:22px 20px;position:relative;box-shadow:0 6px 18px -8px rgba(20,27,38,.16)}
#cn .cn-step .n{width:34px;height:34px;border-radius:50%;background:#1E5AA8;color:#fff;font-weight:800;display:grid;place-items:center;margin-bottom:12px}
#cn .cn-step h3{margin:0 0 6px;font-size:17px}
#cn .cn-step p{margin:0;font-size:13.5px;color:#5F6B7A;line-height:1.5}
#cn .cn-step:not(:last-child):after{content:"";position:absolute;right:-18px;top:50%;width:18px;border-top:2px dashed #9DBCE4;animation:cnDash 1s linear infinite}
@keyframes cnDash{to{transform:translateX(6px)}}
#cn .cn-src2{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:28px}
#cn .cn-src2 span{font-size:12px;font-weight:800;padding:6px 12px;border-radius:999px;background:#fff;border:1px solid #D8DFE7;color:#2F3A4A}
#cn .cn-fin{text-align:center;padding:90px 20px 110px}
#cn .cn-fin p{max-width:640px;margin:0 auto 28px;color:#5F6B7A;font-size:17px;line-height:1.55}
@media (prefers-reduced-motion:reduce){#cn *{animation-duration:.01s!important;animation-iteration-count:1!important;transition:none!important}#cn .cn-rv{opacity:1;transform:none}}
@media (max-width:640px){#cn .cn-step:after{display:none}}
`;
  const N = n => Math.round(n).toLocaleString('es-PE');
  const M = n => N(n / 1e6);
  function datos() {   // reales cuando el panel ya cargó; si no, cifras de referencia
    const p = (typeof R !== 'undefined' && R && R.pais) || {};
    const A0 = (typeof A !== 'undefined' && A && A.conteo) || {};
    return { pim: p.pim || 72e9, dev: p.dev || 39.7e9, cui: p.n_cui || 54943, ue: p.n_ue || 2321,
             rez: A0.rezago || 648, f12: A0.f12b || 439, csd: A0.contr_sin_dev || 500, cer: A0.por_cerrar || 887,
             corte: (typeof BASE !== 'undefined' && BASE.R && BASE.R.corte) || '' };
  }
  function mapaSVG() {   // reutiliza los trazos reales del mapa del panel; si aún no está, una cuadrícula
    const src = document.getElementById('mapa');
    if (src && src.querySelector('path')) {
      const s = src.cloneNode(true); s.removeAttribute('id'); s.setAttribute('class', 'cn-map'); s.querySelectorAll('text,title').forEach(t => t.remove());
      const F = ['#5F94D1', '#3572BE', '#1E5AA8', '#8FB4E0', '#3572BE'];
      s.querySelectorAll('path').forEach((p, i) => { p.removeAttribute('style'); p.removeAttribute('class'); p.style.setProperty('--i', i); p.style.setProperty('--f', F[i % 5]); });
      return s.outerHTML;
    }
    return `<svg class="cn-map" viewBox="0 0 100 100">${Array.from({ length: 25 }, (_, i) => `<path style="--i:${i};--f:${['#5F94D1', '#3572BE', '#1E5AA8'][i % 3]}" d="M${(i % 5) * 20} ${Math.floor(i / 5) * 20}h18v18h-18z"/>`).join('')}</svg>`;
  }
  function html(d) {
    const mini = (t, desc, scr) => `<div class="cn-mini cn-rv"><div class="cn-t">${t}</div><div class="cn-d">${desc}</div><div class="cn-scr">${scr}</div></div>`;
    const av = d.pim ? 100 * d.dev / d.pim : 55;
    return `
<button class="cn-x" id="cn-x">Entrar a Acierta</button>
<div class="cn-hero" id="cn-intro"></div>
<div class="cn-cue">Desliza para conocer Acierta</div>
<section class="cn-s w" id="cn-hoy"><div>
 <div class="cn-nums cn-rv" style="margin:0">
   <div class="cn-num"><b data-cu="${d.pim / 1e6}" data-pre="S/ " data-suf=" M">0</b><small>Presupuesto ${new Date().getFullYear()}</small></div>
   <div class="cn-num"><b data-cu="${av}" data-dec="1" data-suf=" %">0</b><small>Avance país</small></div>
   <div class="cn-num"><b data-cu="${d.cui}">0</b><small>Inversiones</small></div>
   <div class="cn-num"><b data-cu="${d.ue}">0</b><small>Unidades ejecutoras</small></div>
 </div>
 <h2 class="cn-rv" style="margin-top:34px">En tres pasos</h2>
 <p class="cn-lead cn-rv">Sin manual ni capacitación. Así llegas a tu entidad en menos de un minuto.</p>
 <div class="cn-flow">
  <div class="cn-step cn-rv w"><div class="n">1</div><h3>Busca tu entidad</h3><p>Escribe el nombre de la municipalidad, el gobierno regional o la unidad ejecutora en el buscador. También un CUI o una función.</p></div>
  <div class="cn-step cn-rv w"><div class="n">2</div><h3>Elige el módulo</h3><p>Inversiones, Contrataciones, Presupuesto o Planeamiento. Cada uno abre con sus paneles; un clic en cualquier cifra despliega el detalle.</p></div>
  <div class="cn-step cn-rv w"><div class="n">3</div><h3>Exporta y comparte</h3><p>Excel del detalle, Expediente PPT y PDF, a la fecha de corte que elijas (las exportaciones se activan con el contrato de la entidad). O guarda la entidad en Mi cartera para volver mañana.</p></div>
 </div>
</div></section>

<section class="cn-s w" id="cn-que"><div>
 <h2 class="cn-rv">Lo que verás dentro</h2>
 <p class="cn-lead cn-rv">Los datos de hoy, módulo por módulo. Así se ve Acierta por dentro.</p>
 <div class="cn-grid">
 ${mini('Resumen ejecutivo', 'Cuánto tienes, cuánto has gastado y cuánto te queda, en una sola pantalla. Y cómo va tu entidad frente al resto del país.', `
  <div class="cn-tiles"><div class="cn-tile"><small>PIM</small><b>S/ ${M(d.pim)} M</b><div class="cn-bar"><i style="--c:#1C1917"></i></div></div>
  <div class="cn-tile"><small>DEVENGADO</small><b>S/ ${M(d.dev)} M</b><div class="cn-bar"><i style="--c:#1B9E5A;transform-origin:left"></i></div></div>
  <div class="cn-tile"><small>CERTIFICADO</small><b>S/ ${M(d.pim * .87)} M</b><div class="cn-bar"><i style="--c:#1E5AA8"></i></div></div>
  <div class="cn-tile"><small>SALDO</small><b>S/ ${M(d.pim - d.dev)} M</b><div class="cn-bar"><i style="--c:#F9A825"></i></div></div></div>
  <div class="cn-gauge"><svg viewBox="0 0 78 78"><circle cx="39" cy="39" r="31.5" fill="none" stroke="#E6EAF0" stroke-width="8"/><circle class="v" cx="39" cy="39" r="31.5" fill="none" stroke="#1E5AA8" stroke-width="8" stroke-linecap="round" transform="rotate(-90 39 39)"/></svg><b>${av.toFixed(0)}%</b></div>`)}
 ${mini('Mapa y territorio', 'Del país al departamento, la provincia y el distrito. Un clic y estás dentro de la municipalidad.', `${mapaSVG()}<div class="cn-pin"></div>`)}
 ${mini('Alertas tempranas', 'Hoy conviene revisar: inversiones con avance bajo, F12-B por actualizar, contratos aún sin devengado, inversiones por cerrar.', `
  <div class="cn-chip" style="--i:0;--c:#D64545"><i></i><b>${N(d.rez)}</b> inversiones grandes con avance bajo</div>
  <div class="cn-chip" style="--i:1;--c:#936413"><i></i><b>${N(d.f12)}</b> con Formato 12-B por actualizar</div>
  <div class="cn-chip" style="--i:2;--c:#D64545"><i></i><b>${N(d.csd)}</b> contratos firmados que aún no registran gasto</div>
  <div class="cn-chip" style="--i:3;--c:#1B9E5A"><i></i><b>${N(d.cer)}</b> obras casi listas, por cerrar</div>`)}
 ${mini('Contrataciones', 'Obras, bienes, servicios y consultorías de la entidad, ordenadas por año y proceso, con sus proveedores, penalidades y resueltos.', `
  <div class="cn-pan"><div class="cn-p hot" style="--i:0;--c:#1E5AA8">OBRAS<b>S/ 48.2 M</b></div><div class="cn-p" style="--i:1;--c:#00897B">BIENES<b>S/ 6.1 M</b></div><div class="cn-p" style="--i:2;--c:#936413">SERVICIOS<b>S/ 9.7 M</b></div><div class="cn-p" style="--i:3;--c:#7B4FBF">CONSULT.<b>S/ 2.4 M</b></div></div>
  <div class="cn-rows"><div class="cn-row" style="--i:0"><span>LP-000-0000 · Mejoramiento de vía (ejemplo ilustrativo)</span><b>S/ 21.4 M</b></div><div class="cn-row" style="--i:1"><span>CD-000-0000 · Puente (ejemplo) · <span style="color:#D64545">resuelto</span></span><b>S/ 3.2 M</b></div></div>`)}
 ${mini('Radar de proveedores', 'Escribe un RUC y en un clic cruza SUNAT, OECE, RNP, Tribunal, INFOBRAS y arbitrajes. Historial público en SUNAT, OECE, RNP, Tribunal e INFOBRAS, con la fecha de cada registro.', `
  <div class="cn-inp">🔍 <span>20512345678</span></div>
  <div class="cn-src"><span style="--i:0">SUNAT ✓</span><span style="--i:1">RNP ✓</span><span style="--i:2">OECE sanciones ✓</span><span style="--i:3">Penalidades ✓</span><span style="--i:4">INFOBRAS ✓</span><span style="--i:5">Arbitrajes ✓</span></div>
  <div class="cn-ver">✔ Sin sanciones vigentes registradas (ejemplo) · 2 penalidades · 1 obra paralizada</div>`)}
 ${mini('Mi entidad · SIAF', 'Con clave: la cadena completa del gasto de tu entidad, expediente por expediente. Viaja cifrado y solo tu entidad lo abre.', `
  <div class="cn-lock">🔓</div>
  <div class="cn-chain">
   <div class="cn-st" style="--i:0"><span>Certificado</span><div class="cn-bar"><i style="--c:#1E5AA8;--w:.92"></i></div><b>S/ 41.3 M</b></div>
   <div class="cn-st" style="--i:1"><span>Comprometido</span><div class="cn-bar"><i style="--c:#3572BE;--w:.78"></i></div><b>S/ 35.0 M</b></div>
   <div class="cn-st" style="--i:2"><span>Devengado</span><div class="cn-bar"><i style="--c:#1B9E5A;--w:.55"></i></div><b>S/ 24.7 M</b></div>
   <div class="cn-st" style="--i:3"><span>Girado</span><div class="cn-bar"><i style="--c:#00897B;--w:.52"></i></div><b>S/ 23.4 M</b></div>
   <div class="cn-st" style="--i:4"><span>Pagado</span><div class="cn-bar"><i style="--c:#0F2A43;--w:.50"></i></div><b>S/ 22.5 M</b></div></div>`)}
 ${mini('Exportaciones', 'Excel del detalle, Expediente PPT listo para exponer y PDF. Con tu plantilla institucional si la tienes.', `
  <div class="cn-files"><div class="cn-f" style="--i:0"><span class="ic">📊</span>EXCEL<div class="cn-bar"><i style="--c:#1B9E5A"></i></div></div><div class="cn-f" style="--i:1"><span class="ic">📑</span>POWERPOINT<div class="cn-bar"><i style="--c:#D64545"></i></div></div><div class="cn-f" style="--i:2"><span class="ic">📄</span>PDF<div class="cn-bar"><i style="--c:#1E5AA8"></i></div></div></div>
  <div class="cn-ok">✅ <span>Expediente_Entidad.pptx listo · 14 láminas · corte de hoy (ejemplo)</span></div>`)}
 ${mini('Reportes a la fecha de corte', 'Elige cualquier día y el reporte sale con los datos de ese día. Ideal para informes mensuales y sesiones de consejo.', `
  <div class="cn-cal">${Array.from({ length: 28 }, (_, i) => `<i style="--i:${i};--c:${['#DCE7F5', '#B9D0EC', '#8FB4E0'][i % 3]}"${i === 16 ? ' class="sel"' : ''}></i>`).join('')}</div>
  <div class="cn-corte">📅 Corte 17 de setiembre · reporte generado con los datos de ese día</div>`)}
 </div>
</div></section>

<section class="cn-s">
 <h2 class="cn-rv">Cómo funciona</h2>
 <p class="cn-lead cn-rv">Sin cargar datos a mano: Acierta se actualiza sola cada mañana con lo que publica el MEF. Para ver tu SIAF, un agente en tu computadora cifra y sube tu respaldo.</p>
 <div class="cn-flow">
  <div class="cn-step cn-rv"><div class="n">1</div><h3>Cada mañana, datos abiertos</h3><p>Consulta Amigable, Banco de Inversiones, Formato 12-B, expedientes técnicos, ingresos y transferencias del MEF.</p></div>
  <div class="cn-step cn-rv"><div class="n">2</div><h3>Cruces automáticos</h3><p>SEACE, sanciones y penalidades de la OECE, padrón SUNAT, obras INFOBRAS de la Contraloría y el SSI de cada inversión.</p></div>
  <div class="cn-step cn-rv"><div class="n">3</div><h3>Tu entidad, con clave</h3><p>Con tu respaldo del SIAF y tu clave ves lo que el portal público no muestra: expediente, proveedor, documento y fase de cada pago. </p></div>
  <div class="cn-step cn-rv"><div class="n">4</div><h3>Reportes listos</h3><p>Expediente PPT con tu plantilla, Excel y PDF, a cualquier fecha de corte. Para el alcalde o gobernador y el consejo; insumo de trabajo, no documento oficial.</p></div>
 </div>
 <div class="cn-src2 cn-rv"><span>MEF · Consulta Amigable</span><span>Banco de Inversiones</span><span>SEACE</span><span>OECE · CONOSCE</span><span>SUNAT</span><span>INFOBRAS · Contraloría</span><span>SSI</span><span>SIAF de la entidad</span></div>
</section>

<div class="cn-fin cn-rv">
 <h2>Lleva Acierta a tu entidad</h2>
 <p>En pocos días tu equipo entra con su clave, ve su SIAF expediente por expediente y recibe cada semana el Expediente PPT con la plantilla de la entidad. Sin instalar servidores ni cambiar de sistema. Una herramienta de ARKA PROYECTOS.</p>
 <div class="cn-cta"><a class="cn-btn p" href="mailto:consultas@arkaproyectos.com.pe?subject=Quiero%20ver%20Acierta%20para%20mi%20entidad" onclick="track('contacto_correo',{origen:'conoce'})">Pedir una demostración</a><button class="cn-btn g" id="cn-go2">Entrar a Acierta</button></div>
</div>`;
  }
  function cuenta(el) {   // contador animado
    const v = +el.dataset.cu, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = performance.now(), D = 1600;
    const f = t => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + (v * e).toLocaleString('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function abrir() {
    if (document.getElementById('cn')) return;
    if (!document.getElementById('cn-css')) { const st = document.createElement('style'); st.id = 'cn-css'; st.textContent = CSS; document.head.appendChild(st); }
    const el = document.createElement('div'); el.id = 'cn'; el.innerHTML = html(datos()); document.body.appendChild(el);
    document.body.style.overflow = 'hidden'; if (location.hash !== '#/conoce') { window.__cnPrev = location.hash || '#/'; history.replaceState(null, '', '#/conoce'); } window.__cnTit = document.title; document.title = 'Conoce Acierta: qué es y cómo ayuda a tu entidad'; if (window.track) track('vista', { sec: 'conoce' }); document.title = 'Acierta para municipalidades y gobiernos regionales: seguimiento de inversiones, presupuesto y contrataciones';
    if (window.ACIERTA) ACIERTA.intro(el.querySelector('#cn-intro'), { botones: '<button class="dn-btn" id="cn-go">Entrar a Acierta</button><a class="dn-btn g" href="#cn-que">Ver qué hay dentro</a>' });
    el.querySelectorAll('#cn-x,#cn-go,#cn-go2').forEach(b => b.onclick = cerrar);
    el.addEventListener('click', e => { const a = e.target.closest('a[href="#cn-que"]'); if (a) { e.preventDefault(); el.querySelector('#cn-hoy').scrollIntoView({ behavior: 'smooth' }); } });
    el.querySelectorAll('[data-cu]').forEach(cuenta);
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('on'); io.unobserve(x.target); } }), { root: el, threshold: .15 });
    el.querySelectorAll('.cn-rv').forEach(x => io.observe(x));
    try { localStorage.setItem('conoce_visto', '1'); } catch (e) { }
  }
  function cerrar() { const el = document.getElementById('cn'); if (el) el.remove(); if (window.__cnTit) document.title = window.__cnTit; document.body.style.overflow = ''; if (location.hash === '#/conoce') history.replaceState(null, '', window.__cnPrev || '#/'); }
  window.addEventListener('hashchange', () => { if (location.hash !== '#/conoce' && document.getElementById('cn')) cerrar(); });   // 29/10: navegar con el hash cierra la intro (no dejaba el overflow bloqueado)
  window.Conoce = { abrir, cerrar };
  // la presentación ya no se abre sola: la portada presenta Acierta; se abre desde el menú "Conoce Acierta" o el pie
})();
