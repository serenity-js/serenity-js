import type { ReportData } from '../../src/cli/ReportData';
import { AboutView } from '../components/about/AboutView';
import { SystemContextView } from '../components/about/SystemContextView';
import { CapabilitiesView } from '../components/capabilities/CapabilitiesView';
import { ConsistencyView } from '../components/consistency/ConsistencyView';
import { DashboardView } from '../components/dashboard/DashboardView';
import { ErrorsView } from '../components/errors/ErrorsView';
import { ScenarioDetailView } from '../components/scenarios/ScenarioDetailView';
import { ScenariosView } from '../components/scenarios/ScenariosView';
import { TagsView } from '../components/tags/TagsView';
import { TestRunsView } from '../components/test-runs/TestRunsView';
import { TimelineView } from '../components/timeline/TimelineView';
import { totalFailedCount } from '../utils';
import type { RouteDefinition } from './RouteDefinition';
import { defineRoute, routeWithQuery } from './RouteDefinition';

export const routes: RouteDefinition[] = [
    defineRoute({
        pattern: '/',
        title: (data: ReportData) => data.summary.title,
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
    }),
    defineRoute({
        pattern: '/tests/:id',
        title: 'Test Scenario',
        view: ScenarioDetailView,
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            specDirectory: data.specDirectory,
            scenarioId: params.segment + (params.query.toString() ? '?' + params.query.toString() : ''),
        }),
    }),
    defineRoute({
        pattern: '/tests',
        title: 'Test Scenarios',
        view: ScenariosView,
        icon: 'testScenarios',
        navLabel: 'Test Scenarios',
        badge: (data: ReportData) => totalFailedCount(data.summary.outcomes),
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            summary: data.summary,
            specDirectory: data.specDirectory,
            route: routeWithQuery(params),
        }),
    }),
    defineRoute({
        pattern: '/capabilities',
        title: 'Capabilities',
        view: CapabilitiesView,
        icon: 'completeness',
        navLabel: 'Capabilities',
        data: (data, params) => ({
            capabilities: data.capabilities,
            route: routeWithQuery(params),
        }),
    }),
    defineRoute({
        pattern: '/errors',
        title: 'Errors',
        view: ErrorsView,
        icon: 'errors',
        navLabel: 'Errors',
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            specDirectory: data.specDirectory,
            route: routeWithQuery(params),
        }),
    }),
    defineRoute({
        pattern: '/consistency',
        title: 'Consistency',
        view: ConsistencyView,
        icon: 'unstable',
        navLabel: 'Consistency',
        data: (data) => ({
            inconsistentTests: data.inconsistentTests || [],
            specDirectory: data.specDirectory,
        }),
    }),
    defineRoute({
        pattern: '/timeline',
        title: 'Timeline',
        view: TimelineView,
        icon: 'timeline',
        navLabel: 'Timeline',
        data: (data) => ({
            scenarios: data.scenarios,
            summary: data.summary,
        }),
    }),
    defineRoute({
        pattern: '/tags',
        title: 'Tags',
        view: TagsView,
        icon: 'tags',
        navLabel: 'Tags',
        data: (data) => ({ tags: data.tags }),
    }),
    defineRoute({
        pattern: '/test-runs',
        title: 'Test Runs',
        view: TestRunsView,
        icon: 'testRuns',
        navLabel: 'Test Runs',
        data: (data) => ({ history: data.history }),
    }),
    defineRoute({
        pattern: '/system',
        title: 'System Context',
        view: SystemContextView,
        icon: 'system',
        navLabel: 'System Context',
        data: (data) => ({ systemContext: data.systemContext }),
    }),
    defineRoute({
        pattern: '/about',
        title: 'About This Report',
        view: AboutView,
        icon: 'info',
        navLabel: 'About This Report',
        data: () => ({}),
    }),
];
