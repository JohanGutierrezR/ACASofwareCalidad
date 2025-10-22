/* app.js - versión ajustada: recuadros de color por criterio y PDF fiable */

/* CONFIG */
const METRICS = [
  { key: 'Funcionalidad', weight: 15 },
  { key: 'Usabilidad', weight: 15 },
  { key: 'Eficiencia', weight: 10 },
  { key: 'Mantenibilidad', weight: 10 },
  { key: 'Portabilidad', weight: 10 },
  { key: 'Seguridad', weight: 15 },
  { key: 'Fiabilidad', weight: 15 },
  { key: 'Compatibilidad', weight: 10 }
];
const LOW_THRESHOLD = 3.5;
const STORAGE_KEY = 'aca_quality_history';

/* ESTADO */
let state = {};
function resetState(){
  state = {};
  METRICS.forEach(m => state[m.key] = { score: 0, weight: m.weight });
  const ai = document.getElementById('appName');
  if(ai){ ai.classList.remove('input-error'); const err = document.getElementById('appNameError'); if(err) err.classList.add('hidden'); }
}
resetState();

/* RUTAS */
document.querySelectorAll('.navbtn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.navbtn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const route = b.dataset.route;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const page = document.getElementById('page-' + route);
    if (page) page.classList.remove('hidden');
    if(route === 'historial') renderHistory();
  });
});

/* subtabs */
document.querySelectorAll('.subbtn').forEach(s => {
  s.addEventListener('click', () => {
    document.querySelectorAll('.subbtn').forEach(x => x.classList.remove('active'));
    s.classList.add('active');
    const sub = s.dataset.sub;
    document.getElementById('sub-metrics').classList.toggle('hidden', sub !== 'metrics');
    document.getElementById('sub-charts').classList.toggle('hidden', sub !== 'charts');
    if (sub === 'charts') renderChart();
  });
});

/* RENDER INFO (igual que antes) */
const docs = [
  { short:'ISO/IEC 25010', name:'ISO/IEC 25010 (modelo de calidad)', url:'https://iso25000.com/index.php/normas-iso-25000/iso-25010' },
  { short:'ISO 9001', name:'ISO 9001 (gestión de calidad)', url:'https://repositorio.buap.mx/rcontraloria/public/inf_public/2019/0/NOM_ISO_9001-2015.pdf' },
  { short:'IEEE', name:'IEEE (ingeniería de software)', url:'https://www.ieee.org/' },
  { short:'CMMI', name:'CMMI Institute', url:'https://cmmiinstitute.com/' },
  { short:'TMMi', name:'TMMi (Test Maturity Model)', url:'https://www.tmmi.org/' },
  { short:'Microsoft', name:'Microsoft Docs - testing', url:'https://learn.microsoft.com/' }
];

function renderInfo(){
  const grid = document.getElementById('criteriaGrid');
  if(grid){
    grid.innerHTML = '';
    METRICS.forEach(m => {
      const card = document.createElement('div');
      card.className = 'crit-card';
      card.innerHTML = `<div style="font-weight:800;margin-bottom:6px">${m.key}</div>
                        <div class="comp-desc" style="color:var(--muted)">${briefDesc(m.key)}</div>`;
      grid.appendChild(card);
    });
  }

  const docsList = document.getElementById('docsList');
  if(docsList){
    docsList.innerHTML = '';
    docs.forEach(d => {
      const a = document.createElement('span');
      a.className = 'doc-link';
      a.textContent = d.short;
      a.title = d.name;
      a.style.marginRight = '10px';
      a.addEventListener('click', () => window.open(d.url, '_blank', 'noopener'));
      docsList.appendChild(a);
    });
  }
}
function briefDesc(key){
  const map = {
    'Funcionalidad':'Verifica que el software cumpla con los requisitos y casos de uso esperados por docentes y estudiantes.',
    'Usabilidad':'Evalúa facilidad de aprendizaje, accesibilidad y eficiencia de la interacción para usuarios educativos.',
    'Eficiencia':'Mide tiempos de respuesta y uso de recursos; importante en picos de acceso y evaluaciones masivas.',
    'Mantenibilidad':'Valora lo sencillo que es corregir, adaptar y extender el código y la arquitectura del sistema.',
    'Portabilidad':'Capacidad de funcionar correctamente en distintos navegadores, dispositivos y entornos de despliegue.',
    'Seguridad':'Protección de datos, control de acceso, cifrado y resistencia frente a amenazas comunes.',
    'Fiabilidad':'Estabilidad del sistema frente a fallos, capacidad de recuperación y tolerancia a errores.',
    'Compatibilidad':'Interoperabilidad con otros sistemas y cumplimiento de estándares de integración.'
  };
  return map[key] || '';
}

