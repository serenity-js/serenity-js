import {
    AboutView,
    CapabilitiesView,
    ConsistencyView,
    DashboardView,
    ErrorsView,
    Navigation,
    ScenarioDetailView,
    ScenariosView,
    SystemContextView,
    TagsView,
    TestRunsView,
    TimelineView,
} from '@serenity-js/html-reporter/serenity';
import { useFixtures } from '@serenity-js/playwright-test';
import { By, PageElement } from '@serenity-js/web';

interface TestFixtures {
    navigation: Navigation;
    aboutView: AboutView<unknown>;
    capabilitiesView: CapabilitiesView<unknown>;
    consistencyView: ConsistencyView<unknown>;
    dashboardView: DashboardView<unknown>;
    errorsView: ErrorsView<unknown>;
    expected: {
        scenarios: {
            maxVisibleRows: number;
        }
    }
    scenarioDetailView: ScenarioDetailView<unknown>;
    scenariosView: ScenariosView<unknown>;
    systemContextView: SystemContextView<unknown>;
    tagsView: TagsView<unknown>;
    testRunsView: TestRunsView<unknown>;
    timelineView: TimelineView<unknown>;
}

interface WorkerFixtures {

}

export const {
    describe,
    expect,
    it,
    test,
    beforeEach,
    afterEach,
} = useFixtures<TestFixtures, WorkerFixtures>({
    page: async ({ page }, use) => {
        await page.goto('/index.html');
        await use(page);
    },

    navigation: async ({ }, use) => {
        await use(new Navigation());
    },

    aboutView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="about"]')).describedAs('about view');
        await use(new AboutView(rootElement, navigation));
    },

    capabilitiesView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="capabilities"]')).describedAs('capabilities view');
        await use(new CapabilitiesView(rootElement, navigation));
    },

    consistencyView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="consistency"]')).describedAs('consistency view');
        await use(new ConsistencyView(rootElement, navigation));
    },

    dashboardView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="dashboard"]')).describedAs('dashboard view');
        await use(new DashboardView(rootElement, navigation));
    },

    errorsView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="errors"]')).describedAs('errors view');
        await use(new ErrorsView(rootElement, navigation));
    },

    expected: async ({ }, use, info) => {
        const maxVisibleRows: Record<string, number> = {
            desktop: 17,
            tablet: 15,
            mobile: 16,
        };

        await use({
            scenarios: {
                maxVisibleRows: maxVisibleRows[info.project.name] ?? 15,
            },
        });
    },

    scenarioDetailView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="tests"]')).describedAs('scenario detail view');
        await use(new ScenarioDetailView(rootElement, navigation));
    },

    scenariosView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="tests"]')).describedAs('scenarios view');
        await use(new ScenariosView(rootElement, navigation));
    },

    systemContextView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="system"]')).describedAs('system context view');
        await use(new SystemContextView(rootElement, navigation));
    },

    tagsView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="tags"]')).describedAs('tags view');
        await use(new TagsView(rootElement, navigation));
    },

    testRunsView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="test-runs"]')).describedAs('test runs view');
        await use(new TestRunsView(rootElement, navigation));
    },

    timelineView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="timeline"]')).describedAs('timeline view');
        await use(new TimelineView(rootElement, navigation));
    },
});
