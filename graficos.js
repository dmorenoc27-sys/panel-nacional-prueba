/* graficos.js: gráficos interactivos con Apache ECharts 6 (lib/echarts.simple.min.js, alojado aquí mismo, sin CDN).
   29/10/2026. Reglas: una sola escala por gráfico, colores con significado (azul = lo ejecutado, gris = la referencia), cifras legibles sin
   pasar el ratón, tooltip claro, dataZoom cuando hay más de 16 puntos, tabla oculta para lectores de pantalla y respeto a prefers-reduced-motion.
   Mientras la librería carga (o si no carga) queda el SVG sencillo que ya pintaba cada vista: nada se pierde. */
(function () {
  const C = { p: '#1D4F9A', p2: '#0E2B57', ref: '#C9CFDA', ok: '#1B7F4B', warn: '#8A6508', bad: '#B23A3A', ink: '#1C2430', mut: '#5C6775', grid: '#E6E9EF', acc: '#E0A82E' };
  const REDUCIDO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = v => v == null ? '' : (Math.abs(v) >= 1000 ? (v / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' mil M' : v.toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' M');
  const INST = new WeakMap();
  let carga = null;
  function lib() {
    if (window.echarts) return Promise.resolve();
    if (carga) return carga;
    carga = new Promise((ok, err) => { const s = document.createElement('script'); s.src = 'lib/echarts.simple.min.js?v=6.1.0'; s.async = true; s.onload = ok; s.onerror = () => { carga = null; err(new Error('echarts')); }; document.head.appendChild(s); });
    return carga;
  }
  // el contenedor puede ser un <svg> (vista vieja): se cambia por un <div> con el mismo id, clase y tamaño
  function caja(el) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return null;
    if (el.tagName.toLowerCase() === 'svg') { const d = document.createElement('div'); d.id = el.id; d.className = el.className.baseVal || ''; d.setAttribute('role', 'img'); d.setAttribute('aria-label', el.getAttribute('aria-label') || 'Gráfico'); d.style.cssText = el.getAttribute('style') || ''; el.replaceWith(d); el = d; }
    if (!el.style.minHeight && el.clientHeight < 60) el.style.minHeight = '170px';
    return el;
  }
  function pinta(el, opt, tabla) {
    let ch = INST.get(el); if (!ch || ch.isDisposed()) { ch = echarts.init(el, null, { renderer: 'svg' }); INST.set(el, ch); const ro = new ResizeObserver(() => ch.resize()); ro.observe(el); }
    ch.setOption(Object.assign({ animation: !REDUCIDO, animationDuration: 500, animationEasing: 'cubicOut', textStyle: { fontFamily: 'Manrope, system-ui, sans-serif', color: C.ink } }, opt), true);
    if (tabla) { let t = el.querySelector('table.sr-only'); if (!t) { t = document.createElement('table'); t.className = 'sr-only'; el.appendChild(t); } t.innerHTML = tabla; }
    return ch;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function tablaDe(labels, series) { return `<caption>Valores del gráfico</caption><tr><th>Periodo</th>${series.map(s => `<th>${esc(s.nombre)}</th>`).join('')}</tr>` + labels.map((l, i) => `<tr><td>${esc(l)}</td>${series.map(s => `<td>${esc(M(s.vals[i]))}</td>`).join('')}</tr>`).join(''); }

  /* barras agrupadas: series = [{nombre, vals, color?, ref?}] ; unidad 'S/ millones' ; zoom automático si hay > 16 categorías */
  function barras(el, { labels, series, unidad = 'S/ millones', titulo = '' } = {}) {
    el = caja(el); if (!el) return;
    lib().then(() => {
      const zoom = labels.length > 16;
      const opt = {
        grid: { left: 8, right: 10, top: 10, bottom: zoom ? 34 : 26, containLabel: true },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: C.grid, textStyle: { color: C.ink, fontSize: 12 }, formatter: ps => `<b>${esc(ps[0].axisValue)}</b>` + ps.map(p => `<div style="display:flex;gap:10px;justify-content:space-between"><span>${p.marker} ${esc(p.seriesName)}</span><b>S/ ${M(p.value)}</b></div>`).join('') },
        xAxis: { type: 'category', data: labels, axisTick: { show: false }, axisLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.mut, fontSize: 11, interval: labels.length > 24 ? 'auto' : 0 } },
        yAxis: { type: 'value', name: unidad, nameTextStyle: { color: C.mut, fontSize: 10, align: 'left', padding: [0, 0, 0, -6] }, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.mut, fontSize: 11, formatter: v => v >= 1000 ? (v / 1000) + ' mil' : v } },
        series: series.map((s, i) => ({ name: s.nombre, type: 'bar', data: s.vals.map(v => v == null ? 0 : +(+v).toFixed(2)), itemStyle: { color: s.color || (s.ref || (series.length > 1 && i === 0) ? C.ref : C.p), borderRadius: [4, 4, 0, 0] }, barMaxWidth: 34, barGap: '18%', emphasis: { itemStyle: { color: s.color || (s.ref || (series.length > 1 && i === 0) ? '#B3BBC9' : C.p2) } }, label: series.length === 1 && labels.length <= 12 ? { show: true, position: 'top', fontSize: 10, color: C.mut, formatter: p => p.value ? M(p.value) : '' } : undefined })),
        dataZoom: zoom ? [{ type: 'inside', start: Math.max(0, 100 - 1600 / labels.length), end: 100 }, { type: 'slider', height: 16, bottom: 4, start: Math.max(0, 100 - 1600 / labels.length), end: 100, borderColor: C.grid, fillerColor: 'rgba(29,79,154,.12)', handleSize: 14, textStyle: { fontSize: 10, color: C.mut } }] : undefined,
        legend: series.length > 1 ? { bottom: zoom ? 20 : 0, left: 'center', icon: 'roundRect', itemWidth: 12, itemHeight: 8, textStyle: { color: C.mut, fontSize: 11 } } : undefined
      };
      pinta(el, opt, tablaDe(labels, series));
      if (titulo) el.setAttribute('aria-label', titulo);
    }).catch(() => { });
  }

  /* líneas de avance en el tiempo: series = [{nombre, puntos:[[fechaISO, valor]], color}] ; finPlazo = fecha ISO (línea vertical) */
  function linea(el, { series, unidad = '%', finPlazo = null } = {}) {
    el = caja(el); if (!el) return;
    lib().then(() => {
      const fmtF = v => new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
      const opt = {
        grid: { left: 8, right: 14, top: 12, bottom: series.length > 1 ? 30 : 22, containLabel: true },
        tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: C.grid, textStyle: { color: C.ink, fontSize: 12 }, formatter: ps => `<b>${fmtF(ps[0].value[0])}</b>` + ps.map(p => `<div style="display:flex;gap:10px;justify-content:space-between"><span>${p.marker} ${esc(p.seriesName)}</span><b>${(+p.value[1]).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${unidad}</b></div>`).join('') },
        xAxis: { type: 'time', axisLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.mut, fontSize: 10, formatter: '{MMM} {yy}' }, splitLine: { show: false } },
        yAxis: { type: 'value', min: 0, max: unidad === '%' ? 100 : null, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.mut, fontSize: 10, formatter: v => v + (unidad === '%' ? ' %' : '') } },
        legend: series.length > 1 ? { bottom: 0, left: 'center', icon: 'roundRect', itemWidth: 12, itemHeight: 8, textStyle: { color: C.mut, fontSize: 11 } } : undefined,
        series: series.map((s, i) => ({ name: s.nombre, type: 'line', data: s.puntos, smooth: 0.25, symbol: 'circle', symbolSize: 6, showSymbol: s.puntos.length <= 24, lineStyle: { width: 2.2, color: s.color || C.p }, itemStyle: { color: s.color || C.p, borderColor: '#fff', borderWidth: 1.5 }, areaStyle: i === 0 ? { color: 'rgba(29,79,154,.08)' } : undefined,
          markLine: i === 0 && finPlazo ? { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: C.bad, width: 1.5 }, label: { formatter: 'fin de plazo', color: C.bad, fontSize: 10, position: 'insideEndTop' }, data: [{ xAxis: finPlazo }] } : undefined })),
        dataZoom: Math.max(...series.map(s => s.puntos.length)) > 18 ? [{ type: 'inside' }] : undefined
      };
      pinta(el, opt, `<caption>Avance declarado</caption>` + series.map(s => `<tr><th>${esc(s.nombre)}</th>${s.puntos.map(p => `<td>${esc(p[0])}: ${esc(p[1])} ${unidad}</td>`).join('')}</tr>`).join(''));
    }).catch(() => { });
  }
  window.Graficos = { barras, linea, lib };
})();
