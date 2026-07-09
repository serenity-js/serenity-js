import { useFixtures } from '@serenity-js/playwright-test';
import { By, PageElement } from '@serenity-js/web';

import { Navigation } from './app';
import { ConsistencyView } from './consistency';
import { DashboardView } from './dashboard';
import { ErrorsView } from './errors';
import { TimelineView } from './timeline';

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
        const navigation = new Navigation();
        await use(navigation);
    },

    consistencyView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="consistency"]')).describedAs('consistency view');
        const consistencyView = new ConsistencyView(rootElement, navigation);
        await use(consistencyView);
    },

    dashboardView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="dashboard"]')).describedAs('dashboard view');
        const dashboardView = new DashboardView(rootElement, navigation);
        await use(dashboardView);
    },

    timelineView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="timeline"]')).describedAs('timeline view');
        const timelineView = new TimelineView(rootElement, navigation);
        await use(timelineView);
    },

    errorsView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="errors"]')).describedAs('errors view');
        const errorsView = new ErrorsView(rootElement, navigation);
        await use(errorsView);
    },
});
