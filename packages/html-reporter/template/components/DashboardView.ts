/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import 'chartjs-plugin-zoom';

import { Chart } from 'chart.js/auto';
import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { DATA, formatDuration, formatRunLabel, outcomeClass, scenarioUrl } from '../utils';

const html = htm.bind(h);

// ===== Area Sparkline (filled, for hero card) =====
function AreaSparkline({ values, color, width = 200, height = 48 }) {
    if (!values || values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padY = 2;
    const pts = values.map((v, i) => ({
        x: (i / (values.length - 1)) * width,
        y: padY + (1 - (v - min) / range) * (height - 2 * padY),
    }));
    const line = pts.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${pts.map(p => `${p.x},${p.y}`).join(' ')} ${width},${height} 0,${height}`;
    return html`
        <svg class="sparkline-area" width="100%" height=${height} viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <polygon fill=${color} points=${area} />
            <polyline fill="none" stroke=${color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points=${line} opacity="0.6" />
        </svg>
    `;
}

// ===== Dot Trend (for operational cards) =====
function DotTrend({ values, color, maxHeight = 20 }) {
    if (!values || values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return html`
        <div class="kpi-dots" aria-hidden="true">
            ${values.slice(-7).map(v => {
                const h = 4 + ((v - min) / range) * (maxHeight - 4);
                return html`<span class="kpi-dot" style="height:${h}px;background:${color}"></span>`;
            })}
        </div>
    `;
}

// ===== Delta indicator =====
function Delta({ current, previous, invert = false, suffix = '' }) {
    if (previous === undefined || previous === null) return null;
    const diff = current - previous;
    if (diff === 0) return html`<span class="kpi-delta kpi-delta--neutral">— no change</span>`;
    const positive = invert ? diff < 0 : diff > 0;
    const cls = positive ? 'kpi-delta--positive' : 'kpi-delta--negative';
    const arrow = positive ? '↑' : '↓';
    return html`<span class="kpi-delta ${cls}">${arrow} ${Math.abs(diff)}${suffix}</span>`;
}

// ===== Trend Chart (Chart.js) =====
export function TrendChart({ history, onNavigate }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const [chartTheme, setChartTheme] = useState(() => localStorage.getItem('serenity-theme') || 'light');

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const t = document.documentElement.getAttribute('data-theme') || 'light';
            setChartTheme(t);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const handleResize = () => {
            if (!chartRef.current) return;
            const isMobile = window.innerWidth <= 768;
            const xScale = chartRef.current.options.scales.x;
            if (isMobile && history.length > 3) {
                xScale.min = history.length - 3;
            } else {
                xScale.min = undefined;
            }
            chartRef.current.update('none');
        };
        window.addEventListener('resize', handleResize);

        return () => { observer.disconnect(); window.removeEventListener('resize', handleResize); };
    }, []);

    useEffect(() => {
        if (!canvasRef.current || history.length === 0) return;
        if (chartRef.current) chartRef.current.destroy();

        const isDark = chartTheme === 'dark';
        const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(46,38,61,0.7)';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

        const allDurations = history.flatMap(h => [h.fastest, h.slowest, h.average, h.duration].filter(v => v > 0));
        const minDuration = allDurations.length > 0 ? Math.min(...allDurations) : undefined;
        const maxDuration = allDurations.length > 0 ? Math.max(...allDurations) : undefined;

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: history.map(h => formatRunLabel(h.label, h.timestamp)),
                datasets: [
                    {
                        type: 'bar',
                        label: 'Passed',
                        data: history.map(h => h.outcomes.passed),
                        backgroundColor: '#28c76f',
                        stack: 'outcomes',
                        maxBarThickness: 80,
                        yAxisID: 'y',
                        order: 2,
                    },
                    {
                        type: 'bar',
                        label: 'Failed',
                        data: history.map(h => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0)),
                        backgroundColor: '#ea5455',
                        stack: 'outcomes',
                        maxBarThickness: 80,
                        yAxisID: 'y',
                        order: 2,
                    },
                    {
                        type: 'bar',
                        label: 'Skipped',
                        data: history.map(h => (h.outcomes.skipped || 0) + (h.outcomes.pending || 0)),
                        backgroundColor: '#a8aaae',
                        stack: 'outcomes',
                        maxBarThickness: 80,
                        yAxisID: 'y',
                        order: 2,
                    },
                    {
                        type: 'line',
                        label: 'Total Duration',
                        data: history.map(h => h.duration),
                        borderColor: isDark ? 'rgba(105,108,255,0.7)' : 'rgba(105,108,255,0.6)',
                        backgroundColor: 'transparent',
                        borderDash: [4, 4],
                        borderWidth: 2.5,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        yAxisID: 'y1',
                        order: 1,
                    },
                    {
                        type: 'bar',
                        label: 'Duration Range',
                        data: history.map(h => [h.fastest || 0, h.slowest || 0]),
                        backgroundColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        borderColor: 'transparent',
                        borderWidth: 0,
                        borderSkipped: false,
                        barPercentage: 0.05,
                        categoryPercentage: 1,
                        maxBarThickness: 3,
                        yAxisID: 'y1',
                        order: 0,
                        grouped: false,
                    },
                    {
                        type: 'line',
                        label: 'Average Duration',
                        data: history.map(h => h.average || 0),
                        borderColor: 'transparent',
                        backgroundColor: isDark ? '#ffffff' : '#3a3541',
                        pointStyle: 'rect',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 0,
                        fill: false,
                        showLine: false,
                        yAxisID: 'y1',
                        order: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 100,
                interaction: { intersect: false, mode: 'index' },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        onNavigate && onNavigate('/tests?run=' + history[index].timestamp);
                    }
                },
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: textColor, usePointStyle: true, padding: 16 } },
                    tooltip: {
                        usePointStyle: true,
                        callbacks: {
                            title: (items) => {
                                const index = items[0].dataIndex;
                                const run = history[index];
                                return formatRunLabel(run.label, run.timestamp);
                            },
                            label: (context) => {
                                const label = context.dataset.label || '';
                                if (label === 'Duration Range') {
                                    const [low, high] = context.raw;
                                    return 'Fastest: ' + formatDuration(low) + ' · Slowest: ' + formatDuration(high);
                                }
                                if (label === 'Duration' || label === 'Total Duration' || label === 'Average Duration') {
                                    return label + ': ' + formatDuration(context.raw);
                                }
                                return label + ': ' + context.raw;
                            },
                            labelColor: (context) => {
                                const color = context.dataset.borderColor === 'transparent' ? context.dataset.backgroundColor : context.dataset.borderColor;
                                return { borderColor: color, backgroundColor: color };
                            },
                        },
                    },
                    zoom: {
                        pan: { enabled: true, mode: 'x' },
                        zoom: { wheel: { enabled: false }, pinch: { enabled: true }, mode: 'x' },
                        limits: { x: { min: 0, max: history.length - 1 } },
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: textColor },
                        grid: { color: gridColor },
                        min: window.innerWidth <= 768 && history.length > 3 ? history.length - 3 : undefined,
                        max: history.length - 1,
                    },
                    y: { stacked: true, beginAtZero: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor }, title: { display: false } },
                    y1: { type: 'logarithmic', position: 'right', min: minDuration ? minDuration * 0.8 : undefined, max: maxDuration ? maxDuration * 1.2 : undefined, ticks: { color: textColor, callback: (v) => formatDuration(v), maxTicksLimit: 8 }, grid: { drawOnChartArea: true, color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderDash: [3, 3] }, title: { display: false } },
                },
            },
        });

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [history, chartTheme]);

    if (history.length === 0) return null;

    return html`
    <div style="position:relative;width:100%;height:280px;overflow:hidden">
      <canvas ref=${canvasRef}></canvas>
    </div>
  `;
}

// ===== Dashboard View =====
export function DashboardView({ onNavigate }) {
    const { summary, history, scenarios } = DATA;
    const totalFailed = (summary.outcomes.failed || 0) + (summary.outcomes.error || 0) + (summary.outcomes.compromised || 0);

    // Compute current scores from latest history entry or derive from summary
    const latestScore = history.length > 0 && history[history.length - 1].score;
    const previousScore = history.length > 1 && history[history.length - 2].score;
    const passRate = latestScore ? latestScore.passRate : (summary.totalScenarios > 0 ? Math.round((summary.outcomes.passed / summary.totalScenarios) * 100) : 0);
    const consistency = latestScore ? latestScore.consistency : 100;
    const completenessScore = latestScore ? latestScore.completeness : (() => {
        const capabilities = DATA.capabilities;
        if (!capabilities) return 100;
        let total = 0, complete = 0;
        function walk(node) {
            if (node.type === 'file') { total++; const t = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0); if (t > 0 && !(node.outcomes.pending || 0) && !(node.outcomes.skipped || 0)) complete++; }
            if (node.children) node.children.forEach(walk);
        }
        if (capabilities.children) capabilities.children.forEach(walk);
        return total > 0 ? Math.round((complete / total) * 100) : 100;
    })();
    const confidence = latestScore ? latestScore.confidence : Math.round(completenessScore * 0.3 + passRate * 0.35 + consistency * 0.35);

    // Previous run values for deltas
    const previousConfidence = previousScore ? previousScore.confidence : undefined;
    const previousPassRate = previousScore ? previousScore.passRate : undefined;
    const previousConsistency = previousScore ? previousScore.consistency : undefined;
    const previousCompleteness = previousScore ? previousScore.completeness : undefined;
    const previousFailed = history.length > 1 ? ((h) => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0))(history[history.length - 2]) : undefined;
    const previousDuration = history.length > 1 ? history[history.length - 2].duration : undefined;

    // Sparkline data from history
    const scoreHistory = history.filter(h => h.score);
    const confidenceTrend = scoreHistory.map(h => h.score.confidence);
    const failedTrend = history.map(h => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0));
    const durationTrend = history.map(h => h.duration);

    // Colour: only exceptional or warning states get colour; "normal good" uses default text
    const heroColor = (v) => v >= 90 ? 'var(--color-passed)' : v < 50 ? 'var(--color-failed)' : v < 70 ? 'var(--color-pending)' : undefined;
    const scoreColor = (v) => v >= 90 ? 'var(--color-passed)' : v < 50 ? 'var(--color-failed)' : v < 70 ? 'var(--color-pending)' : undefined;

    const sorted = [...scenarios].sort((a, b) => b.duration - a.duration);
    const slowest = sorted.slice(0, 5);
    const newFailures = useMemo(() => (DATA.newFailures || []).slice(0, 5), []);
    const newPasses = useMemo(() => (DATA.newPasses || []).slice(0, 5), []);
    const inconsistent = (DATA.inconsistentTests || []).slice(0, 5);

    // Look up execution history for a test by source identity
    const getHistory = (t) => {
        const key = t.source.path + ':' + (t.source.line || '');
        const match = scenarios.find(s => s.source.path + ':' + (s.source.line || '') === key)
            || scenarios.find(s => s.name === t.name && s.source.path === t.source.path);
        return match && match.executionHistory ? match.executionHistory.slice(-5) : [];
    };

    return html`
    <div class="dashboard">
      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi-card kpi-card--hero" onClick=${() => onNavigate('/capabilities')} tabindex="0" role="button" aria-label="Confidence: ${confidence} percent">
          <span class="kpi-label">Confidence</span>
          <span class="kpi-value" style=${heroColor(confidence) ? `color:${heroColor(confidence)}` : ''}>${confidence}<span style="font-size:var(--font-base);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <span class="kpi-subtitle">${(() => {
                if (previousConfidence === undefined) return `${summary.totalScenarios} scenarios across ${history.length} run${history.length !== 1 ? 's' : ''}`;
                const newFails = (DATA.newFailures || []).length;
                const recovered = (DATA.newPasses || []).length;
                if (confidence > previousConfidence) {
                    if (recovered > 0) return `Improved since last run — ${recovered} test${recovered > 1 ? 's' : ''} recovered`;
                    return `Improved since last run — pass rate up`;
                }
                if (confidence < previousConfidence) {
                    if (newFails > 0) return `Decreased since last run — ${newFails} new failure${newFails > 1 ? 's' : ''}`;
                    return `Decreased since last run — consistency dropped`;
                }
                return 'No change since last run';
            })()}</span>
          <${AreaSparkline} values=${confidenceTrend} color=${heroColor(confidence) || 'var(--accent)'} />
        </div>
        <div class="kpi-card" onClick=${() => onNavigate('/tests?filter=failed,skipped')} tabindex="0" role="button" aria-label="Pass rate: ${passRate} percent">
          <span class="kpi-label">Pass Rate</span>
          <span class="kpi-value" style=${scoreColor(passRate) ? `color:${scoreColor(passRate)}` : ''}>${passRate}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <${Delta} current=${passRate} previous=${previousPassRate} suffix="%" />
          <span class="kpi-subtitle">${summary.outcomes.passed} of ${summary.totalScenarios} passing</span>
        </div>
        <div class="kpi-card" onClick=${() => onNavigate('/consistency')} tabindex="0" role="button" aria-label="Consistency: ${consistency} percent">
          <span class="kpi-label">Consistency</span>
          <span class="kpi-value" style=${scoreColor(consistency) ? `color:${scoreColor(consistency)}` : ''}>${consistency}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <${Delta} current=${consistency} previous=${previousConsistency} suffix="%" />
          <span class="kpi-subtitle">${consistency === 100 ? 'All tests consistent' : (DATA.inconsistentTests || []).length + ' inconsistent test' + ((DATA.inconsistentTests || []).length !== 1 ? 's' : '')}</span>
        </div>
        <div class="kpi-card" onClick=${() => onNavigate('/capabilities')} tabindex="0" role="button" aria-label="Completeness: ${completenessScore} percent">
          <span class="kpi-label">Completeness</span>
          <span class="kpi-value" style=${scoreColor(completenessScore) ? `color:${scoreColor(completenessScore)}` : ''}>${completenessScore}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <${Delta} current=${completenessScore} previous=${previousCompleteness} suffix="%" />
          <span class="kpi-subtitle">${summary.totalScenarios - (summary.outcomes.pending || 0) - (summary.outcomes.skipped || 0)} of ${summary.totalScenarios} implemented</span>
        </div>
        <div class="kpi-row-operational">
          <div class="kpi-card kpi-card--operational" onClick=${() => onNavigate('/tests?filter=failed')} tabindex="0" role="button" aria-label="${totalFailed} failed scenarios">
            <span class="kpi-label">Failed</span>
            <span class="kpi-value" style="color:${totalFailed > 0 ? 'var(--color-failed)' : 'var(--text-primary)'}">${totalFailed}</span>
            <${Delta} current=${totalFailed} previous=${previousFailed} invert=${true} />
            <${DotTrend} values=${failedTrend} color="var(--color-failed)" />
          </div>
          <div class="kpi-card kpi-card--operational" onClick=${() => onNavigate('/tests?sort=duration')} tabindex="0" role="button" aria-label="Total duration: ${formatDuration(summary.duration)}">
            <span class="kpi-label">Duration</span>
            <span class="kpi-value">${formatDuration(summary.duration)}</span>
            ${previousDuration !== undefined ? html`<span class="kpi-delta ${summary.duration < previousDuration ? 'kpi-delta--positive' : summary.duration > previousDuration ? 'kpi-delta--negative' : 'kpi-delta--neutral'}">${summary.duration < previousDuration ? '↑' : summary.duration > previousDuration ? '↓' : '—'} ${formatDuration(Math.abs(summary.duration - previousDuration))} ${summary.duration < previousDuration ? 'faster' : summary.duration > previousDuration ? 'slower' : ''}</span>` : null}
            <${DotTrend} values=${durationTrend} color="var(--accent)" />
          </div>
        </div>
      </div>

      <!-- Context metadata -->
      <div class="dashboard-meta">
        <span>${summary.totalScenarios} scenarios • ${summary.testRunner}</span>
        ${DATA.systemContext && DATA.systemContext.ci ? (() => { const ci = DATA.systemContext.ci; const repoUrl = ci.repositoryUrl ? ci.repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') : ''; return html`
          ${ci.branch ? html`<span class="dashboard-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>${repoUrl ? html`<a href="${repoUrl}/tree/${ci.branch}" target="_blank" class="meta-link">${ci.branch}</a>` : html`<span>${ci.branch}</span>`}</span>` : null}
          ${ci.commit ? html`<span class="dashboard-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><circle cx="12" cy="12" r="4"/><line x1="1" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="23" y2="12"/></svg>${repoUrl ? html`<a href="${repoUrl}/commit/${ci.commit}" target="_blank" class="meta-link mono">${ci.commit.slice(0, 10)}</a>` : html`<span class="mono">${ci.commit.slice(0, 10)}</span>`}</span>` : null}
        `; })() : null}
      </div>

      <!-- Main grid: Trend (8col) + Health Summary (4col) -->
      <div class="dashboard-main-grid">
        <div class="card dashboard-trend-card">
          <div class="card-header">
            <div class="card-title mb-0">Trend</div>
          </div>
          <${TrendChart} history=${history} onNavigate=${onNavigate} />
        </div>

        <div class="dashboard-health-col">
          <!-- Consistency -->
          <div class="card dashboard-status-card">
            <div class="card-header">
              <span class="status-card-title">Consistency</span>
              ${(newFailures.length > 0 || newPasses.length > 0 || inconsistent.length > 0) ? html`<a class="view-all-link" onClick=${() => onNavigate('/consistency')}>View all →</a>` : null}
            </div>
            ${(() => {
                const items = [
                    ...newFailures.map(t => ({ ...t, kind: 'degraded' })),
                    ...newPasses.map(t => ({ ...t, kind: 'recovered' })),
                    ...inconsistent.filter(t => !newFailures.some(f => f.source.path === t.source.path) && !newPasses.some(p => p.source.path === t.source.path)).map(t => ({ ...t, kind: 'unstable' })),
                ].slice(0, 5);
                if (items.length === 0) return html`<div class="status-empty status-empty--ok"><span class="status-chip">✓</span> All tests consistent</div>`;
                return items.map(t => html`
                    <div class="status-item status-item--rich clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                      <div class="status-item-main">
                        <span class="status-icon ${t.kind === 'degraded' ? 'status-icon--fail' : t.kind === 'recovered' ? 'status-icon--pass' : 'status-icon--warn'}">${t.kind === 'degraded' ? '✗' : t.kind === 'recovered' ? '✓' : '⚠'}</span>
                        <span class="status-item-name">${t.name}</span>
                        <span class="status-item-kind" style="color:${t.kind === 'degraded' ? 'var(--color-failed)' : t.kind === 'recovered' ? 'var(--color-passed)' : 'var(--color-pending)'}">${t.kind}</span>
                      </div>
                      <div class="status-item-history">${(t.history || getHistory(t)).map((h, i) => {
                    const outcome = typeof h === 'string' ? h : h.outcome;
                    const label = t.labels ? t.labels[i] : (typeof h === 'object' ? h.run : '');
                    return html`<span class="history-dot history-dot--${outcomeClass(outcome)}" title=${outcome + (label ? ' (' + label + ')' : '')}></span>`;
                })}</div>
                    </div>
                `);
            })()}
          </div>
          <!-- Slowest Tests -->
          <div class="card dashboard-status-card">
            <div class="card-header">
              <span class="status-card-title">Slowest Tests</span>
              <a class="view-all-link" onClick=${() => onNavigate('/tests?sort=duration')}>View all →</a>
            </div>
            ${slowest.map(s => html`
              <div class="status-item clickable" onClick=${() => onNavigate(scenarioUrl(s))}>
                <span class="status-icon" style="color:var(--color-pending)">⏱</span>
                <span class="status-item-name">${s.name}</span>
                <span class="status-item-meta">${formatDuration(s.duration)}</span>
              </div>
            `)}
          </div>
        </div>
      </div>
    </div>
  `;
}