/* ===== CAMBIO PRINCIPAL: renderMetrics muestra recuadro de color por criterio ===== */
function scoreInfo(score){
  const s = Number(score);
  if (isNaN(s)) return { colorBg: '#ffffff', colorBorder: '#cccccc', label: 'N/A' };
  if (s <= 3.5) return { colorBg: '#fdecea', colorBorder: '#d9534f', label: 'Bajo' };
  if (s <= 4.5) return { colorBg: '#fff4e5', colorBorder: '#f0ad4e', label: 'Aceptable' };
  return { colorBg: '#eafaf1', colorBorder: '#2f9d57', label: 'Alto' };
}

function renderMetrics(){
  const container = document.getElementById('metricsGrid');
  if(!container) return;
  container.innerHTML = '';

  Object.keys(state).forEach(key => {
    const s = state[key].score || 0;
    const si = scoreInfo(s);

    const r = document.createElement('div');
    r.className = 'metricRow';
    // estructura: label / slider / value / weight / colored box (dependiente del score)
    r.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;width:100%">
        <div style="flex:1;min-width:220px">
          <div class="label">${key}</div>
        </div>
        <div style="flex:3">
          <input type="range" min="0" max="5" step="0.1" value="${s}" data-key="${key}" class="slider" style="width:100%">
        </div>
        <div style="width:60px;text-align:right;font-weight:700"><span data-val="${key}">${Number(s).toFixed(1)}</span></div>
        <div style="width:86px"><input type="number" min="0" max="100" step="1" value="${state[key].weight}" data-weight="${key}"></div>
        <div style="width:140px;text-align:right">
          <div class="score-box" data-box="${key}" style="display:inline-block;padding:8px 10px;border-radius:8px;border:2px solid ${si.colorBorder};background:${si.colorBg};font-weight:700">
            ${si.label}
          </div>
        </div>
      </div>
      <div class="lowIndicator" data-low="${key}" style="min-width:170px;margin-top:8px"></div>
    `;
    container.appendChild(r);
  });

  // handlers
  container.querySelectorAll('input[type="range"]').forEach(r => {
    r.addEventListener('input', e => {
      const k = e.target.dataset.key;
      const v = parseFloat(e.target.value);
      state[k].score = v;
      const valSpan = document.querySelector(`[data-val="${k}"]`);
      if (valSpan) valSpan.textContent = v.toFixed(1);
      // actualizar color del recuadro
      const box = document.querySelector(`[data-box="${k}"]`);
      if (box) {
        const si = scoreInfo(v);
        box.style.background = si.colorBg;
        box.style.borderColor = si.colorBorder;
        box.textContent = si.label;
      }
      // actualizar indicador bajo (si quieres mantenerlo)
      checkLow(k);
    });
  });

  container.querySelectorAll('input[type="number"]').forEach(n => {
    n.addEventListener('input', e => {
      const k = e.target.dataset.weight; let v = parseFloat(e.target.value); if(isNaN(v)) v = 0; state[k].weight = v;
    });
  });

  // inicializar lowIndicators
  Object.keys(state).forEach(k => checkLow(k));
}

/* checkLow: ahora solo muestra un aviso simple junto al control (no observaciones extensas) */
function checkLow(key){
  const el = document.querySelector(`.lowIndicator[data-low="${key}"]`);
  if(!el) return;
  if(state[key].score < LOW_THRESHOLD) el.innerHTML = `<div class="alert">Necesita mejora: ${state[key].score.toFixed(1)}</div>`;
  else el.innerHTML = '';
}

/* cálculo ponderado (igual) */
function calculate(){ let n=0,d=0; Object.keys(state).forEach(k=>{ n += (state[k].score || 0) * (state[k].weight || 0); d += (state[k].weight || 0); }); return { overall: d===0?0: Number((n/d).toFixed(2)), n,d }; }

/* validación inline (solo nombre obligatorio) */
function validateNameInline(){ const el = document.getElementById('appName'); const err = document.getElementById('appNameError'); const name = (el && el.value||'').trim(); if(!name){ if(el) el.classList.add('input-error'); if(err) err.classList.remove('hidden'); return false } if(el) el.classList.remove('input-error'); if(err) err.classList.add('hidden'); return true; }

/* GENERAR resultado: mantengo lógica similar a la tuya pero sin observaciones por criterio (solo banner y resumen) */
document.getElementById('btnGenerate').addEventListener('click', () => {
  if (!validateNameInline()) return;
  const name = (document.getElementById('appName').value || '').trim();
  const calc = (typeof calculate === 'function') ? calculate() : { overall: 0 };
  const overall = Number(calc.overall || 0);

  // clasificación simple para banner color
  let classification = { level: '', bg: '#ffffff', border: '#cccccc', message: '' };
  if (overall <= 3.5) {
    classification = { level: 'Necesita mejora', bg: '#fdecea', border: '#d9534f', message: 'Calificación insuficiente — priorizar pruebas y correcciones.' };
  } else if (overall <= 4.5) {
    classification = { level: 'Aceptable', bg: '#fff4e5', border: '#f0ad4e', message: 'Nivel aceptable — optimizar rendimiento y documentación.' };
  } else {
    classification = { level: 'Excelente', bg: '#eafaf1', border: '#2f9d57', message: 'Excelente — mantener controles y revisiones periódicas.' };
  }

  // criterios que requieren atención (<= 3.5)
  const attentionKeys = Object.keys(state).filter(k => (state[k].score || 0) <= 3.5);

  // remover banner previo si existe
  const parent = document.getElementById('sub-metrics') || document.getElementById('page-evaluador') || document.body;
  const prev = parent.querySelector('.custom-result-banner, .banner');
  if (prev) prev.remove();

  // crear banner
  const banner = document.createElement('div');
  banner.className = 'custom-result-banner';
  banner.style.background = classification.bg;
  banner.style.borderLeft = `6px solid ${classification.border}`;
  banner.style.padding = '14px';
  banner.style.borderRadius = '8px';
  banner.style.marginBottom = '12px';
  banner.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';

  // contenido banner: nombre + nivel + mensaje + lista de criterios (si hay)
  let attentionHtml = '';
  if (attentionKeys.length) {
    attentionHtml = '<div style="margin-top:8px;font-weight:700;color:#7a2b2b">Criterios que requieren atención:</div><ul style="margin-top:6px">';
    attentionKeys.forEach(k => {
      const score = (state[k].score || 0).toFixed(1);
      attentionHtml += `<li><strong>${k}</strong> — ${score}</li>`;
    });
    attentionHtml += '</ul>';
  } else {
    attentionHtml = '<div style="margin-top:8px;color:#0b5e35">No se detectan criterios críticos.</div>';
  }

  banner.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px">
      <div>
        <div style="font-weight:900;color:${classification.border};font-size:1rem">${name}</div>
        <div style="margin-top:6px;color:#123;font-size:1.05rem">Promedio: <strong>${overall} / 5</strong> — <em>${classification.level}</em></div>
        <div style="margin-top:8px;color:#333;font-size:0.95rem">${classification.message}</div>
      </div>
    </div>
    ${attentionHtml}
  `;

  // insertar banner antes del resultado
  const resultBox = document.getElementById('resultBox');
  if (resultBox && resultBox.parentElement) resultBox.parentElement.insertBefore(banner, resultBox);
  else parent.insertBefore(banner, parent.firstChild);

  // construir resumen detallado SIN la palabra "peso"
  const lines = [];
  lines.push('Aplicativo: ' + name);
  lines.push('Fecha: ' + new Date().toLocaleString());
  lines.push('');
  Object.keys(state).forEach(k => lines.push(`${k} : ${(state[k].score || 0).toFixed(1)} / 5`));
  lines.push('');
  lines.push(`Calificación final (ponderada): ${overall} / 5`);
  const preview = document.getElementById('resultPreview');
  if (preview) preview.textContent = lines.join('\n');
  if (resultBox) resultBox.classList.remove('hidden');

  // actualizar gráfica
  try { if (typeof renderChart === 'function') renderChart(); } catch(e) {}
});

/* Guardar (igual) */
document.getElementById('btnSave').addEventListener('click', () => {
  const ok = validateNameInline(); const notice = document.getElementById('saveNotice'); if(notice) notice.innerHTML='';
  if(!ok){ if(notice) notice.innerHTML = `<div class="notice-red"><strong>Error:</strong> escribe el nombre del aplicativo antes de guardar.</div>`; return; }
  const calc = calculate(); const name = document.getElementById('appName').value.trim();
  const now = new Date();
  const entry = { name, score: calc.overall, details: JSON.parse(JSON.stringify(state)), date: now.toLocaleDateString(), time: now.toLocaleTimeString(), ts: now.getTime() };
  const list = loadHistory(); list.unshift(entry); localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0,200)));
  const low = Object.keys(state).filter(k => (state[k].score||0) < LOW_THRESHOLD);
  let html = `<div class="notice-green"><strong>Guardado:</strong> "${name}" — Calificación final: <strong>${calc.overall} / 5</strong>.`;
  if(low.length){ html += `<div style="margin-top:10px"><ul>`; low.forEach(k => html += `<li><strong>${k}</strong>: puntuación ${(state[k].score||0).toFixed(1)}.</li>`); html += `</ul></div>`; } else html += `<div style="margin-top:10px">No se detectan criterios críticos.</div>`;
  html += `</div>`; notice.innerHTML = html;
  if(!document.getElementById('page-historial').classList.contains('hidden')) renderHistory();
});

