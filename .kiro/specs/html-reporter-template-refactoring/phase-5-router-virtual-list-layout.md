# Phase 5: Router, Virtual List Abstraction, and Layout Configuration

## Goal

Introduce three simplifying abstractions that make the template codebase production-ready and approachable for community contributors:

1. **Route Table** — a single declarative source of truth for all routes, replacing the if/else chain in `App.ts` and the duplicated nav items in `Sidebar.ts`
2. **`GroupedVirtualList` component** — a reusable component that encapsulates all virtualisation + sticky header boilerplate, eliminating ~150 lines of duplicated structural code across 3 views
3. **Layout configuration** — extract scattered pixel-height constants into a shared config

## Precondition

Phases 1–4 are complete. Components are typed, extracted, and receive data as props.

## Entry Criteria

- `npx tsc --project template/tsconfig.json --noEmit` passes
- `npx playwright test --project=unit` passes
- `node packages/html-reporter/scripts/bundle-template.mjs` succeeds

---

## Change 1: Route Table and Resolver

### Problem

Route knowledge is scattered across three places:
- `App.ts` — 13-branch if/else chain matching URLs to views and data
- `Sidebar.ts` — duplicated `navItems` array defining paths, labels, icons
- Individual views — each parses `route` string and `URLSearchParams` internally

### Solution

Define routes declaratively in a single table. A resolver matches the current URL to a route definition and extracts parameters.

### New Files

#### `template/router/RouteDefinition.ts`

```typescript
import type { ReportData } from '../../src/ReportData';

export interface RouteParams {
    /** Full path portion of the hash route (before '?') */
    path: string;
    /** Parsed query parameters from the hash route */
    query: URLSearchParams;
    /** Captured dynamic segment (e.g. the scenario ID from /tests/:id) */
    segment?: string;
}

export interface RouteDefinition {
    /**
     * URL pattern to match.
     * - Exact: '/tags'
     * - With query: '/tests' (also matches '/tests?filter=failed')
     * - Dynamic segment: '/tests/:id' (captures everything after '/tests/')
     */
    pattern: string;

    /** Page title. String or function for dynamic titles. */
    title: string | ((data: ReportData) => string);

    /** The view component to render for this route. */
    view: (props: Record<string, unknown>) => ReturnType<typeof html>;

    /** Icon key from icons.ts for the sidebar navigation. */
    icon?: string;

    /** Label for the sidebar navigation. Omit to hide from nav. */
    navLabel?: string;

    /** Badge count for the sidebar navigation item. */
    badge?: (data: ReportData) => number;

    /**
     * Selects the data subset this view needs from the full ReportData.
     * Returns the props object that will be spread onto the view component.
     */
    data: (data: ReportData, params: RouteParams) => Record<string, unknown>;
}
```

#### `template/router/resolveRoute.ts`

```typescript
import type { RouteDefinition, RouteParams } from './RouteDefinition';

export interface RouteMatch {
    definition: RouteDefinition;
    params: RouteParams;
}

/**
 * Matches a hash route string against the route table.
 * Returns the first matching route definition and its extracted parameters.
 *
 * Matching rules:
 * - Exact match: '/tags' matches only '/tags'
 * - Query match: '/tests' matches '/tests' and '/tests?filter=failed'
 * - Dynamic segment: '/tests/:id' matches '/tests/anything-here' and captures the segment
 *
 * The route table is evaluated in order — put more specific patterns before general ones.
 */
export function resolveRoute(route: string, routes: RouteDefinition[]): RouteMatch | undefined {
    const path = route.includes('?') ? route.split('?')[0] : route;
    const query = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : new URLSearchParams();

    for (const definition of routes) {
        const pattern = definition.pattern;

        if (pattern.includes(':')) {
            // Dynamic segment pattern: '/tests/:id'
            const prefix = pattern.split(':')[0]; // '/tests/'
            if (path.startsWith(prefix) && path.length > prefix.length) {
                const segment = path.slice(prefix.length);
                return { definition, params: { path, query, segment } };
            }
        } else {
            // Exact or prefix match
            if (path === pattern || path === pattern + '/') {
                return { definition, params: { path, query } };
            }
        }
    }

    return undefined;
}
```

