/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { DATA, formatTimestamp } from '../utils';
import { AboutView } from './AboutView';
import { CapabilitiesView } from './CapabilitiesView';
import { ConsistencyView } from './ConsistencyView';
import { DashboardView } from './DashboardView';
import { ErrorsView } from './ErrorsView';
import { icons } from './icons';
import { ScenarioDetailView } from './ScenarioDetailView';
import { ScenariosView } from './ScenariosView';
import { Sidebar } from './Sidebar';
import { SystemContextView } from './SystemContextView';
import { TagsView } from './TagsView';
import { TestRunsView } from './TestRunsView';
import { TimelineView } from './TimelineView';

const html = htm.bind(h);

function initTheme() {
    const stored = localStorage.getItem('serenity-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getRoute() {
    const hash = window.location.hash || '#/';
    return hash.slice(1);
}

export function App() {
    const [theme, setTheme] = useState(initTheme);
    const [route, setRoute] = useState(getRoute);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('serenity-sidebar-collapsed') === 'true');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('serenity-theme', theme);
    }, [theme]);

    useEffect(() => {
        const failures = (DATA.summary.outcomes.failed || 0) + (DATA.summary.outcomes.error || 0) + (DATA.summary.outcomes.compromised || 0);
        document.title = `${ DATA.summary.title } | Serenity/JS (${ failures === 0 ? '✓' : failures })`;
    }, []);

    useEffect(() => {
        const onHash = () => setRoute(getRoute());
        window.addEventListener('hashchange', onHash);
        window.addEventListener('popstate', onHash);
        return () => {
            window.removeEventListener('hashchange', onHash);
            window.removeEventListener('popstate', onHash);
        };
    }, []);

    const navigate = useCallback((path) => {
        window.location.hash = '#' + path;
    }, []);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    const toggleSidebar = () => setSidebarCollapsed(c => { const next = !c; localStorage.setItem('serenity-sidebar-collapsed', String(next)); return next; });

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
    } else if (route === '/consistency') {
        view = html`<${ConsistencyView} onNavigate=${navigate} />`;
        pageTitle = 'Consistency';
    } else if (route === '/capabilities' || route.startsWith('/capabilities?')) {
        view = html`<${CapabilitiesView} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Capabilities';
    } else if (route === '/timeline') {
        view = html`<${TimelineView} onNavigate=${navigate} />`;
        pageTitle = 'Timeline';
    } else if (route === '/system') {
        view = html`<${SystemContextView} />`;
        pageTitle = 'System Context';
    } else if (route === '/about') {
        view = html`<${AboutView} />`;
        pageTitle = 'About this report';
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
            <div class="topbar-subtitle" title="${DATA.summary.finishedAt}">${DATA.summary.testRunner} • ${formatTimestamp(DATA.summary.finishedAt)}</div>
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