/* CSV, Reset (igual) */
document.getElementById('btnCsv').addEventListener('click', () => {
  if(!validateNameInline()) return;
  let csv = 'Métrica,Puntaje,Peso(%)\n';
  Object.keys(state).forEach(k => csv += `${k},${(state[k].score||0).toFixed(1)},${state[k].weight}\n`);
  const a = document.createElement('a'); const blob = new Blob([csv], { type:'text/csv' }); a.href = URL.createObjectURL(blob);
  a.download = `metricas_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`; a.click(); URL.revokeObjectURL(a.href);
});

document.getElementById('btnReset').addEventListener('click', () => {
  // Reinicia los datos o estado general
  resetState();
  renderMetrics();

  // Oculta el cuadro de resultados si existe
  const resultBox = document.getElementById('resultBox');
  if (resultBox) {
    resultBox.classList.add('hidden');
  }

  // Elimina cualquier banner generado previamente
  const prevBanner = document.querySelector('.custom-result-banner');
  if (prevBanner) {
    prevBanner.remove();
  }

  const noticeGreen= document.querySelector('.notice-green');
  if (noticeGreen) {
    noticeGreen.remove();
  }

const chartCard = document.getElementById('sub-charts');
if (chartCard) {
  chartCard.remove();
}

});


/* ===================== DESCARGAR PDF ===================== */
document.getElementById('btnPdf').addEventListener('click', async () => {
  const appName = document.getElementById('appName').value.trim() || 'Aplicativo educativo';
  await downloadPDF(appName);
});

