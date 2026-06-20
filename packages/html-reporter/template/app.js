    import { h, render, Component } from 'preact';
    import { useState, useEffect, useMemo, useCallback, useRef } from 'preact/hooks';
    import htm from 'htm';
    import { observeElementRect, observeElementOffset, elementScroll, Virtualizer, defaultRangeExtractor } from '@tanstack/virtual-core';

    const html = htm.bind(h);

    // ===== Utilities =====
    const DATA = window.__SERENITY_REPORT_DATA__;

    function RawHtml({ content, ...props }) {
      return h('div', { ...props, dangerouslySetInnerHTML: { __html: content } });
    }

    function formatDuration(ms) {
      if (ms === 0) return '—';
      if (ms < 1000) return ms + 'ms';
      if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
      const mins = Math.floor(ms / 60000);
      const secs = Math.round((ms % 60000) / 1000);
      return mins + 'm ' + secs + 's';
    }

    function outcomeClass(outcome) {
      const map = { SUCCESS: 'passed', FAILURE: 'failed', PENDING: 'pending', SKIPPED: 'skipped', COMPROMISED: 'compromised', ERROR: 'error' };
      return map[outcome] || 'skipped';
    }

    function outcomeIcon(outcome) {
      const map = { SUCCESS: '✓', FAILURE: '✗', PENDING: '–', SKIPPED: '⊘', COMPROMISED: '⚠', ERROR: '!' };
      return map[outcome] || '?';
    }

    function getBrowserTag(scenario) {
      const tag = scenario.tags.find(t => t.type === 'browser');
      return tag ? tag.name : null;
    }

    function relativeSourcePath(scenario) {
      const p = scenario.source.path;
      const specDir = DATA.requirements ? DATA.requirements.name : 'spec';
      const marker = '/' + specDir + '/';
      const idx = p.indexOf(marker);
      return (idx !== -1 ? p.slice(idx + marker.length) : p) + ':' + scenario.source.line;
    }

    function scenarioUrl(scenario, run) {
      const base = '/tests/' + encodeURIComponent(scenario.source.path + ':' + scenario.source.line);
      return run !== undefined && run !== null ? base + '?run=' + run : base;
    }

    /**
     * Search matching logic:
     * - Quoted strings ("exact phrase") match as an exact substring
     * - Unquoted words match individually — ALL words must appear somewhere in the name or category
     * - Matching is case-insensitive
     *
     * Examples:
     * - "Reports Passing Scenarios" → exact match only
     * - Reports Scenarios → matches anything containing BOTH "reports" AND "scenarios"
     * - Reports "Passing Scenarios" → matches "reports" AND exact "Passing Scenarios"
     */
    function matchesSearch(scenario, query) {
      const tagNames = (scenario.tags || []).map(t => t.name).join(' ');
      const sourcePath = scenario.source?.path || '';
      const text = (scenario.name + ' ' + scenario.category + ' ' + tagNames + ' ' + sourcePath).toLowerCase();
      const tokens = parseSearchTokens(query.toLowerCase());
      return tokens.every(token => text.includes(token));
    }

    function parseSearchTokens(query) {
      const tokens = [];
      const regex = /"([^"]+)"|(\S+)/g;
      let match;
      while ((match = regex.exec(query)) !== null) {
        const token = match[1] || match[2].replace(/"/g, '');
        if (token) tokens.push(token);
      }
      return tokens;
    }

    // ===== Toast Notification =====
    function showToast(message) {
      const existing = document.getElementById('serenity-toast');
      if (existing) existing.remove();
      const el = document.createElement('div');
      el.id = 'serenity-toast';
      el.textContent = message;
      el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text-primary);color:var(--bg-surface);padding:8px 16px;border-radius:6px;font-size:13px;z-index:9999;opacity:0;transition:opacity 0.2s;pointer-events:none';
      document.body.appendChild(el);
      requestAnimationFrame(() => { el.style.opacity = '1'; });
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 200); }, 2000);
    }

    // ===== Virtual Scroll Hook (wraps @tanstack/virtual-core for Preact) =====
    function useVirtualizer(options) {
      const [, rerender] = useState(0);
      const resolvedOptions = {
        ...options,
        observeElementRect,
        observeElementOffset,
        scrollToFn: elementScroll,
        onChange: () => {
          rerender(c => c + 1);
        },
      };

      const instanceRef = useRef(null);
      if (!instanceRef.current) {
        instanceRef.current = new Virtualizer(resolvedOptions);
      }
      instanceRef.current.setOptions(resolvedOptions);

      useEffect(() => {
        return instanceRef.current._didMount();
      }, []);

      useEffect(() => {
        return instanceRef.current._willUpdate();
      });

      return instanceRef.current;
    }

    // ===== Theme Management =====
    function initTheme() {
      const stored = localStorage.getItem('serenity-theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // ===== Router =====
    function getRoute() {
      const hash = window.location.hash || '#/';
      return hash.slice(1);
    }

    // ===== Icons (inline SVG) =====
    const icons = {
      dashboard: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
      testScenarios: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6m-6 4h4"/></svg>`,
      tags: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      errors: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>`,
      flaky: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      coverage: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
      timeline: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      testRuns: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/><circle cx="12" cy="12" r="1"/></svg>`,

      system: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      sun: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
      moon: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
      menu: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
      chevron: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
    };

    // ===== Sidebar Component =====
    function Sidebar({ route, sidebarOpen, collapsed, onNavigate, onClose, onToggleCollapse }) {
      const navItems = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/tests', label: 'Test Scenarios', icon: 'testScenarios', badge: DATA.summary.outcomes.failed + (DATA.summary.outcomes.error || 0) + (DATA.summary.outcomes.compromised || 0) },
        { path: '/requirements', label: 'Requirements', icon: 'coverage' },
        { path: '/errors', label: 'Errors', icon: 'errors' },
        { path: '/stability', label: 'Stability', icon: 'flaky' },
        { path: '/timeline', label: 'Timeline', icon: 'timeline' },
        { path: '/tags', label: 'Tags', icon: 'tags' },
        { path: '/test-runs', label: 'Test Runs', icon: 'testRuns' },
        { path: '/system', label: 'System Context', icon: 'system' },
      ];

      const isActive = (path) => {
        if (path === '/') return route === '/' || route === '';
        return route.startsWith(path);
      };

      return html`
        <aside class="sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}">
          <div class="sidebar-brand" style="cursor:pointer" onClick=${() => { onNavigate('/'); onClose(); }}>
            <svg class="brand-full" viewBox="0 0 1103 244" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"><g transform="translate(295.633,110.998)"><path d="M0,47.128L22.342,47.128C23.913,59.695 28.975,70.168 50.095,70.168C63.884,70.168 73.658,62.488 73.658,50.968C73.658,39.448 67.898,35.084 47.651,31.768C17.804,27.753 3.666,18.677 3.666,-4.712C3.666,-25.134 21.12,-40.494 47.127,-40.494C74.008,-40.494 90.065,-28.275 92.509,-4.363L71.215,-4.363C68.945,-17.454 61.44,-23.039 47.127,-23.039C32.989,-23.039 25.658,-16.232 25.658,-6.632C25.658,3.491 29.848,8.554 51.491,11.695C80.814,15.71 96,24.088 96,49.048C96,70.691 77.673,87.622 50.095,87.622C16.059,87.622 1.745,70.691 0,47.128" style="fill:rgb(255,210,0);fill-rule:nonzero"/></g><g transform="translate(472.968,160.569)"><path d="M0,-18.85C-1.048,-34.559 -9.077,-41.541 -22.168,-41.541C-34.909,-41.541 -43.462,-32.989 -45.557,-18.85L0,-18.85ZM-67.55,-8.377L-67.55,-9.774C-67.55,-38.05 -48.175,-56.901 -22.168,-56.901C0.523,-56.901 20.945,-43.461 20.945,-10.821L20.945,-4.712L-45.906,-4.712C-45.208,12.568 -36.48,22.342 -20.771,22.342C-8.029,22.342 -1.396,17.281 0.174,8.379L20.596,8.379C17.629,27.579 2.094,38.051 -21.295,38.051C-48.175,38.051 -67.55,20.422 -67.55,-8.377" style="fill:rgb(253,211,10);fill-rule:nonzero"/></g><g transform="translate(513.981,195.304)"><path d="M0,-89.716L14.487,-89.716L14.487,-73.309C20.248,-83.607 28.103,-90.763 44.51,-91.287L44.51,-77.672C26.183,-76.8 14.487,-71.039 14.487,-48.524L14.487,1.571L0,1.571L0,-89.716Z" style="fill:white;fill-rule:nonzero"/></g><g transform="translate(638.254,160.046)"><path d="M0,-17.629C-1.396,-36.48 -11.171,-43.985 -26.182,-43.985C-41.018,-43.985 -50.967,-33.861 -53.411,-17.629L0,-17.629ZM-68.945,-7.855L-68.945,-9.251C-68.945,-36.829 -51.316,-56.029 -26.182,-56.029C-5.062,-56.029 14.837,-43.287 14.837,-10.648L14.837,-5.935L-53.935,-5.935C-53.236,14.836 -43.287,26.356 -24.61,26.356C-10.473,26.356 -2.269,21.12 -0.349,10.473L14.139,10.473C10.996,28.8 -4.189,38.4 -24.785,38.4C-50.618,38.4 -68.945,20.247 -68.945,-7.855" style="fill:white;fill-rule:nonzero"/></g><g transform="translate(674.382,195.304)"><path d="M0,-89.716L14.487,-89.716L14.487,-75.229C18.676,-83.781 28.8,-91.287 43.811,-91.287C62.661,-91.287 75.927,-80.988 75.927,-54.458L75.927,1.571L61.439,1.571L61.439,-55.505C61.439,-71.564 54.633,-78.72 39.971,-78.72C26.53,-78.72 14.487,-70.167 14.487,-53.76L14.487,1.571L0,1.571L0,-89.716Z" style="fill:white;fill-rule:nonzero"/></g><g transform="translate(-85.035,-230.002)"><path d="M858.267,335.59L872.754,335.59L872.754,426.877L858.267,426.877L858.267,335.59ZM855.649,306.964C855.649,301.727 860.013,297.364 865.25,297.364C870.486,297.364 874.849,301.727 874.849,306.964C874.849,312.201 870.486,316.564 865.25,316.564C860.013,316.564 855.649,312.201 855.649,306.964" style="fill:white;fill-rule:nonzero"/></g><g transform="translate(819.66,108.905)"><path d="M0,65.105L0,8.901L-13.091,8.901L-13.091,-3.317L0,-3.317L0,-24.087L14.487,-24.087L14.487,-3.317L35.781,-3.317L35.781,8.901L14.487,8.901L14.487,63.709C14.487,72.61 18.502,76.974 25.833,76.974C30.371,76.974 33.861,76.276 37.004,75.054L37.004,87.272C34.036,88.319 30.545,89.192 24.61,89.192C8.029,89.192 0,79.418 0,65.105" style="fill:white;fill-rule:nonzero"/></g><g transform="translate(903.089,146.781)"><path d="M0,40.668L-35.782,-41.193L-20.247,-41.193L7.68,24.261L32.989,-41.193L47.825,-41.193L-2.618,81.861L-17.28,81.861L0,40.668Z" style="fill:white;fill-rule:nonzero"/></g><g transform="matrix(1.433,0,0,1.433,986.565,190.288)"><path d="M0,-69.537L7.752,-69.537L-14.976,0L-22.651,0L0,-69.537Z" style="fill:rgb(253,211,10);fill-rule:nonzero"/></g><g transform="matrix(1.433,0,0,1.433,995.297,99.491)"><path d="M0,51.326L0,43.5C1.882,44.252 3.763,44.853 6.924,44.853C11.815,44.853 14.977,42.295 14.977,35.672L14.977,-1.58L25.061,-1.58L25.061,35.898C25.061,47.562 18.363,52.906 8.429,52.906C3.989,52.906 1.731,52.228 0,51.326" style="fill:rgb(253,211,10);fill-rule:nonzero"/></g><g transform="matrix(1.433,0,0,1.433,1042.74,121.278)"><path d="M0,20.316L9.633,20.316C10.311,25.736 12.493,30.25 21.599,30.25C27.544,30.25 31.759,26.939 31.759,21.972C31.759,17.005 29.275,15.125 20.545,13.695C7.677,11.962 1.581,8.05 1.581,-2.034C1.581,-10.84 9.106,-17.461 20.319,-17.461C31.909,-17.461 38.833,-12.194 39.886,-1.883L30.705,-1.883C29.727,-7.528 26.49,-9.936 20.319,-9.936C14.224,-9.936 11.063,-7.002 11.063,-2.862C11.063,1.504 12.869,3.685 22.201,5.039C34.844,6.771 41.392,10.382 41.392,21.144C41.392,30.476 33.489,37.777 21.599,37.777C6.924,37.777 0.753,30.476 0,20.316" style="fill:rgb(253,211,10);fill-rule:nonzero"/></g><g transform="translate(231.034,174.238)"><path d="M0,-105.012L-67.217,-37.795L-20.276,-37.795C-27.321,4.986 -64.557,37.726 -109.302,37.726C-140.698,37.726 -168.388,21.599 -184.557,-2.797L-206.843,19.49C-184.762,49.356 -149.296,68.726 -109.302,68.726C-42.347,68.726 11.93,14.449 11.93,-52.506C11.93,-71.316 7.646,-89.125 0,-105.012M-198.328,-67.216C-191.283,-109.998 -154.047,-142.738 -109.302,-142.738C-77.906,-142.738 -50.216,-126.611 -34.047,-102.215L-11.761,-124.501C-33.842,-154.368 -69.308,-173.738 -109.302,-173.738C-176.257,-173.738 -230.534,-119.46 -230.534,-52.506C-230.534,-33.695 -226.25,-15.886 -218.604,0L-151.387,-67.216L-198.328,-67.216Z" style="fill:white;fill-rule:nonzero"/></g><g transform="matrix(0,-1,-1,0,121.732,90.328)"><path d="M-31.404,-31.404C-48.749,-31.404 -62.808,-17.344 -62.808,0C-62.808,17.344 -48.749,31.404 -31.404,31.404C-14.06,31.404 0,17.344 0,0C0,-17.344 -14.06,-31.404 -31.404,-31.404" style="fill:rgb(253,211,10);fill-rule:nonzero"/></g></svg>
            <svg class="brand-icon" viewBox="0 0 244 244" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px;fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2">
              <g transform="matrix(0,-0.887622,-0.887622,0,121.732,93.8568)"><path d="M-31.404,-31.404C-48.749,-31.404 -62.808,-17.344 -62.808,0C-62.808,17.344 -48.749,31.404 -31.404,31.404C-14.06,31.404 0,17.344 0,0C0,-17.344 -14.06,-31.404 -31.404,-31.404" style="fill:rgb(253,211,10);fill-rule:nonzero"/></g>
              <g transform="matrix(0.887622,0,0,0.887622,218.751,168.337)"><path d="M0,-105.012L-67.217,-37.795L-20.276,-37.795C-27.321,4.986 -64.557,37.726 -109.302,37.726C-140.698,37.726 -168.388,21.599 -184.557,-2.797L-206.843,19.49C-184.762,49.356 -149.296,68.726 -109.302,68.726C-42.347,68.726 11.93,14.449 11.93,-52.506C11.93,-71.316 7.646,-89.125 0,-105.012M-198.328,-67.216C-191.283,-109.998 -154.047,-142.738 -109.302,-142.738C-77.906,-142.738 -50.216,-126.611 -34.047,-102.215L-11.761,-124.501C-33.842,-154.368 -69.308,-173.738 -109.302,-173.738C-176.257,-173.738 -230.534,-119.46 -230.534,-52.506C-230.534,-33.695 -226.25,-15.886 -218.604,0L-151.387,-67.216L-198.328,-67.216Z" style="fill:white;fill-rule:nonzero"/></g>
            </svg>
          </div>
          <nav class="sidebar-nav">
            <div class="nav-section-label">Report</div>
            ${navItems.map(item => html`
              <div class="nav-item ${isActive(item.path) ? 'active' : ''}"
                   title=${item.label}
                   onClick=${() => { onNavigate(item.path); onClose(); }}>
                ${icons[item.icon]}
                <span>${item.label}</span>
                ${item.badge > 0 ? html`<span class="nav-badge">${item.badge}</span>` : null}
              </div>
            `)}
            <a href="https://serenity-js.org" target="_blank" rel="noopener" class="nav-item" title="This report was generated by Serenity/JS — learn more at serenity-js.org" style="color:var(--text-sidebar);text-decoration:none;margin-top:var(--space-sm);border-top:1px solid rgba(255,255,255,0.08);padding-top:var(--space-md)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;flex-shrink:0"><path d="M9 18h6m-5 2h4M12 2a7 7 0 014 12.7V17a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2.3A7 7 0 0112 2z"/></svg>
              <span>Learn Serenity/JS</span>
            </a>
          </nav>
          <button class="sidebar-collapse-btn" onClick=${onToggleCollapse} title=${collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;flex-shrink:0;transform:${collapsed ? 'rotate(180deg)' : 'none'};transition:transform 0.2s"><polyline points="15 18 9 12 15 6"/></svg>
            <span>Collapse</span>
          </button>
        </aside>
      `;
    }

    // ===== Dashboard View =====
    function DashboardView({ onNavigate }) {
      const { summary, history, scenarios } = DATA;
      const passRate = ((summary.outcomes.passed / summary.totalScenarios) * 100).toFixed(1);
      const sorted = [...scenarios].sort((a, b) => b.duration - a.duration);
      const slowest = sorted.slice(0, 5);
      const newFailures = useMemo(() => {
        if (DATA.history.length < 2) return [];
        return DATA.scenarios.filter(s => {
          if (!s.executionHistory || s.executionHistory.length < 2) return false;
          const prev = s.executionHistory[s.executionHistory.length - 2];
          const curr = s.executionHistory[s.executionHistory.length - 1];
          return prev && curr && prev.outcome === 'SUCCESS' && curr.outcome !== 'SUCCESS';
        }).slice(0, 5);
      }, []);
      const newPasses = useMemo(() => {
        if (DATA.history.length < 2) return [];
        return DATA.scenarios.filter(s => {
          if (!s.executionHistory || s.executionHistory.length < 2) return false;
          const prev = s.executionHistory[s.executionHistory.length - 2];
          const curr = s.executionHistory[s.executionHistory.length - 1];
          return prev && curr && prev.outcome !== 'SUCCESS' && curr.outcome === 'SUCCESS';
        }).slice(0, 5);
      }, []);
      const flakyTests = (DATA.flakyTests || []).slice(0, 5);

      return html`
        <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-md);overflow:hidden" class="dashboard-trend-grid">
          <!-- Left column -->
          <div style="display:flex;flex-direction:column;gap:var(--space-md);min-width:0">
            <!-- Row 1: Test Results + Pass Rate / Failed -->
            <div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:var(--space-md)" class="dashboard-stats-grid">
              <div class="card" style="display:flex;flex-direction:column">
                <div class="card-title">Test Results</div>
                <div class="donut-chart">
                  <${DonutChart} outcomes=${summary.outcomes} total=${summary.totalScenarios} />
                  <div class="donut-legend">
                    <div class="legend-item" style="cursor:pointer" onClick=${() => onNavigate('/tests?filter=passed')}><span class="legend-dot" style="background:var(--color-passed)"></span> Passed (${summary.outcomes.passed})</div>
                    <div class="legend-item" style="cursor:pointer" onClick=${() => onNavigate('/tests?filter=failed')}><span class="legend-dot" style="background:var(--color-failed)"></span> Failed (${(summary.outcomes.failed || 0) + (summary.outcomes.error || 0) + (summary.outcomes.compromised || 0)})</div>
                    <div class="legend-item" style="cursor:pointer" onClick=${() => onNavigate('/tests?filter=skipped')}><span class="legend-dot" style="background:var(--color-skipped)"></span> Skipped (${(summary.outcomes.skipped || 0) + (summary.outcomes.pending || 0)})</div>
                  </div>
                </div>
                <div style="margin-top:var(--space-md);font-size:var(--font-sm);color:var(--text-secondary)">${summary.totalScenarios} scenarios • ${summary.testRunner}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:var(--space-md)">
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
            <!-- Branch and commit info -->
            ${DATA.systemContext && DATA.systemContext.ci ? html`
              <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-md);flex-wrap:wrap">
                ${DATA.systemContext.ci.branch ? html`<div style="display:flex;align-items:center;gap:var(--space-xs)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg><span style="font-size:var(--font-sm);font-weight:500">${DATA.systemContext.ci.branch}</span></div>` : null}
                ${DATA.systemContext.ci.commit ? html`<div style="display:flex;align-items:center;gap:var(--space-xs)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0"><circle cx="12" cy="12" r="4"/><line x1="1" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="23" y2="12"/></svg><span style="font-size:var(--font-sm);font-family:var(--font-mono)">${DATA.systemContext.ci.commit}</span></div>` : null}
                ${DATA.systemContext.ci.provider ? html`<div style="font-size:var(--font-xs);color:var(--text-secondary);margin-left:auto">${DATA.systemContext.ci.provider}</div>` : null}
              </div>
            ` : null}
            <!-- Row 2: Trend chart -->
            <div class="card" style="overflow:hidden">
              <div class="card-title">Trend (Last ${history.length} runs)</div>
              <${TrendChart} history=${history} onNavigate=${onNavigate} />
            </div>
          </div>

          <!-- Right column: Degraded / Recovered / Most Unstable / Slowest Tests -->
          <div style="display:flex;flex-direction:column;gap:var(--space-md);min-width:0;overflow:hidden">
            <div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
                <div class="card-title" style="margin-bottom:0;color:var(--color-failed)">Degraded</div>
                ${newFailures.length > 0 ? html`
                  <a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>
                ` : null}
              </div>
              ${newFailures.length > 0 ? html`
                ${newFailures.map(t => html`
                  <div class="slowest-item" onClick=${() => onNavigate(scenarioUrl(t))} style="cursor:pointer">
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
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
                <div class="card-title" style="margin-bottom:0;color:var(--color-passed)">Recovered</div>
                ${newPasses.length > 0 ? html`
                  <a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>
                ` : null}
              </div>
              ${newPasses.length > 0 ? html`
                ${newPasses.map(t => html`
                  <div class="slowest-item" onClick=${() => onNavigate(scenarioUrl(t))} style="cursor:pointer">
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
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
                  <div class="card-title" style="margin-bottom:0">Most Unstable</div>
                  <a class="view-all-link" onClick=${() => onNavigate('/stability')}>View all →</a>
                </div>
                ${flakyTests.map(t => html`
                  <div class="slowest-item" onClick=${() => onNavigate(scenarioUrl(t))} style="cursor:pointer">
                    <span style="font-size:var(--font-sm);font-weight:600;color:var(--color-pending);width:36px" title="Failure ratio: ${Math.round(t.flakinessRate * 100)}%">${Math.round(t.flakinessRate * 100)}%</span>
                    <span class="slowest-name">${t.name}</span>
                  </div>
                `)}
              </div>
            ` : null}
            <div class="card" style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
                <div class="card-title" style="margin-bottom:0">Slowest Tests</div>
                <a class="view-all-link" onClick=${() => onNavigate('/tests?sort=duration')}>View all →</a>
              </div>
              ${slowest.map((s, i) => html`
                <div class="slowest-item" onClick=${() => onNavigate(scenarioUrl(s))} style="cursor:pointer">
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

    // ===== Filter Bar =====
    function FilterBar({ outcomes, total, activeFilter, onFilter, sortOptions, activeSort, onSort }) {
      const filters = [
        { key: 'all', label: 'All', count: total },
        { key: 'passed', label: 'Passed', count: outcomes.passed },
        { key: 'failed', label: 'Failed', count: (outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0) },
        { key: 'skipped', label: 'Skipped', count: (outcomes.skipped || 0) + (outcomes.pending || 0) },
      ];

      return html`
        <div class="filter-bar" role="group" aria-label="Filter tests by outcome" style="align-items:center">
          <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;align-self:center">Status:</span>
          ${filters.map(f => html`
            <button class="filter-chip ${f.key} ${(activeFilter || 'all') === f.key ? 'active' : ''}"
                    onClick=${() => onFilter && onFilter(f.key)}
                    aria-pressed=${(activeFilter || 'all') === f.key}>
              <span>${f.label}</span>
              <span class="count">${f.count}</span>
            </button>
          `)}
          ${sortOptions ? html`
            <div class="sort-group">
              <label style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px" for="sort-select">Sort:</label>
              <select id="sort-select" class="sort-select" value=${activeSort} onChange=${(e) => onSort(e.target.value)} aria-label="Sort order">
                ${sortOptions.map(s => html`<option value=${s.key} selected=${activeSort === s.key}>${s.label}</option>`)}
              </select>
            </div>
          ` : null}
        </div>
      `;
    }

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
              const ctx = chart.ctx;
              const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
              const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
              ctx.save();
              ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
              ctx.fillStyle = dark ? '#ffffff' : '#3a3541de';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              if (dark) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4; }
              ctx.fillText(String(total), centerX, centerY);
              ctx.restore();
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
    function TrendChart({ history, onNavigate }) {
      const canvasRef = useRef(null);
      const chartRef = useRef(null);
      const [chartTheme, setChartTheme] = useState(() => localStorage.getItem('serenity-theme') || 'light');

      // Watch for theme changes
      useEffect(() => {
        const observer = new MutationObserver(() => {
          const t = document.documentElement.getAttribute('data-theme') || 'light';
          setChartTheme(t);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Watch for resize to adjust visible range
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

        chartRef.current = new Chart(canvasRef.current, {
          type: 'bar',
          data: {
            labels: history.map(h => h.label.replace('build ', '')),
            datasets: [
              {
                type: 'bar',
                label: 'Passed',
                data: history.map(h => h.outcomes.passed),
                backgroundColor: '#28c76f',
                stack: 'outcomes',
                yAxisID: 'y',
                order: 2,
              },
              {
                type: 'bar',
                label: 'Failed',
                data: history.map(h => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0)),
                backgroundColor: '#ea5455',
                stack: 'outcomes',
                yAxisID: 'y',
                order: 2,
              },
              {
                type: 'bar',
                label: 'Skipped',
                data: history.map(h => (h.outcomes.skipped || 0) + (h.outcomes.pending || 0)),
                backgroundColor: '#a8aaae',
                stack: 'outcomes',
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
                backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                borderColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                borderWidth: 1,
                borderSkipped: false,
                barPercentage: 0.05,
                categoryPercentage: 1,
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
                pointStyle: 'rectRot',
                pointRadius: 4,
                pointHoverRadius: 6,
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
            onClick: (evt, elements) => {
              if (elements.length > 0) {
                const idx = elements[0].index;
                onNavigate && onNavigate('/tests?run=' + idx);
              }
            },
            plugins: {
              legend: { display: true, position: 'bottom', labels: { color: textColor, usePointStyle: true, padding: 16 } },
              tooltip: {
                usePointStyle: false,
                callbacks: {
                  title: (items) => {
                    const idx = items[0].dataIndex;
                    const run = history[idx];
                    return run.label + ' — ' + new Date(run.timestamp).toLocaleDateString();
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
              y1: { type: 'logarithmic', position: 'right', ticks: { color: textColor, callback: (v) => formatDuration(v), maxTicksLimit: 6 }, grid: { drawOnChartArea: true, color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderDash: [3, 3] }, title: { display: false } },
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

    // ===== Virtualized Scenario List Component =====
    function VirtualScenarioList({ filtered, grouped, sort, onNavigate, runIndex, setSearch }) {
      const parentRef = useRef(null);
      const SCENARIO_ROW_HEIGHT = 108;
      const GROUP_HEADER_HEIGHT_FIRST = 62;  // 46px content + 16px gap below
      const GROUP_HEADER_HEIGHT_REST = 78;   // 16px gap above + 46px content + 16px gap below
      const GROUP_HEADER_CONTENT_HEIGHT = 46;

      // Flatten grouped data into a single list of items for virtualization
      const flatItems = useMemo(() => {
        if (sort === 'category') {
          const items = [];
          for (const [category, scenarios] of Object.entries(grouped)) {
            items.push({ type: 'header', category });
            for (const scenario of scenarios) {
              items.push({ type: 'scenario', scenario });
            }
          }
          return items;
        }
        return filtered.map(scenario => ({ type: 'scenario', scenario }));
      }, [sort, filtered, grouped]);

      // Build a set of header indices for sticky behavior
      const headerIndices = useMemo(() => {
        const indices = [];
        flatItems.forEach((item, i) => {
          if (item.type === 'header') indices.push(i);
        });
        return indices;
      }, [flatItems]);

      // Find the active sticky header: the last header whose index is <= first visible item
      const activeStickyRef = useRef(-1);

      const rangeExtractor = useCallback((range) => {
        if (sort !== 'category' || headerIndices.length === 0) {
          activeStickyRef.current = -1;
          return defaultRangeExtractor(range);
        }
        // Find the header that should be sticky (last header before or at range.startIndex)
        let activeStickyIndex = headerIndices[0];
        for (const idx of headerIndices) {
          if (idx > range.startIndex) break;
          activeStickyIndex = idx;
        }
        activeStickyRef.current = activeStickyIndex;

        const defaultRange = defaultRangeExtractor(range);
        // Ensure sticky header is always in the rendered set
        if (!defaultRange.includes(activeStickyIndex)) {
          return [activeStickyIndex, ...defaultRange];
        }
        return defaultRange;
      }, [sort, headerIndices]);

      const virtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => flatItems[index].type === 'header' ? (index === 0 ? GROUP_HEADER_HEIGHT_FIRST : GROUP_HEADER_HEIGHT_REST) : SCENARIO_ROW_HEIGHT,
        overscan: 15,
        rangeExtractor,
      });

      // Sticky header: rendered imperatively on scroll via DOM manipulation
      // (Preact's VDOM diffing drops sibling elements before the virtualizer container)

      // Create sticky header element once
      const stickyElRef = useRef(null);
      if (!stickyElRef.current) {
        stickyElRef.current = document.createElement('div');
        stickyElRef.current.id = 'vs-sticky-header';
        stickyElRef.current.className = 'scenario-group-header';
        stickyElRef.current.style.cssText = 'display:none;position:sticky;top:0;width:100%;height:46px;flex-shrink:0;z-index:3;background:var(--bg-surface);box-shadow:0 1px 0 var(--border-color);margin-bottom:-46px;padding:var(--space-md) var(--space-md) var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px';
      }

      // Use a ref callback to re-insert the sticky element after every Preact commit
      const parentRefCallback = useCallback((node) => {
        parentRef.current = node;
        if (node && sort === 'category') {
          const stickyEl = stickyElRef.current;
          if (stickyEl.parentNode !== node) {
            node.insertBefore(stickyEl, node.firstChild);
          }
        }
      }, [sort]);

      // Scroll handler to show/hide and update sticky header content
      useEffect(() => {
        const el = parentRef.current;
        const stickyEl = stickyElRef.current;
        if (!el || sort !== 'category') {
          stickyEl.style.display = 'none';
          return;
        }
        let currentCategory = '';

        // Precompute header start positions for O(1) lookup during scroll
        const headerStarts = [];
        let pos = 0;
        for (let i = 0; i < flatItems.length; i++) {
          if (flatItems[i].type === 'header') {
            headerStarts.push({ index: i, start: pos, category: flatItems[i].category });
          }
          const headerHeight = i === 0 ? GROUP_HEADER_HEIGHT_FIRST : GROUP_HEADER_HEIGHT_REST;
          pos += flatItems[i].type === 'header' ? headerHeight : SCENARIO_ROW_HEIGHT;
        }

        const onScroll = () => {
          const scrollTop = el.scrollTop;
          // Find active header: last header whose start is <= scrollTop
          let activeHeader = null;
          for (const h of headerStarts) {
            if (h.start <= scrollTop) activeHeader = h;
            else break;
          }
          const activeHeaderHeight = activeHeader && activeHeader.index === 0 ? GROUP_HEADER_HEIGHT_FIRST : GROUP_HEADER_HEIGHT_REST;
          if (!activeHeader || scrollTop <= activeHeader.start + activeHeaderHeight) {
            stickyEl.style.display = 'none';
            return;
          }
          stickyEl.style.display = 'block';
          if (currentCategory !== activeHeader.category) {
            currentCategory = activeHeader.category;
            stickyEl.textContent = activeHeader.category.replace(/ › /g, '  ›  ');
          }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => el.removeEventListener('scroll', onScroll);
      }, [sort, flatItems]);

      return html`
        <div ref=${parentRefCallback} style="max-height:calc(100vh - 380px);overflow-y:auto;position:relative">
          <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
            ${virtualizer.getVirtualItems().map(virtualRow => {
              const item = flatItems[virtualRow.index];
              if (item.type === 'header') {
                const segments = item.category.split(' › ');
                const topOffset = virtualRow.index === 0 ? 0 : 16;
                return html`
                  <div style="position:absolute;top:0;left:0;width:100%;height:${GROUP_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1"
                       class="scenario-group-header">
                    ${segments.map((segment, idx) => html`
                      <span style="cursor:pointer" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${idx < segments.length - 1 ? html`<span style="margin:0 4px;text-decoration:none;cursor:default"> › </span>` : null}
                    `)}
                  </div>
                `;
              }
              const scenario = item.scenario;
              const clickHandler = () => onNavigate(scenarioUrl(scenario, runIndex));
              const stopProp = (e) => e.stopPropagation();
              return html`
                <div style="position:absolute;top:0;left:0;width:100%;height:${SCENARIO_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden"
                     class="scenario-item" onClick=${clickHandler}>
                  <div class="scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
                    ${outcomeIcon(scenario.outcome)}
                  </div>
                  <div class="scenario-info">
                    <div class="scenario-name">${scenario.name}</div>
                    <div class="scenario-tags">
                      ${getBrowserTag(scenario) ? html`<a href=${'#/tests?search=' + encodeURIComponent('"' + getBrowserTag(scenario) + '"')} class="badge badge-${getBrowserTag(scenario)}" style="text-decoration:none;cursor:pointer" onClick=${stopProp}>${getBrowserTag(scenario)}</a>` : null}
                      ${scenario.retries > 0 ? html`<span class="retries-badge">${scenario.retries + 1} ${(scenario.retries + 1) === 1 ? 'attempt' : 'attempts'}</span>` : null}
                      ${[...new Map((scenario.tags || []).filter(t => t.type !== 'feature' && t.type !== 'browser').map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<a href=${'#/tests?search=' + encodeURIComponent('"' + t.name + '"')} class="tag-chip" style="font-size:var(--font-2xs);padding:1px 6px;text-decoration:none" onClick=${stopProp}>${t.name}</a>`)}
                    </div>
                    <div class="scenario-meta">
                      <span class="scenario-source" style="direction:rtl;text-align:left;unicode-bidi:plaintext">${relativeSourcePath(scenario)}</span>
                    </div>
                  </div>
                  <span class="scenario-duration">${formatDuration(scenario.duration)}</span>
                </div>
              `;
            })}
          </div>
        </div>
      `;
    }

    // ===== Test Scenarios List View =====
    function ScenariosView({ onNavigate, route }) {
      const [search, setSearch] = useState(() => {
        const hash = window.location.hash;
        const params = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
        return params?.get('search') || '';
      });
      const [filter, setFilter] = useState(() => {
        const hash = window.location.hash;
        const params = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
        return params?.get('filter') || 'all';
      });
      const [sort, setSort] = useState(() => {
        const hash = window.location.hash;
        const params = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
        return params?.get('sort') || 'category';
      });

      // Sync state from route prop when URL changes externally (e.g. tag chip click)
      useEffect(() => {
        const params = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        const newSearch = params?.get('search') || '';
        const newFilter = params?.get('filter') || 'all';
        const newSort = params?.get('sort') || 'category';
        setSearch(newSearch);
        setFilter(newFilter);
        setSort(newSort);
      }, [route]);

      const filtered = useMemo(() => {
        let result = DATA.scenarios;
        if (filter === 'non-passing') {
          result = result.filter(s => s.outcome !== 'SUCCESS');
        } else if (filter !== 'all') {
          const filterMatch = { passed: ['SUCCESS'], failed: ['FAILURE', 'ERROR', 'COMPROMISED'], skipped: ['SKIPPED', 'PENDING'] };
          const allowed = filterMatch[filter];
          if (allowed) result = result.filter(s => allowed.includes(s.outcome));
        }
        if (search) {
          result = result.filter(s => matchesSearch(s, search));
        }
        // Apply sorting
        if (sort === 'name') {
          result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'duration') {
          result = [...result].sort((a, b) => b.duration - a.duration);
        } else if (sort === 'status') {
          const statusOrder = { FAILURE: 1, ERROR: 2, COMPROMISED: 3, PENDING: 4, SKIPPED: 5, SUCCESS: 6 };
          result = [...result].sort((a, b) => (statusOrder[a.outcome] || 6) - (statusOrder[b.outcome] || 6));
        }
        return result;
      }, [search, filter, sort]);

      // Sync state to URL hash
      useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filter && filter !== 'all') params.set('filter', filter);
        if (sort && sort !== 'category') params.set('sort', sort);
        if (runIndex !== null) params.set('run', String(runIndex));
        const paramStr = params.toString();
        const newHash = paramStr ? '#/tests?' + paramStr : '#/tests';
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, '', newHash);
        }
      }, [search, filter, sort]);

      // Group by category
      const grouped = useMemo(() => {
        const groups = {};
        for (const s of filtered) {
          if (!groups[s.category]) groups[s.category] = [];
          groups[s.category].push(s);
        }
        return groups;
      }, [filtered]);

      // Detect if viewing a historical run (reactive to route prop from App)
      const runParams = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
      const runStr = runParams ? runParams.get('run') : null;
      const runIndex = runStr !== null ? parseInt(runStr, 10) : null;

      const historicalRun = (runIndex !== null && runIndex !== DATA.history.length - 1) ? DATA.history[runIndex] : null;

      // Precompute run selector pills
      const runPills = DATA.history.map((run, idx) => {
        const isLatest = idx === DATA.history.length - 1;
        const isActive = runIndex === idx || (runIndex === null && isLatest);
        const passRate = Math.round((run.outcomes.passed / Object.values(run.outcomes).reduce((a, b) => a + b, 0)) * 100);
        const pillStyle = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:12px;font-size:var(--font-xs);font-weight:500;cursor:pointer;transition:all 0.2s;border:1px solid ' + (isActive ? 'var(--accent)' : 'var(--border-color)') + ';background:' + (isActive ? 'var(--accent)' : 'var(--bg-surface)') + ';color:' + (isActive ? '#fff' : 'var(--text-secondary)');
        const target = isLatest ? '/tests' : '/tests?run=' + idx;
        const label = run.label.replace('build ', '');
        const title = run.label + ' — ' + new Date(run.timestamp).toLocaleDateString() + ' — ' + passRate + '% pass rate';
        const onClick = () => onNavigate(target);
        return { pillStyle, label, title, onClick };
      });

      // Compute outcomes for the selected run (not always the latest)
      const runOutcomes = useMemo(() => {
        if (runIndex !== null && DATA.history[runIndex]) {
          return DATA.history[runIndex].outcomes;
        }
        return DATA.summary.outcomes;
      }, [runIndex]);
      const runTotal = useMemo(() => {
        return Object.values(runOutcomes).reduce((a, b) => a + b, 0);
      }, [runOutcomes]);

      return html`
        <div>
          ${historicalRun ? html`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px var(--space-md);margin-bottom:var(--space-md);background:var(--accent-light);border:1px solid var(--accent);border-radius:var(--radius-sm);font-size:var(--font-md)">
              <span>Viewing results from: <strong>${historicalRun.label}</strong> (${new Date(historicalRun.timestamp).toLocaleString()}) — ${formatDuration(historicalRun.duration)}</span>
              <a href="#/tests" style="cursor:pointer;color:var(--accent);font-weight:500;text-decoration:underline">show latest</a>
            </div>
          ` : null}

          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);flex-wrap:wrap">
            <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Test run:</span>
            ${runPills.map(pill => html`
              <div style=${pill.pillStyle} onClick=${pill.onClick} title=${pill.title}>
                <span>${pill.label}</span>
              </div>
            `)}
          </div>

          <div style="position:relative;margin-bottom:var(--space-md)">
            <input class="search-input" type="text" placeholder="Find test scenarios..."
                   value=${search} onInput=${e => setSearch(e.target.value)}
                   aria-label="Find test scenarios" style="margin-bottom:0;padding-right:36px" />
            ${search ? html`<button onClick=${() => setSearch('')}
              style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-secondary);font-size:var(--font-lg);padding:4px;line-height:1"
              aria-label="Clear search">✕</button>` : null}
          </div>

          <${FilterBar} outcomes=${runOutcomes} total=${runTotal}
                         activeFilter=${filter} onFilter=${setFilter}
                         sortOptions=${[
                           { key: 'category', label: 'Category' },
                           { key: 'name', label: 'Name' },
                           { key: 'duration', label: 'Slowest' },
                           { key: 'status', label: 'Status' },
                         ]}
                         activeSort=${sort} onSort=${setSort} />

          <div class="card">
            <div style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-md)">
              Showing ${filtered.length} of ${DATA.scenarios.length} test scenarios
            </div>
            <${VirtualScenarioList} filtered=${filtered} grouped=${grouped} sort=${sort}
              onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch} />
          </div>
        </div>
      `;
    }

    // ===== Test Scenario Detail View =====
    function ScenarioDetailView({ scenarioId, onNavigate }) {
      // Strip query params from scenarioId (e.g., "path%3Aline?run=1" → "path%3Aline")
      const cleanId = scenarioId.split('?')[0];
      const params = scenarioId.includes('?') ? new URLSearchParams(scenarioId.split('?')[1]) : null;
      const runIndex = params?.get('run') !== null && params?.get('run') !== undefined ? parseInt(params.get('run'), 10) : null;

      const scenario = DATA.scenarios.find(s => {
        const sourceKey = s.source.path + ':' + s.source.line;
        return sourceKey === decodeURIComponent(cleanId) || s.id === cleanId;
      });
      const [activeAttempt, setActiveAttempt] = useState(0);
      const [lightboxIndex, setLightboxIndex] = useState(-1);

      // Handle photo deep-link: scroll to and highlight photo on load
      useEffect(() => {
        const hash = window.location.hash;
        const photoMatch = hash.match(/&photo=(\d+)/);
        if (photoMatch) {
          const photoIdx = parseInt(photoMatch[1], 10);
          setTimeout(() => {
            const el = document.getElementById('photo-' + photoIdx);
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('photo-highlight'); setTimeout(() => el.classList.remove('photo-highlight'), 2000); }
          }, 300);
        }
      }, []);

      if (!scenario) {
        return html`<div class="card"><p>Test scenario not found.</p></div>`;
      }

      // Default missing fields to prevent runtime errors
      if (!scenario.tags) scenario.tags = [];
      if (!scenario.cast) scenario.cast = [];
      if (!scenario.activities) scenario.activities = [];
      if (!scenario.executionHistory) scenario.executionHistory = [];

      const hasRetries = scenario.attempts && scenario.attempts.length > 0;
      const hasCast = scenario.cast.length > 0;
      const hasTags = scenario.tags.length > 0;
      const hasExecutionHistory = scenario.executionHistory.length > 0;
      const currentActivities = hasRetries && activeAttempt < scenario.attempts.length

        ? scenario.attempts[activeAttempt].activities
        : scenario.activities;
      const currentError = hasRetries && activeAttempt < scenario.attempts.length
        ? scenario.attempts[activeAttempt].error
        : scenario.error;

      const copyTestPath = () => {
        const text = scenario.source.path + ':' + scenario.source.line;
        navigator.clipboard.writeText(text).then(() => showToast('Path copied to clipboard')).catch(() => {});
      };

      return html`
        <div>
          <div class="breadcrumb">
            <a onClick=${() => onNavigate('/tests' + (runIndex !== null ? '?run=' + runIndex : ''))}>Test Scenarios</a>
            ${scenario.category.split(' › ').map((segment) => html`
              <span>›</span>
              <a onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + segment + '"'))}>${segment}</a>
            `)}
            <span>›</span>
            <span>${scenario.name}</span>
          </div>

          <div class="card" style="margin-bottom:var(--space-md)">
            <div class="scenario-detail-header">
              <div class="scenario-detail-outcome scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
                ${outcomeIcon(scenario.outcome)}
              </div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:var(--space-sm)">
                  <div class="scenario-detail-title" style="flex:1;min-width:0">${scenario.name}</div>
                  <button onClick=${copyTestPath} title="Copy test path to clipboard" style="flex-shrink:0;width:28px;height:28px;border-radius:var(--radius-sm);border:none;background:var(--bg-hover);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  </button>
                </div>
                <div class="scenario-detail-meta">
                  <span>${formatDuration(scenario.duration)}</span>
                  <span>•</span>
                  <span class="scenario-source">${scenario.source.path}:${scenario.source.line}</span>
                  ${getBrowserTag(scenario) ? html`<span class="badge badge-${getBrowserTag(scenario)}">${getBrowserTag(scenario)}</span>` : null}
                </div>
              </div>
            </div>

            ${hasTags ? html`
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:var(--space-md)">
                ${[...new Map(scenario.tags.map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<span class="tag-chip">${t.type}:${t.name}</span>`)}
              </div>
            ` : null}

            ${hasExecutionHistory ? html`
              <div style="margin-bottom:var(--space-md)">
                <div class="card-title" style="margin-bottom:var(--space-sm)">Execution History</div>
                <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
                  ${scenario.executionHistory.map((entry, idx) => {
                    const isActive = runIndex === idx;
                    const blockStyle = 'width:20px;height:20px;border-radius:4px;background:var(--color-' + outcomeClass(entry.outcome) + ');opacity:' + (isActive ? '1' : '0.85') + ';display:flex;align-items:center;justify-content:center;font-size:var(--font-2xs);color:#fff;font-weight:600' + (isActive ? ';box-shadow:0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent)' : '');
                    const labelStyle = 'font-size:var(--font-xs);color:' + (isActive ? 'var(--accent)' : 'var(--text-disabled)') + ';font-weight:' + (isActive ? '600' : '400');
                    const handleRunClick = (e) => { e.stopPropagation(); onNavigate(scenarioUrl(scenario) + '?run=' + idx); };
                    return html`
                    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer"
                         title="${entry.run}: ${entry.outcome}"
                         onClick=${handleRunClick}>
                      <div style=${blockStyle}>${outcomeIcon(entry.outcome)}</div>
                      <span style=${labelStyle}>${entry.run}</span>
                    </div>
                  `;
                  })}
                </div>
              </div>
            ` : null}

            ${scenario.narrative ? html`
              <div style="margin-bottom:var(--space-md);padding:var(--space-md);background:var(--bg-primary);border-radius:var(--radius-sm);border-left:3px solid var(--accent);font-size:var(--font-md);color:var(--text-secondary);white-space:pre-line;line-height:1.6;font-style:italic">${scenario.narrative}</div>
            ` : null}

            ${scenario.description ? html`
              <div style="margin-bottom:var(--space-md);padding:var(--space-md);background:var(--bg-primary);border-radius:var(--radius-sm);border-left:3px solid var(--border-color);font-size:var(--font-md);color:var(--text-primary);white-space:pre-line;line-height:1.6">${scenario.description}</div>
            ` : null}

            ${hasCast ? html`
              <div class="cast-section">
                <div class="card-title" style="margin-bottom:var(--space-sm)">Cast</div>
                ${scenario.cast.map(actor => html`
                  <div style="margin-bottom:var(--space-md)">
                    <div class="cast-item">
                      <div class="cast-avatar">${actor.name[0]}</div>
                      <div style="font-weight:500">${actor.name}</div>
                    </div>
                    <div style="margin-left:36px;font-size:var(--font-sm);color:var(--text-secondary)">
                      <div style="margin-bottom:2px;font-weight:500;color:var(--text-primary)">${actor.name} can:</div>
                      <ul style="list-style:disc;padding-left:var(--space-md);margin:0">
                        ${actor.abilities.map(ability => html`
                          <li style="margin-bottom:2px;font-family:${ability.details ? 'var(--font-mono)' : 'inherit'};font-size:${ability.details ? '11px' : '12px'}">
                            <strong>${ability.name}</strong>${ability.details ? html`<span style="color:var(--text-disabled)"> ${ability.details}</span>` : null}
                          </li>
                        `)}
                      </ul>
                    </div>
                  </div>
                `)}
              </div>
            ` : null}
          </div>

          ${hasRetries ? html`
            <div class="retry-tabs">
              ${scenario.attempts.map((attempt, i) => html`
                <div class="retry-tab ${activeAttempt === i ? 'active' : ''} ${outcomeClass(attempt.outcome)}"
                     onClick=${() => setActiveAttempt(i)}>
                  Attempt ${attempt.attemptNumber} (${attempt.outcome === 'SUCCESS' ? 'passed' : 'failed'})
                </div>
              `)}
            </div>
          ` : null}

          ${currentActivities.length > 0 || scenario.scenarioOutline ? html`
            <div class="card" style="margin-bottom:var(--space-md)">
              <div class="card-title">Activity Tree</div>
              ${scenario.scenarioOutline ? html`
                <div style="margin-bottom:var(--space-md);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);border-radius:var(--radius-sm);font-family:var(--font-mono);font-size:var(--font-sm);white-space:pre-line;color:var(--text-secondary)">${scenario.scenarioOutline.template}</div>
                <${ParameterSetGroups} parameters=${scenario.scenarioOutline.parameters} />
              ` : html`
                <div class="activity-tree">
                  ${currentActivities.map(activity => html`<${ActivityNode} activity=${activity} />`)}
                </div>
              `}
            </div>
          ` : null}

          ${currentError ? html`
            <div class="error-block">
              <div class="error-name">${currentError.name}</div>
              <div class="error-message">${currentError.message}</div>
              <pre class="error-stack">${currentError.stack}</pre>
            </div>
          ` : null}

          ${scenario.video ? html`
            <div class="card" style="margin-top:var(--space-md)">
              <div class="card-title">Video Recording</div>
              <video controls preload="metadata" style="width:100%;border-radius:var(--radius-sm);margin-top:var(--space-sm)">
                <source src=${scenario.video} type="video/webm" />
              </video>
            </div>
          ` : null}

          ${(() => {
            const photos = [];
            const scenarioStart = new Date(scenario.startedAt).getTime();
            function collectPhotos(activities) {
              for (const a of activities) {
                if (a.artifacts) {
                  for (const art of a.artifacts) {
                    if (art.path && art.path.endsWith('.png')) {
                      const actStart = a.startedAt ? new Date(a.startedAt).getTime() : scenarioStart;
                      photos.push({ path: art.path, name: a.name, wallClock: a.startedAt, offsetMs: actStart - scenarioStart });
                    }
                  }
                }
                if (a.children) collectPhotos(a.children);
              }
            }
            collectPhotos(currentActivities);
            if (photos.length === 0) return null;
            return html`
              <div class="card" style="margin-top:var(--space-md)">
                <div class="card-title">Screenshots (${photos.length})</div>
                <div class="photo-strip" id="photo-strip">
                  ${photos.map((photo, idx) => html`
                    <div class="photo-strip-item" id=${'photo-' + idx}>
                      <img src=${photo.path} loading="lazy" alt=${photo.name} onClick=${() => setLightboxIndex(idx)} />
                      <div class="photo-strip-caption">${photo.name}</div>
                      <div class="photo-strip-time">${photo.wallClock ? new Date(photo.wallClock).toLocaleTimeString() : ''} · +${formatDuration(photo.offsetMs)}</div>
                    </div>
                  `)}
                </div>
              </div>
              ${lightboxIndex >= 0 && lightboxIndex < photos.length ? html`
                <div class="lightbox-overlay" onClick=${(e) => { if (e.target.classList.contains('lightbox-overlay')) setLightboxIndex(-1); }}
                     onKeyDown=${(e) => { if (e.key === 'Escape') setLightboxIndex(-1); else if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) setLightboxIndex(lightboxIndex + 1); else if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1); }}
                     tabIndex="0" ref=${(el) => { if (el) el.focus(); }}>
                  <div class="lightbox-content">
                    <button class="lightbox-close" onClick=${() => setLightboxIndex(-1)}>✕</button>
                    ${lightboxIndex > 0 ? html`<button class="lightbox-nav lightbox-prev" onClick=${() => setLightboxIndex(lightboxIndex - 1)}>‹</button>` : null}
                    ${lightboxIndex < photos.length - 1 ? html`<button class="lightbox-nav lightbox-next" onClick=${() => setLightboxIndex(lightboxIndex + 1)}>›</button>` : null}
                    <img src=${photos[lightboxIndex].path} alt=${photos[lightboxIndex].name} />
                    <div class="lightbox-caption">
                      <div>${photos[lightboxIndex].name}</div>
                      <div style="font-size:var(--font-xs);color:var(--text-secondary);font-family:var(--font-mono)">${photos[lightboxIndex].wallClock ? new Date(photos[lightboxIndex].wallClock).toLocaleTimeString() : ''} · +${formatDuration(photos[lightboxIndex].offsetMs)} · ${lightboxIndex + 1}/${photos.length}</div>
                    </div>
                  </div>
                </div>
              ` : null}
            `;
          })()}
        </div>
      `;
    }

    // ===== Parameter Set Groups (groups examples by their Examples: name) =====
    function ParameterSetGroups({ parameters }) {
      // Group parameter sets by name+description transitions
      const groups = useMemo(() => {
        const result = [];
        let current = null;
        for (const ps of parameters) {
          const key = (ps.name || '') + '\0' + (ps.description || '');
          if (!current || current.key !== key) {
            current = { key, name: ps.name, description: ps.description, items: [] };
            result.push(current);
          }
          current.items.push(ps);
        }
        return result;
      }, [parameters]);

      // Single group with no name and no description: render flat
      if (groups.length === 1 && !groups[0].name && !groups[0].description) {
        return html`${groups[0].items.map((ps, idx) => html`<${ParameterSetNode} ps=${ps} index=${idx} groupIndex=${0} forceExpanded=${undefined} />`)}`;
      }

      return html`${groups.map((group, idx) => html`<${ParameterSetGroup} group=${group} index=${idx} />`)}`;
    }

    function ParameterSetGroup({ group, index }) {
      const [expanded, setExpanded] = useState(true);
      const [forceExpanded, setForceExpanded] = useState(undefined);
      const passCount = group.items.filter(ps => ps.outcome === 'SUCCESS' || (ps.outcome && ps.outcome.code === 64)).length;
      const label = group.name || ('Examples' + (index !== undefined ? ' #' + (index + 1) : ''));
      const collapseAll = (e) => { e.stopPropagation(); setForceExpanded(false); };
      const expandAll = (e) => { e.stopPropagation(); setForceExpanded(true); };
      return html`
        <div style="margin-bottom:var(--space-md);border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden">
          <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);cursor:pointer;user-select:none"
               onClick=${() => setExpanded(!expanded)}>
            <span style="font-size:var(--font-sm);transform:${expanded ? 'rotate(90deg)' : 'none'};transition:transform 0.2s">▸</span>
            <span style="font-size:var(--font-md);font-weight:600">${label}</span>
            <span style="margin-left:auto;display:flex;align-items:center;gap:var(--space-sm)">
              <button onClick=${expandAll} title="Expand all examples" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;display:flex;opacity:0.6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M7 9l5 5 5-5"/><path d="M7 15l5 5 5-5"/></svg>
              </button>
              <button onClick=${collapseAll} title="Collapse all examples" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;display:flex;opacity:0.6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M17 15l-5-5-5 5"/><path d="M17 9l-5-5-5 5"/></svg>
              </button>
              <span style="font-size:var(--font-xs);color:var(--text-secondary)">${passCount}/${group.items.length} passed</span>
            </span>
          </div>
          ${group.description ? html`
            <div style="padding:var(--space-xs) var(--space-md) ${expanded ? '0' : 'var(--space-xs)'};font-size:var(--font-sm);color:var(--text-secondary);font-style:italic;border-top:1px solid var(--divider)">${group.description}</div>
          ` : null}
          ${expanded ? html`
            <div style="padding:var(--space-sm) var(--space-md)">
              ${group.items.map((ps, idx) => html`<${ParameterSetNode} ps=${ps} index=${idx} groupIndex=${index} forceExpanded=${forceExpanded} />`)}
            </div>
          ` : null}
        </div>
      `;
    }

    // ===== Parameter Set Node (scenario outline example) =====
    function ParameterSetNode({ ps, index, groupIndex, forceExpanded }) {
      const exampleId = (groupIndex !== undefined ? groupIndex + '-' : '') + (index + 1);
      const isLinked = (() => {
        const hash = window.location.hash;
        const m = hash.match(/[&?]example=([^&]*)/);
        return m && m[1] === exampleId;
      })();
      const [expanded, setExpanded] = useState(true);
      useEffect(() => { if (forceExpanded !== undefined) setExpanded(forceExpanded); }, [forceExpanded]);
      const nodeRef = useRef(null);
      const copyLink = (e) => {
        e.stopPropagation();
        const hash = window.location.hash.replace(/([&?])example=[^&]*/g, '');
        const url = window.location.origin + window.location.pathname + window.location.search + hash + (hash.includes('?') ? '&' : '?') + 'example=' + exampleId;
        navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard')).catch(() => {});
      };
      useEffect(() => { if (isLinked && nodeRef.current) nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, []);
      const paramSummary = Object.entries(ps.values).map(([k, v]) => k + ': ' + v).join(', ');
      return html`
        <div ref=${nodeRef} style="margin-bottom:var(--space-sm);border:1px solid ${isLinked ? 'var(--accent)' : 'var(--border-color)'};border-radius:var(--radius-sm);overflow:hidden">
          <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);cursor:pointer;user-select:none"
               onClick=${() => setExpanded(!expanded)}>
            <span style="font-size:var(--font-sm);transform:${expanded ? 'rotate(90deg)' : 'none'};transition:transform 0.2s">▸</span>
            <span class="scenario-outcome-icon ${outcomeClass(ps.outcome)}" style="width:18px;height:18px;font-size:var(--font-2xs);flex-shrink:0">${outcomeIcon(ps.outcome)}</span>
            <span style="font-size:var(--font-sm);font-weight:500">#${index + 1} — ${paramSummary}</span>
            <button onClick=${copyLink} title="Copy link to this example" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;line-height:1;opacity:0.6;display:flex;align-items:center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            </button>
            <span style="font-size:var(--font-xs);color:var(--text-secondary)">${formatDuration(ps.duration)}</span>
          </div>
          ${expanded && ps.activities.length > 0 ? html`
            <div class="activity-tree" style="padding:var(--space-sm) var(--space-md)">
              ${ps.activities.map(activity => html`<${ActivityNode} activity=${activity} />`)}
            </div>
          ` : null}
        </div>
      `;
    }

    // ===== Activity Node (recursive) =====
    function ActivityNode({ activity }) {
      const hasPhoto = activity.artifacts && activity.artifacts.some(a => a.path && a.path.endsWith('.png'));
      const { displayName, parsedDataTable, parsedDocString } = useMemo(() => {
        const name = activity.name;
        const lines = name.split('\n');
        const firstTableIdx = lines.findIndex(l => l.trim().startsWith('|'));
        if (firstTableIdx > 0 || (firstTableIdx === 0 && lines.length > 1)) {
          const textLines = [];
          const tableLines = [];
          let inTable = false;
          for (const line of lines) {
            if (line.trim().startsWith('|')) { inTable = true; tableLines.push(line); }
            else if (!inTable) textLines.push(line);
            else { textLines.push(line); inTable = false; }
          }
          if (tableLines.length > 0) {
            const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
            const rows = tableLines.slice(1).map(row => row.split('|').filter(c => c.trim()).map(c => c.trim()));
            return { displayName: textLines.join('\n').replace(/:\s*$/, ':'), parsedDataTable: { headers, rows }, parsedDocString: null };
          }
        }
        const colonIdx = name.indexOf(':\n');
        if (colonIdx > 0 && !name.substring(colonIdx + 2).trim().startsWith('|')) {
          const prefix = name.substring(0, colonIdx + 1);
          const docContent = name.substring(colonIdx + 2);
          return { displayName: prefix, parsedDataTable: null, parsedDocString: docContent };
        }
        return { displayName: name, parsedDataTable: null, parsedDocString: null };
      }, [activity.name]);
      const effectiveDataTable = activity.dataTable || parsedDataTable;
      const effectiveDocString = activity.docString || parsedDocString;
      return html`
        <div class="activity-node">
          <div class="activity-row">
            <div class="activity-icon ${outcomeClass(activity.outcome)}">
              ${outcomeIcon(activity.outcome)}
            </div>
            <span class="activity-name ${activity.type === 'Task' ? 'task' : ''}">${displayName}</span>
            ${hasPhoto ? html`<span style="cursor:pointer;opacity:0.7;font-size:var(--font-sm)" title="View screenshot" onClick=${(e) => { e.stopPropagation(); const photos = document.querySelectorAll('.photo-strip-item'); for (const p of photos) { p.classList.remove('photo-highlight'); } const idx = [...photos].findIndex(p => p.querySelector('.photo-strip-caption')?.textContent === activity.name); if (idx >= 0) { const hash = window.location.hash.split('&photo=')[0]; window.history.replaceState(null, '', hash + '&photo=' + idx); const el = document.getElementById('photo-' + idx); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('photo-highlight'); setTimeout(() => el.classList.remove('photo-highlight'), 2000); } } }}>📷</span>` : null}
            ${activity.location ? html`<span style="cursor:pointer;opacity:0.6;display:inline-flex;align-items:center" title="Copy invocation location: ${activity.location.path}:${activity.location.line}" onClick=${(e) => { e.stopPropagation(); navigator.clipboard.writeText(activity.location.path + ':' + activity.location.line).then(() => showToast('Location copied to clipboard')).catch(() => {}); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></span>` : null}
            <span class="activity-duration">${formatDuration(activity.duration)}</span>
            ${activity.outcome === 'PENDING' && activity.location ? html`<span style="font-size:var(--font-xs);color:var(--text-secondary);font-family:var(--font-mono)" title="Pending step location">${activity.location.path.split('/').pop()}:${activity.location.line}</span>` : null}
          </div>
          ${effectiveDataTable ? html`
            <div style="margin-left:var(--space-lg);margin-top:var(--space-xs);margin-bottom:var(--space-sm);overflow-x:auto">
              <table style="border-collapse:collapse;font-size:var(--font-sm);font-family:var(--font-mono);width:auto">
                <thead>
                  <tr>${effectiveDataTable.headers.map(h => html`<th style="padding:4px 10px;border:1px solid var(--border-color);background:var(--bg-primary);font-weight:600;white-space:nowrap">${h}</th>`)}</tr>
                </thead>
                <tbody>
                  ${effectiveDataTable.rows.map(row => html`
                    <tr>${row.map(cell => html`<td style="padding:4px 10px;border:1px solid var(--border-color);white-space:nowrap">${cell}</td>`)}</tr>
                  `)}
                </tbody>
              </table>
            </div>
          ` : null}
          ${effectiveDocString ? html`
            <div style="margin-left:var(--space-lg);margin-top:var(--space-xs);margin-bottom:var(--space-sm)">
              <pre style="font-size:var(--font-sm);font-family:var(--font-mono);background:var(--bg-primary);padding:var(--space-sm) var(--space-md);border-radius:var(--radius-sm);border:1px solid var(--border-color);white-space:pre-wrap;margin:0">${effectiveDocString}</pre>
            </div>
          ` : null}
          ${activity.children && activity.children.length > 0 ? html`
            <div style="margin-left:var(--space-sm)">
              ${activity.children.map(child => html`<${ActivityNode} activity=${child} />`)}
            </div>
          ` : null}
        </div>
      `;
    }

    // ===== Tags View =====
    function TagsView({ onNavigate }) {
      // Group tags by type
      const tagsByType = {};
      for (const tag of DATA.tags) {
        const type = tag.type || 'other';
        if (!tagsByType[type]) tagsByType[type] = [];
        tagsByType[type].push(tag);
      }

      // Order types: feature first, then alphabetical
      const typeOrder = Object.keys(tagsByType).sort((a, b) => {
        if (a === 'feature') return -1;
        if (b === 'feature') return 1;
        return a.localeCompare(b);
      });

      // Precompute render data
      const typeIcons = { feature: '📋', tag: '#', issue: '🐛', browser: '🌐', capability: '🎯', theme: '📚' };
      const renderGroups = typeOrder.map(type => {
        const tags = tagsByType[type];
        const items = tags.map(tag => {
          const passRate = tag.scenarioCount > 0 ? Math.round((tag.passed / tag.scenarioCount) * 100) : 0;
          const passColor = passRate >= 80 ? 'var(--color-passed)' : passRate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)';
          return { name: tag.name, scenarioCount: tag.scenarioCount, passRate, passColor, icon: typeIcons[type] || '#' };
        });
        return { type, label: type.charAt(0).toUpperCase() + type.slice(1), items };
      });

      // Flatten for template rendering
      const renderItems = [];
      for (const group of renderGroups) {
        renderItems.push({ kind: 'header', label: group.label, count: group.items.length });
        for (const item of group.items) {
          renderItems.push({ kind: 'tag', ...item });
        }
      }

      return html`
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:var(--space-sm)">
          ${renderItems.map(item => {
            if (item.kind === 'header') {
              return html`
                <div style="grid-column:1/-1;padding:var(--space-md) 0 var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--divider);margin-top:var(--space-md)">
                  ${item.label} <span style="font-weight:400;color:var(--text-disabled)">(${item.count})</span>
                </div>
              `;
            }
            const barWidth = item.passRate + '%';
            const barColor = item.passColor;
            return html`
              <div class="tag-card" onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + item.name + '"'))}>
                <div class="tag-card-icon">${item.icon}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-sm);margin-bottom:4px">
                    <div class="tag-card-name">${item.name}</div>
                    <span style="font-size:var(--font-sm);font-weight:600;color:${barColor};flex-shrink:0;min-width:36px;text-align:right" title="Pass rate: ${item.passRate}%">${item.passRate}%</span>
                  </div>
                  <div style="height:4px;border-radius:2px;background:var(--border-color);overflow:hidden">
                    <div style="height:100%;width:${barWidth};background:${barColor};border-radius:2px;transition:width 0.3s"></div>
                  </div>
                  <div class="tag-card-count" style="margin-top:4px">${item.scenarioCount} scenario${item.scenarioCount > 1 ? 's' : ''}</div>
                </div>
              </div>
            `;
          })}
        </div>
      `;
    }

    // ===== Errors View =====
    function ErrorsView({ onNavigate, route }) {
      // Parse run index from route
      const errRunParams = (route && route.includes('?')) ? new URLSearchParams(route.split('?')[1]) : null;
      const errRunStr = errRunParams ? errRunParams.get('run') : null;
      const errRunIndex = errRunStr !== null ? parseInt(errRunStr, 10) : null;
      const errIsHistorical = errRunIndex !== null && errRunIndex !== DATA.history.length - 1;
      const errHistoricalRun = errIsHistorical ? DATA.history[errRunIndex] : null;

      // Precompute run pills
      const errRunPills = DATA.history.map((run, idx) => {
        const isLatest = idx === DATA.history.length - 1;
        const isActive = errRunIndex === idx || (errRunIndex === null && isLatest);
        const pillStyle = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:12px;font-size:var(--font-xs);font-weight:500;cursor:pointer;transition:all 0.2s;border:1px solid ' + (isActive ? 'var(--accent)' : 'var(--border-color)') + ';background:' + (isActive ? 'var(--accent)' : 'var(--bg-surface)') + ';color:' + (isActive ? '#fff' : 'var(--text-secondary)');
        const target = isLatest ? '/errors' : '/errors?run=' + idx;
        const label = run.label.replace('build ', '');
        const title = run.label + ' — ' + new Date(run.timestamp).toLocaleDateString();
        const onClick = () => onNavigate(target);
        return { pillStyle, label, title, onClick };
      });
      const errShowLatest = () => onNavigate('/errors');

      const errorScenarios = DATA.scenarios.filter(s => s.error || s.outcome === 'FAILURE' || s.outcome === 'ERROR' || s.outcome === 'COMPROMISED');

      // Classify errors into categories
      function classifyError(error) {
        const name = (error.name || '').toLowerCase();
        const msg = (error.message || '').toLowerCase();
        if (name.includes('compromised')) return 'Compromised Tests';
        if (name.includes('assert') || name.includes('assertion')) return 'Assertion Errors';
        if (msg.includes('timed out') || msg.includes('timeout')) return 'Timeout Errors';
        return 'Runtime Errors';
      }

      // Group by category only — no sub-grouping by message
      const categories = {};
      for (const s of errorScenarios) {
        const cat = classifyError(s.error || { name: s.outcome, message: '' });
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s);
      }

      // Sort categories by total impact
      const categoryOrder = Object.entries(categories).map(([name, scenarios]) => {
        return { name, scenarios };
      }).sort((a, b) => b.scenarios.length - a.scenarios.length);

      const categoryColors = { 'Assertion Errors': 'var(--color-failed)', 'Compromised Tests': 'var(--color-compromised)', 'Timeout Errors': 'var(--color-pending)', 'Runtime Errors': 'var(--color-failed)' };
      const categoryIcons = { 'Assertion Errors': '≠', 'Compromised Tests': '⚠', 'Timeout Errors': '⏱', 'Runtime Errors': '✗' };

      // Precompute summary cards
      const summaryCards = categoryOrder.map(cat => ({
        title: cat.name,
        value: String(cat.scenarios.length),
        color: categoryColors[cat.name] || 'var(--color-failed)',
        subtitle: cat.scenarios.length === 1 ? '1 test' : cat.scenarios.length + ' tests',
      }));

      // Precompute flat render list: headers + scenario items
      const renderItems = useMemo(() => {
        const items = [];
        for (const cat of categoryOrder) {
          items.push({ type: 'header', icon: categoryIcons[cat.name] || '✗', name: cat.name, count: cat.scenarios.length });
          for (const s of cat.scenarios) {
            items.push({ type: 'scenario', scenario: s });
          }
        }
        return items;
      }, [categoryOrder]);

      // Virtualizer constants
      const ERROR_ROW_HEIGHT = 108;
      const ERROR_HEADER_HEIGHT_FIRST = 62;   // 46px content + 16px gap below
      const ERROR_HEADER_HEIGHT_REST = 78;    // 16px gap above + 46px content + 16px gap below
      const ERROR_HEADER_CONTENT_HEIGHT = 46;

      // Build header indices for sticky behavior
      const headerIndices = useMemo(() => {
        const indices = [];
        renderItems.forEach((item, i) => { if (item.type === 'header') indices.push(i); });
        return indices;
      }, [renderItems]);

      // Virtual scroll setup
      const errParentRef = useRef(null);
      const errActiveStickyRef = useRef(-1);

      const errRangeExtractor = useCallback((range) => {
        if (headerIndices.length === 0) {
          errActiveStickyRef.current = -1;
          return defaultRangeExtractor(range);
        }
        let activeStickyIndex = headerIndices[0];
        for (const idx of headerIndices) {
          if (idx > range.startIndex) break;
          activeStickyIndex = idx;
        }
        errActiveStickyRef.current = activeStickyIndex;
        const defaultRange = defaultRangeExtractor(range);
        if (!defaultRange.includes(activeStickyIndex)) return [activeStickyIndex, ...defaultRange];
        return defaultRange;
      }, [headerIndices]);

      const errVirtualizer = useVirtualizer({
        count: renderItems.length,
        getScrollElement: () => errParentRef.current,
        estimateSize: (index) => {
          if (renderItems[index].type !== 'header') return ERROR_ROW_HEIGHT;
          return index === 0 ? ERROR_HEADER_HEIGHT_FIRST : ERROR_HEADER_HEIGHT_REST;
        },
        overscan: 15,
        rangeExtractor: errRangeExtractor,
      });

      // Imperative sticky header
      const errStickyElRef = useRef(null);
      if (!errStickyElRef.current) {
        errStickyElRef.current = document.createElement('div');
        errStickyElRef.current.id = 'vs-errors-sticky';
        errStickyElRef.current.className = 'scenario-group-header';
        errStickyElRef.current.style.cssText = 'display:none;position:sticky;top:0;width:100%;height:46px;flex-shrink:0;z-index:3;background:var(--bg-surface);box-shadow:0 1px 0 var(--border-color);margin-bottom:-46px;padding:var(--space-md) var(--space-md) var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;direction:ltr';
      }

      const errParentRefCallback = useCallback((node) => {
        errParentRef.current = node;
        if (node) {
          const stickyEl = errStickyElRef.current;
          if (stickyEl.parentNode !== node) node.insertBefore(stickyEl, node.firstChild);
        }
      }, []);

      useEffect(() => {
        const el = errParentRef.current;
        const stickyEl = errStickyElRef.current;
        if (!el) { stickyEl.style.display = 'none'; return; }
        const headerStarts = [];
        let pos = 0;
        for (let i = 0; i < renderItems.length; i++) {
          if (renderItems[i].type === 'header') headerStarts.push({ index: i, start: pos, item: renderItems[i] });
          const hHeight = i === 0 ? ERROR_HEADER_HEIGHT_FIRST : ERROR_HEADER_HEIGHT_REST;
          pos += renderItems[i].type === 'header' ? hHeight : ERROR_ROW_HEIGHT;
        }
        let currentName = '';
        const onScroll = () => {
          const scrollTop = el.scrollTop;
          let activeHeader = null;
          for (const h of headerStarts) { if (h.start <= scrollTop) activeHeader = h; else break; }
          const activeHeaderHeight = activeHeader && activeHeader.index === 0 ? ERROR_HEADER_HEIGHT_FIRST : ERROR_HEADER_HEIGHT_REST;
          if (!activeHeader || scrollTop <= activeHeader.start + activeHeaderHeight) { stickyEl.style.display = 'none'; return; }
          stickyEl.style.display = 'flex';
          stickyEl.style.alignItems = 'center';
          stickyEl.style.gap = 'var(--space-sm)';
          if (currentName !== activeHeader.item.name) {
            currentName = activeHeader.item.name;
            stickyEl.innerHTML = '';
            const iconSpan = document.createElement('span');
            iconSpan.textContent = activeHeader.item.icon;
            const nameSpan = document.createElement('span');
            nameSpan.textContent = activeHeader.item.name;
            const countSpan = document.createElement('span');
            countSpan.textContent = '(' + activeHeader.item.count + ')';
            countSpan.style.cssText = 'font-size:var(--font-xs);color:var(--text-disabled);font-weight:400';
            stickyEl.appendChild(iconSpan);
            stickyEl.appendChild(nameSpan);
            stickyEl.appendChild(countSpan);
          }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => el.removeEventListener('scroll', onScroll);
      }, [renderItems]);

      if (errorScenarios.length === 0) {
        return html`
          <div class="placeholder-view">
            ${icons.errors}
            <h2>No Errors</h2>
            <p>All tests passed without errors.</p>
          </div>
        `;
      }

      return html`
        <div>
          ${errHistoricalRun ? html`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px var(--space-md);margin-bottom:var(--space-md);background:var(--accent-light);border:1px solid var(--accent);border-radius:var(--radius-sm);font-size:var(--font-md)">
              <span>Viewing errors from: <strong>${errHistoricalRun.label}</strong> (${new Date(errHistoricalRun.timestamp).toLocaleString()})</span>
              <a onClick=${errShowLatest} style="cursor:pointer;color:var(--accent);font-weight:500;text-decoration:underline">show latest</a>
            </div>
          ` : null}

          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);flex-wrap:wrap">
            <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Test run:</span>
            ${errRunPills.map(pill => html`
              <div style=${pill.pillStyle} onClick=${pill.onClick} title=${pill.title}>
                <span>${pill.label}</span>
              </div>
            `)}
          </div>

          <div class="grid-stats" style="margin-bottom:var(--space-md)">
            ${summaryCards.map(card => html`
              <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
                <div class="card-title" style="margin-bottom:0">${card.title}</div>
                <div class="card-value" style="color:${card.color};font-size:var(--font-lg)">${card.value}</div>
              </div>
            `)}
          </div>
          <div class="card" style="padding-bottom:0">
            <div style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-md)">
              Showing ${errorScenarios.length} ${errorScenarios.length === 1 ? 'error' : 'errors'}
            </div>
            <div ref=${errParentRefCallback} style="max-height:calc(100vh - 380px);overflow-y:auto;position:relative">
              <div style="height:${errVirtualizer.getTotalSize()}px;width:100%;position:relative">
                ${errVirtualizer.getVirtualItems().map(virtualRow => {
                  const item = renderItems[virtualRow.index];
                  if (item.type === 'header') {
                    const topOffset = virtualRow.index === 0 ? 0 : 16;
                    return html`
                      <div style="position:absolute;top:0;left:0;width:100%;height:${ERROR_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1;display:flex;align-items:center;gap:var(--space-sm);direction:ltr"
                           class="scenario-group-header">
                        <span>${item.icon}</span>
                        <span>${item.name}</span>
                        <span style="font-size:var(--font-xs);color:var(--text-disabled);font-weight:400">(${item.count})</span>
                      </div>
                    `;
                  }
                  const s = item.scenario;
                  return html`
                    <div style="position:absolute;top:0;left:0;width:100%;height:${ERROR_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden;align-items:flex-start"
                         class="scenario-item" onClick=${() => onNavigate(scenarioUrl(s))}>
                      <div class="scenario-outcome-icon ${outcomeClass(s.outcome)}" style="width:20px;height:20px;font-size:var(--font-2xs);margin-top:2px;flex-shrink:0">${outcomeIcon(s.outcome)}</div>
                      <div class="scenario-info">
                        <div class="scenario-name">${s.name}</div>
                        <div style="font-size:var(--font-sm);color:var(--color-${outcomeClass(s.outcome)});margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.error ? s.error.message : s.outcome}</div>
                        <div class="scenario-meta">
                          <span class="scenario-source" style="direction:rtl;text-align:left;unicode-bidi:plaintext">${relativeSourcePath(s)}</span>
                        </div>
                      </div>
                      <span class="scenario-duration">${formatDuration(s.duration)}</span>
                    </div>
                  `;
                })}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // ===== System Context View =====
    function SystemContextView() {
      const ctx = DATA.systemContext;

      if (!ctx) {
        return html`
          <div class="placeholder-view">
            ${icons.system}
            <h2>System Context</h2>
            <p>System context information is not yet available.<br/>It will be populated once the reporter collects environment metadata.</p>
          </div>
        `;
      }

      return html`
        <div class="card">
          <div class="card-title" style="margin-bottom:var(--space-lg)">Environment</div>
          <div class="context-grid">
            <div class="context-item">
              <div class="context-icon">⚡</div>
              <div>
                <div class="context-label">Node.js</div>
                <div class="context-value">${ctx.nodeVersion}</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">🧪</div>
              <div>
                <div class="context-label">Test Runner</div>
                <div class="context-value">${ctx.testRunner.name} ${ctx.testRunner.version}</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">🖥</div>
              <div>
                <div class="context-label">Operating System</div>
                <div class="context-value">${ctx.os.name} ${ctx.os.version} (${ctx.os.arch})</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">📦</div>
              <div>
                <div class="context-label">Serenity/JS</div>
                <div class="context-value">v${ctx.serenityVersion}</div>
              </div>
            </div>
            ${ctx.browsers.map(b => html`
              <div class="context-item">
                <div class="context-icon">🌐</div>
                <div>
                  <div class="context-label">${b.name}</div>
                  <div class="context-value">${b.version}</div>
                </div>
              </div>
            `)}
          </div>

          ${ctx.ci ? html`
            <div style="margin-top:var(--space-xl)">
              <div class="card-title" style="margin-bottom:var(--space-md)">CI / CD</div>
              <div class="context-grid">
                <div class="context-item">
                  <div class="context-icon">🏗</div>
                  <div>
                    <div class="context-label">Provider</div>
                    <div class="context-value">${ctx.ci.provider}</div>
                  </div>
                </div>
                <div class="context-item">
                  <div class="context-icon">#</div>
                  <div>
                    <div class="context-label">Build</div>
                    <div class="context-value">#${ctx.ci.buildNumber}</div>
                  </div>
                </div>
                <div class="context-item">
                  <div class="context-icon">🌿</div>
                  <div>
                    <div class="context-label">Branch</div>
                    <div class="context-value">${ctx.ci.branch}</div>
                  </div>
                </div>
                <div class="context-item">
                  <div class="context-icon">📝</div>
                  <div>
                    <div class="context-label">Commit</div>
                    <div class="context-value" style="font-family:var(--font-mono);font-size:var(--font-sm)">${ctx.ci.commit} — ${ctx.ci.commitMessage}</div>
                  </div>
                </div>
              </div>
            </div>
          ` : null}
        </div>
      `;
    }

    // ===== Placeholder Views =====
    function FlakyView({ onNavigate }) {
      const flaky = DATA.flakyTests || [];

      const [filter, setFilter] = useState('unstable');
      const [search, setSearch] = useState('');
      const [sort, setSort] = useState('category');

      const hasNoData = flaky.length === 0;

      if (hasNoData) {
        return html`
          <div class="placeholder-view">
            ${icons.flaky}
            <h2>All Tests Stable</h2>
            <p>No unstable results detected.<br/>Run your test suite several times to populate history.</p>
          </div>
        `;
      }

      // Derive degraded/recovered from flakyTests based on most recent outcome
      const allUnstable = useMemo(() => flaky.map(t => {
        const lastOutcome = t.history && t.history.length > 0 ? t.history[t.history.length - 1] : null;
        const kind = lastOutcome === 'SUCCESS' ? 'recovered' : 'degraded';
        return { ...t, kind };
      }), []);

      const degradedCount = allUnstable.filter(t => t.kind === 'degraded').length;
      const recoveredCount = allUnstable.filter(t => t.kind === 'recovered').length;

      // Build list based on filter
      const allItems = useMemo(() => {
        if (filter === 'degraded') return allUnstable.filter(t => t.kind === 'degraded');
        if (filter === 'recovered') return allUnstable.filter(t => t.kind === 'recovered');
        return allUnstable; // 'unstable' shows all
      }, [filter, allUnstable]);

      // Apply search filter
      const searchedItems = useMemo(() => {
        if (!search) return allItems;
        return allItems.filter(t => matchesSearch(t, search));
      }, [allItems, search]);

      // Apply sorting
      const sortedItems = useMemo(() => {
        if (sort === 'name') return [...searchedItems].sort((a, b) => a.name.localeCompare(b.name));
        return [...searchedItems].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      }, [searchedItems, sort]);

      // Flatten into virtualizer items (headers + scenarios)
      const STABILITY_ROW_HEIGHT = 56;
      const STABILITY_HEADER_HEIGHT_FIRST = 62;
      const STABILITY_HEADER_HEIGHT_REST = 78;
      const STABILITY_HEADER_CONTENT_HEIGHT = 46;

      const flatItems = useMemo(() => {
        if (sort !== 'category') return sortedItems.map(t => ({ type: 'scenario', item: t }));
        const groups = {};
        for (const t of sortedItems) {
          const cat = t.category || 'Uncategorised';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(t);
        }
        const result = [];
        for (const [category, tests] of Object.entries(groups)) {
          result.push({ type: 'header', category });
          for (const t of tests) result.push({ type: 'scenario', item: t });
        }
        return result;
      }, [sortedItems, sort]);

      // Virtual scroll setup
      const parentRef = useRef(null);
      const headerIndices = useMemo(() => {
        const indices = [];
        flatItems.forEach((item, i) => { if (item.type === 'header') indices.push(i); });
        return indices;
      }, [flatItems]);

      const activeStickyRef = useRef(-1);
      const rangeExtractor = useCallback((range) => {
        if (sort !== 'category' || headerIndices.length === 0) {
          activeStickyRef.current = -1;
          return defaultRangeExtractor(range);
        }
        let activeStickyIndex = headerIndices[0];
        for (const idx of headerIndices) {
          if (idx > range.startIndex) break;
          activeStickyIndex = idx;
        }
        activeStickyRef.current = activeStickyIndex;
        const defaultRange = defaultRangeExtractor(range);
        if (!defaultRange.includes(activeStickyIndex)) return [activeStickyIndex, ...defaultRange];
        return defaultRange;
      }, [sort, headerIndices]);

      const virtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
          if (flatItems[index].type !== 'header') return STABILITY_ROW_HEIGHT;
          return index === 0 ? STABILITY_HEADER_HEIGHT_FIRST : STABILITY_HEADER_HEIGHT_REST;
        },
        overscan: 15,
        rangeExtractor,
      });

      // Imperative sticky header
      const stickyElRef = useRef(null);
      if (!stickyElRef.current) {
        stickyElRef.current = document.createElement('div');
        stickyElRef.current.id = 'vs-stability-sticky';
        stickyElRef.current.className = 'scenario-group-header';
        stickyElRef.current.style.cssText = 'display:none;position:sticky;top:0;width:100%;height:46px;flex-shrink:0;z-index:3;background:var(--bg-surface);box-shadow:0 1px 0 var(--border-color);margin-bottom:-46px;padding:var(--space-md) var(--space-md) var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px';
      }

      const parentRefCallback = useCallback((node) => {
        parentRef.current = node;
        if (node && sort === 'category') {
          const stickyEl = stickyElRef.current;
          if (stickyEl.parentNode !== node) node.insertBefore(stickyEl, node.firstChild);
        }
      }, [sort]);

      useEffect(() => {
        const el = parentRef.current;
        const stickyEl = stickyElRef.current;
        if (!el || sort !== 'category') { stickyEl.style.display = 'none'; return; }
        const headerStarts = [];
        let pos = 0;
        for (let i = 0; i < flatItems.length; i++) {
          if (flatItems[i].type === 'header') headerStarts.push({ index: i, start: pos, category: flatItems[i].category });
          const hHeight = i === 0 ? STABILITY_HEADER_HEIGHT_FIRST : STABILITY_HEADER_HEIGHT_REST;
          pos += flatItems[i].type === 'header' ? hHeight : STABILITY_ROW_HEIGHT;
        }
        let currentCategory = '';
        const onScroll = () => {
          const scrollTop = el.scrollTop;
          let activeHeader = null;
          for (const h of headerStarts) { if (h.start <= scrollTop) activeHeader = h; else break; }
          const activeHeaderHeight = activeHeader && activeHeader.index === 0 ? STABILITY_HEADER_HEIGHT_FIRST : STABILITY_HEADER_HEIGHT_REST;
          if (!activeHeader || scrollTop <= activeHeader.start + activeHeaderHeight) { stickyEl.style.display = 'none'; return; }
          stickyEl.style.display = 'block';
          if (currentCategory !== activeHeader.category) {
            currentCategory = activeHeader.category;
            stickyEl.textContent = activeHeader.category.replace(/ › /g, '  ›  ');
          }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => el.removeEventListener('scroll', onScroll);
      }, [sort, flatItems]);

      const kindIcon = (kind) => {
        if (kind === 'degraded') return html`<span class="scenario-outcome-icon failed">✗</span>`;
        return html`<span class="scenario-outcome-icon pending">⚡</span>`;
      };

      const kindLabel = (kind) => {
        if (kind === 'degraded') return 'currently failing';
        if (kind === 'recovered') return 'currently passing';
        return '';
      };

      return html`
        <div>
          <!-- Search -->
          <div style="position:relative;margin-bottom:var(--space-md)">
            <input class="search-input" type="text" placeholder="Find test scenarios..."
                   value=${search} onInput=${e => setSearch(e.target.value)}
                   aria-label="Find test scenarios" style="margin-bottom:0;padding-right:36px" />
            ${search ? html`<button onClick=${() => setSearch('')}
              style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-secondary);font-size:var(--font-lg);padding:4px;line-height:1"
              aria-label="Clear search">✕</button>` : null}
          </div>

          <!-- Filter and sort -->
          <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-md);flex-wrap:wrap;align-items:center">
            <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">State:</span>
            <button class="filter-chip ${filter === 'unstable' ? 'active' : ''}" onClick=${() => setFilter('unstable')}>
              Unstable <span class="count">${flaky.length}</span>
            </button>
            <button class="filter-chip failed ${filter === 'degraded' ? 'active' : ''}" onClick=${() => setFilter('degraded')}>
              Degraded <span class="count">${degradedCount}</span>
            </button>
            <button class="filter-chip passed ${filter === 'recovered' ? 'active' : ''}" onClick=${() => setFilter('recovered')}>
              Recovered <span class="count">${recoveredCount}</span>
            </button>
            <div class="sort-group">
              <label style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px" for="stability-sort-select">Sort:</label>
              <select id="stability-sort-select" class="sort-select" value=${sort} onChange=${(e) => setSort(e.target.value)} aria-label="Sort order">
                <option value="category" selected=${sort === 'category'}>Category</option>
                <option value="name" selected=${sort === 'name'}>Name</option>
              </select>
            </div>
          </div>

          <!-- Results list (virtualized) -->
          <div class="card" style="padding-bottom:0">
            <div style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-md)">
              Showing ${sortedItems.length} ${sortedItems.length === 1 ? 'test' : 'tests'}
            </div>
            <div ref=${parentRefCallback} style="max-height:calc(100vh - 380px);overflow-y:auto;position:relative">
              <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
                ${virtualizer.getVirtualItems().map(virtualRow => {
                  const flatItem = flatItems[virtualRow.index];
                  if (flatItem.type === 'header') {
                    const topOffset = virtualRow.index === 0 ? 0 : 16;
                    return html`
                      <div style="position:absolute;top:0;left:0;width:100%;height:${STABILITY_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1"
                           class="scenario-group-header">
                        ${flatItem.category.split(' › ').map((segment, idx, arr) => html`
                          <span style="cursor:pointer" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${idx < arr.length - 1 ? html`<span style="margin:0 4px;text-decoration:none;cursor:default"> › </span>` : null}
                        `)}
                      </div>
                    `;
                  }
                  const t = flatItem.item;
                  const clickHandler = () => onNavigate(scenarioUrl(t));
                  return html`
                    <div style="position:absolute;top:0;left:0;width:100%;height:${STABILITY_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden"
                         class="scenario-item" onClick=${clickHandler}>
                      ${kindIcon(t.kind)}
                      <div class="scenario-info" style="flex:1;min-width:0">
                        <div class="scenario-name">${t.name}</div>
                        <div class="scenario-meta">
                          <span class="scenario-source">${t.source.path}:${t.source.line}</span>
                          ${kindLabel(t.kind) ? html`<span style="color:var(--text-disabled)">•</span><span>${kindLabel(t.kind)}</span>` : null}
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:var(--space-md);flex-shrink:0">
                        ${t.history ? html`
                          <div style="display:flex;gap:2px;align-items:center">
                            ${t.history.map((outcome, idx) => {
                              const runClickHandler = (e) => { e.stopPropagation(); onNavigate(scenarioUrl(t) + '?run=' + idx); };
                              return html`<div style="width:12px;height:12px;border-radius:2px;background:var(--color-${outcomeClass(outcome)});opacity:0.85;cursor:pointer" title="${t.labels[idx]}: ${outcome}" onClick=${runClickHandler}></div>`;
                            })}
                          </div>
                        ` : null}
                        ${t.flakinessRate !== undefined ? html`
                          <div style="text-align:right;min-width:44px" title="Failure ratio: ${Math.round(t.flakinessRate * 100)}%">
                            <div style="font-size:var(--font-md);font-weight:700;color:var(--color-pending)">${Math.round(t.flakinessRate * 100)}%</div>
                          </div>
                        ` : null}
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function RequirementsPageView({ onNavigate }) {
      const requirements = DATA.requirements;

      if (!requirements) {
        return html`
          <div class="placeholder-view">
            ${icons.coverage}
            <h2>Requirements</h2>
            <p>Configure a <code>specDirectory</code> to derive the requirements hierarchy.</p>
          </div>
        `;
      }

      // Calculate coverage stats
      const totalFiles = useMemo(() => {
        let count = 0;
        function walk(node) { if (node.type === 'file') count++; if (node.children) node.children.forEach(walk); }
        if (requirements.children) requirements.children.forEach(walk);
        return count;
      }, []);

      const gapCount = useMemo(() => {
        let count = 0;
        function walk(node) {
          if (node.type === 'file') {
            const pending = (node.outcomes.pending || 0) + (node.outcomes.skipped || 0);
            const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
            if (total === 0 || pending > 0) count++;
          }
          if (node.children) node.children.forEach(walk);
        }
        if (requirements.children) requirements.children.forEach(walk);
        return count;
      }, []);

      const coveredFiles = totalFiles - gapCount;
      const coveragePercent = totalFiles > 0 ? Math.round((coveredFiles / totalFiles) * 100) : 100;
      const totalScenarios = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
      const passRate = totalScenarios > 0 ? Math.round((requirements.outcomes.passed / totalScenarios) * 100) : 0;

      return html`
        <div>
          <div class="grid-stats" style="margin-bottom:var(--space-md)">
            <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)" title="${coveredFiles} of ${totalFiles} areas are fully covered (no pending or skipped tests)">
              <div class="card-title" style="margin-bottom:0">Coverage</div>
              <div class="card-value" style="color:${coveragePercent >= 80 ? 'var(--color-passed)' : coveragePercent >= 50 ? 'var(--color-pending)' : 'var(--color-failed)'};font-size:var(--font-lg)">${coveragePercent}%</div>
              <div class="card-subtitle" style="margin-top:0;margin-left:auto">${coveredFiles} of ${totalFiles} areas fully covered</div>
            </div>
            <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)" title="${requirements.outcomes.passed || 0} of ${totalScenarios} scenarios are passing">
              <div class="card-title" style="margin-bottom:0">Pass Rate</div>
              <div class="card-value" style="color:${passRate >= 80 ? 'var(--color-passed)' : passRate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)'};font-size:var(--font-lg)">${passRate}%</div>
              <div class="card-subtitle" style="margin-top:0;margin-left:auto">${totalScenarios} scenarios total</div>
            </div>
            <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)" title="${gapCount} ${gapCount === 1 ? 'area has' : 'areas have'} incomplete tests (pending or skipped)">
              <div class="card-title" style="margin-bottom:0">Gaps</div>
              <div class="card-value" style="color:${gapCount === 0 ? 'var(--color-passed)' : 'var(--color-failed)'};font-size:var(--font-lg)">${gapCount}</div>
              <div class="card-subtitle" style="margin-top:0;margin-left:auto">${gapCount === 1 ? 'area' : 'areas'} with incomplete tests</div>
            </div>
          </div>

          ${requirements.readme ? html`
            <${RawHtml} content=${requirements.readme} class="card readme-content" style="margin-bottom:var(--space-md);padding:var(--space-md) var(--space-lg);border-left:3px solid var(--accent);font-size:var(--font-md);color:var(--text-primary);line-height:1.7" />
          ` : null}

          <div class="card">
            ${requirements.children.map(node => html`<${ReqNode} node=${node} onNavigate=${onNavigate} depth=${0} />`)}
          </div>
        </div>
      `;
    }

    function ReqNode({ node, onNavigate, depth }) {
      const [expanded, setExpanded] = useState(depth < 1);
      const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
      const passRate = total > 0 ? Math.round((node.outcomes.passed / total) * 100) : 0;
      const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;
      const hasGap = total === 0 && (node.scenarioCount === 0 || node.type === 'directory');
      const passColor = total > 0 ? (passRate >= 80 ? 'var(--color-passed)' : passRate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)') : 'var(--color-failed)';

      return html`
        <div style="margin-left:${depth * 20}px;margin-bottom:2px">
          <div class="scenario-item" style="padding:8px var(--space-sm)"
               onClick=${() => hasChildren ? setExpanded(!expanded) : onNavigate('/tests?search=' + encodeURIComponent('"' + (node.displayName || node.name) + '"'))}>
            ${hasChildren ? html`
              <span style="font-size:1.5rem;line-height:1;color:var(--text-primary);width:28px;text-align:center;cursor:pointer">${expanded ? '▾' : '▸'}</span>
            ` : html`<span style="width:28px"></span>`}
            <span style="font-size:var(--font-md);font-weight:${node.type === 'directory' ? '600' : '400'};flex:1">${node.displayName || node.name}</span>
            ${total > 0 ? html`
              <span style="font-size:var(--font-sm);font-weight:500;color:${passColor}" title="${node.outcomes.passed} passed, ${node.outcomes.failed || 0} failed, ${(node.outcomes.error || 0) + (node.outcomes.compromised || 0)} error, ${(node.outcomes.skipped || 0) + (node.outcomes.pending || 0)} skipped">${passRate}%</span>
              <span style="font-size:var(--font-xs);color:var(--text-secondary);min-width:80px;text-align:right;display:inline-flex;gap:6px;justify-content:flex-end">${node.outcomes.passed ? html`<span style="color:var(--color-passed)" title="Passed">${node.outcomes.passed}✓</span>` : null}${node.outcomes.failed ? html`<span style="color:var(--color-failed)" title="Failed">${node.outcomes.failed}✗</span>` : null}${(node.outcomes.error || 0) + (node.outcomes.compromised || 0) > 0 ? html`<span style="color:var(--color-error)" title="Error / Compromised">${(node.outcomes.error || 0) + (node.outcomes.compromised || 0)}!</span>` : null}${(node.outcomes.skipped || 0) + (node.outcomes.pending || 0) > 0 ? html`<span style="color:var(--color-skipped)" title="Skipped / Pending">${(node.outcomes.skipped || 0) + (node.outcomes.pending || 0)}⊘</span>` : null}</span>
            ` : html`
              <span style="font-size:var(--font-xs);color:var(--color-failed);font-weight:500">${hasGap ? 'No tests' : ''}</span>
            `}
          </div>
          ${hasChildren && expanded && node.readme ? html`
            <${RawHtml} content=${node.readme} class="readme-content" style="margin-left:${28 + 8}px;margin-bottom:var(--space-md);padding:var(--space-md) var(--space-lg);background:var(--bg-surface);border-radius:var(--radius-sm);border-left:3px solid var(--accent);font-size:var(--font-md);color:var(--text-primary);line-height:1.7" />
          ` : null}
          ${hasChildren && expanded ? html`
            ${node.children.map(child => html`<${ReqNode} node=${child} onNavigate=${onNavigate} depth=${depth + 1} />`)}
          ` : null}
        </div>
      `;
    }

    function TimelineView({ onNavigate }) {
      const [sortBy, setSortBy] = useState('time');
      const [filter, setFilter] = useState('all');
      const allScenarios = DATA.scenarios;
      const start = new Date(DATA.summary.startedAt).getTime();
      const end = new Date(DATA.summary.finishedAt).getTime();
      const totalDur = end - start;

      const scenarios = useMemo(() => {
        let result = allScenarios;
        if (filter !== 'all') {
          const filterMatch = { passed: ['SUCCESS'], failed: ['FAILURE', 'ERROR', 'COMPROMISED'], skipped: ['SKIPPED', 'PENDING'] };
          const allowed = filterMatch[filter];
          if (allowed) result = result.filter(s => allowed.includes(s.outcome));
        }
        if (sortBy === 'duration') return [...result].sort((a, b) => b.duration - a.duration);
        return result;
      }, [sortBy, filter]);

      const durations = allScenarios.map(s => s.duration).filter(d => d > 0);
      const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
      const slowest = Math.max(...durations);
      const fastest = Math.min(...durations.filter(d => d > 0));

      const rowHeight = 52;

      const parentRef = useRef(null);

      const virtualizer = useVirtualizer({
        count: scenarios.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 20,
      });


      return html`
        <div>
          <!-- Stats cards -->
          <div class="grid-stats" style="margin-bottom:var(--space-md)">
            <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
              <div class="card-title" style="margin-bottom:0">Slowest</div>
              <div class="card-value" style="color:var(--color-failed);font-size:var(--font-lg)">${formatDuration(slowest)}</div>
            </div>
            <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
              <div class="card-title" style="margin-bottom:0">Fastest</div>
              <div class="card-value" style="color:var(--color-passed);font-size:var(--font-lg)">${formatDuration(fastest)}</div>
            </div>
            <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
              <div class="card-title" style="margin-bottom:0">Average</div>
              <div class="card-value" style="font-size:var(--font-lg)">${formatDuration(avg)}</div>
            </div>
            <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
              <div class="card-title" style="margin-bottom:0">Total Run</div>
              <div class="card-value" style="font-size:var(--font-lg)">${formatDuration(DATA.summary.duration)}</div>
            </div>
          </div>

          <${FilterBar} outcomes=${DATA.summary.outcomes} total=${allScenarios.length}
                       activeFilter=${filter} onFilter=${setFilter}
                       sortOptions=${[
                         { key: 'time', label: 'Execution order' },
                         { key: 'duration', label: 'Slowest first' },
                       ]}
                       activeSort=${sortBy} onSort=${setSortBy} />

          <div class="card" style="padding-bottom:0">
            <!-- Virtualized Rows -->
            <div ref=${parentRef} style="border-top:1px solid var(--border-color);max-height:calc(100vh - 320px);overflow-y:auto">
              <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
                ${virtualizer.getVirtualItems().map(virtualRow => {
                  const i = virtualRow.index;
                  const s = scenarios[i];
                  const sStart = new Date(s.startedAt).getTime();
                  const left = sortBy === 'time' ? ((sStart - start) / totalDur) * 100 : 0;
                  const width = sortBy === 'time'
                    ? Math.max((s.duration / totalDur) * 100, Math.min((s.duration / slowest) * 8, 15))
                    : Math.max((s.duration / slowest) * 100, 0.5);
                  const clickHandler = () => onNavigate(scenarioUrl(s));
                  const barWidth = sortBy === 'time' ? width : Math.max((s.duration / slowest) * 100, 3);
                  const nameColor = s.outcome !== 'SUCCESS' ? 'color:var(--color-' + outcomeClass(s.outcome) + ')' : '';
                  return html`
                    <div class="timeline-row" style="position:absolute;top:0;left:0;width:100%;height:${rowHeight}px;transform:translateY(${virtualRow.start}px);display:flex;flex-direction:column;justify-content:center;padding:4px var(--space-sm);border-bottom:1px solid var(--divider);cursor:pointer"
                         onClick=${clickHandler}
                         title="Started: ${new Date(s.startedAt).toLocaleTimeString()} • Duration: ${formatDuration(s.duration)}">
                      <div style="display:flex;align-items:center;gap:6px;overflow:hidden">
                        <span class="scenario-outcome-icon ${outcomeClass(s.outcome)}" style="width:18px;height:18px;font-size:var(--font-xs);flex-shrink:0">${outcomeIcon(s.outcome)}</span>
                        <span style="font-size:var(--font-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;${nameColor}">${s.category} › ${s.name}</span>
                        <span style="font-size:var(--font-xs);${s.outcome !== 'SUCCESS' ? 'color:var(--color-' + outcomeClass(s.outcome) + ')' : 'color:var(--text-secondary)'};font-family:var(--font-mono);white-space:nowrap;flex-shrink:0">${formatDuration(s.duration)}</span>
                      </div>
                      <div style="height:10px;margin-left:24px;margin-top:2px;position:relative">
                        <div style="position:absolute;left:${left}%;width:${barWidth}%;height:100%;border-radius:3px;background:var(--color-${outcomeClass(s.outcome)});opacity:0.85"></div>
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // ===== Test Runs View =====
    function TestRunsView({ onNavigate }) {
      const runs = [...DATA.history].reverse();
      return html`
        <div class="card">
          <div class="card-title">Test Run History</div>
          <div class="scenario-list">
            ${runs.map((run) => {
              const originalIndex = DATA.history.indexOf(run);
              return html`
              <div class="scenario-item" onClick=${() => onNavigate('/tests?run=' + originalIndex)} style="cursor:pointer">
                <div class="scenario-outcome-icon passed" style="background:var(--accent-light);color:var(--text-primary)">
                  #
                </div>
                <div class="scenario-info">
                  <div class="scenario-name">${run.label}</div>
                  <div class="scenario-meta">
                    <span>${new Date(run.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>${formatDuration(run.duration)}</span>
                    ${run.ciJobUrl ? html`<span>•</span><a href=${run.ciJobUrl} target="_blank" rel="noopener" onClick=${(e) => e.stopPropagation()} style="color:var(--accent);text-decoration:none;display:inline-flex;align-items:center;gap:3px" class="ci-link" title="View CI job"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>CI</a>` : null}
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
                  <span style="font-size:var(--font-md);font-weight:600;color:var(--color-passed)">${Math.round((run.outcomes.passed / Object.values(run.outcomes).reduce((a, b) => a + b, 0)) * 100)}%</span>
                  <span style="font-size:var(--font-xs);color:var(--text-secondary)">${Object.values(run.outcomes).reduce((a, b) => a + b, 0)} scenarios</span>
                </div>
              </div>
            `;
            })}
          </div>
        </div>
      `;
    }

    // ===== App Component =====
    function App() {
      const [theme, setTheme] = useState(initTheme);
      const [route, setRoute] = useState(getRoute);
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('serenity-sidebar-collapsed') === 'true');

      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('serenity-theme', theme);
      }, [theme]);

      useEffect(() => {
        const onHash = () => setRoute(getRoute());
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
      }, []);

      const navigate = useCallback((path) => {
        window.location.hash = '#' + path;
      }, []);

      const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
      const toggleSidebar = () => setSidebarCollapsed(c => { const next = !c; localStorage.setItem('serenity-sidebar-collapsed', String(next)); return next; });

      // Route matching
      let view;
      let pageTitle = 'Dashboard';

      if (route === '/' || route === '') {
        view = html`<${DashboardView} onNavigate=${navigate} />`;
        pageTitle = DATA.summary.title;
      } else if (route === '/tests') {
        view = html`<${ScenariosView} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Test Scenarios';
      } else if (route.startsWith('/tests?')) {
        view = html`<${ScenariosView} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Test Scenarios';
      } else if (route.startsWith('/tests/')) {
        const id = route.split('/tests/')[1];
        view = html`<${ScenarioDetailView} scenarioId=${id} onNavigate=${navigate} />`;
        pageTitle = 'Test Scenario';
      } else if (route === '/tags') {
        view = html`<${TagsView} onNavigate=${navigate} />`;
        pageTitle = 'Tags';
      } else if (route === '/test-runs') {
        view = html`<${TestRunsView} onNavigate=${navigate} />`;
        pageTitle = 'Test Runs';
      } else if (route === '/errors' || route.startsWith('/errors?')) {
        view = html`<${ErrorsView} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Errors';
      } else if (route === '/stability') {
        view = html`<${FlakyView} onNavigate=${navigate} />`;
        pageTitle = 'Stability';
      } else if (route === '/requirements') {
        view = html`<${RequirementsPageView} onNavigate=${navigate} />`;
        pageTitle = 'Requirements';
      } else if (route === '/timeline') {
        view = html`<${TimelineView} onNavigate=${navigate} />`;
        pageTitle = 'Timeline';
      } else if (route === '/system') {
        view = html`<${SystemContextView} />`;
        pageTitle = 'System Context';
      } else {
        view = html`<div class="card"><p>Page not found.</p></div>`;
        pageTitle = 'Not Found';
      }

      return html`
        <div class="sidebar-overlay ${sidebarOpen ? 'visible' : ''}" onClick=${() => setSidebarOpen(false)}></div>
        <${Sidebar} route=${route} sidebarOpen=${sidebarOpen} collapsed=${sidebarCollapsed}
                    onNavigate=${navigate} onClose=${() => setSidebarOpen(false)} onToggleCollapse=${toggleSidebar} />
        <main class="main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}"
              style="margin-left:${sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'}">
          <div class="topbar">
            <div class="topbar-left">
              <button class="btn-icon hamburger" onClick=${() => setSidebarOpen(true)} aria-label="Open menu">
                ${icons.menu}
              </button>
              <div>
                <div class="topbar-title">${pageTitle}</div>
                <div class="topbar-subtitle">${DATA.summary.testRunner} • ${new Date(DATA.summary.finishedAt).toLocaleDateString()} ${new Date(DATA.summary.finishedAt).toLocaleTimeString()}</div>
              </div>
            </div>
            <div class="topbar-actions">
              <button class="btn-icon" onClick=${toggleTheme} aria-label="Toggle theme">
                ${theme === 'light' ? icons.moon : icons.sun}
              </button>
            </div>
          </div>
          ${view}
        </main>
      `;
    }

    // ===== Mount =====
    render(html`<${App} />`, document.getElementById('app'));
