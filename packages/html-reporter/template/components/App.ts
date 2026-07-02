import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { DATA, formatTimestamp, hashHistory, totalFailedCount } from '../utils';
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

export function App(): ReturnType<typeof html> {
    const [theme, setTheme] = useState(initTheme);
    const [route, setRoute] = useState(hashHistory.getRoute);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('serenity-sidebar-collapsed') === 'true');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('serenity-theme', theme);
    }, [theme]);

    useEffect(() => {
        const failures = totalFailedCount(DATA.summary.outcomes);
        document.title = `${ DATA.summary.title } | Serenity/JS (${ failures === 0 ? '✓' : failures })`;
    }, []);

    useEffect(() => {
        const onHash = () => setRoute(hashHistory.getRoute());
        window.addEventListener('hashchange', onHash);
        window.addEventListener('popstate', onHash);
        return () => {
            window.removeEventListener('hashchange', onHash);
            window.removeEventListener('popstate', onHash);
        };
    }, []);

    const navigate = useCallback((path: string) => {
        window.location.hash = '#' + path;
    }, []);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    const toggleSidebar = () => setSidebarCollapsed(c => { const next = !c; localStorage.setItem('serenity-sidebar-collapsed', String(next)); return next; });

    let view;
    let pageTitle = 'Dashboard';
    const specDirectory = DATA.capabilities?.name;

    if (route === '/' || route === '') {
        view = html`<${DashboardView}
            summary=${DATA.summary}
            history=${DATA.history}
            scenarios=${DATA.scenarios}
            newFailures=${DATA.newFailures || []}
            newPasses=${DATA.newPasses || []}
            inconsistentTests=${DATA.inconsistentTests || []}
            capabilities=${DATA.capabilities}
            systemContext=${DATA.systemContext}
            onNavigate=${navigate}
        />`;
        pageTitle = DATA.summary.title;
    } else if (route === '/tests') {
        view = html`<${ScenariosView} scenarios=${DATA.scenarios} history=${DATA.history} summary=${DATA.summary} specDirectory=${specDirectory} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Test Scenarios';
    } else if (route.startsWith('/tests?')) {
        view = html`<${ScenariosView} scenarios=${DATA.scenarios} history=${DATA.history} summary=${DATA.summary} specDirectory=${specDirectory} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Test Scenarios';
    } else if (route.startsWith('/tests/')) {
        const id = route.split('/tests/')[1];
        view = html`<${ScenarioDetailView} scenarios=${DATA.scenarios} history=${DATA.history} specDirectory=${specDirectory} scenarioId=${id} onNavigate=${navigate} />`;
        pageTitle = 'Test Scenario';
    } else if (route === '/tags') {
        view = html`<${TagsView} tags=${DATA.tags} onNavigate=${navigate} />`;
        pageTitle = 'Tags';
    } else if (route === '/test-runs') {
        view = html`<${TestRunsView} history=${DATA.history} onNavigate=${navigate} />`;
        pageTitle = 'Test Runs';
    } else if (route === '/errors' || route.startsWith('/errors?')) {
        view = html`<${ErrorsView} scenarios=${DATA.scenarios} history=${DATA.history} specDirectory=${specDirectory} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Errors';
    } else if (route === '/consistency') {
        view = html`<${ConsistencyView} inconsistentTests=${DATA.inconsistentTests || []} specDirectory=${specDirectory} onNavigate=${navigate} />`;
        pageTitle = 'Consistency';
    } else if (route === '/capabilities' || route.startsWith('/capabilities?')) {
        view = html`<${CapabilitiesView} capabilities=${DATA.capabilities} onNavigate=${navigate} route=${route} />`;
        pageTitle = 'Capabilities';
    } else if (route === '/timeline') {
        view = html`<${TimelineView} scenarios=${DATA.scenarios} summary=${DATA.summary} onNavigate=${navigate} />`;
        pageTitle = 'Timeline';
    } else if (route === '/system') {
        view = html`<${SystemContextView} systemContext=${DATA.systemContext} />`;
        pageTitle = 'System Context';
    } else if (route === '/about') {
        view = html`<${AboutView} />`;
        pageTitle = 'About this report';
    } else {
        view = html`<div class="card"><p>Page not found.</p></div>`;
        pageTitle = 'Not Found';
    }

    return html`
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="sidebar-overlay ${sidebarOpen ? 'visible' : ''}" onClick=${() => setSidebarOpen(false)}></div>
    <${Sidebar} route=${route} sidebarOpen=${sidebarOpen} collapsed=${sidebarCollapsed}
                failedBadgeCount=${totalFailedCount(DATA.summary.outcomes)}
                onNavigate=${navigate} onClose=${() => setSidebarOpen(false)} onToggleCollapse=${toggleSidebar} />
    <main id="main-content" class="main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}"
          style="margin-left:${sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'}">
      <div class="topbar">
        <div class="topbar-left">
          <button class="btn-icon hamburger" onClick=${() => setSidebarOpen(true)} aria-label="Open menu">
            ${icons.menu}
          </button>
          <div>
            <h1 class="topbar-title">${pageTitle}</h1>
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