#### `template/router/routes.ts`

The single source of truth. One entry per view:

```typescript
import type { ReportData } from '../../src/ReportData';
import type { RouteDefinition } from './RouteDefinition';
import { totalFailedCount } from '../utils';

// Import all views
import { DashboardView } from '../components/views/DashboardView';
import { ScenariosView } from '../components/views/ScenariosView';
// ... etc

export const routes: RouteDefinition[] = [
    {
        pattern: '/',
        title: (data) => data.summary.title,
        view: DashboardView,
        icon: 'dashboard',
        navLabel: 'Dashboard',
        data: (data) => ({
            summary: data.summary,
            history: data.history,
            scenarios: data.scenarios,
            newFailures: data.newFailures || [],
            newPasses: data.newPasses || [],
            inconsistentTests: data.inconsistentTests || [],
            capabilities: data.capabilities,
            systemContext: data.systemContext,
        }),
    },
    {
        pattern: '/tests/:id',
        title: 'Test Scenario',
        view: ScenarioDetailView,
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            specDirectory: data.capabilities?.name,
            scenarioId: params.segment,
        }),
    },
    {
        pattern: '/tests',
        title: 'Test Scenarios',
        view: ScenariosView,
        icon: 'testScenarios',
        navLabel: 'Test Scenarios',
        badge: (data) => totalFailedCount(data.summary.outcomes),
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            summary: data.summary,
            specDirectory: data.capabilities?.name,
            query: params.query,
        }),
    },
    {
        pattern: '/capabilities',
        title: 'Capabilities',
        view: CapabilitiesView,
        icon: 'completeness',
        navLabel: 'Capabilities',
        data: (data, params) => ({
            capabilities: data.capabilities,
            query: params.query,
        }),
    },
    {
        pattern: '/errors',
        title: 'Errors',
        view: ErrorsView,
        icon: 'errors',
        navLabel: 'Errors',
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            specDirectory: data.capabilities?.name,
            query: params.query,
        }),
    },
    {
        pattern: '/consistency',
        title: 'Consistency',
        view: ConsistencyView,
        icon: 'unstable',
        navLabel: 'Consistency',
        data: (data) => ({
            inconsistentTests: data.inconsistentTests || [],
            specDirectory: data.capabilities?.name,
        }),
    },
    {
        pattern: '/timeline',
        title: 'Timeline',
        view: TimelineView,
        icon: 'timeline',
        navLabel: 'Timeline',
        data: (data) => ({
            scenarios: data.scenarios,
            summary: data.summary,
        }),
    },
    {
        pattern: '/tags',
        title: 'Tags',
        view: TagsView,
        icon: 'tags',
        navLabel: 'Tags',
        data: (data) => ({ tags: data.tags }),
    },
    {
        pattern: '/test-runs',
        title: 'Test Runs',
        view: TestRunsView,
        icon: 'testRuns',
        navLabel: 'Test Runs',
        data: (data) => ({ history: data.history }),
    },
    {
        pattern: '/system',
        title: 'System Context',
        view: SystemContextView,
        icon: 'system',
        navLabel: 'System Context',
        data: (data) => ({ systemContext: data.systemContext }),
    },
    {
        pattern: '/about',
        title: 'About This Report',
        view: AboutView,
        icon: 'info',
        navLabel: 'About This Report',
        data: () => ({}),
    },
];
```

#### `template/router/index.ts`

```typescript
export type { RouteDefinition, RouteMatch, RouteParams } from './RouteDefinition';
export { resolveRoute } from './resolveRoute';
export { routes } from './routes';
```

### Changes to `App.ts`

Replace the if/else chain with:

```typescript
import { resolveRoute, routes } from '../router';

const match = resolveRoute(route, routes);
const viewData = match
    ? match.definition.data(DATA, match.params)
    : {};
const view = match
    ? html`<${match.definition.view} ...${viewData} onNavigate=${navigate} />`
    : html`<div class="card"><p>Page not found.</p></div>`;
const pageTitle = match
    ? (typeof match.definition.title === 'function' ? match.definition.title(DATA) : match.definition.title)
    : 'Not Found';
```

### Changes to `Sidebar.ts`

Derive nav items from the route table instead of a hardcoded array:

