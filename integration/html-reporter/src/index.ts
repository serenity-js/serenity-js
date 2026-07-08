import { useFixtures } from '@serenity-js/playwright-test';
import { By, PageElement } from '@serenity-js/web';

import { Navigation } from './app';
import { ConsistencyView } from './consistency';

interface TestFixtures {
    navigation: Navigation;
    consistencyView: ConsistencyView<unknown>;
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
});
