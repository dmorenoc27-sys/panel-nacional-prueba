/* diag.js — caja negra de Acierta (22/10/2026). Se carga ANTES que todo lo demás.
   Por qué: en Chrome real la página se congeló (bucle infinito) y en pruebas automáticas no se reproduce. Esto deja rastro
   aunque la pestaña muera: cada paso se escribe de inmediato en localStorage ('acierta_diag'), y al abrir de nuevo se ve
   dónde quedó. Además corta en seco cualquier MutationObserver que se dispare en bucle (la causa típica de un cuelgue total).
   Solo guarda nombres de vistas y de archivos:línea, nunca datos de la entidad ni claves. Ver: localStorage.acierta_diag */
(function () {
  const K = 'acierta_diag', MAX = 80;
  let log = [];
  try { const prev = JSON.parse(localStorage.getItem(K) || '{}'); if (prev.vivo) prev.log.push(['!', 'la sesión anterior terminó sin cerrarse (posible cuelgue)']); localStorage.setItem(K + '_prev', JSON.stringify(prev)); } catch (e) { }
  const t0 = Date.now();
  function anota(tipo, txt) {
    log.push([((Date.now() - t0) / 1000).toFixed(1), tipo, String(txt).slice(0, 160)]); if (log.length > MAX) log = log.slice(-MAX);
    try { localStorage.setItem(K, JSON.stringify({ inicio: new Date(t0).toISOString(), vivo: 1, hash: location.hash, ua: navigator.userAgent.slice(0, 120), log })); } catch (e) { }
  }
  // origen de quien crea algo: primer archivo:línea de la pila que no sea este archivo
  const origen = () => { const s = (new Error().stack || '').split('\n').slice(2).map(l => (l.match(/\/([^\/?#:\s]+)(?:\?[^:\s]*)?:(\d+):\d+/) || [])).find(m => m[1] && m[1] !== 'diag.js'); return s ? s[1] + ':' + s[2] : '?'; };
  anota('carga', location.href.replace(/[?&]r=\d+/, ''));
  addEventListener('hashchange', () => anota('vista', location.hash));
  addEventListener('error', e => anota('error', `${e.message} @ ${(e.filename || '').split('/').pop()}:${e.lineno}`));
  addEventListener('unhandledrejection', e => anota('promesa', e.reason && (e.reason.message || e.reason)));
  addEventListener('pagehide', () => { try { const s = JSON.parse(localStorage.getItem(K)); s.vivo = 0; localStorage.setItem(K, JSON.stringify(s)); } catch (e) { } });
  setInterval(() => anota('latido', location.hash), 5000);   // si el último latido es viejo, ahí se congeló

  // cortacircuitos: un MutationObserver que se dispara una y otra vez SIN que el navegador recupere el turno (bucle de microtareas, lo que
  // congela la pestaña) se desconecta al llegar a 200 seguidas y queda anotado. Uso normal: la racha vuelve a 0 en cuanto la página respira.
  const MO = window.MutationObserver;
  window.MutationObserver = function (cb) {
    const de = origen(); let racha = 0, pend = false;
    return new MO(function (ms, o) {
      if (!pend) { pend = true; setTimeout(() => { racha = 0; pend = false; }, 0); }
      if (++racha > 200) { o.disconnect(); anota('BUCLE', `MutationObserver de ${de} desconectado: ${racha} disparos seguidos sin respiro`); return; }
      return cb.call(this, ms, o);
    });
  };
  window.MutationObserver.prototype = MO.prototype;

  // tareas largas (> 1 s) con el script responsable, cuando el navegador lo informa (Chrome 123+)
  try { new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.duration > 1000 && document.visibilityState === 'visible') anota('lento', `${Math.round(e.duration)} ms en ${location.hash} · ${(e.scripts || []).slice(0, 2).map(s => `${(s.sourceURL || '').split('/').pop().split('?')[0]}:${s.sourceFunctionName || s.invoker || ''}`).join(', ')}`); })).observe({ type: 'long-animation-frame', buffered: true }); } catch (e) { }
  // inicio y fin de cada cambio de vista: si queda un 'go' sin su 'go fin', el cuelgue fue al pintar esa vista
  document.addEventListener('DOMContentLoaded', () => { const g = window.go; if (typeof g !== 'function') return;
    window.go = async function (r) { let s = ''; try { s = JSON.stringify(r || {}); } catch (e) { } anota('go', s.slice(0, 100)); try { return await g.apply(this, arguments); } finally { anota('go fin', location.hash); } }; });
  window.AciertaDiag = { anota, ver: () => JSON.parse(localStorage.getItem(K) || '{}'), anterior: () => JSON.parse(localStorage.getItem(K + '_prev') || '{}') };
})();
