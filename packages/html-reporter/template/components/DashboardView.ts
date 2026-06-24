/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import 'chartjs-plugin-zoom';

import { Chart } from 'chart.js/auto';
import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { DATA, formatDuration, formatTimestamp, scenarioUrl } from '../utils';

const html = htm.bind(h);

// ===== Donut Chart (Chart.js) =====
function DonutChart({ outcomes, total }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();

        chartRef.current = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [outcomes.passed, (outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0), (outcomes.skipped || 0) + (outcomes.pending || 0)],
                    backgroundColor: ['#28c76f', '#ea5455', '#a8aaae'],
                    borderWidth: 0,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                },
            },
        });

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [outcomes, total]);

    useEffect(() => {
        const observer = new MutationObserver(() => { if (chartRef.current) chartRef.current.update(); });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    return html`
    <div style="width:56px;height:56px;flex-shrink:0">
      <canvas ref=${canvasRef}></canvas>
    </div>
  `;
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
                labels: history.map(h => h.label + ' — ' + formatTimestamp(h.timestamp)),
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
                        usePointStyle: false,
                        callbacks: {
                            title: (items) => {
                                const index = items[0].dataIndex;
                                const run = history[index];
                                return run.label + ' — ' + formatTimestamp(run.timestamp);
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
    const totalSkipped = (summary.outcomes.skipped || 0) + (summary.outcomes.pending || 0);
    const denominator = summary.totalScenarios - totalSkipped;
    const passRate = denominator > 0 ? ((summary.outcomes.passed / denominator) * 100).toFixed(1) : '0.0';

    const coverage = useMemo(() => {
        const req = DATA.requirements;
        if (!req) return null;
        let total = 0, covered = 0;
        function walk(node) {
            if (node.type === 'file') {
                total++;
                const t = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0);
                if (t > 0 && !(node.outcomes.pending || 0) && !(node.outcomes.skipped || 0)) covered++;
            }
            if (node.children) node.children.forEach(walk);
        }
        if (req.children) req.children.forEach(walk);
        return { total, covered, percent: total > 0 ? Math.round((covered / total) * 100) : 100 };
    }, []);

    const sorted = [...scenarios].sort((a, b) => b.duration - a.duration);
    const slowest = sorted.slice(0, 5);
    const newFailures = useMemo(() => (DATA.newFailures || []).slice(0, 5), []);
    const newPasses = useMemo(() => (DATA.newPasses || []).slice(0, 5), []);
    const flakyTests = (DATA.unstableTests || []).slice(0, 5);

    // Look up execution history for a test by source identity
    const getHistory = (t) => {
        const key = t.source.path + ':' + t.source.line;
        const match = scenarios.find(s => s.source.path + ':' + s.source.line === key);
        return match && match.executionHistory ? match.executionHistory.slice(-5) : [];
    };

    // Trend summary stats
    const totalPassed = history.reduce((sum, h) => sum + h.outcomes.passed, 0);
    const totalHistoryFailed = history.reduce((sum, h) => sum + (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0), 0);

    return html`
    <div class="dashboard">
      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi-card" onClick=${() => onNavigate('/tests')}>
          <div class="kpi-icon-wrap kpi-icon--total">
            <${DonutChart} outcomes=${summary.outcomes} total=${summary.totalScenarios} />
          </div>
          <div class="kpi-content">
            <span class="kpi-value">${summary.totalScenarios}</span>
            <span class="kpi-label">Total Scenarios</span>
          </div>
        </div>
        <div class="kpi-card" onClick=${() => onNavigate('/tests?filter=failed,skipped')} title="${summary.outcomes.passed} scenarios passing, ${totalFailed} failing">
          <div class="kpi-icon-wrap kpi-icon--pass-rate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value" style="color:var(--color-passed)">${passRate}%</span>
            <span class="kpi-label">Pass Rate</span>
          </div>
        </div>
        ${coverage ? html`
          <div class="kpi-card" onClick=${() => onNavigate('/requirements')} title="${coverage.covered} of ${coverage.total} areas fully covered">
            <div class="kpi-icon-wrap kpi-icon--coverage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value" style="color:${coverage.percent >= 80 ? 'var(--color-passed)' : coverage.percent >= 50 ? 'var(--color-pending)' : 'var(--color-failed)'}">${coverage.percent}%</span>
              <span class="kpi-label">Coverage</span>
            </div>
          </div>
        ` : null}
        <div class="kpi-card" onClick=${() => onNavigate('/tests?filter=failed')} title="${totalFailed} failed, compromised, or broken scenarios">
          <div class="kpi-icon-wrap kpi-icon--failed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value" style="color:var(--color-failed)">${totalFailed}</span>
            <span class="kpi-label">Failed Scenarios</span>
          </div>
        </div>
        <div class="kpi-card" onClick=${() => onNavigate('/tests?filter=skipped')} title="${totalSkipped} skipped or pending tests">
          <div class="kpi-icon-wrap kpi-icon--skipped">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value" style="color:var(--text-secondary)">${totalSkipped}</span>
            <span class="kpi-label">Skipped</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-icon--duration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">${formatDuration(summary.duration)}</span>
            <span class="kpi-label">Total Duration</span>
          </div>
        </div>
      </div>

      <!-- Context metadata -->
      <div class="dashboard-meta">
        <span>${summary.totalScenarios} scenarios • ${summary.testRunner}</span>
        ${DATA.systemContext && DATA.systemContext.ci ? (() => { const ci = DATA.systemContext.ci; const repoUrl = ci.repositoryUrl ? ci.repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') : ''; return html`
          ${ci.branch ? html`<span class="dashboard-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>${repoUrl ? html`<a href="${repoUrl}/tree/${ci.branch}" target="_blank" class="meta-link">${ci.branch}</a>` : html`<span>${ci.branch}</span>`}</span>` : null}
          ${ci.commit ? html`<span class="dashboard-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><circle cx="12" cy="12" r="4"/><line x1="1" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="23" y2="12"/></svg>${repoUrl ? html`<a href="${repoUrl}/commit/${ci.commit}" target="_blank" class="meta-link mono">${ci.commit}</a>` : html`<span class="mono">${ci.commit}</span>`}</span>` : null}
        `; })() : null}
      </div>

      <!-- Main grid: Trend (8col) + Health Summary (4col) -->
      <div class="dashboard-main-grid">
        <div class="card dashboard-trend-card">
          <div class="card-header">
            <div class="card-title mb-0">Trend</div>
            <span class="trend-summary">${totalPassed} Passed | ${totalHistoryFailed} Failed | Avg ${formatDuration(summary.duration)}</span>
          </div>
          <${TrendChart} history=${history} onNavigate=${onNavigate} />
        </div>

        <div class="dashboard-health-col">
          <!-- Degraded -->
          <div class="card dashboard-status-card">
            <div class="card-header">
              <span class="status-card-title" style="color:var(--color-failed)">Degraded</span>
              ${newFailures.length > 0 ? html`<a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>` : null}
            </div>
            ${newFailures.length > 0 ? html`
              ${newFailures.map(t => html`
                <div class="status-item status-item--rich clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                  <div class="status-item-main">
                    <span class="status-icon status-icon--fail">✗</span>
                    <span class="status-item-name">${t.name}</span>
                  </div>
                  <div class="status-item-history">${getHistory(t).map(h => html`<span class="history-dot history-dot--${h.outcome}" title=${h.outcome + ' (' + h.run + ')'}></span>`)}</div>
                </div>
              `)}
            ` : html`
              <div class="status-empty status-empty--ok"><span class="status-chip">✓</span> No degraded tests</div>
            `}
          </div>
          <!-- Recovered -->
          <div class="card dashboard-status-card">
            <div class="card-header">
              <span class="status-card-title" style="color:var(--color-passed)">Recovered</span>
              ${newPasses.length > 0 ? html`<a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>` : null}
            </div>
            ${newPasses.length > 0 ? html`
              ${newPasses.map(t => html`
                <div class="status-item status-item--rich clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                  <div class="status-item-main">
                    <span class="status-icon status-icon--pass">✓</span>
                    <span class="status-item-name">${t.name}</span>
                  </div>
                  <div class="status-item-history">${getHistory(t).map(h => html`<span class="history-dot history-dot--${h.outcome}" title=${h.outcome + ' (' + h.run + ')'}></span>`)}</div>
                </div>
              `)}
            ` : html`
              <div class="status-empty"><span class="status-chip">✓</span> No newly recovered tests</div>
            `}
          </div>
          <!-- Slowest Tests -->
          <div class="card dashboard-status-card">
            <div class="card-header">
              <span class="status-card-title" style="color:var(--color-pending)">Slowest Tests</span>
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
          <!-- Unstable -->
          ${flakyTests.length > 0 ? html`
            <div class="card dashboard-status-card">
              <div class="card-header">
                <span class="status-card-title" style="color:var(--color-pending)">Unstable</span>
                <a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>
              </div>
              ${flakyTests.map(t => html`
                <div class="status-item clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                  <span class="status-icon status-icon--warn">⚠</span>
                  <span class="status-item-name">${t.name}</span>
                </div>
              `)}
            </div>
          ` : null}
        </div>
      </div>
    </div>
  `;
}
