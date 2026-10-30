/* fed.js — Fondo de Estímulo al Desempeño y Logro de Resultados Sociales (FED), edición 2025-2026.
   Norma: DS 012-2025-MIDIS (31/12/2025) aprueba el Instrumento (11 artículos, Anexo I definiciones, Anexo II metas por gobierno regional);
   Reglamento del FED: DS 003-2024-MIDIS; creación: 84.ª DCF Ley 30114; violencia contra la mujer: 69.ª DCF Ley 30372 y art. 18 Ley 30879.
   Es el equivalente regional del Programa de Incentivos municipal. Metas por región en data/fed_metas.json (Anexo II, OCR verificado).
   Depende de helpers globales ($, N). Estado manual por indicador en el navegador (localStorage). */
(function () {
  const FED = {
    norma: 'DS 012-2025-MIDIS (31/12/2025) · Reglamento DS 003-2024-MIDIS · Ley 30114, 84.ª DCF',
    periodo: [['1', '1.ª verificación', '2025-12-01', '2026-05-31'], ['2', '2.ª verificación', '2026-06-01', '2026-12-31']],
    reglas: ['Cada indicador tiene basal y meta por verificación (art. 7 y Anexo II); las fichas técnicas las aprueba el Comité Directivo del FED.',
      'La entidad rectora entrega la base de datos 25 días hábiles después del corte; MIDIS verifica en 40 días hábiles; el Comité aprueba en 5 (art. 8).',
      'Cumplimiento parcial = transferencia proporcional al avance (art. 8.10). El monto máximo por región se fija por DS del MEF-MIDIS (art. 9).',
      'Dos transferencias: tras la 1.ª verificación (con cargo a la Ley 32513) y tras la 2.ª (art. 10); el titular del pliego incorpora y programa los recursos (art. 11).'],
    cat: { SI: ['Salud · Desarrollo Infantil Temprano', 'MINSA'], MC0: ['Salud · cobertura', 'MINSA'], VI: ['Reducción de violencia contra la mujer', 'MINSA · MIMP'], AI: ['Agua', 'MVCS · MINSA-DIGESA · SUNASS'], MC8: ['Agua · cobertura', 'MVCS'], EI: ['Educación', 'MINEDU'], MCE: ['Educación · cobertura', 'MINEDU'], ART: ['Articulación territorial', 'MIDIS'] },
    ind: [
      ['SI-01.01', 'SI', 'cg', 'Gestantes con 1.ª atención prenatal en el 1.er trimestre (condición previa)'],
      ['SI-01.02', 'SI', 'cg', 'Gestantes con anemia que reciben tratamiento con hierro y dosaje de hemoglobina'],
      ['SI-01.03', 'SI', 'cg', 'Mujeres con parto institucional sin anemia que recibieron suplementación preventiva y dosaje'],
      ['SI-02.01', 'SI', 'cg', 'Niños de 6 meses que a los 4 meses recibieron hierro preventivo y dosaje (condición previa)'],
      ['SI-02.02', 'SI', 'cg', 'Niños de 6 meses prematuros o con bajo peso, sin anemia, con hierro preventivo y dosaje'],
      ['SI-02.03', 'SI', 'cg', 'Niños de 12 meses con anemia que reciben tratamiento con hierro y dosaje'],
      ['SI-02.04', 'SI', 'cg', 'Niños de 12 meses sin anemia que reciben hierro preventivo y dosaje'],
      ['SI-03.01', 'SI', 'cg', 'Adolescentes mujeres 12–17 años atendidas con dosaje de hemoglobina (condición previa)'],
      ['SI-03.02', 'SI', 'cg', 'Adolescentes mujeres 12–17 años sin anemia que reciben prestaciones priorizadas'],
      ['MC-01.01', 'MC0', 'mc', 'Mujeres con parto institucional (quintiles 1-2 de pobreza) que recibieron el paquete integrado de servicios'],
      ['MC-02.01', 'MC0', 'mc', 'Niños menores de 12 meses (quintiles 1-2) que recibieron el paquete integrado de servicios'],
      ['MC-03.01', 'MC0', 'mc', 'Recién nacidos con vacunas BCG y HvB, controles CRED y tamizaje neonatal'],
      ['VI-01.01', 'VI', 'cg', 'Gestantes con tamizaje positivo de violencia contra la mujer (condición previa)'],
      ['VI-01.02', 'VI', 'cg', 'Gestantes con tamizaje positivo que reciben el paquete mínimo de intervenciones terapéuticas'],
      ['AI-01.01a', 'AI', 'cg', 'Centros poblados rurales con cloro residual ≥ 0.5 mg/L y turbiedad ≤ 5 UNT (paso 1)', 'n'],
      ['AI-01.01b', 'AI', 'cg', 'Centros poblados rurales con información de disposición sanitaria de excretas (paso 2)', 'n'],
      ['AI-02.01', 'AI', 'cg', 'Centros poblados con vigilancia de calidad del agua y seguimiento a metas y ejecución presupuestal', 'n', 'SIAF: actividad 5004428 (PPoR 1001, RO, genérica 2.3) con compromiso ≥ 50 % del PIA 2026 al 31-oct-2026; meta física y financiera programada en CEPLAN al 28-feb-2026.'],
      ['AI-03.01', 'AI', 'cg', 'Centros poblados que implementan medidas correctivas ante riesgos sanitarios en el agua', 'n'],
      ['AI-04.01', 'AI', 'cg', 'Centros poblados con hogares rurales que reciben educación sanitaria (PP 0083)', 'n'],
      ['AI-05.01', 'AI', 'cg', 'Instituciones educativas con mantenimiento de infraestructura sanitaria y control de calidad del agua', 'n'],
      ['MC-08.01', 'MC8', 'mc', 'Niños menores de 60 meses que NO acceden a agua clorada (menor es mejor)', '%', null, true],
      ['EI-01.01', 'EI', 'cg', 'IE de secundaria rural (MSE) que reciben a tiempo los kits de bienestar registrados en SIGA'],
      ['EI-02.01', 'EI', 'cg', 'Plazas CAS de Educación Básica Especial cubiertas oportunamente', '%', 'SIAF: contratos CAS del PP 0106 (EBE) en DRE/GRE y UGEL — el gasto en 2.3.2.8 CAS muestra si las plazas se cubrieron.'],
      ['EI-03.01', 'EI', 'cg', 'Locales educativos de Mi Mantenimiento que ejecutaron mantenimiento de instalaciones sanitarias 2026', '%', 'SIAF: transferencias del programa de mantenimiento 2026 (PRONIED) ejecutadas por las UGEL.'],
      ['MC-04.01', 'MCE', 'mc', 'Niños de 3 años matriculados y registrados en SIAGIE, año escolar 2026'],
      ['MC-05.01', 'MCE', 'mc', 'Servicios educativos EIB y rurales que reciben todo el material educativo, pertinente y suficiente'],
      ['MC-06.01', 'MCE', 'mc', 'Docentes EIB que culminan los cursos de lectura y escritura en lengua originaria (SIFODS)'],
      ['MC-07.01', 'MCE', 'mc', 'Docentes y agentes educativos de EBE que aprueban cursos de educación inclusiva'],
      ['ART-01.01', 'ART', 'cg', 'Gobiernos locales firmantes del pacto regional que mejoran indicadores priorizados con asistencia técnica del GORE', 'n']
    ]
  };
  const ESTADOS = [['pend', 'Sin registrar', '#B0BEC5'], ['proc', 'En proceso', '#E39B1E'], ['ok', 'Cumplido', '#1B9E5A'], ['no', 'En riesgo', '#D64545']];
  let METAS = null;
  const st = { get(r) { try { return JSON.parse(localStorage.getItem('fed_' + r) || '{}'); } catch (e) { return {}; } }, set(r, v) { try { localStorage.setItem('fed_' + r, JSON.stringify(v)); } catch (e) { } } };
  const region = u => u.nivel !== 'R' ? null : u.dpto === 'LIMA' ? 'LIMA PROVINCIAS' : /CALLAO/.test(u.dpto || '') ? 'CALLAO' : u.dpto;
  const fmt = (v, unidad) => v == null || v === 'NA' ? '—' : unidad === 'n' ? String(v) : v + ' %';
  const hoy = () => new Date().toISOString().slice(0, 10);

  function resumen(u) {
    const r = region(u); if (!r || !METAS || !METAS[r]) return null;
    const S = st.get(r), M = METAS[r];
    const items = FED.ind.filter(i => M[i[0]]).map(([code, cat, tipo, nombre, unidad, siaf, menor]) => ({ code, cat, tipo, nombre, unidad: unidad || '%', siaf, menor: !!menor, m: M[code], e: S[code] || 'pend' }));
    return { region: r, items, S };
  }
  // ---- vista: misma estética que el Plan de Incentivos (tarjetas compactas por eje -> detalle) ----
  const COL = { ok: '#1B9E5A', proc: '#E39B1E', no: '#D64545', pend: '#1E5AA8' };
  const TXT = { ok: 'Cumplido', proc: 'En proceso', no: 'En riesgo', pend: 'Sin registrar' };
  let abierto = null, ultimo = null;
  function resumenCat(items) {
    const n = k => items.filter(i => i.e === k).length, ok = n('ok'), no = n('no'), pr = n('proc'), pe = n('pend');
    const col = no ? 'no' : pr ? 'proc' : ok === items.length ? 'ok' : 'pend';
    const partes = [ok && `${ok} cumplido${ok > 1 ? 's' : ''}`, pr && `${pr} en proceso`, no && `${no} en riesgo`, pe && `${pe} sin registrar`].filter(Boolean);
    const titulo = pe === items.length ? `${items.length} indicador${items.length > 1 ? 'es' : ''} · sin registrar` : ok === items.length ? `${ok} de ${items.length} cumplidos` : partes.join(' · ');
    return { col, titulo, ok, no, pr, pe };
  }
  function compactCard(c, n, items) {
    const r = resumenCat(items), col = COL[r.col];
    return `<div class="card pnl" data-abrir="${c}" style="cursor:pointer;border-left:5px solid ${col};padding:14px 16px;flex-direction:row;align-items:center;gap:14px">
      <div style="width:34px;height:34px;border-radius:50%;background:${col}1F;display:grid;place-items:center;font-weight:800;color:${col};flex:0 0 auto;font-size:15px">${n}</div>
      <div style="min-width:0;flex:1"><b style="font-size:13.5px;color:var(--p2)">${FED.cat[c][0]}</b><div style="font-size:11.5px;color:var(--ink);margin-top:2px">${r.titulo} <small class="mutx">· ${FED.cat[c][1]}</small></div></div>
      <div style="font-size:20px;color:var(--mut);flex:0 0 auto">›</div></div>`;
  }
  function detalle(c, items, S, fase) {
    const fila = i => { const col = COL[i.e], on = k => k === fase[0] ? 'style="background:#FFF3D6;font-weight:800"' : '';
      return `<tr><td style="white-space:normal"><b>${i.code}</b> ${i.nombre}<small class="mutx" style="display:block">${i.tipo === 'cg' ? 'Compromiso de gestión' : 'Meta de cobertura'}${i.menor ? ' · menor es mejor' : ''}</small>${i.siaf ? `<small style="display:block;color:var(--p2)">${i.siaf}</small>` : ''}</td>
        <td>${fmt(i.m.b, i.unidad)}</td>${i.m.u != null ? `<td colspan="2" style="background:#FFF3D6;font-weight:800">${fmt(i.m.u, i.unidad)} <small class="mutx">única</small></td>` : `<td ${on('1')}>${fmt(i.m['1'], i.unidad)}</td><td ${on('2')}>${fmt(i.m['2'], i.unidad)}</td>`}
        <td><select data-estado="${i.code}" style="font:inherit;font-size:11px;font-weight:700;border:1.5px solid var(--line);border-radius:6px;padding:2px 4px;background:#fff;color:${col}">${ESTADOS.map(e => `<option value="${e[0]}" ${i.e === e[0] ? 'selected' : ''}>${e[1]}</option>`).join('')}</select></td></tr>`; };
    return `<div style="padding:10px 0 0">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px"><b style="font-size:13px">${FED.cat[c][0]}</b><br><small class="mutx">Entidad rectora: ${FED.cat[c][1]} · ${items.length} indicador${items.length > 1 ? 'es' : ''} · ${fase[1]} en curso (${fase[2].slice(0, 7)} → ${fase[3].slice(0, 7)})</small></div></div>
      <div class="pd-lbl" style="margin-top:10px">Indicadores, basal y metas <small>Anexo II · DS 012-2025-MIDIS</small></div>
      <div style="overflow-x:auto"><table class="pd-tbl"><tr><th style="width:58%">Indicador</th><th>Basal</th><th>Meta 1.ª verif.</th><th>Meta 2.ª verif.</th><th>Estado</th></tr>${items.map(fila).join('')}</table></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px"><div style="min-width:0">
        <div class="pd-lbl">Notas de seguimiento</div><textarea data-nota="${c}" rows="3" style="width:100%;font:inherit;font-size:11.5px;border:1.5px solid var(--line);border-radius:6px;padding:5px" placeholder="Responsable, avances, pendientes…">${S['nota_' + c] || ''}</textarea></div>
        <div style="min-width:0"><div class="pd-lbl">Cómo se verifica y se paga</div>${FED.reglas.map(x => `<div class="pd-row"><span style="font-weight:500">${x}</span></div>`).join('')}</div></div></div>`;
  }
  function ui(el, u) {
    const r = region(u); if (!r) return;
    if (!METAS) { fetch('data/fed_metas.json').then(x => x.json()).then(j => { METAS = j; ui(el, u); }).catch(() => { }); return; }
    const R = resumen(u); if (!R) return;
    ultimo = [el, u];
    const h = hoy(), fase = FED.periodo.find(p => h >= p[2] && h <= p[3]) || FED.periodo[1];
    const cats = [...new Set(R.items.map(i => i.cat))], de = c => R.items.filter(i => i.cat === c), S = R.S;
    if (abierto !== null && !cats.includes(abierto)) abierto = null;
    if (abierto !== null) {
      el.innerHTML = `<div style="padding:8px">
       <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px"><button class="btn" data-atras-fed>‹ Volver al FED</button><div class="pd-lbl" style="margin:0">${cats.indexOf(abierto) + 1}. ${FED.cat[abierto][0]}</div></div>
       <div class="card" style="padding:0 14px 14px">${detalle(abierto, de(abierto), S, fase)}</div></div>`;
      el.querySelector('[data-atras-fed]').onclick = () => { abierto = null; ui(el, u); };
    } else {
      const t = resumenCat(R.items);
      el.innerHTML = `<div style="padding:8px">
       <div class="pd-lbl">FED 2025-2026 · Fondo de Estímulo al Desempeño<small>${FED.norma} · ${r}</small></div>
       <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 10px;font-size:11.5px"><span class="tag" style="background:var(--p2);color:#fff">${fase[1]} · ${fase[2].slice(0, 7)} → ${fase[3].slice(0, 7)}</span><span>${R.items.length} indicadores le aplican</span><span class="tag ok">${t.ok} cumplidos</span><span class="tag warn">${t.pr} en proceso</span><span class="tag bad">${t.no} en riesgo</span><span class="tag" style="background:var(--sup);color:var(--ink2)">${t.pe} sin registrar</span></div>
       <p class="mutx" style="font-size:11.5px;margin:0 0 10px">Clic en un eje para ver sus indicadores, metas y registrar el avance. El pago llega por DS tras cada verificación; cumplimiento parcial paga en proporción (art. 8.10 y 10).</p>
       <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${cats.map((c, i) => compactCard(c, i + 1, de(c))).join('')}</div></div>`;
    }
    el.querySelectorAll('[data-abrir]').forEach(x => x.onclick = () => { abierto = x.dataset.abrir; ui(el, u); });
    el.querySelectorAll('[data-estado]').forEach(x => x.onchange = () => { const S2 = st.get(r); S2[x.dataset.estado] = x.value; st.set(r, S2); ui(el, u); });
    el.querySelectorAll('[data-nota]').forEach(x => x.onblur = () => { const S2 = st.get(r); S2['nota_' + x.dataset.nota] = x.value; st.set(r, S2); });
  }
  window.FED = { ui, region, resumen, FED, atras: () => { if (abierto === null || !ultimo) return false; abierto = null; ui(...ultimo); return true; } };
})();