```typescript
interface SidebarProps {
    route: string;
    routes: RouteDefinition[];  // passed from App
    failedBadgeCount: number;
    // ...
}

// Inside:
const navItems = routes.filter(r => r.navLabel);
```

### Changes to Views

Views no longer receive `route: string` and parse it themselves. Instead they receive `query: URLSearchParams` (already parsed by the router):

**Before:**
```typescript
export function ScenariosView({ scenarios, history, summary, specDirectory, onNavigate, route }: ScenariosViewProps) {
    const params = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
    const filterFromUrl = params?.get('filter') || 'all';
```

**After:**
```typescript
export function ScenariosView({ scenarios, history, summary, specDirectory, onNavigate, query }: ScenariosViewProps) {
    const filterFromUrl = query.get('filter') || 'all';
```

### Integration with `HashHistory`

The `HashHistory` utility stays as-is. The router's `resolveRoute` is a pure function that takes a route string — it doesn't manage history. `App.ts` continues to use `useHashHistory()` for reading the current route and `navigate()` for pushing new ones. The router is just the **mapping** from URL → view.

---

## Change 2: `GroupedVirtualList` Component

### Problem

Three components (`VirtualScenarioList`, `ConsistencyView`, `ErrorsView`) duplicate ~50 lines of identical virtualisation boilerplate each:
- Height constants
- `flatItems` construction
- `headerIndices` computation
- `rangeExtractor` with sticky header logic
- `useVirtualizer` call
- `useStickyHeader` call
- Positioned container rendering with `getTotalSize()` / `getVirtualItems()`

### Solution

A generic `GroupedVirtualList` component that accepts items, a grouping function, row heights, and render functions.

### New File: `template/components/layout/GroupedVirtualList.ts`

```typescript
interface GroupedVirtualListProps<T> {
    /** Items to render */
    items: T[];

    /** Returns the group key for an item (for sticky headers). Omit for flat lists. */
    groupBy?: (item: T) => string;

    /** Pixel height of a single item row. Must match the CSS. */
    rowHeight: number;

    /** Renders a single item. */
    renderItem: (item: T, index: number) => ReturnType<typeof html>;

    /** Renders a group header. Receives the group key. */
    renderGroupHeader?: (group: string) => ReturnType<typeof html>;

    /** Shown when items array is empty. */
    renderEmpty?: () => ReturnType<typeof html>;

    /** Height of the first group header. Default: 62 */
    firstHeaderHeight?: number;

    /** Height of subsequent group headers. Default: 78 */
    headerHeight?: number;

    /** Number of items to render beyond the visible area. Default: 15 */
    overscan?: number;

    /** Unique ID for the sticky header DOM element. */
    id?: string;
}
```

The component encapsulates:
- Building the flat items array with group headers
- Computing header indices
- The `rangeExtractor` with sticky logic
- `useVirtualizer` call
- `useStickyHeader` call
- The positioned container rendering

### Usage After Refactoring

**VirtualScenarioList.ts** → becomes a thin wrapper or is deleted:

```typescript
<${GroupedVirtualList}
    items=${filtered}
    groupBy=${sort === 'category' ? (s) => s.category : undefined}
    rowHeight=${108}
    renderItem=${(scenario) => html`<${ScenarioRow} scenario=${scenario} ... />`}
    renderGroupHeader=${(category) => html`<span>${category}</span>`}
    renderEmpty=${() => html`<${EmptyState} />`}
    id="scenario-list"
/>
```

**ConsistencyView.ts** — no more virtualisation code:

```typescript
<${GroupedVirtualList}
    items=${filteredTests}
    groupBy=${sort === 'category' ? (t) => t.category : undefined}
    rowHeight=${88}
    renderItem=${(item) => html`<${ConsistencyRow} item=${item} onNavigate=${onNavigate} />`}
    id="consistency-list"
/>
```

**ErrorsView.ts** — same pattern:

```typescript
<${GroupedVirtualList}
    items=${errorItems}
    groupBy=${(item) => item.category}
    rowHeight=${108}
    renderItem=${(item) => html`<${ErrorRow} item=${item} onNavigate=${onNavigate} />`}
    id="error-list"
/>
```

### What Gets Extracted from Each View

