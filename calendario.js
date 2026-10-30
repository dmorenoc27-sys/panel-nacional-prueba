/* calendario.js — selector de fecha de corte de ACIERTA. window.Calendario.abrir({ancla, dias, sel, actual, min, max, onPick, onAnio})
   dias: {'2026-10-11':{hora}} fechas con foto guardada (en negrita y seleccionables); actual: fecha del corte vigente;
   sel: fecha elegida o null (= vigente). onAnio(y): ver el cierre de un año anterior. Sin dependencias; teclado: flechas, Enter, Esc. */
(function () {
  const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
  const DS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const larga = f => { const [y, m, d] = f.split('-').map(Number); return `${d} de ${MES[m - 1]} de ${y}`; };
  let abierto = null;
  function cerrar() { if (!abierto) return; abierto.el.remove(); document.removeEventListener('mousedown', abierto.fuera, true); document.removeEventListener('keydown', abierto.tecla, true); window.removeEventListener('resize', abierto.pos); const a = abierto.ancla; abierto = null; a?.setAttribute('aria-expanded', 'false'); a?.focus(); }
  function abrir(o) {
    if (abierto) { cerrar(); return; }
    const dias = o.dias || {}; const actual = o.actual; const hoy = new Date();
    const fechas = Object.keys(dias).sort(); const minF = o.min || fechas[0] || actual; const maxF = actual || fechas[fechas.length - 1] || iso(hoy);
    const anioMin = o.anioMin || Math.min(+minF.slice(0, 4), +maxF.slice(0, 4)); const anioMax = +maxF.slice(0, 4);
    let cur = (o.sel || actual || iso(hoy)).slice(0, 7); let foco = o.sel || actual;
    const el = document.createElement('div'); el.className = 'cal'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'false'); el.setAttribute('aria-label', 'Elegir la fecha de corte de la información');
    const tiene = f => !!dias[f] || f === actual;
    function render() {
      const [y, m] = cur.split('-').map(Number); const first = new Date(y, m - 1, 1); const n = new Date(y, m, 0).getDate(); const off = (first.getDay() + 6) % 7;
      const anios = []; for (let a = anioMax; a >= anioMin; a--) anios.push(a);
      const esteAnio = y === anioMax; const conFoto = fechas.filter(f => f.startsWith(cur)).length + (actual && actual.startsWith(cur) && !dias[actual] ? 1 : 0);
      el.innerHTML = `
      <div class="cal-h">
        <button type="button" class="cal-nav" data-nav="-1" aria-label="Mes anterior"><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg></button>
        <div class="cal-sel">
          <select class="cal-mes" aria-label="Mes">${MES.map((x, i) => `<option value="${i + 1}" ${i + 1 === m ? 'selected' : ''}>${x[0].toUpperCase() + x.slice(1)}</option>`).join('')}</select>
          <select class="cal-anio" aria-label="Año">${anios.map(a => `<option ${a === y ? 'selected' : ''}>${a}</option>`).join('')}</select>
        </div>
        <button type="button" class="cal-nav" data-nav="1" aria-label="Mes siguiente"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></button>
      </div>
      <div class="cal-g" role="group" aria-label="Días del mes">${DS.map(d => `<span class="cal-d" aria-hidden="true">${d}</span>`).join('')}${Array.from({ length: off }, () => '<span></span>').join('')}${Array.from({ length: n }, (_, i) => { const f = `${cur}-${String(i + 1).padStart(2, '0')}`; const ok = tiene(f); const cls = ['cal-n', ok ? 'con' : 'sin', f === (o.sel || actual) ? 'sel' : '', f === actual ? 'act' : '', f === iso(hoy) ? 'hoy' : ''].filter(Boolean).join(' '); return `<button type="button" class="${cls}" data-f="${f}" ${ok ? '' : 'disabled'} tabindex="${f === foco ? 0 : -1}" aria-label="${larga(f)}${ok ? (f === actual ? ', corte vigente' : ', con información') : ', sin información guardada'}" title="${ok ? (dias[f]?.hora ? 'Corte de las ' + dias[f].hora : 'Corte vigente') : 'Sin información guardada'}">${i + 1}</button>`; }).join('')}</div>
      <p class="cal-nota">Selecciona la fecha de la que deseas ver la información. Los días en <b>negrita</b> tienen datos guardados${conFoto === 0 ? ' (este mes no tiene días guardados)' : ''}.</p>
      <div class="cal-f">
        ${esteAnio ? `<button type="button" class="cal-btn" data-ult>Volver a lo último (${larga(actual).replace(/ de (\d{4})$/, '')})</button>` : `<button type="button" class="cal-btn" data-anio="${y}">Ver el cierre del año ${y}</button>`}
        ${o.sel ? `<span class="cal-leg">Viendo el ${larga(o.sel)}</span>` : `<span class="cal-leg">Viendo el corte vigente</span>`}
      </div>`;
      el.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => { const d = new Date(y, m - 1 + +b.dataset.nav, 1); if (d.getFullYear() < anioMin || d.getFullYear() > anioMax) return; cur = iso(d).slice(0, 7); render(); });
      el.querySelector('.cal-mes').onchange = e => { cur = `${y}-${String(e.target.value).padStart(2, '0')}`; render(); };
      el.querySelector('.cal-anio').onchange = e => { cur = `${e.target.value}-${String(m).padStart(2, '0')}`; render(); };
      el.querySelectorAll('.cal-n:not([disabled])').forEach(b => b.onclick = () => { const f = b.dataset.f; cerrar(); o.onPick(f === actual ? null : f); });
      el.querySelector('[data-ult]')?.addEventListener('click', () => { cerrar(); o.onPick(null); });
      el.querySelector('[data-anio]')?.addEventListener('click', e => { cerrar(); o.onAnio && o.onAnio(+e.currentTarget.dataset.anio); });
    }
    render(); document.body.appendChild(el);
    const pos = () => { const r = o.ancla.getBoundingClientRect(); const w = el.offsetWidth, h = el.offsetHeight; let x = r.left, yy = r.top - h - 8; if (yy < 8) yy = Math.min(window.innerHeight - h - 8, r.bottom + 8); if (x + w > window.innerWidth - 8) x = window.innerWidth - w - 8; el.style.left = Math.max(8, x) + 'px'; el.style.top = Math.max(8, yy) + 'px'; };
    pos(); requestAnimationFrame(() => el.classList.add('on'));
    const fuera = e => { if (!el.contains(e.target) && e.target !== o.ancla && !o.ancla.contains(e.target)) cerrar(); };
    const tecla = e => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
      const act = document.activeElement; if (!act || !act.classList || !act.classList.contains('cal-n')) return;
      const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]; if (!d) return; e.preventDefault();
      const f = act.dataset.f; const dt = new Date(+f.slice(0, 4), +f.slice(5, 7) - 1, +f.slice(8, 10) + d); const nf = iso(dt);
      if (nf.slice(0, 7) !== cur) { cur = nf.slice(0, 7); foco = nf; render(); }
      const b = el.querySelector(`.cal-n[data-f="${nf}"]`); if (b) { el.querySelectorAll('.cal-n').forEach(x => x.tabIndex = -1); b.tabIndex = 0; b.focus(); foco = nf; }
    };
    document.addEventListener('mousedown', fuera, true); document.addEventListener('keydown', tecla, true); window.addEventListener('resize', pos);
    abierto = { el, fuera, tecla, pos, ancla: o.ancla }; o.ancla.setAttribute('aria-expanded', 'true');
    (el.querySelector('.cal-n[tabindex="0"]') || el.querySelector('.cal-n:not([disabled])') || el.querySelector('select'))?.focus();
  }
  window.Calendario = { abrir, cerrar, larga };
})();
