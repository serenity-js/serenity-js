import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { resolveRoute, routes } from '../../router';
import { DATA, formatTimestamp, totalFailedCount, useHashHistory } from '../../utils';
import { icons } from './icons';
import { Sidebar } from './Sidebar';

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
        const failures = totalFailedCount(DATA.summary.outcomes);
        document.title = `${ DATA.summary.title } | Serenity/JS (${ failures === 0 ? '✓' : failures })`;
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

    // Route resolution: match route string to a route definition
    const effectiveRoute = route === '' ? '/' : route;
    const match = resolveRoute(effectiveRoute, routes);

    let view;
    let pageTitle: string;
    let viewTestId: string;

    if (match) {
        const viewData = match.definition.data(DATA, match.params);
        const ViewComponent = match.definition.view;
        view = html`<${ViewComponent} ...${viewData} onNavigate=${navigate} />`;
        pageTitle = typeof match.definition.title === 'function'
            ? match.definition.title(DATA)
            : match.definition.title;
        // Derive testid from route pattern: '/' → 'dashboard', '/tests/:id' → 'tests', '/test-runs' → 'test-runs'
        const patternPath = match.definition.pattern.replace(/\/:.+$/, '');
        viewTestId = patternPath === '/' ? 'dashboard' : patternPath.slice(1);
    } else {
        view = html`<div class="card"><p>Page not found.</p></div>`;
        pageTitle = 'Not Found';
        viewTestId = 'not-found';
    }

    return html`
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="sidebar-overlay ${sidebarOpen ? 'visible' : ''}" onClick=${() => setSidebarOpen(false)}></div>
    <${Sidebar} route=${effectiveRoute} sidebarOpen=${sidebarOpen} collapsed=${sidebarCollapsed}
                routes=${routes}
                failedBadgeCount=${totalFailedCount(DATA.summary.outcomes)}
                onNavigate=${navigate} onClose=${() => setSidebarOpen(false)} onToggleCollapse=${toggleSidebar}
                theme=${themePreference} onSetTheme=${setThemePreference} />
    <main id="main-content" class="main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}"
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