async function downloadPDF(appName) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    alert('Error: jsPDF no está cargado correctamente.');
    return;
  }

  // 1️⃣ Mostrar temporalmente la sección de gráficas para capturar los canvas
  const chartsSection = document.getElementById('sub-charts');
  const originalDisplay = chartsSection.style.display;
  chartsSection.classList.remove('hidden');
  chartsSection.style.display = 'block';

  // Si tienes función de renderizado, la llamamos
  if (typeof renderChart === 'function') renderChart();

  // Esperar un poco para que Chart.js termine de dibujar
  await new Promise(r => setTimeout(r, 1000));

  // 2️⃣ Capturar los canvas de Chart.js como imágenes
  const barCanvas = document.getElementById('barChart');
  const pieCanvas = document.getElementById('pieChart');
  const barDataUrl = barCanvas ? barCanvas.toDataURL('image/png', 1.0) : null;
  const pieDataUrl = pieCanvas ? pieCanvas.toDataURL('image/png', 1.0) : null;

  // Restaurar el estado visual original
  chartsSection.style.display = originalDisplay || '';
  if (originalDisplay === 'none') chartsSection.classList.add('hidden');

  // 3️⃣ Crear el documento PDF
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // === ENCABEZADO ===
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text('Informe de Evaluación de Calidad de Software', margin, 50);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(`Aplicativo: ${appName}`, margin, 70);
  pdf.text(`Fecha: ${new Date().toLocaleString()}`, margin, 85);

  pdf.line(margin, 95, pageWidth - margin, 95);

  // === RESULTADO GLOBAL ===
  const { overall } = calculate();
  let level = 'Excelente';
  let color = [47, 157, 87];
  if (overall <= 3.5) { level = 'Necesita mejora'; color = [217, 83, 79]; }
  else if (overall <= 4.5) { level = 'Aceptable'; color = [240, 173, 78]; }

  pdf.setFontSize(12);
  pdf.setTextColor(...color);
  pdf.text(`Calificación global: ${overall.toFixed(2)} / 5 — ${level}`, margin, 115);
  pdf.setTextColor(0, 0, 0);

  // === DETALLE DE MÉTRICAS (compacto, columna doble) ===
  pdf.setFontSize(10);
  pdf.text('Detalle de métricas:', margin, 135);

  let yLeft = 150;
  let yRight = 150;
  const halfWidth = pageWidth / 2;

  for (const [index, key] of Object.keys(state).entries()) {
    const s = state[key].score || 0;
    const si = scoreInfo(s);
    const textLine = `${key}: ${s.toFixed(1)} — ${si.label}`;
    if (index % 2 === 0) {
      pdf.text(textLine, margin, yLeft);
      yLeft += 14;
    } else {
      pdf.text(textLine, halfWidth, yRight);
      yRight += 14;
    }
  }

  // === GRÁFICAS (ajustadas lado a lado) ===
  const chartY = Math.max(yLeft, yRight) + 20;
  const availableWidth = pageWidth - margin * 2;
  const chartWidth = (availableWidth / 2) - 10;
  const chartHeight = 180; // tamaño proporcional para una hoja

  if (barDataUrl && barDataUrl.startsWith('data:image/png')) {
    pdf.addImage(barDataUrl, 'PNG', margin, chartY, chartWidth, chartHeight);
  }

  if (pieDataUrl && pieDataUrl.startsWith('data:image/png')) {
    pdf.addImage(pieDataUrl, 'PNG', margin + chartWidth + 20, chartY, chartWidth - 10, chartHeight);
  }

  // === PIE DE PÁGINA ===
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text('Generado automáticamente con ACA Calidad de Software', margin, pageHeight - 30);

  // === GUARDAR PDF ===
  const filename = `informe_${appName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
  pdf.save(filename);
}


/* CHARTS (igual) */
let chartInst=null, pieInst=null;
function renderChart(){
  const labels = Object.keys(state);
  const data = labels.map(l => Number((state[l].score||0).toFixed(1)));
  const barEl = document.getElementById('barChart');
  if (barEl) {
    const ctx = barEl.getContext('2d');
    if (chartInst) chartInst.destroy();
    chartInst = new Chart(ctx, {
      type:'bar',
      data:{ labels, datasets:[{ label:'Puntaje (0-5)', data, backgroundColor: labels.map((_,i)=>`rgba(11,148,166,${0.62 + (i%3)*0.06})`) }]},
      options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ min:0, max:5, ticks:{ stepSize:0.5 } } } }
    });
  }

  const pieEl = document.getElementById('pieChart');
  if (pieEl) {
    const pctx = pieEl.getContext('2d');
    if (pieInst) pieInst.destroy();
    pieInst = new Chart(pctx, {
      type:'pie',
      data:{ labels, datasets:[{ data, backgroundColor: labels.map((_,i)=>`hsl(${i*40%360} 70% 50% / 0.9)`) }]},
      options:{ responsive:true, maintainAspectRatio:false }
    });
  }
}

/* HISTORIAL (igual) */
function loadHistory(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){ return []; } }
function renderHistory(){
  const list = loadHistory(); const tbody = document.querySelector('#historyTable tbody'); if(!tbody) return; tbody.innerHTML = '';
  const fName = (document.getElementById('filterName').value||'').toLowerCase(); const min = parseFloat(document.getElementById('filterMin').value||'-1'); const max = parseFloat(document.getElementById('filterMax').value||'999');
  const filtered = list.filter(e => { if(fName && !e.name.toLowerCase().includes(fName)) return false; if(!isNaN(min) && min>=0 && e.score < min) return false; if(!isNaN(max) && max<=5 && e.score > max) return false; return true; });
  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.name}</td><td>${item.score}</td><td>${item.date}</td><td>${item.time}</td>
      <td><button class="light viewBtn" data-ts="${item.ts}">Ver</button></td>
      <td><button class="light delBtn" data-ts="${item.ts}">Eliminar</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.viewBtn').forEach(b => b.addEventListener('click', e => {
    const ts = e.target.dataset.ts; const entry = list.find(x=>String(x.ts)===String(ts)); if(!entry) return;
    const prev = document.querySelector('.banner'); if(prev) prev.remove();
    const banner = document.createElement('div'); banner.className='banner';
    const lowKeys = Object.keys(entry.details).filter(k=> (entry.details[k].score||0) < LOW_THRESHOLD);
    let lowHtml=''; if(lowKeys.length){ lowHtml = '<div style="margin-top:8px;font-weight:700;color:#7a2b2b">Criterios a mejorar:</div><ul>'; lowKeys.forEach(k=> lowHtml += `<li>${k} — ${(entry.details[k].score||0).toFixed(1)}</li>`); lowHtml += '</ul>'; }
    banner.innerHTML = `<div><strong class="badge">${entry.name}</strong> obtuvo <strong>${entry.score} / 5</strong></div>
      <div style="margin-top:8px">Guardado: ${entry.date} ${entry.time}</div>${lowHtml}`;
    const histCard = document.getElementById('page-historial').querySelector('.card'); if(histCard) histCard.prepend(banner);
    window.scrollTo({top:0,behavior:'smooth'});
  }));
  tbody.querySelectorAll('.delBtn').forEach(b => b.addEventListener('click', e => {
    const ts = e.target.dataset.ts; let listAll = loadHistory(); listAll = listAll.filter(x => String(x.ts) !== String(ts)); localStorage.setItem(STORAGE_KEY, JSON.stringify(listAll)); renderHistory();
  }));
}

/* filtros historial */
const applyFiltersBtn = document.getElementById('applyFilters');
if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => renderHistory());
const clearFiltersBtn = document.getElementById('clearFilters');
if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => { document.getElementById('filterName').value=''; document.getElementById('filterMin').value=''; document.getElementById('filterMax').value=''; renderHistory(); });

/* inicial */
renderInfo(); renderMetrics(); renderChart();

// header scroll effect (no cambia)
window.addEventListener('scroll', () => {
  const header = document.querySelector('.topbar');
  if (!header) return;
  if (window.scrollY > 20) header.classList.add('scrolled'); else header.classList.remove('scrolled');
});
