/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Chart } from 'chart.js/auto';
import 'chartjs-plugin-zoom';
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
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                },
            },
            plugins: [{
                id: 'centerText',
                afterDraw: (chart) => {
                    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
                    const context = chart.ctx;
                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                    context.save();
                    context.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
                    context.fillStyle = dark ? '#ffffff' : '#3a3541de';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    if (dark) { context.shadowColor = 'rgba(0,0,0,0.5)'; context.shadowBlur = 4; }
                    context.fillText(String(total), centerX, centerY);
                    context.restore();
                },
            }],
        });

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [outcomes, total]);

    useEffect(() => {
        const observer = new MutationObserver(() => { if (chartRef.current) chartRef.current.update(); });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    return html`
    <div style="width:120px;height:120px;flex-shrink:0">
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
    <div style="position:relative;width:100%;height:400px;overflow:hidden">
      <canvas ref=${canvasRef}></canvas>
    </div>
  `;
}

// ===== Dashboard View =====
export function DashboardView({ onNavigate }) {
    const { summary, history, scenarios } = DATA;
    const passRate = ((summary.outcomes.passed / summary.totalScenarios) * 100).toFixed(1);
    const sorted = [...scenarios].sort((a, b) => b.duration - a.duration);
    const slowest = sorted.slice(0, 5);
    const newFailures = useMemo(() => {
        return (DATA.newFailures || []).slice(0, 5);
    }, []);
    const newPasses = useMemo(() => {
        return (DATA.newPasses || []).slice(0, 5);
    }, []);
    const flakyTests = (DATA.unstableTests || []).slice(0, 5);

    return html`
    <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-md);overflow:hidden" class="dashboard-trend-grid">
      <!-- Left column -->
      <div style="display:flex;flex-direction:column;gap:var(--space-md);min-width:0">
        <!-- Row 1: Test Results + Pass Rate / Failed -->
        <div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:var(--space-md)" class="dashboard-stats-grid">
          <div class="flex-col gap-md">
            <div class="card" style="display:flex;flex-direction:column;flex:1">
              <div class="card-title">Test Results</div>
              <div class="donut-chart">
                <${DonutChart} outcomes=${summary.outcomes} total=${summary.totalScenarios} />
                <div class="donut-legend">
                  <div class="legend-item clickable" onClick=${() => onNavigate('/tests?filter=passed')}><span class="legend-dot" style="background:var(--color-passed)"></span> Passed (${summary.outcomes.passed})</div>
                  <div class="legend-item clickable" onClick=${() => onNavigate('/tests?filter=failed')}><span class="legend-dot" style="background:var(--color-failed)"></span> Failed (${(summary.outcomes.failed || 0) + (summary.outcomes.error || 0) + (summary.outcomes.compromised || 0)})</div>
                  <div class="legend-item clickable" onClick=${() => onNavigate('/tests?filter=skipped')}><span class="legend-dot" style="background:var(--color-skipped)"></span> Skipped (${(summary.outcomes.skipped || 0) + (summary.outcomes.pending || 0)})</div>
                </div>
              </div>
              <div style="margin-top:var(--space-md);font-size:var(--font-sm);color:var(--text-secondary)">${summary.totalScenarios} scenarios • ${summary.testRunner}</div>
            </div>
            ${DATA.systemContext && DATA.systemContext.ci ? html`
              <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-md);flex-wrap:wrap">
                ${(() => { const ci = DATA.systemContext.ci; const repoUrl = ci.repositoryUrl ? ci.repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') : ''; return html`
                  ${ci.branch ? html`<div class="flex-row gap-xs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm" style="flex-shrink:0"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>${repoUrl ? html`<a href="${repoUrl}/tree/${ci.branch}" target="_blank" style="font-size:var(--font-sm);font-weight:500;color:inherit;text-decoration:none" onMouseOver=${(e) => e.target.style.textDecoration='underline'} onMouseOut=${(e) => e.target.style.textDecoration='none'}>${ci.branch}</a>` : html`<span style="font-size:var(--font-sm);font-weight:500">${ci.branch}</span>`}</div>` : null}
                  ${ci.commit ? html`<div class="flex-row gap-xs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm" style="flex-shrink:0"><circle cx="12" cy="12" r="4"/><line x1="1" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="23" y2="12"/></svg>${repoUrl ? html`<a href="${repoUrl}/commit/${ci.commit}" target="_blank" style="font-size:var(--font-sm);font-family:var(--font-mono);color:inherit;text-decoration:none" onMouseOver=${(e) => e.target.style.textDecoration='underline'} onMouseOut=${(e) => e.target.style.textDecoration='none'}>${ci.commit}</a>` : html`<span style="font-size:var(--font-sm);font-family:var(--font-mono)">${ci.commit}</span>`}</div>` : null}
                  ${ci.pullRequestUrl ? html`<div class="flex-row gap-xs"><a href="${ci.pullRequestUrl}" target="_blank" style="font-size:var(--font-sm);color:var(--accent);text-decoration:none;display:flex;align-items:center;gap:3px" onMouseOver=${(e) => e.target.style.textDecoration='underline'} onMouseOut=${(e) => e.target.style.textDecoration='none'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm" style="flex-shrink:0"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v12"/><path d="M18 9a9 9 0 0 0-9 9"/></svg>PR #${ci.pullRequestNumber || ''}</a></div>` : null}
                  ${ci.provider ? html`<div style="font-size:var(--font-xs);color:var(--text-secondary);margin-left:auto">${ci.jobUrl ? html`<a href="${ci.jobUrl}" target="_blank" style="color:inherit;text-decoration:none" onMouseOver=${(e) => e.target.style.textDecoration='underline'} onMouseOut=${(e) => e.target.style.textDecoration='none'}>${ci.provider}</a>` : ci.provider}</div>` : null}
                `; })()}
              </div>
            ` : null}
          </div>
          <div class="flex-col gap-md">
            <div class="card" style="flex:1;cursor:pointer" onClick=${() => onNavigate('/tests?filter=non-passing')}>
              <div class="card-title">Pass Rate</div>
              <div class="card-value" style="color:var(--color-passed)">${passRate}%</div>
              <div class="card-subtitle">${summary.outcomes.passed} of ${summary.totalScenarios} passed</div>
              <a class="view-all-link" style="margin-top:var(--space-sm);display:inline-block" onClick=${(e) => { e.stopPropagation(); onNavigate('/requirements'); }}>Requirements</a>
            </div>
            <div class="card" style="flex:1;cursor:pointer" onClick=${() => onNavigate('/tests?filter=failed')}>
              <div class="card-title">Total Failed</div>
              <div class="card-value" style="color:var(--color-failed)">${summary.outcomes.failed + (summary.outcomes.error || 0) + (summary.outcomes.compromised || 0)}</div>
              <div class="card-subtitle">${[summary.outcomes.failed ? summary.outcomes.failed + ' assertion' + (summary.outcomes.failed > 1 ? ' failures' : ' failure') : '', summary.outcomes.error ? summary.outcomes.error + ' error' + (summary.outcomes.error > 1 ? 's' : '') : '', summary.outcomes.compromised ? summary.outcomes.compromised + ' compromised' : ''].filter(Boolean).join(', ') || 'No failures'}</div>
            </div>
          </div>
        </div>
        <!-- Row 2: Trend chart -->
        <div class="card" style="overflow:hidden">
          <div class="card-title">Trend (Last ${history.length} runs)</div>
          <${TrendChart} history=${history} onNavigate=${onNavigate} />
        </div>
      </div>

      <!-- Right column: Degraded / Recovered / Most Unstable / Slowest Tests -->
      <div style="display:flex;flex-direction:column;gap:var(--space-md);min-width:0;overflow:hidden">
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="margin-bottom:0;color:var(--color-failed)">Degraded</div>
            ${newFailures.length > 0 ? html`
              <a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>
            ` : null}
          </div>
          ${newFailures.length > 0 ? html`
            ${newFailures.map(t => html`
              <div class="slowest-item clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                <span style="font-size:var(--font-sm);color:var(--color-failed)">✗</span>
                <span class="slowest-name">${t.name}</span>
              </div>
            `)}
            <div style="font-size:var(--font-xs);color:var(--text-secondary);margin-top:var(--space-sm)">Was passing, now failing</div>
          ` : html`
            <div style="padding:var(--space-md) 0;text-align:center;color:var(--color-passed)">
              <div style="font-size:var(--font-lg);margin-bottom:var(--space-xs)">✓</div>
              <div style="font-size:var(--font-md)">Well done! No degraded tests</div>
            </div>
          `}
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="margin-bottom:0;color:var(--color-passed)">Recovered</div>
            ${newPasses.length > 0 ? html`
              <a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>
            ` : null}
          </div>
          ${newPasses.length > 0 ? html`
            ${newPasses.map(t => html`
              <div class="slowest-item clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                <span style="font-size:var(--font-sm);color:var(--color-passed)">✓</span>
                <span class="slowest-name">${t.name}</span>
              </div>
            `)}
            <div style="font-size:var(--font-xs);color:var(--text-secondary);margin-top:var(--space-sm)">Was failing, now passing</div>
          ` : html`
            <div style="padding:var(--space-md) 0;text-align:center;color:var(--text-secondary)">
              <div style="font-size:var(--font-md)">No newly recovered tests</div>
            </div>
          `}
        </div>
        ${flakyTests.length > 0 ? html`
          <div class="card">
            <div class="card-header">
              <div class="card-title mb-0">Most Unstable</div>
              <a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>
            </div>
            ${flakyTests.map(t => html`
              <div class="slowest-item clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                <span style="font-size:var(--font-sm);font-weight:600;color:var(--color-pending);width:36px" title="Failure ratio: ${Math.round(t.flakinessRate * 100)}%">${Math.round(t.flakinessRate * 100)}%</span>
                <span class="slowest-name">${t.name}</span>
              </div>
            `)}
          </div>
        ` : null}
        <div class="card" style="flex:1">
          <div class="card-header">
            <div class="card-title mb-0">Slowest Tests</div>
            <a class="view-all-link" onClick=${() => onNavigate('/tests?sort=duration')}>View all →</a>
          </div>
          ${slowest.map((s, i) => html`
            <div class="slowest-item clickable" onClick=${() => onNavigate(scenarioUrl(s))}>
              <span class="slowest-rank">#${i + 1}</span>
              <span class="slowest-name">${s.name}</span>
              <span class="slowest-dur">${formatDuration(s.duration)}</span>
            </div>
          `)}
        </div>
      </div>
    </div>
  `;
}
