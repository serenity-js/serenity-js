import type { InteractionObjectOptions } from '@serenity-js/html-reporter/serenity';
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
import { By, PageElement, Photographer, TakePhotosOfInteractions } from '@serenity-js/web';

interface TestFixtures {
    navigation: Navigation;
    aboutView: AboutView<unknown>;
    capabilitiesView: CapabilitiesView<unknown>;
    consistencyView: ConsistencyView<unknown>;
    dashboardView: DashboardView<unknown>;
    errorsView: ErrorsView<unknown>;
    interactionObjectOptions: InteractionObjectOptions;
    isShowcase: boolean;
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
    isShowcase: async ({ }, use, info) => {
        await use(info.tags.includes('@showcase'));
    },

    interactionObjectOptions: async ({ page }, use) => {
        const viewport = page.viewportSize();
        const isMobile = viewport.width <= 768;

        await use({
            mobile: isMobile
        });
    },

    crew: async ({ crew }, use, info) => {
        const isShowcase = info.tags.includes('@showcase');

        await use(
            crew.map(member =>
                isShowcase && member instanceof Photographer
                    ? Photographer.whoWill(TakePhotosOfInteractions)
                    : member
            )
        );
    },

    page: async ({ page }, use) => {
        await page.goto('/single/index.html');
        await use(page);
    },

    navigation: async ({ }, use) => {
        await use(new Navigation());
    },

    aboutView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="about"]')).describedAs('about view');
        await use(new AboutView(rootElement, navigation));
    },

    capabilitiesView: async ({ interactionObjectOptions, navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="capabilities"]')).describedAs('capabilities view');
        await use(new CapabilitiesView(rootElement, navigation, interactionObjectOptions));
    },

    consistencyView: async ({ interactionObjectOptions, navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="consistency"]')).describedAs('consistency view');
        await use(new ConsistencyView(rootElement, navigation, interactionObjectOptions));
    },

    dashboardView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="dashboard"]')).describedAs('dashboard view');
        await use(new DashboardView(rootElement, navigation));
    },

    errorsView: async ({ interactionObjectOptions, navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="errors"]')).describedAs('errors view');
        await use(new ErrorsView(rootElement, navigation, interactionObjectOptions));
    },

    scenarioDetailView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="tests"]')).describedAs('scenario detail view');
        await use(new ScenarioDetailView(rootElement, navigation));
    },

    scenariosView: async ({ interactionObjectOptions, navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="tests"]')).describedAs('scenarios view');
        await use(new ScenariosView(rootElement, navigation, interactionObjectOptions));
    },

    systemContextView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="system"]')).describedAs('system context view');
        await use(new SystemContextView(rootElement, navigation));
    },

    tagsView: async ({ interactionObjectOptions, navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="tags"]')).describedAs('tags view');
        await use(new TagsView(rootElement, navigation, interactionObjectOptions));
    },

    testRunsView: async ({ navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="test-runs"]')).describedAs('test runs view');
        await use(new TestRunsView(rootElement, navigation));
    },

    timelineView: async ({ interactionObjectOptions, navigation }, use) => {
        const rootElement = PageElement.located(By.css('[data-testid="timeline"]')).describedAs('timeline view');
        await use(new TimelineView(rootElement, navigation, interactionObjectOptions));
    },
});
