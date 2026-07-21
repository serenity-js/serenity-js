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

export const routes: RouteDefinition[] = [
    {
        pattern: '/',
        title: (data: ReportData) => data.summary.title,
        view: DashboardView as unknown as RouteDefinition['view'],
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
        view: ScenarioDetailView as unknown as RouteDefinition['view'],
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            specDirectory: data.specDirectory,
            scenarioId: params.segment + (params.query.toString() ? '?' + params.query.toString() : ''),
        }),
    },
    {
        pattern: '/tests',
        title: 'Test Scenarios',
        view: ScenariosView as unknown as RouteDefinition['view'],
        icon: 'testScenarios',
        navLabel: 'Test Scenarios',
        badge: (data: ReportData) => totalFailedCount(data.summary.outcomes),
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            summary: data.summary,
            specDirectory: data.specDirectory,
            route: params.path + (params.query.toString() ? '?' + params.query.toString() : ''),
        }),
    },
    {
        pattern: '/capabilities',
        title: 'Capabilities',
        view: CapabilitiesView as unknown as RouteDefinition['view'],
        icon: 'completeness',
        navLabel: 'Capabilities',
        data: (data, params) => ({
            capabilities: data.capabilities,
            route: params.path + (params.query.toString() ? '?' + params.query.toString() : ''),
        }),
    },
    {
        pattern: '/errors',
        title: 'Errors',
        view: ErrorsView as unknown as RouteDefinition['view'],
        icon: 'errors',
        navLabel: 'Errors',
        data: (data, params) => ({
            scenarios: data.scenarios,
            history: data.history,
            specDirectory: data.specDirectory,
            route: params.path + (params.query.toString() ? '?' + params.query.toString() : ''),
        }),
    },
    {
        pattern: '/consistency',
        title: 'Consistency',
        view: ConsistencyView as unknown as RouteDefinition['view'],
        icon: 'unstable',
        navLabel: 'Consistency',
        data: (data) => ({
            inconsistentTests: data.inconsistentTests || [],
            specDirectory: data.specDirectory,
        }),
    },
    {
        pattern: '/timeline',
        title: 'Timeline',
        view: TimelineView as unknown as RouteDefinition['view'],
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
        view: TagsView as unknown as RouteDefinition['view'],
        icon: 'tags',
        navLabel: 'Tags',
        data: (data) => ({ tags: data.tags }),
    },
    {
        pattern: '/test-runs',
        title: 'Test Runs',
        view: TestRunsView as unknown as RouteDefinition['view'],
        icon: 'testRuns',
        navLabel: 'Test Runs',
        data: (data) => ({ history: data.history }),
    },
    {
        pattern: '/system',
        title: 'System Context',
        view: SystemContextView as unknown as RouteDefinition['view'],
        icon: 'system',
        navLabel: 'System Context',
        data: (data) => ({ systemContext: data.systemContext }),
    },
    {
        pattern: '/about',
        title: 'About This Report',
        view: AboutView as unknown as RouteDefinition['view'],
        icon: 'info',
        navLabel: 'About This Report',
        data: () => ({}),
    },
];
