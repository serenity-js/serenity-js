import { ConsistencyView, DashboardView, ErrorsView, Navigation, TimelineView } from '@serenity-js/html-reporter/serenity';
import { useFixtures } from '@serenity-js/playwright-test';
import { By, PageElement } from '@serenity-js/web';

interface TestFixtures {
    navigation: Navigation;
    dashboardView: DashboardView<unknown>;
    consistencyView: ConsistencyView<unknown>;
    timelineView: TimelineView<unknown>;
    errorsView: ErrorsView<unknown>;
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

    consistencyView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="consistency"]')).describedAs('consistency view');
        await use(new ConsistencyView(rootElement, navigation));
    },

    dashboardView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="dashboard"]')).describedAs('dashboard view');
        await use(new DashboardView(rootElement, navigation));
    },

    timelineView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="timeline"]')).describedAs('timeline view');
        await use(new TimelineView(rootElement, navigation));
    },

    errorsView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="errors"]')).describedAs('errors view');
        await use(new ErrorsView(rootElement, navigation));
    },
});