- `ConsistencyView.ts` loses ~60 lines (height constants, flatItems, headerIndices, rangeExtractor, virtualizer, useStickyHeader, positioned container rendering)
- `ErrorsView.ts` loses ~50 lines (same pattern)
- `VirtualScenarioList.ts` either becomes a thin wrapper around `GroupedVirtualList` or is replaced entirely

### Row Components

Each view will need a dedicated row component for its render function:

- `ScenarioRow.ts` — already conceptually exists within `VirtualScenarioList`
- `ConsistencyRow.ts` — the item rendering currently inside `ConsistencyView`
- `ErrorRow.ts` — the item rendering currently inside `ErrorsView`

These are small (20–40 lines) pure components that receive one item and render it.

---

## Change 3: Layout Configuration

### Problem

Height constants are:
- Defined inside component function bodies (not even at module level)
- Duplicated with different names (`SCENARIO_ROW_HEIGHT`, `CONSISTENCY_ROW_HEIGHT`, `ERROR_ROW_HEIGHT`)
- Magic numbers with no documentation of what they measure

### Solution

With `GroupedVirtualList`, the constants become **props** passed at each call site. They no longer need a shared module — each view declares its row height in the `<GroupedVirtualList rowHeight=${108} />` call.

However, if the same height is used in multiple places (e.g., the `108` for scenario rows appears in both `ScenariosView` and `ErrorsView`), extract to a shared config:

### New File: `template/config/layout.ts`

```typescript
/**
 * Pixel heights for virtualised list rows.
 *
 * These values MUST match the rendered height produced by the CSS.
 * If you change row padding/font-size in styles.css, update these values.
 */
export const ROW_HEIGHTS = {
    /** Standard scenario row (name, tags, duration, source) */
    scenario: 108,
    /** Consistency view row (shorter — no source path) */
    consistency: 88,
    /** Error view row (same as scenario) */
    error: 108,
} as const;

/**
 * Group header heights for virtualised lists with sticky category headers.
 */
export const GROUP_HEADER_HEIGHTS = {
    /** First header (no top margin) */
    first: 62,
    /** Subsequent headers (with top separator) */
    rest: 78,
    /** Content area within the header (text only) */
    content: 46,
} as const;
```

---

## Implementation Order

1. **Route resolver** (`resolveRoute.ts`, `RouteDefinition.ts`) — pure logic, easy to test
2. **Route table** (`routes.ts`) — defines all routes declaratively
3. **Refactor `App.ts`** to use route table — replaces if/else
4. **Refactor `Sidebar.ts`** to derive nav from routes
5. **Remove `route` string prop** from views, replace with `query: URLSearchParams`
6. **`GroupedVirtualList` component** — implement with existing `useVirtualizer` + `useStickyHeader`
7. **Extract row components** (`ScenarioRow`, `ConsistencyRow`, `ErrorRow`)
8. **Refactor views** to use `GroupedVirtualList` — one view at a time
9. **Extract layout config** — move remaining constants to `config/layout.ts`

Do steps 1–5 as one unit (router), then steps 6–9 as a second unit (virtual list). Verify between each unit.

---

## What NOT to Change

- View rendering logic (what each row looks like)
- The `HashHistory` abstraction (it handles URL manipulation; the router handles URL→view mapping)
- The `useStickyHeader` and `useVirtualizer` hooks (they stay as lower-level primitives used by `GroupedVirtualList`)
- Data flow from Phase 3.1 (views still receive data as props from `App.ts`)
- Visual appearance of any view

---

## Directory Structure After

```
template/
├── router/
│   ├── RouteDefinition.ts
│   ├── resolveRoute.ts
│   ├── routes.ts
│   └── index.ts
├── config/
│   └── layout.ts
├── components/
│   ├── layout/
│   │   ├── App.ts
│   │   ├── Sidebar.ts
│   │   └── GroupedVirtualList.ts
│   ├── rows/
│   │   ├── ScenarioRow.ts
│   │   ├── ConsistencyRow.ts
│   │   └── ErrorRow.ts
│   ├── views/
│   │   ├── DashboardView.ts
│   │   ├── ScenariosView.ts
│   │   ├── ScenarioDetailView.ts
│   │   ├── CapabilitiesView.ts
│   │   ├── ConsistencyView.ts
│   │   ├── ErrorsView.ts
│   │   ├── TagsView.ts
│   │   ├── TestRunsView.ts
│   │   ├── TimelineView.ts
│   │   ├── SystemContextView.ts
│   │   └── AboutView.ts
│   ├── charts/
│   ├── scenario/
│   └── capabilities/
├── hooks/
├── utils/
└── app.tsx
```

