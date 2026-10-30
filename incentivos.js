/* incentivos.js — Programa de Incentivos a la Mejora de la Gestión Municipal 2026 (DS 003-2026-EF, RD 0003-2026-EF/50.01).
   Estructura de los 7 compromisos con indicadores, hitos y lo que el SIAF permite verificar; estado manual guardado en el navegador.
   Depende de Mi entidad (datos E descifrados) y de helpers globales ($, M, P, cls, MES). */
(function () {
  const PI = {
    anio: 2026, norma: 'DS 003-2026-EF (22/01/2026) · RD 0003-2026-EF/50.01 (29/01/2026), fichas modificadas por RD 0021-2026-EF/50.01 (29/07/2026) · Ley 32513',
    calendario: [['2027-03-17', 'Resultados preliminares (MEF)'], ['2027-04-21', 'Resultados finales'], ['2027-06-30', 'Transferencia del incentivo']],
    compromisos: [
      { n: 1, nombre: 'Prevención y reducción de la anemia en niños hasta 12 meses', corto: 'Anemia infantil', ente: 'MINSA · DGIESP', verif: 'Aplicativo de Visitas Domiciliarias, HIS-MINSA, SINADEF, SIEE, FUA del SIS y SIHCE (ficha 1.1)', aplica: '1,059 distritos priorizados (tipos A–G)',
        indicadores: [['1.1', 'Porcentaje de niños de 6 y/o 12 meses sin anemia']],
        hitos: [['2026-02-01', 'Inicio del periodo de medición (01/02 continuadoras; 01/04 recién incorporadas), visitas desde marzo'], ['2026-12-31', 'Visitas domiciliarias y sesiones demostrativas (al menos tres sesiones modulares) durante el periodo'], ['2026-12-31', 'Cierre de medición (ficha 1.1)']],
        siaf: { tipo: 'pp', codigos: ['0001'], nota: 'Gasto del Programa Presupuestal 0001 Articulado Nutricional (visitas domiciliarias, sesiones demostrativas): muestra si hay presupuesto y ejecución detrás del compromiso.' } },
      { n: 2, nombre: 'Mejorar los niveles de recaudación del Impuesto Predial', corto: 'Impuesto Predial', ente: 'MEF · DGPIP (valida con SIAF y SISREPRE)', verif: 'SIAF (recaudación), SISREPRE, tablero de avance', aplica: '1,354 municipalidades: 2.1 tipos A–D (424) · 2.2 tipos E–G (930)',
        indicadores: [['2.1', 'Efectividad de recaudación del predial corriente (tipos A–D)'], ['2.2', 'Aumento de la recaudación total 2026 respecto a 2025 (tipos E–G)']],
        hitos: [['2026-12-31', 'Recaudación medida en SIAF del 1 de enero al 31 de diciembre'], ['2026-12-31', 'Registro de emisión y cobranza en SISREPRE'], ['2027-04-30', 'Evaluación MEF (enero–abril 2027)']],
        siaf: { tipo: 'ingreso', filtro: 'PREDIAL', nota: 'La recaudación del predial la mide el MEF directamente en el SIAF: es la misma fuente que usa el MEF; la medición oficial puede diferir por ajustes y fecha de corte. Para 2.2 ingresa la recaudación total 2025 y el sistema calcula el % de aumento.' } },
      { n: 3, nombre: 'Fortalecimiento y ampliación del Registro de Información Social (RIS)', corto: 'Registro Social (RIS)', ente: 'MIDIS · OFIS', verif: 'REUNIS, RIS (OFIS), RUIPN, SIGOF, visitas de campo ago–set', aplica: '501 municipalidades (tipos A–G)',
        indicadores: [['3.1', 'Población con clasificación socioeconómica vigente en el RIS ']],
        hitos: [['2026-02-01', 'Inicio del periodo de medición y ULE operativa'], ['2026-12-28', 'Fin de registro y certificación de CSE'], ['2026-12-31', 'Corte de medición']],
        siaf: { tipo: 'texto', nota: 'Sin medición en SIAF. Se puede seguir el gasto de la Unidad Local de Empadronamiento (personal, movilidad) buscando "ULE" o "EMPADRONAMIENTO" en las glosas.' , glosa: 'EMPADRON' } },
      { n: 4, nombre: 'Mejorar la prestación de los servicios de agua potable y saneamiento rural', corto: 'Agua y saneamiento rural', ente: 'VIVIENDA · PNSR', verif: 'SIVICA-DATASS, verificación de campo, declaración jurada, SIAF', aplica: '1,654 municipalidades (grupos 1–4)',
        indicadores: [['4.1', 'Viviendas con acceso a agua de calidad (cloro residual, sistemas operativos)']],
        hitos: [['2026-03-31', 'Preselección de sistemas en DATASS'], ['2026-04-30', 'Reemplazos de sistemas'], ['2026-05-29', 'Reducción por condiciones climáticas'], ['2026-07-31', 'PIM de referencia del producto 3000882 (al 31/07)'], ['2026-08-31', 'Actas registradas'], ['2026-09-30', 'Certificado ≥ 80 % y devengado ≥ 60 % del PIM (al 31-jul) del producto 3000882'], ['2026-12-18', 'Devengado ≥ 80 % del PIM del producto 3000882'], ['2026-12-31', 'Control mensual de cloro residual, mantenimiento y operador seleccionado']],
        siaf: { tipo: 'producto', codigos: ['3000882'], reglas: [['2026-09-30', 'cert', 80], ['2026-09-30', 'dev', 60], ['2026-12-18', 'dev', 80]], nota: 'Ficha técnica 4.1 (numeral 3.1): certificar 80 % y devengar 60 % del producto 3000882 al 30-set y devengar 80 % al 18-dic, sobre el PIM al 31-jul según la ficha; aquí se calcula con el PIM vigente al corte, por lo que el porcentaje oficial puede diferir. Vale 5 % del puntaje; el otro 95 % es el indicador de agua clorada.' } },
      { n: 5, nombre: 'Fortalecer el rol de los gobiernos locales en favor de la seguridad ciudadana', corto: 'Seguridad ciudadana', ente: 'MININTER · DGSC', verif: 'SIPCOP-M (patrullaje), reportes de comisarías', aplica: '580 gobiernos locales',
        indicadores: [['5.1', 'Población urbana víctima de robo en los últimos 12 meses'], ['5.2', 'Jurisdicciones de comisarías con patrullaje coordinado'], ['5.3', 'Patrullajes que cumplen parámetros (≥ 75 % municipal válido, ≥ 50 % de días con patrullaje integrado, km mínimos)']],
        hitos: [['2026-12-31', 'Patrullaje municipal e integrado registrado mes a mes en SIPCOP-M'], ['2026-12-31', 'Cámaras interconectadas con la PNP y atención de alertas (Ojo Vigilante)']],
        siaf: { tipo: 'pp', codigos: ['0030'], nota: 'Gasto del PP 0030 Seguridad Ciudadana (patrullaje por sector 3000355, comunidad organizada 3000356): combustible, serenos, cámaras. Un devengado bajo puede ser señal de dificultades para sostener el patrullaje.' } },
      { n: 6, nombre: 'Mejorar la seguridad vial en entornos viales de riesgo', corto: 'Seguridad vial', ente: 'MTC · Dirección de Seguridad Vial', verif: 'Plataforma de Seguridad Vial en Entornos Viales, fotos/videos, verificación de campo', aplica: '252 gobiernos locales (88 provinciales, 164 distritales)',
        indicadores: [['6.1', 'Zonas escolares priorizadas con medidas de seguridad vial'], ['6.2', 'Intersecciones priorizadas intervenidas'], ['6.3', 'Zonas de establecimientos de salud intervenidas']],
        hitos: [['2026-04-30', 'Subsanar mantenimiento de zonas escolares del PI 2024 (ficha 6.1)'], ['2026-12-31', 'Acciones 0 a 3 según el cronograma del MTC (enlace en la ficha); ejecución (demarcación, señalización, reductores, espacios peatonales)']],
        siaf: { tipo: 'pp', codigos: ['0138'], nota: 'Gasto del PP 0138 (seguridad vial: 3000133, 3000478) y de las inversiones viales asociadas. La ejecución de la Acción 3 debería verse como devengado en estas metas antes del corte del MTC.' } },
      { n: 7, nombre: 'Fortalecer la gestión de trámites municipales', corto: 'Trámites municipales', ente: 'PCM · SGP y SGTD; INDECOPI', verif: 'SUT, reporte SGD, aprobación y publicación del TUPA', aplica: '107 municipalidades (mayormente tipos A–B)',
        indicadores: [['7.1', 'Barreras burocráticas eliminadas voluntariamente'], ['7.2', 'Trámites del TUPA estandarizados y simplificados (PAE)'], ['7.3', 'Trámites digitalizados (SGD, PIDE, certificados digitales)']],
        hitos: [['2026-10-30', 'Eliminación voluntaria de barreras burocráticas (INDECOPI), hasta el último día hábil de octubre'], ['2026-12-31', 'TUPA estandarizado aprobado y publicado'], ['2026-12-31', 'Sistema de Gestión Documental operativo']],
        siaf: { tipo: 'texto', nota: 'Sin medición en SIAF. Se puede seguir el gasto en consultorías y software buscando "TUPA", "SGD" o "SIMPLIFICACION" en las glosas.', glosa: 'TUPA' } }
    ]
  };
  const F = n => n == null ? '—' : 'S/ ' + Number(n).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  let METAS = null, MCUR = null;   // metas por municipalidad (Anexo C del PI 2026, cuadros 2026_M_C1..C7 del MEF) -> Web/data/pi_metas.json
  const fetchMetas = () => fetch('pi/pi_metas.json').then(r => { if (!r.ok) throw 0; return r.json(); }).catch(() => fetch('data/pi_metas.json').then(r => r.json()));
  function cargarMetas(cb) { if (METAS) return; METAS = {}; fetchMetas().then(j => { METAS = j; cb && cb(); }).catch(() => { }); }
  function metasDe(ue) { const ux = (typeof UES !== 'undefined' ? UES : []).find(u => u.cod === ue); return ux && METAS && METAS[ux.dist] || null; }
  const aplicaA = (c, S, m) => S['aplica' + c.n] !== undefined ? S['aplica' + c.n] : m ? !!m['c' + c.n] : true;
  const st = { get(ue) { try { return JSON.parse(localStorage.getItem('pi_' + ue) || '{}'); } catch (e) { return {}; } }, set(ue, v) { try { localStorage.setItem('pi_' + ue, JSON.stringify(v)); } catch (e) { } } };
  const hoy = () => hoyPE();
  const ESTADOS = [['pend', 'Pendiente', 'p'], ['proc', 'En proceso', 'warn'], ['ok', 'Cumplido', 'ok'], ['no', 'No cumplido', 'bad']];

  function evaluarSIAF(c, E, META) {
    const s = c.siaf; if (!s) return null; const metas = E.metas;
    if (s.tipo === 'producto' || s.tipo === 'pp') {
      const ms = metas.filter(m => s.tipo === 'producto' ? s.codigos.includes(m.act_proy) : s.codigos.includes(m.pp));
      const t = { pim: 0, cert: 0, comp: 0, dev: 0, gir: 0 }; ms.forEach(m => { for (const k in t) t[k] += m[k] || 0; });
      const reglas = (s.reglas || []).map(([f, campo, min]) => { const pct = t.pim ? 100 * t[campo] / t.pim : 0; return { fecha: f, campo, min, pct, cumple: pct >= min, vencido: f < E.corte }; });
      return { metas: ms, t, reglas };
    }
    if (s.tipo === 'ingreso') {
      const cls_ = (E.ingresos.clasificadores || []).filter(x => (x.nombre || '').toUpperCase().includes(s.filtro));
      const mensual = {}; let total = 0; cls_.forEach(x => { total += x.recaudado || 0; for (const m in x.mensual || {}) mensual[m] = (mensual[m] || 0) + x.mensual[m]; });
      return { clasificadores: cls_, total, mensual, pim: cls_.reduce((a, x) => a + (x.pim || 0), 0) };
    }
    if (s.tipo === 'texto' && s.glosa) return { exps: E.expedientes.filter(e => (e.glosa || '').toUpperCase().includes(s.glosa)).slice(0, 8) };
    return null;
  }

  const Fm = n => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  function diagnostico(c, ev, S, E) {
    const hoyS = hoy(), venc = c.hitos.filter(([f], i) => f < hoyS && !S['hito' + c.n + '_' + i]).length, prox = c.hitos.filter(([f]) => f >= hoyS)[0];
    const d = { color: 'p', titulo: '', frases: [], accion: '' };
    if (ev && (c.siaf.tipo === 'producto' || c.siaf.tipo === 'pp')) {
      const t = ev.t;
      if (!ev.metas.length) { d.color = 'bad'; d.titulo = 'Sin presupuesto en el programa de referencia'; d.frases.push(`La municipalidad no tiene metas en ${c.siaf.tipo === 'producto' ? 'el producto ' : 'el programa presupuestal '}${c.siaf.codigos.join(', ')}. Si el compromiso aplica y el gasto no está en otra cadena (APNOP u otra actividad), se sugiere evaluar una nota modificatoria que habilite presupuesto.`); }
      else {
        const av = 100 * t.dev / (t.pim || 1), avc = 100 * t.cert / (t.pim || 1);
        d.frases.push(`Presupuesto ${Fm(t.pim)} en ${ev.metas.length} meta(s): certificado ${avc.toFixed(0)} %, devengado ${av.toFixed(1)} % al ${E.corte}.`);
        if (ev.reglas.length) {
          const pend = ev.reglas.filter(r => !r.cumple), next = pend[0];
          if (!next) { d.color = 'ok'; d.titulo = 'Hitos presupuestales cumplidos'; }
          else { const falta = Math.max(0, t.pim * next.min / 100 - t[next.campo]); d.color = next.vencido ? 'bad' : (falta / (t.pim || 1) > 0.3 ? 'bad' : 'warn'); d.titulo = `Falta ${next.campo === 'cert' ? 'certificar' : 'devengar'} ${Fm(falta)}`;
            d.frases.push(`Para llegar al ${next.min} % ${next.campo === 'cert' ? 'certificado' : 'devengado'} exigido al ${next.fecha} ${next.vencido ? '(plazo vencido)' : ''} hay que ${next.campo === 'cert' ? 'certificar' : 'devengar'} ${Fm(falta)} más${next.campo === 'dev' ? '; hoy hay ' + Fm(t.cert - t.dev) + ' ya certificados que aún no se han ejecutado' : ''}.`);
            const peor = ev.metas.filter(m => m.pim).map(m => ({ m, saldo: m.pim - m[next.campo] })).sort((a, b) => b.saldo - a.saldo).slice(0, 3);
            if (peor.length) d.accion = 'Dónde está el saldo: ' + peor.map(x => `${x.m.act_proy.startsWith('2') ? 'CUI ' + x.m.act_proy : 'meta ' + x.m.meta + ' ' + (x.m.finalidad_n ? x.m.finalidad_n.toLowerCase() : x.m.finalidad || '')} ${Fm(x.saldo)}`).join(' · ') + '.';
            ev.reglas.filter(r => r.cumple).forEach(r => d.frases.push(`✓ ${r.fecha}: ${r.campo === 'cert' ? 'certificado' : 'devengado'} ${r.pct.toFixed(1)} % ≥ ${r.min} %.`)); }
        } else { d.color = av >= 50 ? 'ok' : av >= 25 ? 'warn' : 'bad'; d.titulo = av >= 50 ? 'Gasto asociado en marcha' : av >= 25 ? 'Gasto asociado lento' : 'Gasto asociado casi sin ejecutar'; d.frases.push(`El SIAF no mide este compromiso directamente; el gasto del programa es la señal de que se está trabajando. Quedan ${Fm(t.pim - t.dev)} por devengar.`); }
      }
    } else if (ev && c.siaf.tipo === 'ingreso') {
      const base = S['base' + c.n] || 0, meses = Object.keys(ev.mensual).sort(), n = meses.length || 1, prom = ev.total / n, proy = ev.total + prom * (12 - n);
      d.frases.push(`Predial recaudado ${Fm(ev.total)} en ${n} meses (${(100 * ev.total / (ev.pim || 1)).toFixed(0)} % del presupuesto de ${Fm(ev.pim)}); ritmo ${Fm(prom)} al mes, proyección a diciembre ${Fm(proy)}.`);
      if (base) { const inc = 100 * (proy - base) / base; const mt = MCUR && MCUR.c2 && MCUR.c2['2.2']; d.color = mt ? (inc >= mt[1] ? 'ok' : inc >= mt[0] ? 'warn' : 'bad') : inc >= 0 ? 'ok' : 'bad'; d.titulo = (inc >= 0 ? `Proyecta +${inc.toFixed(1)} % vs 2025` : `Proyecta ${inc.toFixed(1)} % vs 2025`) + (mt ? ` · su meta: umbral ${mt[0]} %, máxima ${mt[1]} %` : ''); d.frases.push(inc >= 0 ? `Al ritmo actual superaría la recaudación 2025 (${Fm(base)}).` : `Al ritmo actual quedaría ${Fm(base - proy)} por debajo de 2025 (${Fm(base)}): hay que recaudar ${Fm((base - ev.total) / Math.max(1, 12 - n))} al mes en lo que queda del año solo para igualarla.`); }
      else { d.color = ev.pim && ev.total / ev.pim >= n / 12 ? 'ok' : 'warn'; d.titulo = ev.pim && ev.total / ev.pim >= n / 12 ? 'Recaudación al día con el presupuesto' : 'Recaudación por debajo del ritmo'; d.accion = 'Ingresa la recaudación 2025 en el detalle para calcular el indicador 2.2.'; }
    } else {
      d.color = venc ? 'warn' : 'p'; d.titulo = venc ? `${venc} plazo(s) de la ficha ya pasado(s)` : 'Seguimiento por hitos';
      d.frases.push(c.siaf.nota); if (ev?.exps?.length) d.frases.push(`${ev.exps.length} expediente(s) con gasto relacionado en el SIAF.`);
    }
    if (prox) d.frases.push(`Próximo hito: ${prox[0]} · ${prox[1]}.`);
    if (venc && d.color === 'ok') d.color = 'warn';
    return d;
  }
  // ---- infografías SVG ----
  const COL = { ok: '#1B9E5A', warn: '#E39B1E', bad: '#D64545', p: '#1E5AA8' };
  function dona(pct, col, meta, label, sub) {
    const r = 30, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct || 0));
    return `<svg viewBox="0 0 80 80" width="88" height="88" style="flex:0 0 auto"><circle cx="40" cy="40" r="${r}" fill="none" stroke="#E6EAF0" stroke-width="9"/><circle cx="40" cy="40" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c * v / 100} ${c}" transform="rotate(-90 40 40)"/>${meta != null ? `<circle cx="40" cy="40" r="${r}" fill="none" stroke="#1C1917" stroke-width="2" stroke-dasharray="2.5 ${c - 2.5}" stroke-dashoffset="${-c * Math.min(100, meta) / 100}" transform="rotate(-90 40 40)" opacity=".7"/>` : ''}<text x="40" y="38" text-anchor="middle" style="font:800 15px Inter,sans-serif;fill:#1C1917">${label}</text><text x="40" y="52" text-anchor="middle" style="font:700 6px Inter,sans-serif;fill:#8A94A6;letter-spacing:.3px">${sub}</text></svg>`;
  }
  function linea(hitos, S, n, corte, autoOK) {
    const y0 = new Date(PI.anio + '-01-01').getTime(), y1 = new Date(PI.anio + '-12-31').getTime(), X = f => (100 * Math.max(0, Math.min(1, (new Date(f).getTime() - y0) / (y1 - y0)))).toFixed(1);
    const hx = X(hoy());
    return `<div style="position:relative;height:22px;margin:0 6px"><div style="position:absolute;top:10px;left:0;right:0;height:2px;background:#D5DBE3;border-radius:1px"></div><div style="position:absolute;top:10px;left:0;width:${hx}%;height:2px;background:#1E5AA8;opacity:.45"></div><div style="position:absolute;top:2px;left:${hx}%;width:0;height:18px;border-left:1.5px dashed #1C1917;opacity:.6" title="hoy"></div>
      ${hitos.map(([f, t], i) => { const done = S['hito' + n + '_' + i] || (autoOK || []).some(r => r.fecha === f && t.includes(r.campo === 'cert' ? 'Certificado' : 'Devengado')), venc = f < hoy() && !done, c = done ? COL.ok : venc ? COL.bad : '#fff', b = done ? COL.ok : venc ? COL.bad : '#8A94A6'; return `<div title="${f} · ${t}" style="position:absolute;top:5px;left:calc(${X(f)}% - 6px);width:12px;height:12px;border-radius:50%;background:${c};border:2px solid ${b};box-shadow:0 1px 3px rgba(0,0,0,.2)"></div>`; }).join('')}</div>
      <div style="display:flex;justify-content:space-between;font-size:8.5px;color:var(--mut);margin:0 6px"><span>ene</span><span>hoy</span><span>dic</span></div>`;
  }
  function medidor(c, ev, S, E) {
    if (ev && (c.siaf.tipo === 'producto' || c.siaf.tipo === 'pp') && ev.metas.length) { const t = ev.t, next = ev.reglas.find(r => !r.cumple), pct = t.pim ? 100 * t[next ? next.campo : 'dev'] / t.pim : 0; return { pct, meta: next ? next.min : null, label: pct.toFixed(0) + '%', sub: next ? 'META ' + next.min + '%' : 'DEVENGADO' }; }
    if (ev && c.siaf.tipo === 'ingreso') { const base = S['base' + c.n] || 0, n = Object.keys(ev.mensual).length || 1, proy = ev.total / n * 12; const pct = base ? 100 * proy / base : (ev.pim ? 100 * ev.total / ev.pim : 0); return { pct: Math.min(100, pct), meta: base ? 100 : Math.round(100 * n / 12), label: (base ? (100 * (proy - base) / base >= 0 ? '+' : '') + (100 * (proy - base) / base).toFixed(0) : pct.toFixed(0)) + '%', sub: base ? 'VS 2025' : 'DEL PIM' }; }
    const done = c.hitos.filter((h, i) => S['hito' + c.n + '_' + i]).length; return { pct: 100 * done / c.hitos.length, meta: null, label: done + '/' + c.hitos.length, sub: 'HITOS' };
  }
  // ponytail: tarjeta compacta para la vista gerencial — solo número, nombre y una línea de estado; el detalle vive en tarjeta()
  function compactCard(c, S, E, META) {
    const aplica = aplicaA(c, S, MCUR);
    if (!aplica) return `<div class="card pnl" data-abrir="${c.n}" style="cursor:pointer;opacity:.5;padding:14px 16px;border-left:4px solid var(--line);flex-direction:row;align-items:center;gap:14px">
      <div style="width:34px;height:34px;border-radius:50%;background:var(--line);display:grid;place-items:center;font-weight:800;color:var(--ink2);flex:0 0 auto">${c.n}</div>
      <div style="min-width:0;flex:1"><b style="color:var(--ink2)">${c.corto}</b><div class="mutx" style="font-size:11px">No aplica a esta municipalidad · clic para activar</div></div></div>`;
    const estado = S['estado' + c.n] || 'pend', ev = evaluarSIAF(c, E, META), d = diagnostico(c, ev, S, E), col = estado === 'ok' ? 'ok' : estado === 'no' ? 'bad' : d.color;
    const titulo = estado === 'ok' ? 'Cumplido' : estado === 'no' ? 'No cumplido' : d.titulo;
    return `<div class="card pnl" data-abrir="${c.n}" style="cursor:pointer;border-left:5px solid ${COL[col]};padding:14px 16px;flex-direction:row;align-items:center;gap:14px">
      <div style="width:34px;height:34px;border-radius:50%;background:${COL[col]}1F;display:grid;place-items:center;font-weight:800;color:${COL[col]};flex:0 0 auto;font-size:15px">${c.n}</div>
      <div style="min-width:0;flex:1"><b style="font-size:13.5px;color:var(--p2)">${c.corto}</b><div style="font-size:11.5px;color:var(--ink);margin-top:2px">${titulo}</div></div>
      <div style="font-size:20px;color:var(--mut);flex:0 0 auto">›</div></div>`;
  }
  let abiertoN = null, ultimo = null;
  // 22/10/2026: lo que la municipalidad recibió del Programa de Incentivos (PI), año por año (Transferencias del Tesoro, MEF; recurso "Programa de Incentivos (PI)")
  const SHPI = {};
  function recibidoPI(ue, U) {
    if (U && U.cod === ue && U.pi_hist) return Promise.resolve(U.pi_hist);
    const k = (parseInt(ue, 10) % 64).toString().padStart(2, '0');
    if (!SHPI[k]) SHPI[k] = fetch(`data/ue/${k}.json`).then(r => r.json()).catch(() => ({}));
    return SHPI[k].then(b => (b[ue] && b[ue].pi_hist) || []);
  }
  function bloqueRecibido(hist) {
    if (!hist || !hist.length) return '';
    const max = Math.max(...hist.map(h => h[1])), tot = hist.reduce((a, h) => a + h[1], 0), F = v => 'S/ ' + Math.round(v).toLocaleString('es-PE');
    const ult = hist[hist.length - 1], prev = hist.length > 1 ? hist[hist.length - 2] : null, var_ = prev && prev[1] ? Math.round(100 * (ult[1] - prev[1]) / prev[1]) : null;
    return `<section class="pi-rec" aria-label="Recibido por el Programa de Incentivos (PI)"><div class="pi-rech"><div><b>Lo que recibió por el Programa de Incentivos (PI)</b><small>${F(tot)} acreditados entre ${hist[0][0]} y ${ult[0]}${var_ != null ? ` · ${ult[0]}: ${var_ >= 0 ? '+' : ''}${var_} % frente a ${prev[0]}` : ''}</small></div><small class="pi-recs">Transferencias del Tesoro Público, MEF · lo acreditado cada año</small></div>
      <div class="pi-recg">${hist.map(([a, v]) => `<div class="pi-recb" title="${a}: ${F(v)}"><b>${v >= 1e6 ? (v / 1e6).toFixed(1) + ' M' : v >= 1e3 ? Math.round(v / 1e3) + ' mil' : Math.round(v)}</b><i style="height:${Math.max(3, Math.round(100 * v / (max || 1)))}%"></i><span>${a}${a === new Date().getFullYear() ? ' <em>en curso</em>' : ''}</span></div>`).join('')}</div></section>`;
  }
  function pintarRecibido(el, ue, U) { recibidoPI(ue, U).then(h => { const html = bloqueRecibido(h); if (!html) return; const slot = el.querySelector('[data-pi-rec]'); if (slot) slot.outerHTML = html; }); }
  function render(el, E, META, ue, onExp) {
    ultimo = [el, E, META, ue, onExp];
    const S = st.get(ue), corte = E.corte; MCUR = metasDe(ue); if (!METAS) cargarMetas(() => render(el, E, META, ue, onExp));
    if (abiertoN !== null) {
      const c = PI.compromisos.find(x => x.n === abiertoN);
      el.innerHTML = `<div style="padding:8px">
       <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-direction:row-reverse;justify-content:flex-end"><button type="button" class="ov-volver" data-atras-pi title="Volver a las metas"><span class="ov-fl" aria-hidden="true">←</span>Volver</button><div class="pd-lbl" style="margin:0">${c.n}. ${c.corto}</div></div>
       <div class="card" style="padding:0 14px 14px">${tarjeta(c, S, E, META, corte, true)}</div></div>`;
      el.querySelector('[data-atras-pi]').onclick = () => { abiertoN = null; render(el, E, META, ue, onExp); };
    } else {
      el.innerHTML = `<div style="padding:8px">
       <div class="pd-lbl">Programa de Incentivos (PI) ${PI.anio}<small>${PI.norma}</small></div>
       <p class="mutx" style="font-size:11.5px;margin:0 0 10px">Clic en una meta para ver su detalle.</p><div data-pi-rec></div>
       <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${PI.compromisos.map(c => compactCard(c, S, E, META)).join('')}</div></div>`;
      pintarRecibido(el, String(ue), null);
    }
    el.querySelectorAll('[data-abrir]').forEach(x => x.onclick = () => { abiertoN = +x.dataset.abrir; render(el, E, META, ue, onExp); });
    el.querySelectorAll('[data-aplica]').forEach(x => x.onchange = () => { S['aplica' + x.dataset.aplica] = x.checked; st.set(ue, S); render(el, E, META, ue, onExp); });
    el.querySelectorAll('[data-estado]').forEach(x => x.onchange = () => { S['estado' + x.dataset.estado] = x.value; st.set(ue, S); render(el, E, META, ue, onExp); });
    el.querySelectorAll('[data-hito]').forEach(x => x.onchange = () => { S['hito' + x.dataset.hito] = x.checked; st.set(ue, S); render(el, E, META, ue, onExp); });
    el.querySelectorAll('[data-nota]').forEach(x => x.onblur = () => { S['nota' + x.dataset.nota] = x.value; st.set(ue, S); });
    el.querySelectorAll('[data-base]').forEach(x => x.onchange = () => { S['base' + x.dataset.base] = +x.value || 0; st.set(ue, S); render(el, E, META, ue, onExp); });
    el.querySelectorAll('[data-exp]').forEach(x => x.onclick = () => onExp(x.dataset.exp));
  }

  function tarjeta(c, S, E, META, corte, emb) {
    const aplica = aplicaA(c, S, MCUR), estado = S['estado' + c.n] || 'pend', col = ESTADOS.find(e => e[0] === estado)[2];
    const ev = aplica ? evaluarSIAF(c, E, META) : null; let siaf = '';
    if (ev && (c.siaf.tipo === 'producto' || c.siaf.tipo === 'pp')) {
      const t = ev.t, av = t.pim ? 100 * t.dev / t.pim : 0, avc = t.pim ? 100 * t.cert / t.pim : 0;
      siaf = `<div class="pd-row" style="margin:6px 0"><b>Lo que dice el SIAF</b><span style="font-weight:500">${c.siaf.nota}</span></div>
        ${ev.metas.length ? `<table class="pd-tbl"><tr><th>Meta SIAF</th><th>PIM</th><th>Certificado</th><th>Devengado</th><th>Avance</th></tr>${ev.metas.map(m => `<tr><td style="white-space:normal"><b>${m.act_proy}</b> ${(m.nombre_ap || m.nombre || '').slice(0, 60)} <small class="mutx">meta ${m.meta}${m.finalidad_n ? ' · ' + m.finalidad_n : ''}</small></td><td>${F(m.pim)}</td><td>${F(m.cert)}</td><td>${F(m.dev)}</td><td>${P(m.pim ? 100 * m.dev / m.pim : 0)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>${F(t.pim)}</b></td><td><b>${F(t.cert)}</b> <small class="mutx">${avc.toFixed(0)} %</small></td><td><b>${F(t.dev)}</b></td><td>${P(av)}</td></tr></table>` : `<p class="mutx" style="font-size:11px">La entidad no tiene metas presupuestales en ${c.siaf.tipo === 'producto' ? 'el producto ' : 'el programa presupuestal '}${c.siaf.codigos.join(', ')} este año: no registra metas en el PP de referencia; si el gasto está en otra cadena, se sugiere revisarlo; si no hay presupuesto, evaluar una nota modificatoria.</p>`}
        ${ev.reglas.length ? `<table class="pd-tbl" style="margin-top:6px"><tr><th>Hito presupuestal (ficha técnica)</th><th>Exigido</th><th>Logrado al ${corte}</th><th>Estado</th></tr>${ev.reglas.map(r => `<tr><td style="text-align:left">${r.fecha} · ${r.campo === 'cert' ? 'Certificado' : 'Devengado'} del PIM del producto</td><td>≥ ${r.min} %</td><td><b>${r.pct.toFixed(1)} %</b></td><td>${r.cumple ? '<span class="tag ok">Cumplido</span>' : r.vencido ? '<span class="tag bad">Vencido sin cumplir</span>' : `<span class="tag warn">Faltan ${(r.min - r.pct).toFixed(1)} puntos</span>`}</td></tr>`).join('')}</table>` : ''}`;
    } else if (ev && c.siaf.tipo === 'ingreso') {
      const base = S['base' + c.n] || 0, meses = Object.keys(ev.mensual).sort(), acum = meses.reduce((a, m) => a + ev.mensual[m], 0), inc = base ? 100 * (ev.total - base) / base : null;
      siaf = `<div class="pd-row" style="margin:6px 0"><b>Lo que dice el SIAF</b><span style="font-weight:500">${c.siaf.nota}</span></div>
        <table class="pd-tbl"><tr><th>Rubro</th><th>Presupuesto (PIM)</th><th>Recaudado ${PI.anio}</th><th>Avance</th></tr>${ev.clasificadores.map(x => `<tr><td style="text-align:left">${x.cod} ${x.nombre}</td><td>${F(x.pim)}</td><td>${F(x.recaudado)}</td><td>${x.pim ? P(100 * x.recaudado / x.pim) : '—'}</td></tr>`).join('')}<tr><td><b>Total predial</b></td><td><b>${F(ev.pim)}</b></td><td><b>${F(ev.total)}</b></td><td>${ev.pim ? P(100 * ev.total / ev.pim) : '—'}</td></tr></table>
        <table class="pd-tbl" style="margin-top:6px"><tr>${meses.map(m => `<th>${MES[+m - 1]}</th>`).join('')}<th>Acumulado</th></tr><tr>${meses.map(m => `<td>${F(ev.mensual[m])}</td>`).join('')}<td><b>${F(acum)}</b></td></tr></table>
        <div class="pd-row" style="margin-top:8px;align-items:center"><b>Indicador 2.2</b><span style="font-weight:500">Recaudación total del predial en 2025: <input type="number" data-base="${c.n}" value="${base || ''}" placeholder="S/ del año anterior" style="width:150px;padding:3px 6px;border:1.5px solid var(--line);border-radius:6px;font:inherit"> ${inc != null ? `· variación ${PI.anio} frente a 2025 a la fecha: <b style="color:var(--${inc >= 0 ? 'ok' : 'bad'})">${inc >= 0 ? '+' : ''}${inc.toFixed(1)} %</b> (falta lo que se recaude de ${MES[meses.length] || 'los meses siguientes'} a diciembre)` : '<small class="mutx">ingresa el monto 2025 para calcular el aumento</small>'}</span></div>`;
    } else if (ev && ev.exps) {
      siaf = `<div class="pd-row" style="margin:6px 0"><b>Lo que dice el SIAF</b><span style="font-weight:500">${c.siaf.nota}</span></div>${ev.exps.length ? `<table class="pd-tbl"><tr><th>Expediente</th><th>Glosa</th><th>Devengado</th></tr>${ev.exps.map(e => `<tr><td><a class="fc" data-exp="${e.exp}" style="cursor:pointer">${+e.exp}</a></td><td style="text-align:left;white-space:normal">${(e.glosa || '').slice(0, 120)}</td><td>${F(e.tot.D)}</td></tr>`).join('')}</table>` : '<p class="mutx" style="font-size:11px">Sin expedientes con esa glosa.</p>'}`;
    } else if (aplica && c.siaf) siaf = `<div class="pd-row" style="margin:6px 0"><b>Lo que dice el SIAF</b><span style="font-weight:500">${c.siaf.nota}</span></div>`;
    return `<div style="padding:10px 0 0">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px"><b style="font-size:13px">${c.nombre}</b><br><small class="mutx">${c.ente} · aplica a ${c.aplica}</small></div>
       <label style="font-size:11.5px;display:flex;gap:4px;align-items:center"><input type="checkbox" data-aplica="${c.n}" ${aplica ? 'checked' : ''}> Aplica a mi municipalidad</label>
       <select data-estado="${c.n}" ${aplica ? '' : 'disabled'} style="font-size:12px">${ESTADOS.map(([k, t]) => `<option value="${k}" ${k === estado ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      ${aplica ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px"><div style="min-width:0">
        <div class="pd-lbl">Indicadores</div>${c.indicadores.map(([k, t]) => { const v = MCUR && MCUR['c' + c.n] && MCUR['c' + c.n][k]; return `<div class="pd-row"><b>${k}</b><span style="font-weight:500">${t}${MCUR && MCUR['c' + c.n] ? (v ? ` <span class="pd-badge ok" title="Anexo C · metas por municipalidad (MEF)">umbral mínimo ${v[0]}${c.n === 6 ? '' : ' %'} · meta máxima ${v[1]}${c.n === 6 ? '' : ' %'}</span>` : ' <span class="pd-badge">no aplica a esta municipalidad</span>') : ''}</span></div>`; }).join('')}
        <div class="pd-lbl" style="margin-top:8px">Hitos y plazos</div>${c.hitos.map(([f, t], i) => { const auto = ev?.reglas?.find(r => r.fecha === f && t.includes(r.campo === 'cert' ? 'Certificado' : 'Devengado') && r.cumple); const done = auto || S['hito' + c.n + '_' + i]; const venc = f < hoy() && !done; return `<div class="pd-row" style="align-items:center"><b style="min-width:86px;color:${venc ? 'var(--bad)' : done ? 'var(--ok)' : 'var(--ink2)'}">${f}</b><span style="font-weight:500;display:flex;gap:6px;align-items:center"><input type="checkbox" data-hito="${c.n}_${i}" ${done ? 'checked' : ''} ${auto ? 'disabled title="verificado automáticamente en el SIAF"' : ''}> ${t}${auto ? ' <span class="tag ok">SIAF ✓</span>' : venc ? ' <span class="tag bad">vencido</span>' : ''}</span></div>`; }).join('')}
        <div class="pd-lbl" style="margin-top:8px">Medios de verificación</div><div style="font-size:11px;color:var(--ink2)">${c.verif}</div>
        <div class="pd-lbl" style="margin-top:8px">Notas de seguimiento</div><textarea data-nota="${c.n}" rows="2" style="width:100%;font:inherit;font-size:11.5px;border:1.5px solid var(--line);border-radius:6px;padding:5px" placeholder="Responsable, avances, pendientes…">${S['nota' + c.n] || ''}</textarea></div>
        <div style="min-width:0;overflow-x:auto">${siaf}</div></div>` : ''}</div>`;
  }
  // ponytail: 'atras' solo contrae la tarjeta abierta; devuelve true si hizo algo
  // resumen para la vista alcalde: un semáforo por compromiso aplicable
  function resumen(E, META, ue) { const S = st.get(ue); MCUR = metasDe(ue); if (!METAS) cargarMetas(); return PI.compromisos.filter(c => aplicaA(c, S, MCUR)).map(c => { const e = S['estado' + c.n] || 'pend', ev = evaluarSIAF(c, E, META), d = diagnostico(c, ev, S, E); return { n: c.n, corto: c.corto, col: e === 'ok' ? 'ok' : e === 'no' ? 'bad' : d.color, titulo: e === 'ok' ? 'Cumplido' : e === 'no' ? 'No cumplido' : d.titulo, accion: d.accion || d.frases[0] || '' }; }); }

  // ---- vista pública del Programa de Incentivos (PI) (sin SIAF): tarjetas de compromiso con icono, línea de tiempo del MEF y detalle desplegable ----
  const ICO_PI = { 1: 'users', 2: 'coins', 3: 'clipboard', 4: 'drop', 5: 'shield', 6: 'road', 7: 'doc' };
  const COL_PI = { 1: '#B42A2A', 2: '#7A5B12', 3: '#1E5AA8', 4: '#0F6E8C', 5: '#0F2A43', 6: '#2F69B3', 7: '#147A45' };
  const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fD = f => { const [y, m, d] = String(f).split('-'); return d ? `${d}/${m}/${y}` : f; };
  // ---- Programa de Incentivos (PI) de UNA municipalidad: su tipo, las metas que le tocan, qué debe lograr, cómo va con los datos públicos y qué hacer ----
  // Aplicabilidad por tipo (DS 003-2026-EF, art. 5 y Anexo): 'si' = le corresponde por su tipo; 'lista' = depende de la lista nominal del MEF
  // (distritos priorizados, 501 RIS, 580 seguridad, 252 vial, 107 trámites); 'no' = no le corresponde por su tipo. pi_metas.json (Anexo C) manda si existe.
  const APL = { 1: { A:'lista',B:'lista',C:'lista',D:'lista',E:'lista',F:'lista',G:'lista' }, 2: { A:'si',B:'si',C:'si',D:'si',E:'si',F:'si',G:'si' },
    3: { A:'lista',B:'lista',C:'lista',D:'lista',E:'lista',F:'lista',G:'lista' }, 4: { A:'no',B:'lista',C:'no',D:'lista',E:'si',F:'si',G:'si' },
    5: { A:'si',B:'si',C:'si',D:'si',E:'lista',F:'no',G:'no' }, 6: { A:'lista',B:'lista',C:'lista',D:'lista',E:'no',F:'no',G:'no' }, 7: { A:'lista',B:'lista',C:'no',D:'no',E:'no',F:'no',G:'no' } };
  // función presupuestal del gasto asociado a cada meta (señal pública: Consulta Amigable por función), y qué significa
  const FUN = { 1: ['SALUD', 'salud (visitas domiciliarias, sesiones demostrativas)'], 4: ['SANEAMIENTO', 'saneamiento (agua rural, producto 3000882)'], 5: ['ORDEN PUBLICO Y SEGURIDAD', 'orden público y seguridad (patrullaje, serenazgo, cámaras)'], 6: ['TRANSPORTE', 'transporte (señalización, reductores, espacios peatonales)'] };
  const LISTA = { 1: 'los 1,059 distritos priorizados por el MINSA', 3: 'las 501 municipalidades convocadas por el MIDIS', 4: 'las 1,654 municipalidades con sistemas de agua rural (PNSR)', 5: 'los 580 gobiernos locales convocados por el MININTER', 6: 'los 252 gobiernos locales convocados por el MTC', 7: 'las 107 municipalidades convocadas por la PCM' };
  const PIT = { A:'provincial de ciudad principal', B:'provincial no perteneciente a ciudad principal', C:'distrital de Lima Metropolitana', D:'distrital de otra ciudad principal', E:'distrital, más de 70 % de población urbana', F:'distrital, 35–70 % de población urbana', G:'distrital, menos de 35 % de población urbana' };
  const Pm = n => 'S/ ' + (Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(1) + ' M' : Math.round(n).toLocaleString('es-PE'));
  let IPV = null; const cargarIpinv = cb => { if (IPV) return cb(); fetch('data/ipinv.json').then(r => r.json()).then(j => { IPV = j; cb(); }).catch(() => { IPV = {}; cb(); }); };
  function municipal(el, ux, U, opts) {
    const hoy = hoyPE(), mes = new Date().getMonth() + 1, esp = window.ESPERADO != null ? window.ESPERADO : Math.round(100 * mes / 12);
    const ico = n => window.Ico ? Ico(n) : '', RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const m = metasDe(ux.cod), tp = (m && m.tipo) || ux.pi || '', ip = IPV && IPV[ux.cod];   // el Anexo C manda sobre ues.json
    const fun = n => (U && U.funciones || []).find(f => (f.nombre || '').toUpperCase().replace(/Ú/g, 'U') === n);
    const cuis = (U && U.cuis || []).filter(c => c.estado === 'ACTIVO' && !/IRI|PROGRAMA/.test(c.tipo || ''));
    // --- meta de inversiones (Ley 32513, art. 36): siempre, con el indicador que le toca por tipo ---
    const inv = (() => {
      if (!ip) return null; const nom = (typeof IPN !== 'undefined' && IPN[ip.i]) ? IPN[ip.i][0] : 'indicador ' + ip.i;
      const k = ip.p ? (ip.ok ? 'ok' : ip.p <= Math.ceil(0.6 * ip.n) ? 'warn' : 'bad') : 'p';
      const eleg = cuis.filter(c => c.pim > 0 && (c.f8 === 'SI' || c.et_fecha)).map(c => ({ c, av: 100 * (c.dev || 0) / c.pim, saldo: c.pim - (c.dev || 0) })).sort((a, b) => b.saldo - a.saldo);
      const peor = eleg.filter(x => x.av < (ip.c40 || 50)).slice(0, 3);
      const sug = !ip.p ? (ip.i === 5 ? 'El MEF mide este indicador en el Banco de Inversiones: mantén al día el PMI, el F12-B de cada mes, el F8 al cerrar expedientes y el F9 al culminar.' : 'Sin inversiones elegibles: registra el expediente técnico (F8) de las inversiones con PIM para que cuenten.')
        : ip.ok ? `Estimación de Acierta con datos públicos al corte (PIM actual, no el PIM al 30/04 que usa el MEF, y devengado en lugar del girado al 15/01/2027): hoy estaría en el puesto ${ip.p} de ${ip.n}, dentro del 40 % superior. El ranking oficial lo publica el MEF en 2027; se sugiere sostener el ritmo de devengado y girar lo devengado antes del 15/01/2027.`
        : `Se sugiere elevar la ejecución de ${ip.v.toFixed(1)} % a ${ip.c40.toFixed(1)} % para ubicarse en el 40 % superior (puesto ${ip.p} de ${ip.n}). ${peor.length ? 'Dónde está el saldo: ' + peor.map(x => `CUI ${x.c.cui} (${x.av.toFixed(0)} % ejecutado, ${Pm(x.saldo)} por devengar)`).join(' · ') + '.' : ''}`;
      return { k, titulo: 'Ejecución de inversiones', sub: `Ley 32513, art. 36 · indicador ${ip.i} para el tipo ${ip.t}`, meta: `${nom}: estar en el 40 % superior de las municipalidades tipo ${ip.t} al 31 de diciembre`, va: ip.v != null ? `${ip.v.toFixed(1)} %${ip.p ? ` · puesto ${ip.p} de ${ip.n} · corte del 40 %: ${ip.c40.toFixed(1)} %` : ''}` : 'sin medición', pct: ip.v, sug, ico: 'trend', col: '#0F2A43' };
    })();
    // --- las 7 metas del Programa de Incentivos ---
    const metas = PI.compromisos.map(c => {
      const ap = m ? (m['c' + c.n] ? 'si' : 'no') : (APL[c.n][tp] || 'lista');   // con Anexo C (pi_metas.json) la lista nominal manda
      if (ap === 'no') return null;
      const venc = c.hitos.filter(([f]) => f < hoy), prox = c.hitos.find(([f]) => f >= hoy);
      const mc = m && m['c' + c.n] && typeof m['c' + c.n] === 'object' ? m['c' + c.n] : null;
      let ind = c.indicadores; if (mc) ind = ind.filter(([k]) => mc[k] != null); else if (c.n === 2) ind = ind.filter(([k]) => k === '2.1' ? 'ABCD'.includes(tp) : 'EFG'.includes(tp)); if (!ind.length) ind = c.indicadores;
      const um = '';
      let k = 'p', va = '', sug = '', pct = null;
      const f = FUN[c.n] && fun(FUN[c.n][0]);
      if (f && f.pim) { pct = 100 * (f.dev || 0) / f.pim; const nc = cuis.filter(x => (x.funcion || '').toUpperCase().replace(/Ú/g, 'U') === FUN[c.n][0]).length;
        va = `Gasto en ${FUN[c.n][1]}: ${Pm(f.dev || 0)} devengados de ${Pm(f.pim)} (${pct.toFixed(1)} %)${nc ? ` · ${nc} inversión(es) activa(s)` : ''}`;
        k = pct >= esp - 15 ? 'ok' : pct >= esp - 40 ? 'warn' : 'bad'; }
      else if (FUN[c.n]) { va = `Sin presupuesto en la función ${FUN[c.n][0].toLowerCase()} este año.`; k = 'bad'; }
      else if (c.n === 2) { va = 'La recaudación del predial la mide el MEF en el SIAF; aquí no es pública. Con la clave de Mi entidad se ve la recaudación mes a mes y la proyección a diciembre.'; k = 'p'; }
      else va = 'Se verifica en las plataformas del sector, no en el presupuesto.';
      if (venc.length && k !== 'bad') k = k === 'ok' ? 'warn' : k;
      // sugerencia: siempre concreta, con plazo y con lo que exige la ficha técnica
      const S = {
        1: `Registra en el Padrón Nominal y en el aplicativo de visitas cada visita domiciliaria a niños de 4 a 12 meses; la meta se mide por niños de 6 y 12 meses sin anemia (HIS-MINSA). ${pct != null && pct < 25 ? 'El gasto en salud está casi sin ejecutar: se sugiere revisar la habilitación de presupuesto para actores sociales y sesiones demostrativas (PP 0001).' : pct != null && pct < esp - 15 ? 'El gasto en salud va por debajo del ritmo del año: podría convenir asegurar el pago de actores sociales y las sesiones demostrativas (PP 0001).' : ''}`,
        2: 'ABCD'.includes(tp) ? 'Indicador 2.1: efectividad de recaudación del predial corriente. Emite las cuotas en enero, notifica antes de cada vencimiento (feb, may, ago, nov) y registra emisión y cobranza en SISREPRE; el MEF toma la recaudación del SIAF del 1 de enero al 31 de diciembre.' : 'Indicador 2.2: recaudar en 2026 más que en 2025. Actualiza el padrón de predios, emite las cuatro cuotas y registra la cobranza en SISREPRE; el MEF compara la recaudación 2026 contra 2025 en el SIAF.',
        3: 'Mantén operativa la Unidad Local de Empadronamiento: aplica fichas S100, envía los expedientes a OFIS y asiste a los talleres (feb–oct). El corte de clasificación socioeconómica vigente es el 28 de diciembre.',
        4: `Ficha 4.1: certificar 80 % y devengar 60 % del producto 3000882 al 30 de setiembre, y devengar 80 % al 18 de diciembre (sobre el PIM al 31 de julio); además, cloro residual mensual y operador seleccionado en cada sistema. ${pct != null && pct < 60 ? 'El devengado en saneamiento va por debajo del 60 %: podría convenir priorizar las órdenes de compra de cloro y el pago de operadores.' : ''}`,
        5: 'Registra el patrullaje municipal e integrado todos los días en SIPCOP-M (≥ 75 % válido, ≥ 50 % de días con patrullaje integrado, km mínimos) y mantén las cámaras interconectadas con la PNP. El gasto en seguridad (PP 0030) es la señal de que hay combustible, serenos y cámaras.',
        6: `Acción 3 según el cronograma del MTC: demarcación, señalización, reductores y espacios peatonales en las zonas escolares, intersecciones y establecimientos de salud seleccionados. Sube fotos y videos a la Plataforma de Seguridad Vial. ${pct != null && pct < 50 ? 'El gasto en transporte va lento: la ejecución debe verse como devengado antes de esa fecha.' : ''}`,
        7: 'Elimina barreras burocráticas de forma voluntaria ante INDECOPI (hasta el 30 de octubre, último día hábil), aprueba y publica el TUPA estandarizado y pon en operación el Sistema de Gestión Documental antes del 31 de diciembre.'
      };
      sug = S[c.n] + (prox ? ` Próximo plazo: ${fD(prox[0])}, ${prox[1].charAt(0).toLowerCase() + prox[1].slice(1)}.` : '');
      return { n: c.n, k, ap, titulo: c.corto, sub: c.ente, meta: ind.map(([a, t]) => `${a} ${t}` + (mc && Array.isArray(mc[a]) ? ` · su meta: umbral mínimo ${mc[a][0]} %, meta máxima ${mc[a][1]} %` : '')).join(' · '), va, pct, sug, ico: ICO_PI[c.n], col: COL_PI[c.n], venc: venc.length, tot: c.hitos.length, verif: c.verif, hitos: c.hitos, prox };
    }).filter(Boolean);
    const noAp = PI.compromisos.filter(c => !metas.find(x => x.n === c.n));
    const todas = [inv, ...metas].filter(Boolean), nOk = todas.filter(x => x.k === 'ok').length, nMal = todas.filter(x => x.k === 'bad').length;
    const SEM = { ok: 'Gasto asociado en marcha', warn: 'Gasto asociado lento', bad: 'Gasto asociado bajo', p: 'Sin medición pública' };   // 26/10: el semáforo mide el gasto asociado, no el cumplimiento de la meta (eso lo mide el MEF en su plataforma)
    const cal = PI.calendario, prox = cal.find(([f]) => f >= hoy);
    el.innerHTML = `<div class="pi pm">
      <header class="pi-h pm-h"><div><div class="pi-k">Programa de Incentivos (PI) ${PI.anio} · ${esc(PI.norma)}</div><h2>${esc(ux.nombre)}</h2>
        <p>${tp ? `<span class="pm-tipo">Tipo ${esc(tp)}</span> Municipalidad ${esc(PIT[tp] || '')}` : 'Tipo de municipalidad no registrado en la clasificación del MEF'} · ${todas.length} meta${todas.length === 1 ? '' : 's'} que le corresponden${m ? ' (Anexo C del MEF)' : ''} · ${nOk} en camino, ${nMal} atrasada${nMal === 1 ? '' : 's'}</p></div>
        <div class="pi-cal"><div class="pi-calh">Calendario del MEF${prox ? ` <small>· faltan ${Math.round((new Date(prox[0]) - new Date(hoy)) / 864e5)} días para ${prox[1].toLowerCase()}</small>` : ''}</div>
          <ol class="pm-cal">${cal.map(([f, t]) => `<li class="${f <= hoy ? 'ok' : ''}"><b>${fD(f)}</b><span>${esc(t)}</span></li>`).join('')}</ol></div></header>
      <div data-pi-rec></div>
      <section class="pm-g" aria-label="Metas de la municipalidad">${todas.map(x => `<article class="pm-c ${x.k}" style="--c:${x.col}">
        <div class="pm-ch"><span class="pm-ci">${ico(x.ico)}</span><div class="pm-ct"><b>${x.n ? x.n + '. ' : ''}${esc(x.titulo)}</b><small>${esc(x.sub)}${x.ap === 'lista' ? ` · <em>solo si figura en ${esc(LISTA[x.n] || 'la lista del MEF')}</em>` : ''}</small></div><span class="pm-sem ${x.k}">${SEM[x.k]}</span></div>
        <div class="pm-r"><span class="pm-l">${ico('target')}Qué debe lograr</span><p>${esc(x.meta)}</p></div>
        <div class="pm-r"><span class="pm-l">${ico('chart')}Cómo va</span><p>${esc(x.va)}${x.pct != null ? `<span class="pm-bar" title="esperado a esta altura del año: ${esp} %"><i style="width:${Math.min(100, x.pct).toFixed(1)}%"></i><b style="left:${esp}%"></b></span>` : ''}${x.tot ? `<small class="pm-hv">${x.venc} de ${x.tot} plazos ya vencieron · verifícalos en ${esc(x.verif)}</small>` : ''}</p></div>
        <div class="pm-r pm-s"><span class="pm-l">${ico('spark')}Qué hacer</span><p>${esc(x.sug)}</p></div></article>`).join('')}</section>
      ${noAp.length ? `<p class="pm-no">${m ? 'No le corresponden según el Anexo C del MEF' : 'No le corresponden por su tipo'}: ${noAp.map(c => `${c.n}. ${esc(c.corto)}`).join(' · ')}.</p>` : ''}
      <div class="pi-f"><a href="javascript:void(0)" onclick="miEntidad('${esc(String(ux.cod || ''))}')" class="pi-cta">${ico('lock')}<span><b>Diagnóstico en vivo con el SIAF</b><small>recaudación del predial, producto 3000882 y programas 0001, 0030 y 0138, en Mi entidad</small></span></a><span class="pi-src">Fuente: MEF (DS 003-2026-EF, RD 0003-2026-EF/50.01, fichas técnicas), Consulta Amigable y Banco de Inversiones. Herramienta de apoyo, no oficial.</span></div>
    </div>`;
    pintarRecibido(el, ux.cod, U);
    if (!RM && !el.dataset.animado) { el.dataset.animado = 1; el.querySelectorAll('.pm-c,.pi-cal').forEach((x, i) => x.animate && x.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 80 + i * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })); }
  }
  function publico(el, opts) {
    opts = opts || {};
    const ux = opts.ue && (typeof UES !== 'undefined' ? UES : []).find(u => u.cod === opts.ue);
    if (ux && ux.nivel === 'M') { const U_ = (typeof U !== 'undefined' && U && U.cod === ux.cod) ? U : null; const go = () => cargarIpinv(() => municipal(el, ux, U_, opts)); if (METAS) go(); else { METAS = {}; fetchMetas().then(j => { METAS = j; }).catch(() => { }).finally(go); } return; }
    const hoy = hoyPE(); let abierto = null;
    const ico = n => window.Ico ? Ico(n) : '';
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pintar = () => {
      const cal = PI.calendario, pos = f => { const i = cal.findIndex(([x]) => x >= f); return i < 0 ? 100 : (f === cal[i][0] ? 18 + i * 32 : Math.max(2, 18 + i * 32 - 14)); };   // hitos a espacios iguales; 'hoy' antes del próximo
      const prox = cal.find(([f]) => f >= hoy);
      el.innerHTML = `<div class="pi">
        <header class="pi-h"><div><div class="pi-k">Programa de Incentivos a la Mejora de la Gestión Municipal</div><h2>Programa de Incentivos (PI) ${PI.anio}</h2><p>${esc(PI.norma)}</p></div>
          <div class="pi-cal" role="group" aria-label="Calendario del MEF"><div class="pi-calh">Calendario del MEF${prox ? ` <small>· faltan ${Math.round((new Date(prox[0]) - new Date(hoy)) / 864e5)} días para ${prox[1].toLowerCase()}</small>` : ''}</div>
            <div class="pi-tl"><div class="pi-tlp" style="width:${pos(hoy)}%"></div>${cal.map(([f, t]) => `<i class="${f <= hoy ? 'ok' : ''}" style="left:${pos(f)}%" title="${fD(f)} · ${esc(t)}"></i>`).join('')}<b class="pi-hoy" style="left:${pos(hoy)}%"><span>hoy</span></b></div>
            <div class="pi-tlx">${cal.map(([f, t]) => `<div style="left:${pos(f)}%"><b>${fD(f)}</b>${esc(t)}</div>`).join('')}</div></div></header>
        <section class="pi-g" aria-label="Compromisos ${PI.anio}">${PI.compromisos.map(c => { const on = abierto === c.n, col = COL_PI[c.n] || '#0F2A43', venc = c.hitos.filter(([f]) => f < hoy).length;
          return `<article class="pi-c ${on ? 'on' : ''}" style="--c:${col}"><button type="button" class="pi-cb" data-n="${c.n}" aria-expanded="${on}"><span class="pi-ci">${ico(ICO_PI[c.n] || 'target')}</span><span class="pi-cn">${c.n}</span><span class="pi-ct"><b>${esc(c.corto)}</b><small>${esc(c.ente)}</small></span><span class="pi-cm"><span class="pi-ring" style="--p:${c.hitos.length ? Math.round(100 * venc / c.hitos.length) : 0}"><b>${venc}/${c.hitos.length}</b></span><small>hitos vencidos</small></span><span class="pi-ca" aria-hidden="true">${on ? '−' : '+'}</span></button>
            ${on ? `<div class="pi-d"><p class="pi-dn">${esc(c.nombre)}${c.aplica ? ` <span>· aplica a ${esc(c.aplica)}</span>` : ''}</p><div class="pi-dg">
              <div><h4>${ico('target')} Indicadores</h4>${c.indicadores.map(([k, t]) => `<div class="pi-r"><b>${esc(k)}</b><span>${esc(t)}</span></div>`).join('')}</div>
              <div><h4>${ico('calendar')} Hitos y plazos</h4><ol class="pi-hit">${c.hitos.map(([f, t]) => `<li class="${f < hoy ? 'ok' : ''}"><b>${fD(f)}</b><span>${esc(t)}</span></li>`).join('')}</ol></div>
              <div><h4>${ico('check')} Cómo se verifica</h4><p>${esc(c.verif)}</p>${c.siaf && c.siaf.nota ? `<h4>${ico('bank')} Qué muestra el SIAF</h4><p>${esc(c.siaf.nota)}</p>` : ''}</div></div></div>` : ''}</article>`; }).join('')}</section>
        <div class="pi-f"><a href="javascript:void(0)" onclick="miEntidad('${esc(String((opts && opts.ue) || ''))}')" class="pi-cta">${ico('lock')}<span><b>Diagnóstico en vivo por meta</b><small>cruzado con el SIAF, con la clave de esta entidad</small></span></a><span class="pi-src">Fuente: MEF, Programa de Incentivos ${PI.anio}. Herramienta de apoyo, no oficial.</span></div>
      </div>`;
      el.querySelectorAll('.pi-cb').forEach(b => b.onclick = () => { abierto = abierto === +b.dataset.n ? null : +b.dataset.n; pintar(); const t = el.querySelector(`.pi-cb[data-n="${b.dataset.n}"]`); if (t) { t.focus({ preventScroll: true }); if (abierto) t.closest('.pi-c').scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } });
      if (!RM && !el.dataset.animado) { el.dataset.animado = 1; el.querySelectorAll('.pi-c,.pi-cal').forEach((x, i) => x.animate && x.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 80 + i * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })); }
    };
    pintar();
  }
  window.Incentivos = { render, resumen, PI, publico, reset: () => { abiertoN = null; ultimo = null; }, atras: () => { if (abiertoN === null || !ultimo) return false; abiertoN = null; render(...ultimo); return true; } };
})();
