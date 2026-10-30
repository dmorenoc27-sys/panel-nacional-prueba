/* iconos.js — set de iconos propios de Acierta (trazo 1.75, 24x24, currentColor) y reemplazo de emojis en pantalla.
   window.Ico(nombre, tam?) -> '<svg class="ico">…</svg>'
   ponytail: los emojis que quedan en plantillas viejas (11 archivos) se cambian en el DOM con un MutationObserver, en vez de
   editar ~200 cadenas a mano; los textos que van a Excel/PPT no se tocan porque no pasan por el DOM. Si un día pesa, migrar las plantillas a Ico(). */
(function () {
  const P = {
    home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.8V20h13V9.8"/><path d="M10 20v-5.5h4V20"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    trend: '<path d="M3.5 17 9 11.5l3.5 3.5L20.5 7"/><path d="M15.5 7h5v5"/>',
    coins: '<ellipse cx="9" cy="8" rx="5.5" ry="3"/><path d="M3.5 8v4c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3V8"/><path d="M14.5 12.3c3.2.1 6 1.3 6 3 0 1.8-2.5 3.2-5.5 3.2s-5.5-1.4-5.5-3.2"/>',
    cash: '<rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
    bank: '<path d="M3.5 9.5 12 4.5l8.5 5"/><path d="M5 9.5h14"/><path d="M6.5 12.5v5M10.2 12.5v5M13.8 12.5v5M17.5 12.5v5"/><path d="M4 20h16"/>',
    clipboard: '<rect x="5.5" y="5" width="13" height="15.5" rx="2"/><path d="M9 5V3.5h6V5"/><path d="M9 10.5h6M9 14h6M9 17.5h3.5"/>',
    doc: '<path d="M6.5 3.5h7.5l4 4V20.5h-11.5z"/><path d="M14 3.5v4h4"/><path d="M9.5 12h5.5M9.5 15.5h5.5"/>',
    receipt: '<path d="M6 3.5h12V20.5l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 8.5h6M9 12h6"/>',
    handshake: '<path d="M3 8.5 7 6l4 2.5"/><path d="M21 8.5 17 6l-4.5 2.8-3 3.2a1.7 1.7 0 0 0 2.4 2.4L14 12.5"/><path d="m14 12.5 3.5 3.5M11.5 17.5l1.8 1.7a1.7 1.7 0 0 0 2.4-2.4M3 8.5v7l5.5 4.3a1.7 1.7 0 0 0 2.4-2.4M21 8.5v7l-2.5 1.5"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.5-3.3 3-5 6-5s5.5 1.7 6 5"/><path d="M15.5 5.7a3.2 3.2 0 0 1 0 5.8M18 14.8c1.7.8 2.7 2.4 3 4.7"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    medal: '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 9.8 6 3.5h4l2 4.5 2-4.5h4l-2.5 6.3"/><path d="m12 12.3.9 1.7 1.8.3-1.3 1.3.3 1.9-1.7-.9-1.7.9.3-1.9-1.3-1.3 1.8-.3z"/>',
    trophy: '<path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5c0 3 1.3 4.5 3.3 4.8M16.5 6h3c0 3-1.3 4.5-3.3 4.8"/><path d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5z"/>',
    alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4.5M12 17v.01"/>',
    siren: '<path d="M7 17.5v-5a5 5 0 0 1 10 0v5"/><path d="M5 17.5h14v3H5z"/><path d="M12 3v1.5M4.5 6l1.2 1.2M19.5 6l-1.2 1.2M12 12.5v2"/>',
    ban: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
    scale: '<path d="M12 4v16M7.5 20h9M5 7.5h14"/><path d="m5 7.5-2.5 6a2.7 2.7 0 0 0 5 0zM19 7.5l-2.5 6a2.7 2.7 0 0 0 5 0z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 7.5-1.9"/><path d="M12 14.5v2"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="M8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17h.01M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    hourglass: '<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5c0 5 8 5.5 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 5.5-8 8.5s8 3.5 8 8.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
    printer: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14.5h10V20H7z"/>',
    star: '<path d="m12 4 2.5 5.2 5.7.8-4.1 4 1 5.7L12 17l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
    starFill: '<path d="m12 4 2.5 5.2 5.7.8-4.1 4 1 5.7L12 17l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" fill="currentColor"/>',
    download: '<path d="M12 4v11M7.5 11 12 15.5 16.5 11"/><path d="M5 19.5h14"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    pin: '<path d="M12 21s6.5-5.8 6.5-11a6.5 6.5 0 0 0-13 0c0 5.2 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    building: '<path d="M5 20.5V5.5l8-2v17"/><path d="M13 9.5h6v11"/><path d="M3.5 20.5h17M8 8.5h2M8 12h2M8 15.5h2M16 13h.01M16 16.5h.01"/>',
    crane: '<path d="M6 20.5V4.5h3l10 4H6"/><path d="M9 4.5v4M17 8.5v5"/><path d="M15.5 13.5h3v3h-3zM3.5 20.5h9"/>',
    road: '<path d="M8 3.5 4.5 20.5M16 3.5l3.5 17"/><path d="M12 4.5v3M12 10.5v3M12 16.5v3"/>',
    rocket: '<path d="M13.5 4c3.5.3 6 2.8 6.5 6.5-1.5 3-4 5.5-8 7L8.5 14c1-4 2.5-7.5 5-10z"/><circle cx="14.5" cy="9.5" r="1.6"/><path d="M8.5 14 5 14.5l2.5-4M10 15.5 9.5 19l4-2.5M5.5 18.5l2-2"/>',
    puzzle: '<path d="M9.5 4.5h5v3a1.8 1.8 0 1 0 3 0h2v5.5h-2a1.8 1.8 0 1 0 0 3.5h2v3h-5.5v-2a1.8 1.8 0 1 0-3.5 0v2H5v-5.5h2a1.8 1.8 0 1 0 0-3.5H5V7.5h4.5z"/>',
    satellite: '<path d="m13 6 5 5-3.5 3.5-5-5z"/><path d="m6.5 4.5 3 3-3 3-3-3zM16.5 14.5l3 3-3 3-3-3z"/><path d="M4 16a4.5 4.5 0 0 0 4.5 4.5M4 12.5a8 8 0 0 0 8 8"/>',
    broom: '<path d="M19.5 4.5 12 12"/><path d="M9.5 10.5 13.5 14.5c-1 3.5-4 5.5-9.5 5.5 0-5.5 2-8.5 5.5-9.5z"/><path d="M7 16.5 9 18.5"/>',
    chain: '<rect x="3.5" y="9" width="8" height="6" rx="3"/><rect x="12.5" y="9" width="8" height="6" rx="3"/><path d="M9.5 12h5"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 0 1-13 5M4.5 12a7.5 7.5 0 0 1 13-5"/><path d="M17.5 3.5V7H14M6.5 20.5V17H10"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    spark: '<path d="M12 3.5 13.8 9.2 19.5 11l-5.7 1.8L12 18.5l-1.8-5.7L4.5 11l5.7-1.8z"/><path d="M19 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    tools: '<path d="M14.5 6.5a4 4 0 0 0 5 5L11 20a2 2 0 0 1-3-3z"/><path d="m4 4 4 4M5.5 8.5l3-3"/>',
    box: '<path d="m12 3.5 8 4v9l-8 4-8-4v-9z"/><path d="m4 7.5 8 4 8-4M12 11.5v9"/>',
    ruler: '<path d="M4 20V4l16 16z"/><path d="M8 20v-6.5l6.5 6.5"/>',
    drop: '<path d="M12 3.5c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z"/>',
    flag: '<path d="M5.5 21V4"/><path d="M5.5 5h12l-2.5 4 2.5 4h-12"/>',
    pen: '<path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19z"/><path d="m14 6.5 3.5 3.5"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.5-1.5 1.6-2.2 3-2.2s2.5.7 3 2.2M14.5 10h4M14.5 13.5h4"/>',
    scroll: '<path d="M7 4.5h11.5v13a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 0 2.5-2.5V6a1.5 1.5 0 0 0-3 0v2.5h3"/><path d="M11.5 9.5h4M11.5 13h4"/>',
    folder: '<path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4.5l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
    barrier: '<rect x="3" y="8.5" width="18" height="6" rx="1"/><path d="M6 20.5v-6M18 20.5v-6M7 14.5l4-6M12.5 14.5l4-6"/>',
    arrow: '<path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5"/>',
    back: '<path d="M19.5 12h-14M11 6.5 5.5 12l5.5 5.5"/>',
    layers: '<path d="m12 4 9 4.5-9 4.5-9-4.5z"/><path d="m3 12.5 9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
    map: '<path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    shield: '<path d="M12 3.5 19.5 6v6c0 4.5-3 7.3-7.5 8.5C7.5 19.3 4.5 16.5 4.5 12V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4z"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16.5" height="11.5" rx="2"/><path d="M16 13.5h.01M4 7.5V17"/>',
    percent: '<path d="M18.5 5.5 5.5 18.5"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>'
  };
  function Ico(n, s) { return `<svg class="ico" viewBox="0 0 24 24" ${s ? `width="${s}" height="${s}" ` : ''}fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[n] || P.target}</svg>`; }
  Ico.nombres = Object.keys(P);
  const E = { '📑': 'doc', '🎯': 'target', '🏅': 'medal', '💰': 'coins', '⚠': 'alert', '🏦': 'bank', '🧭': 'compass', '⬇': 'download', '👥': 'users', '📋': 'clipboard', '📊': 'chart', '📅': 'calendar', '☆': 'star', '★': 'starFill', '⛔': 'ban', '🤝': 'handshake', '💵': 'cash', '💸': 'cash', '🔒': 'lock', '🔓': 'unlock', '⚖': 'scale', '⏳': 'hourglass', '📄': 'doc', '✅': 'check', '✔': 'check', '🧹': 'broom', '📈': 'trend', '🏗': 'crane', '🚨': 'siren', '📡': 'satellite', '🛰': 'satellite', '🧩': 'puzzle', '🏆': 'trophy', '🔗': 'link', '🖨': 'printer', '✨': 'spark', '✦': 'spark', '🔍': 'search', '🔎': 'search', '📦': 'box', '🛠': 'tools', '📐': 'ruler', '🏢': 'building', '🛣': 'road', '⏱': 'clock', '📌': 'pin', '📍': 'pin', '🚀': 'rocket', '💧': 'drop', '⛓': 'chain', '🔁': 'refresh', '📆': 'calendar', '🧾': 'receipt', '🏛': 'bank', '📇': 'card', '✍': 'pen', '📝': 'pen', '📜': 'scroll', '🪙': 'coins', '🗂': 'folder', '🏁': 'flag', '❌': 'x', '✖': 'x', '🚧': 'barrier', '⤢': 'expand' };
  const RE = new RegExp('(' + Object.keys(E).join('|') + ')\\uFE0F?', 'u'), REG = new RegExp(RE.source, 'gu');
  const NO = /^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|INPUT|svg|text|tspan)$/;
  function limpiar(raiz) {
    if (!raiz || (raiz.nodeType === 1 && (NO.test(raiz.nodeName) || raiz.closest('svg,[data-emoji]')))) return;
    const tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, { acceptNode: n => RE.test(n.nodeValue) && !NO.test(n.parentNode.nodeName) && !n.parentNode.closest('svg,[data-emoji]') ? 1 : 2 });
    const nodos = []; if (raiz.nodeType === 3) { if (RE.test(raiz.nodeValue) && raiz.parentNode && !NO.test(raiz.parentNode.nodeName) && !raiz.parentNode.closest('svg,[data-emoji]')) nodos.push(raiz); } else while (tw.nextNode()) nodos.push(tw.currentNode);
    for (const n of nodos) {
      const t = document.createElement('template');
      t.innerHTML = n.nodeValue.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(REG, (m, e) => Ico(E[e]));
      n.replaceWith(t.content);
    }
  }
  window.Ico = Ico; Ico.limpiar = limpiar;
  if (typeof document === 'undefined') return;
  const arranca = () => { limpiar(document.body); new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') limpiar(m.target); else for (const n of m.addedNodes) if (n.nodeType === 1 || n.nodeType === 3) limpiar(n); } }).observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.body) arranca(); else document.addEventListener('DOMContentLoaded', arranca);
})();
