// Global State
let currentImageId = 1;
let currentProfileTab = 'acertou';
let chartInstances = {};
let currentTab = 'tab-comparativo';

// On Load Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Load first image details
    updatePage1();
    
    // Setup keyboard listener for navigation
    document.addEventListener('keydown', (e) => {
        if (currentTab === 'tab-comparativo') {
            if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        }
    });

    // Populate initial table data
    renderSurveyTable();
});

// ==================== SPA TAB SWITCHING ====================
function switchTab(tabId) {
    currentTab = tabId;
    
    // Hide all pages
    document.getElementById('page-comparativo').classList.add('hidden');
    document.getElementById('page-dashboard').classList.add('hidden');
    document.getElementById('page-respostas').classList.add('hidden');
    
    // Remove active styles from buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.className = "tab-button px-4 py-2 text-sm font-medium rounded-lg border border-transparent transition-all duration-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100";
    });
    
    // Show active page and apply active styles
    const activeBtn = document.getElementById(`btn-${tabId}`);
    activeBtn.className = "tab-button px-4 py-2 text-sm font-medium rounded-lg border border-transparent transition-all duration-200 bg-indigo-50 text-indigo-600 border-indigo-100";
    
    if (tabId === 'tab-comparativo') {
        document.getElementById('page-comparativo').classList.remove('hidden');
        updatePage1();
    } else if (tabId === 'tab-dashboard') {
        document.getElementById('page-dashboard').classList.remove('hidden');
        initDashboardCharts();
    } else if (tabId === 'tab-respostas') {
        document.getElementById('page-respostas').classList.remove('hidden');
        renderSurveyTable();
    }
    
    // Refresh lucide icons for newly rendered content
    if (window.lucide) {
        lucide.createIcons();
    }
}

// ==================== PÁGINA 1: IMAGEM NAVIGATION & RENDERING ====================
function prevImage() {
    currentImageId = currentImageId === 1 ? 8 : currentImageId - 1;
    updatePage1();
}

function nextImage() {
    currentImageId = currentImageId === 8 ? 1 : currentImageId + 1;
    updatePage1();
}

function toggleUserProfile(status) {
    currentProfileTab = status;
    
    const btnAcertou = document.getElementById('btn-profile-acertou');
    const btnErrou = document.getElementById('btn-profile-errou');
    
    if (status === 'acertou') {
        btnAcertou.className = "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 bg-white text-emerald-700 shadow-xs border border-emerald-200 flex items-center gap-1";
        btnErrou.className = "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 text-zinc-500 hover:text-zinc-800 flex items-center gap-1";
    } else {
        btnErrou.className = "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 bg-white text-red-600 shadow-xs border border-red-200 flex items-center gap-1";
        btnAcertou.className = "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 text-zinc-500 hover:text-zinc-800 flex items-center gap-1";
    }
    
    renderUserProfile(status);
}

function renderUserProfile(status) {
    const data = IMAGE_DATA[currentImageId];
    if (!data || !data.user_profiles) return;
    
    const profile = data.user_profiles[status];
    if (!profile) return;
    
    document.getElementById('profile-avg-ia').innerText = `${profile.avg_ia} / 5.0`;
    document.getElementById('profile-pred-ia').innerText = `Predom: ${profile.pred_ia}`;
    
    document.getElementById('profile-avg-net').innerText = `${profile.pred_net} Horas`;
    document.getElementById('profile-pred-net').innerText = `Média: ~${profile.avg_net_hours}h diárias`;
    
    document.getElementById('profile-tool-pct').innerText = `${profile.tool_pct}%`;
    const toolCount = Math.round(profile.count * profile.tool_pct / 100);
    document.getElementById('profile-tool-count').innerText = `${toolCount} de ${profile.count} usaram scanner`;
    
    document.getElementById('profile-avg-score').innerText = `${profile.avg_total_score} / 8`;
    const scorePct = ((profile.avg_total_score / 8) * 100).toFixed(1);
    document.getElementById('profile-score-pct').innerText = `${scorePct}% de acerto global`;
    
    const highlightBox = document.getElementById('profile-highlight-box');
    const highlightText = document.getElementById('profile-highlight-text');
    
    if (status === 'acertou') {
        highlightBox.className = "text-[11px] py-1.5 px-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between";
        highlightText.innerText = `Grupo assertivo (${profile.count} alunos): Média de ${profile.avg_total_score}/8 acertos no teste (${profile.tool_pct}% utilizaram a ferramenta).`;
    } else {
        highlightBox.className = "text-[11px] py-1.5 px-3 rounded bg-red-50 border border-red-200 text-red-700 flex items-center justify-between";
        highlightText.innerText = `Grupo enganado (${profile.count} alunos): Média de ${profile.avg_total_score}/8 acertos no teste (${profile.tool_pct}% utilizaram a ferramenta).`;
    }
}