---

## Testing Strategy

### Route resolver tests

**New file:** `packages/html-reporter/spec/components/router.spec.ts`

Test `resolveRoute()`:
- Exact match: `'/'` → Dashboard
- Query match: `'/tests?filter=failed'` → ScenariosView
- Dynamic segment: `'/tests/spec.ts%3A5'` → ScenarioDetailView with `segment = 'spec.ts%3A5'`
- Dynamic segment with query: `'/tests/spec.ts%3A5?run=2024-01-01'` → captures both
- No match: `'/nonexistent'` → returns `undefined`
- Order matters: `'/tests/:id'` before `'/tests'` catches detail routes

### GroupedVirtualList tests

Test via the existing component test infrastructure:
- Renders items flat when no `groupBy` provided
- Groups items and renders headers when `groupBy` provided
- Calls `renderItem` for each visible item
- Calls `renderGroupHeader` for each group
- Shows `renderEmpty` when items is empty

### Integration

- All existing view tests must continue to pass
- The report must render identically in the browser

---

## Verification

1. **Compile:**
   ```bash
   cd packages/html-reporter && npx tsc --project template/tsconfig.json --noEmit
   ```

2. **Bundle:**
   ```bash
   node packages/html-reporter/scripts/bundle-template.mjs
   ```

3. **Tests:**
   ```bash
   npx playwright test --project=unit
   npx playwright test --project=components
   ```

4. **No if/else routing in App.ts:**
   ```bash
   grep -c "} else if" packages/html-reporter/template/components/layout/App.ts
   ```
   Should return 0.

5. **No duplicated navItems in Sidebar:**
   ```bash
   grep -c "path:.*label:" packages/html-reporter/template/components/layout/Sidebar.ts
   ```
   Should return 0 (derived from route table, not hardcoded).

6. **No virtualisation boilerplate in views:**
   ```bash
   grep -l "defaultRangeExtractor\|useVirtualizer\|useStickyHeader" packages/html-reporter/template/components/views/*.ts
   ```
   Should return empty (all virtualisation lives in `GroupedVirtualList`).

7. **No height constants in views:**
   ```bash
   grep -rn "_HEIGHT" packages/html-reporter/template/components/views/
   ```
   Should return empty.

8. **Visual verification:** Report renders identically.

---

## Benefits for Contributors

| Before | After |
|--------|-------|
| Adding a view requires editing `App.ts` (if/else), `Sidebar.ts` (navItems), creating a component, and understanding routing | Add one entry to `routes.ts` and create one view component |
| Understanding the app requires reading 138 lines of `App.ts` | Read `routes.ts` — every route, its data, and its component in one table |
| Building a virtualised list requires understanding `rangeExtractor`, `useStickyHeader`, height constants, positioned containers | Use `<GroupedVirtualList items=${...} renderItem=${...} />` |
| Pixel heights are magic numbers in function bodies | Documented constants in `config/layout.ts` with CSS coupling noted |
| URL parameters parsed differently in every view | Router hands each view a pre-parsed `query: URLSearchParams` |

---

## Notes

- The route resolver is deliberately simple — no regex, no nested routes, no middleware. This is a static report, not a web application. Three matching rules (exact, prefix+query, dynamic segment) cover all cases.
- `GroupedVirtualList` uses generics (`<T>`) for item typing. The `renderItem` callback receives a typed item — no `any`.
- The router's `data` function receives the full `ReportData` and returns the view's props. This is the same pattern as Phase 3.1's explicit prop passing, just declarative instead of imperative.
- Keep `useVirtualizer` and `useStickyHeader` as lower-level hooks. `GroupedVirtualList` composes them — it doesn't replace them. If someone needs a custom virtualised layout (e.g., the timeline), they can still use the hooks directly.
