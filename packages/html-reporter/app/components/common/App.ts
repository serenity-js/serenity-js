import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import type { RouteMatch } from '../../router/index.js';
import { resolveRoute, routes } from '../../router/index.js';
import { DATA } from '../../utils/data.js';
import { formatTimestamp, totalFailedCount, useHashHistory } from '../../utils/index.js';
import { icons } from './icons.js';
import { Sidebar } from './Sidebar.js';

const html = htm.bind(h);

function initThemePreference(): string {
    return localStorage.getItem('serenity-theme') || 'system';
}

function resolveTheme(preference: string): string {
    if (preference === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preference;
}

interface ResolvedView {
    view: ReturnType<typeof html>;
    pageTitle: string;
    viewTestId: string;
}

function resolveView(effectiveRoute: string, navigate: (path: string) => void): ResolvedView {
    const match: RouteMatch | undefined = resolveRoute(effectiveRoute, routes);

    if (!match) {
        return {
            view: html`<div class="card">
                <h2>Page Not Found</h2>
                <p>The requested page does not exist.</p>
                <a href="#/" class="view-all-link" onClick=${(e: Event) => { e.preventDefault(); navigate('/'); }}>Go to Dashboard →</a>
            </div>`,
            pageTitle: 'Not Found',
            viewTestId: 'not-found',
        };
    }

    const viewData = match.definition.data(DATA, match.params);
    const ViewComponent = match.definition.view;
    const view = html`<${ViewComponent} ...${viewData} onNavigate=${navigate} />`;

    const pageTitle = typeof match.definition.title === 'function'
        ? match.definition.title(DATA)
        : match.definition.title;

    // Derive testid from route pattern: '/' → 'dashboard', '/tests/:id' → 'tests', '/test-runs' → 'test-runs'
    const patternPath = match.definition.pattern.replace(/\/:.+$/, '');
    const viewTestId = patternPath === '/' ? 'dashboard' : patternPath.slice(1);

    return { view, pageTitle, viewTestId };
}

export function App(): ReturnType<typeof html> {
    const hashNav = useHashHistory();
    const [themePreference, setThemePreference] = useState(initThemePreference);
    const [route, setRoute] = useState(() => hashNav.getRoute());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('serenity-sidebar-collapsed') === 'true');

    useEffect(() => {
        const resolved = resolveTheme(themePreference);
        document.documentElement.setAttribute('data-theme', resolved);
        if (themePreference === 'system') {
            localStorage.removeItem('serenity-theme');
        } else {
            localStorage.setItem('serenity-theme', themePreference);
        }
    }, [themePreference]);

    // Listen for system theme changes when preference is 'system'
    useEffect(() => {
        if (themePreference !== 'system') return undefined;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => document.documentElement.setAttribute('data-theme', media.matches ? 'dark' : 'light');
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, [themePreference]);

    useEffect(() => {
        const title = DATA.summary.title || 'Serenity/JS Report';
        const failures = totalFailedCount(DATA.summary.outcomes);
        document.title = `${ title } | Serenity/JS (${ failures === 0 ? '✓' : failures })`;
    }, []);

    useEffect(() => {
        const onHash = () => setRoute(hashNav.getRoute());
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

    const toggleSidebar = () => setSidebarCollapsed(c => { const next = !c; localStorage.setItem('serenity-sidebar-collapsed', String(next)); return next; });

    const effectiveRoute = route === '' ? '/' : route;
    const { view, pageTitle, viewTestId } = resolveView(effectiveRoute, navigate);
    const routeMatched = !!resolveRoute(effectiveRoute, routes);

    return html`
    <a class="skip-link" href="#main-content" onClick=${(e: Event) => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    <div class="sidebar-overlay ${sidebarOpen ? 'visible' : ''}" onClick=${() => setSidebarOpen(false)}></div>
    <${Sidebar} route=${effectiveRoute} sidebarOpen=${sidebarOpen} collapsed=${sidebarCollapsed}
                routes=${routes} routeMatched=${routeMatched}
                failedBadgeCount=${totalFailedCount(DATA.summary.outcomes)}
                onNavigate=${navigate} onClose=${() => setSidebarOpen(false)} onToggleCollapse=${toggleSidebar}
                theme=${themePreference} onSetTheme=${setThemePreference} />
    <main id="main-content" tabindex="-1" class="main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}"
          data-testid="${viewTestId}"
          style="margin-left:${sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'}">
      <div class="topbar">
        <div class="topbar-left">
          <button class="btn-icon hamburger" onClick=${() => setSidebarOpen(true)} aria-label="Open menu">
            ${icons.menu}
          </button>
          <div>
            <h1 class="topbar-title">${pageTitle}</h1>
            <div class="topbar-subtitle" title="${DATA.summary.finishedAt}">${formatTimestamp(DATA.summary.finishedAt)}</div>
          </div>
        </div>
      </div>
      ${view}
    </main>
  `;
}