function openLightboxMainImage() {
    const data = IMAGE_DATA[currentImageId];
    if (!data) return;
    openLightboxImage(data.paths.img, `Imagem ${currentImageId} em Análise (${data.gabarito === 'IA' ? 'Manipulação Artificial' : 'Fotografia Real'})`);
}

function updatePage1() {
    const data = IMAGE_DATA[currentImageId];
    if (!data) return;
    
    // 1. Counter & Image Sources
    document.getElementById('img-counter').innerText = `Imagem ${currentImageId} de 8`;
    
    const mainImg = document.getElementById('main-image');
    mainImg.src = data.paths.img;
    
    const forensicComposite = document.getElementById('forensic-composite');
    forensicComposite.src = data.paths.analise;
    
    // 2. Gabarito Badge
    const gabBadge = document.getElementById('gabarito-badge');
    if (data.gabarito === 'IA') {
        gabBadge.innerText = 'Imagem IA (Manipulada)';
        gabBadge.className = 'px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm border border-red-200 bg-red-50 text-red-600';
    } else {
        gabBadge.innerText = 'Imagem Real (Fotografia)';
        gabBadge.className = 'px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm border border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    // 3. IA Advantage Card
    const adv = data.ia_advantage;
    if (adv) {
        const badge = document.getElementById('ia-advantage-badge');
        const modelScore = document.getElementById('model-advantage-score');
        const humanScore = document.getElementById('human-advantage-score');
        const barModel = document.getElementById('bar-model-advantage');
        const barHuman = document.getElementById('bar-human-advantage');
        const advDesc = document.getElementById('ia-advantage-desc');
        
        modelScore.innerText = `${adv.model_confidence}%`;
        humanScore.innerText = `${adv.human_accuracy}%`;
        barModel.style.width = `${adv.model_confidence}%`;
        barHuman.style.width = `${adv.human_accuracy}%`;
        
        if (adv.advantage_pct > 0) {
            badge.innerText = `+${adv.advantage_pct}% Superior`;
            badge.className = "text-sm sm:text-base font-black px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm code-font tracking-tight";
            if (data.gabarito === 'IA') {
                advDesc.innerText = `O modelo forense identificou anomalias estruturais com precisão de ${adv.model_confidence}%, superando o acerto do público escolar (${adv.human_accuracy}%) em +${adv.advantage_pct}%.`;
            } else {
                advDesc.innerText = `O modelo confirmou a autenticidade real com ${adv.model_confidence}% de certeza, superando o acerto humano (${adv.human_accuracy}%) em +${adv.advantage_pct}%.`;
            }
        } else {
            badge.innerText = `${adv.advantage_pct}% Inferior`;
            badge.className = "text-sm sm:text-base font-black px-3.5 py-1.5 rounded-lg bg-amber-600 text-white shadow-sm code-font tracking-tight";
            advDesc.innerText = `Nesta imagem, a percepção dos alunos (${adv.human_accuracy}%) superou a certeza do modelo (${adv.model_confidence}%), deixando o diagnóstico da IA ${Math.abs(adv.advantage_pct)}% inferior ao público.`;
        }
    }

    // 4. User Profiles Toggle & Grid
    if (data.user_profiles) {
        document.getElementById('label-profile-acertou').innerText = `Acertou (${data.user_profiles.acertou.count})`;
        document.getElementById('label-profile-errou').innerText = `Errou (${data.user_profiles.errou.count})`;
        renderUserProfile(currentProfileTab);
    }

    // 5. Human Stats & Verdict Alert (Bloco 2)
    const hStats = data.human_stats;
    document.getElementById('human-pct-ia').innerText = `${hStats.ia_pct}% (${hStats.ia_votos} votos)`;
    document.getElementById('human-pct-real').innerText = `${hStats.real_pct}% (${hStats.real_votos} votos)`;
    
    document.getElementById('bar-human-ia').style.width = `${hStats.ia_pct}%`;
    document.getElementById('bar-human-real').style.width = `${hStats.real_pct}%`;
    
    document.getElementById('human-accuracy-badge').innerText = `Acertos: ${hStats.correct_pct}%`;

    const verdictAlert = document.getElementById('human-verdict-alert');
    const verdictStatus = document.getElementById('human-verdict-status');
    if (hStats.verdict === 'Acertou') {
        verdictAlert.className = 'w-full text-center py-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 flex flex-col items-center justify-center space-y-1 text-emerald-700';
        verdictStatus.innerText = `Público Acertou! (${hStats.correct_pct}% de acertos)`;
    } else {
        verdictAlert.className = 'w-full text-center py-4 rounded-xl border border-dashed border-red-300 bg-red-50 flex flex-col items-center justify-center space-y-1 text-red-600';
        verdictStatus.innerText = `Público foi Enganado! (${hStats.incorrect_pct}% de erros)`;
    }

    // 6. Model Decision & Auxiliary Cards (Bloco 2)
    const mStats = data.model_stats;
    document.getElementById('model-veredito-pct').innerText = `${mStats.pct}%`;
    
    const donutFill = document.getElementById('model-donut-fill');
    // Circle circumference is 2 * pi * r = 2 * 3.14159 * 40 = 251.2
    const offset = 251.2 - (251.2 * mStats.pct / 100);
    donutFill.style.strokeDashoffset = offset;
    
    if (data.gabarito === 'IA') {
        donutFill.setAttribute('stroke', '#ef4444'); // Red for IA
        document.getElementById('model-veredito-risk').innerText = 'Forte Suspeita de IA';
        document.getElementById('model-veredito-risk').className = 'text-[9px] uppercase tracking-wider font-semibold text-red-400';
    } else {
        donutFill.setAttribute('stroke', '#10b981'); // Emerald for Real
        document.getElementById('model-veredito-risk').innerText = 'Procedência Real';
        document.getElementById('model-veredito-risk').className = 'text-[9px] uppercase tracking-wider font-semibold text-emerald-400';
    }

    // Helper to color model risk badges
    const setRiskBadge = (elementId, pct, pctTextId) => {
        const badge = document.getElementById(elementId);
        const textVal = document.getElementById(pctTextId);
        textVal.innerText = `${pct}%`;
        
        if (pct >= 70) {
            badge.innerText = 'Alto';
            badge.className = 'text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-red-50 text-red-600 border border-red-200';
        } else if (pct >= 30) {
            badge.innerText = 'Médio';
            badge.className = 'text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-50 text-amber-600 border border-amber-200';
        } else {
            badge.innerText = 'Baixo';
            badge.className = 'text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-zinc-100 text-zinc-500 border border-zinc-200';
        }
    };
    
    setRiskBadge('risk-badge-principal', mStats.ia_principal, 'pct-principal');
    setRiskBadge('risk-badge-geral', mStats.ia_geral, 'pct-geral');
    setRiskBadge('risk-badge-multicat', mStats.ia_multicategoria, 'pct-multicat');
    setRiskBadge('risk-badge-face', mStats.ia_face, 'pct-face');

    // 7. System Metrics (Bloco 4)
    const mGrid = data.metrics_grid;
    
    const setMetric = (valId, cardId, value, isRisk) => {
        document.getElementById(valId).innerText = value.toFixed ? value.toFixed(4) : value;
        const card = document.getElementById(cardId);
        if (isRisk) {
            card.className = 'p-4 bg-red-50 border border-red-200 rounded-xl transition-all duration-300';
            document.getElementById(valId).className = 'text-xl font-bold text-red-600 code-font mt-1 block';
        } else {
            card.className = 'p-4 bg-zinc-50 border border-zinc-200 rounded-xl transition-all duration-300';
            document.getElementById(valId).className = 'text-xl font-bold text-zinc-800 code-font mt-1 block';
        }
    };

    setMetric('metric-ruido-val', 'card-metric-ruido', mGrid.variancia_ruido_srm, false);
    setMetric('metric-fft-val', 'card-metric-fft', mGrid.simetria_fourier_fft, mGrid.simetria_fourier_fft > 0.956);
    setMetric('metric-aberration-val', 'card-metric-aberration', mGrid.aberracao_cromatica, mGrid.aberracao_cromatica > 0.5);
    setMetric('metric-rg-val', 'card-metric-rg', mGrid.correlacao_r_g, false);
    setMetric('metric-rb-val', 'card-metric-rb', mGrid.correlacao_r_b, false);
    setMetric('metric-gb-val', 'card-metric-gb', mGrid.correlacao_g_b, false);
    setMetric('metric-gradmean-val', 'card-metric-gradmean', mGrid.media_gradientes, false);
    setMetric('metric-gradstd-val', 'card-metric-gradstd', mGrid.desvio_gradientes, false);
    setMetric('metric-ela-val', 'card-metric-ela', mGrid.media_ela_pct, mGrid.media_ela_pct > 2.5);

    // 8. Indicators List (Bloco 5)
    const indList = document.getElementById('indicators-list');
    indList.innerHTML = '';
    
    data.indicators.forEach((ind) => {
        const card = document.createElement('div');
        card.className = 'bg-zinc-50 border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-sm transition duration-150';
        
        let attBadge = '';
        if (ind.nivel_atencao === 'alta') {
            attBadge = '<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-50 text-red-600 border border-red-200">Atenção Alta</span>';
        } else if (ind.nivel_atencao === 'media') {
            attBadge = '<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-50 text-amber-600 border border-amber-200">Atenção Média</span>';
        } else {
            attBadge = '<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-zinc-100 text-zinc-500 border border-zinc-200">Atenção Baixa</span>';
        }
        
        card.innerHTML = `
            <div class="flex flex-wrap items-center gap-3 mb-3">
                <span class="text-xs font-bold tracking-wider text-indigo-600 uppercase font-mono">${ind.categoria}</span>
                ${attBadge}
            </div>
            <h3 class="text-sm font-semibold text-zinc-800 mb-1">${ind.titulo_anomalia}</h3>
            <p class="text-xs text-zinc-500 leading-relaxed mb-3">${ind.descricao}</p>
            <div class="text-[10px] text-zinc-400 font-mono code-font bg-white border border-zinc-200 px-2.5 py-1 rounded inline-block">
                Nível de desvio estrutural: ${ind.desvio_estrutural.toFixed(4)}
            </div>
        `;
        
        indList.appendChild(card);
    });
    
    // Refresh lucide inside dynamic cards
    if (window.lucide) {
        lucide.createIcons();
    }
}

// ==================== LIGHTBOX MODAL ====================
function openLightbox() {
    const data = IMAGE_DATA[currentImageId];
    openLightboxImage(data.paths.analise, `Painel de Análise Forense da Imagem ${currentImageId}`);
}

function openLightboxImage(src, caption = "Crop do Scanner Forense") {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-image');
    const cap = document.getElementById('lightbox-caption');
    
    img.src = src;
    cap.innerText = caption;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}


// ==================== PÁGINA 2: DASHBOARD GERAL CHARTS ====================
function initDashboardCharts() {
    const kpis = DASHBOARD_KPIS;
    
    // Populate KPIs
    document.getElementById('kpi-responses').innerText = kpis.total_responses;
    document.getElementById('kpi-accuracy').innerText = `${kpis.overall_human_accuracy}%`;
    
    document.getElementById('kpi-ia-knowledge').innerHTML = `${kpis.avg_ia_knowledge} <span class="text-sm text-zinc-400 font-normal">/ 5.0</span>`;
    document.getElementById('kpi-ia-knowledge-details').innerText = `Predom: ${kpis.predominant_ia} | ${kpis.ia_specialists_pct}% Especialistas`;
    
    document.getElementById('kpi-internet').innerText = `${kpis.predominant_internet} Horas`;
    document.getElementById('kpi-internet-details').innerText = `Média: ~${kpis.avg_internet_hours}h/dia (${kpis.internet_above_5h_pct}% > 5h)`;
    
    document.getElementById('kpi-score').innerText = kpis.predominant_score;
    document.getElementById('kpi-score-details').innerText = `${kpis.predominant_score_count} alunos (${kpis.predominant_score_pct}% da turma)`;
    
    document.getElementById('kpi-ia-acc').innerText = `${kpis.ia_accuracy}%`;
    
    document.getElementById('kpi-easiest').innerText = `Imagem ${kpis.easiest_image} (Real)`;
    document.getElementById('kpi-easiest-pct').innerText = `Taxa de acerto: ${kpis.easiest_image_accuracy}%`;
    
    document.getElementById('kpi-deceptive').innerText = `Imagem ${kpis.most_deceptive_image} (Real)`;
    document.getElementById('kpi-deceptive-pct').innerText = `Taxa de acerto: ${kpis.most_deceptive_image_accuracy}% (${(100 - kpis.most_deceptive_image_accuracy).toFixed(1)}% erros)`;

    // Setup global light mode styling for Chart.js
    Chart.defaults.color = 'rgb(82, 82, 91)'; // text-zinc-600
    Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.06)';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    // Destroys previous chart instance if exists
    const destroyChart = (key) => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
        }
    };

    // 1. Chart Image-by-Image Accuracy
    destroyChart('imageAccuracy');
    const ctxIA = document.getElementById('chart-image-accuracy').getContext('2d');
    
    const iaValues = [];
    const barColors = [];
    const borderColors = [];
    const labels = [];
    
    for (let i = 1; i <= 8; i++) {
        const info = IMAGE_DATA[i];
        iaValues.push(info.human_stats.correct_pct);
        labels.push(`Img ${i} (${info.gabarito})`);
        
        if (info.gabarito === 'Real') {
            barColors.push('rgba(16, 185, 129, 0.45)');
            borderColors.push('#10b981');
        } else {
            barColors.push('rgba(239, 68, 68, 0.45)');
            borderColors.push('#ef4444');
        }
    }
    
    const averageLinePlugin = {
        id: 'averageLine',
        afterDraw(chart) {
            const { ctx, chartArea: { left, right }, scales: { y } } = chart;
            const yVal = y.getPixelForValue(65.52);
            ctx.save();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(left, yVal);
            ctx.lineTo(right, yVal);
            ctx.stroke();
            ctx.restore();
            
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText('MÉDIA GERAL (65.5%)', right - 130, yVal - 5);
        }
    };

    chartInstances['imageAccuracy'] = new Chart(ctxIA, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Acurácia (%)',
                data: iaValues,
                backgroundColor: barColors,
                borderColor: borderColors,
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: c => `Acertos: ${c.raw}%` } }
            },
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                x: { grid: { display: false } }
            }
        },
        plugins: [averageLinePlugin]
    });

    // 2. Chart Tool Impact (Com Tool vs Sem Tool)
    destroyChart('toolImpact');
    const ctxTI = document.getElementById('chart-tool-impact').getContext('2d');
    
    // Exact computed values from survey_data.js
    const withToolAcc = [81.0, 92.9, 68.8, 73.4, 70.4, 57.3, 55.0, 39.0];
    const withoutToolAcc = [57.1, 71.4, 27.3, 50.0, 60.0, 44.4, 54.5, 44.4];
    
    chartInstances['toolImpact'] = new Chart(ctxTI, {
        type: 'bar',
        data: {
            labels: ['Img 1 (IA)', 'Img 2 (Real)', 'Img 3 (Real)', 'Img 4 (IA)', 'Img 5 (Real)', 'Img 6 (IA)', 'Img 7 (IA)', 'Img 8 (Real)'],
            datasets: [
                {
                    label: 'Com Uso de Ferramenta (%)',
                    data: withToolAcc,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: '#6366f1',
                    borderWidth: 1.5,
                    borderRadius: 4
                },
                {
                    label: 'Sem Ferramenta / Olho Nu (%)',
                    data: withoutToolAcc,
                    backgroundColor: 'rgba(161, 161, 170, 0.4)',
                    borderColor: '#a1a1aa',
                    borderWidth: 1.5,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw}%` } }
            },
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 3. Chart Score Histogram (Distribution of scores 0 to 8)
    destroyChart('scoreHistogram');
    const ctxSH = document.getElementById('chart-score-histogram').getContext('2d');
    chartInstances['scoreHistogram'] = new Chart(ctxSH, {
        type: 'bar',
        data: {
            labels: ['0/8', '1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8', '8/8'],
            datasets: [{
                label: 'Alunos',
                data: [1, 0, 4, 4, 19, 17, 30, 12, 4],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.4)',
                    'rgba(245, 158, 11, 0.5)', 'rgba(245, 158, 11, 0.5)',
                    'rgba(16, 185, 129, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(99, 102, 241, 0.8)'
                ],
                borderColor: [
                    '#ef4444', '#ef4444', '#ef4444', '#ef4444',
                    '#f59e0b', '#f59e0b',
                    '#10b981', '#10b981', '#6366f1'
                ],
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 4. Chart IA vs Real
    destroyChart('iaVsReal');
    const ctxVR = document.getElementById('chart-ia-vs-real').getContext('2d');
    chartInstances['iaVsReal'] = new Chart(ctxVR, {
        type: 'doughnut',
        data: {
            labels: ['Imagens IA (Sintéticas)', 'Imagens Reais (Fotográficas)'],
            datasets: [{
                data: [65.11, 65.93],
                backgroundColor: ['rgba(239, 68, 68, 0.65)', 'rgba(16, 185, 129, 0.65)'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: { callbacks: { label: c => `${c.label}: ${c.raw}% acertos` } }
            },
            cutout: '60%'
        }
    });

    // 5. Chart Knowledge
    destroyChart('knowledge');
    const ctxK = document.getElementById('chart-knowledge').getContext('2d');
    const kData = kpis.ia_knowledge_distribution;
    chartInstances['knowledge'] = new Chart(ctxK, {
        type: 'doughnut',
        data: {
            labels: Object.keys(kData).map(k => k.split(':')[0]),
            datasets: [{
                data: Object.values(kData),
                backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#64748b'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } },
            cutout: '60%'
        }
    });

    // 6. Chart Internet Usage
    destroyChart('internet');
    const ctxI = document.getElementById('chart-internet').getContext('2d');
    const iData = kpis.internet_distribution;
    chartInstances['internet'] = new Chart(ctxI, {
        type: 'bar',
        data: {
            labels: Object.keys(iData).map(k => `${k} Horas`),
            datasets: [{
                label: 'Alunos',
                data: Object.values(iData),
                backgroundColor: 'rgba(99, 102, 241, 0.55)',
                borderColor: '#6366f1',
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 7. Chart Accuracy by Internet Usage
    destroyChart('accuracyByInternet');
    const ctxABI = document.getElementById('chart-accuracy-by-internet').getContext('2d');
    chartInstances['accuracyByInternet'] = new Chart(ctxABI, {
        type: 'line',
        data: {
            labels: ['0 - 2h', '3 - 4h', '5 - 6h', '7 - 8h', '9+h'],
            datasets: [{
                label: 'Acurácia Média (%)',
                data: [56.25, 67.50, 69.02, 64.71, 65.18],
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: '#10b981',
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `Acurácia: ${c.raw}%` } } },
            scales: {
                y: { min: 50, max: 80, ticks: { callback: v => `${v}%` }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 8. Chart Total Verdicts
    destroyChart('totalVerdicts');
    const ctxTV = document.getElementById('chart-total-verdicts').getContext('2d');
    chartInstances['totalVerdicts'] = new Chart(ctxTV, {
        type: 'doughnut',
        data: {
            labels: ['Respostas Corretas (Acertos)', 'Respostas Incorretas (Erros)'],
            datasets: [{
                data: [477, 251],
                backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } },
            cutout: '65%'
        }
    });
}



// ==================== PÁGINA 3: RESPOSTAS INDIVIDUAIS & FEEDBACK ====================

// ---- Sentiment Analysis Engine (Refined based on actual student comments) ----
const EXPLICIT_POSITIVE_KEYWORDS = [
    'funcionou', 'amei', 'muito bom', 'muito boa', 'excelente', 'ótima', 'otima',
    'perfeita', 'bem funcional', 'ajudou', 'mais facil', 'mais fácil', 'vermos mais detalhes',
    'gostei', 'legal', 'top', 'show', 'arrasaram', 'adorei', 'esclareceu', 'superou',
    'deu certo', 'recomendo', 'muito legal', 'muito interessante'
];

const EXPLICIT_NEGATIVE_KEYWORDS = [
    'não fez diferença', 'nao fez diferenca', 'não ajudou', 'nao ajudou', 'não funcionou',
    'nao funcionou', 'inútil', 'inutil', 'péssimo', 'pessimo', 'ruim', 'perda de tempo',
    'não serviu', 'nao serviu', 'ferramenta errou', 'modelo errou', 'não é confiável',
    'nao é confiavel', 'nada a ver', 'sem sentido', 'não valeu'
];

/**
 * Classifies a single comment text as 'Positivo', 'Negativo' or 'Neutro'.
 */
function classifyCommentSentiment(text) {
    if (!text || text.trim() === '') return { sentiment: 'Neutro', keyword: null };
    const lower = text.toLowerCase().trim();

    for (const kw of EXPLICIT_NEGATIVE_KEYWORDS) {
        if (lower.includes(kw)) return { sentiment: 'Negativo', keyword: kw };
    }
    for (const kw of EXPLICIT_POSITIVE_KEYWORDS) {
        if (lower.includes(kw)) return { sentiment: 'Positivo', keyword: kw };
    }
    return { sentiment: 'Neutro', keyword: null };
}

/**
 * Computes overall student sentiment based on per-image block comments AND final feedback comment.
 * Explicit tool criticism -> Negativo. Explicit tool praise -> Positivo. Otherwise -> Neutro.
 */
function computeStudentSentiment(row) {
    let hasNeg = false;
    let hasPos = false;

    // Check 8 block comments
    for (let i = 1; i <= 8; i++) {
        const r = row.respostas ? row.respostas[i] : null;
        if (!r) continue;
        const text = (r.comentario || '').trim();
        if (text !== '') {
            const { sentiment } = classifyCommentSentiment(text);
            if (sentiment === 'Negativo') hasNeg = true;
            if (sentiment === 'Positivo') hasPos = true;
        }
    }

    // Also check final comment
    const finalText = (row.comentario_final || '').trim();
    if (finalText !== '') {
        const { sentiment } = classifyCommentSentiment(finalText);
        if (sentiment === 'Negativo') hasNeg = true;
        if (sentiment === 'Positivo') hasPos = true;
    }

    if (hasNeg) return 'Negativo';
    if (hasPos) return 'Positivo';
    return 'Neutro';
}

// ---- Sentiment Group Visual Config ----
const SENTIMENT_GROUPS = [
    {
        key: 'Positivo',
        label: 'Elogios / Ferramenta Ajudou',
        subtitle: 'Alunos que relataram expressamente que a ferramenta ajudou, funcionou ou trouxeram elogios',
        headerClass: 'bg-emerald-50 border-l-4 border-emerald-400',
        titleClass: 'text-emerald-800',
        subtitleClass: 'text-emerald-600',
        countClass: 'bg-emerald-100 text-emerald-700',
        cardAccent: 'hover:border-emerald-300',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        icon: 'smile'
    },
    {
        key: 'Neutro',
        label: 'Respostas Objetivas / Neutras',
        subtitle: 'Alunos que apenas observaram detalhes visuais da imagem ou responderam de forma direta',
        headerClass: 'bg-zinc-50 border-l-4 border-zinc-400',
        titleClass: 'text-zinc-700',
        subtitleClass: 'text-zinc-500',
        countClass: 'bg-zinc-100 text-zinc-600',
        cardAccent: 'hover:border-zinc-400',
        badgeClass: 'bg-zinc-100 text-zinc-600 border border-zinc-300',
        icon: 'minus-circle'
    },
    {
        key: 'Negativo',
        label: 'Críticas / Limitações Relatadas',
        subtitle: 'Alunos que relataram que a ferramenta não fez diferença ou que não ajudou na identificação',
        headerClass: 'bg-red-50 border-l-4 border-red-400',
        titleClass: 'text-red-800',
        subtitleClass: 'text-red-600',
        countClass: 'bg-red-100 text-red-700',
        cardAccent: 'hover:border-red-300',
        badgeClass: 'bg-red-50 text-red-600 border border-red-200',
        icon: 'frown'
    }
];

// ---- Main Render ----
function renderSurveyCards(filteredData = SURVEY_DATA) {
    const container = document.getElementById('cards-container');
    const emptyState = document.getElementById('cards-empty-state');
    const countEl = document.getElementById('results-count');

    container.innerHTML = '';

    // Enrich each row with computed sentiment from block comments
    const enriched = filteredData.map(row => ({
        ...row,
        _sent: computeStudentSentiment(row)
    }));

    if (countEl) countEl.innerText = enriched.length;

    if (enriched.length === 0) {
        emptyState.classList.remove('hidden');
        container.classList.add('hidden');
        if (window.lucide) lucide.createIcons();
        return;
    }
    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    SENTIMENT_GROUPS.forEach(group => {
        const groupData = enriched.filter(r => r._sent === group.key);
        if (groupData.length === 0) return;

        const section = document.createElement('div');
        section.className = 'space-y-5';

        // Group header bar
        const headerDiv = document.createElement('div');
        headerDiv.className = `${group.headerClass} rounded-xl px-6 py-4 flex items-center justify-between`;
        headerDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <i data-lucide="${group.icon}" class="w-5 h-5 ${group.titleClass}"></i>
                <div>
                    <h2 class="text-sm font-bold ${group.titleClass}">${group.label}</h2>
                    <p class="text-xs ${group.subtitleClass} mt-0.5">${group.subtitle}</p>
                </div>
            </div>
            <span class="text-sm font-bold px-3 py-1.5 rounded-full ${group.countClass} whitespace-nowrap">
                ${groupData.length} aluno${groupData.length !== 1 ? 's' : ''}
            </span>
        `;
        section.appendChild(headerDiv);

        // Cards — 1 col on mobile, 2 cols on xl+
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 xl:grid-cols-2 gap-5';

        groupData.forEach(row => {
            const shortIa = row.nivel_ia.split(':')[0];

            // Score color
            let scoreColor = 'text-red-600', scoreBg = 'bg-red-50 border-red-200';
            if (row.acertos_total >= 6) { scoreColor = 'text-emerald-700'; scoreBg = 'bg-emerald-50 border-emerald-200'; }
            else if (row.acertos_total >= 4) { scoreColor = 'text-amber-700'; scoreBg = 'bg-amber-50 border-amber-200'; }

            // Build 8 image rows — each visible with vote result + full comment text
            let imageRowsHTML = '';
            for (let i = 1; i <= 8; i++) {
                const r = row.respostas ? row.respostas[i] : null;

                if (!r || !r.vote || r.vote.trim() === '') {
                    // Blank row — no response for this image
                    imageRowsHTML += `
                        <div class="flex items-center gap-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2">
                            <span class="text-[10px] font-bold text-zinc-400 w-12 flex-shrink-0">IMG ${i}</span>
                            <span class="text-[11px] text-zinc-300 italic">sem resposta</span>
                        </div>
                    `;
                } else {
                    const isCorrect = r.acertou;
                    const votedIA = r.vote && (r.vote.toLowerCase().includes('manipula') || r.vote.toLowerCase().includes('artificial') || r.vote.toLowerCase().includes('ia'));
                    const voteLabel = votedIA ? 'IA' : 'Real';
                    const voteLabelColor = votedIA ? 'text-violet-600' : 'text-blue-600';
                    const rowBg = isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50';
                    const resultMark = isCorrect
                        ? '<span class="font-bold text-emerald-600 text-sm">✓</span>'
                        : '<span class="font-bold text-red-500 text-sm">✗</span>';

                    const rawComment = (r.comentario || '').trim();
                    const { sentiment: cSent } = classifyCommentSentiment(rawComment);

                    let commentHTML = '';
                    if (rawComment !== '') {
                        let cPill = 'bg-zinc-100 text-zinc-500';
                        if (cSent === 'Positivo') cPill = 'bg-emerald-100 text-emerald-700';
                        else if (cSent === 'Negativo') cPill = 'bg-red-100 text-red-600';

                        commentHTML = `
                            <div class="mt-1.5 flex items-start gap-2">
                                <span class="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${cPill}">${cSent}</span>
                                <p class="text-[11px] text-zinc-600 italic leading-snug">"${rawComment}"</p>
                            </div>
                        `;
                    }

                    const toolBadge = r.ferramenta === 'Sim'
                        ? '<span class="text-[9px] text-indigo-500 font-semibold bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">Tool</span>'
                        : '';

                    imageRowsHTML += `
                        <div class="rounded-lg border ${rowBg} px-3 py-2">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-bold text-zinc-500 w-12 flex-shrink-0">IMG ${i}</span>
                                ${resultMark}
                                <span class="text-[11px] font-bold ${voteLabelColor}">${voteLabel}</span>
                                ${toolBadge}
                            </div>
                            ${commentHTML}
                        </div>
                    `;
                }
            }

            // Final comment (shown but does NOT influence sentiment grouping)
            const finalRaw = (row.comentario_final || '').trim();
            let finalHTML = '';
            if (finalRaw !== '') {
                finalHTML = `
                    <div class="mt-4 pt-3 border-t border-zinc-100">
                        <p class="text-xs font-semibold text-zinc-400 mb-1">Comentário Final (campo geral)</p>
                        <p class="text-xs text-zinc-500 italic leading-relaxed">"${finalRaw}"</p>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = `bg-white border border-zinc-200 ${group.cardAccent} rounded-xl p-5 shadow-sm transition-all duration-150`;
            card.innerHTML = `
                <!-- Student header -->
                <div class="flex items-start justify-between pb-3 mb-3 border-b border-zinc-100">
                    <div class="min-w-0 flex-grow pr-3">
                        <h3 class="text-sm font-bold text-zinc-900 leading-tight">${row.nome}</h3>
                        <div class="flex flex-wrap items-center gap-x-3 mt-1">
                            <span class="text-[11px] text-zinc-400">${shortIa}</span>
                            <span class="text-[11px] text-zinc-400">${row.media_internet}h/dia</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span class="text-sm font-extrabold code-font ${scoreColor} px-2.5 py-0.5 rounded-lg border ${scoreBg}">${row.acertos_total}/8</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${group.badgeClass}">${group.key}</span>
                    </div>
                </div>

                <!-- Image blocks (each on own row, comment visible) -->
                <div class="space-y-1.5">
                    ${imageRowsHTML}
                </div>

                ${finalHTML}
            `;

            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    });

    if (window.lucide) lucide.createIcons();
}

// Alias
function renderSurveyTable(data) { renderSurveyCards(data); }

function getFilteredData() {
    const nameVal = document.getElementById('filter-name').value.toLowerCase().trim();
    const sentimentVal = document.getElementById('filter-sentiment').value;
    const internetVal = document.getElementById('filter-internet').value;

    return SURVEY_DATA.filter(row => {
        const matchName = nameVal === '' || row.nome.toLowerCase().includes(nameVal);
        const matchInternet = internetVal === 'All' || row.media_internet === internetVal;
        // Sentiment filter is computed from block comments, not spreadsheet field
        const matchSentiment = sentimentVal === 'All' || computeStudentSentiment(row) === sentimentVal;
        return matchName && matchInternet && matchSentiment;
    });
}

function applyFilters() {
    renderSurveyCards(getFilteredData());
}
