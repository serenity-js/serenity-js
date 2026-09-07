import type { Answerable } from '@serenity-js/core';
import { useFixtures } from '@serenity-js/playwright-test';
import { By, PageElement } from '@serenity-js/web';

type InteractionObjectConstructor<IO> = new (rootElement: Answerable<PageElement>) => IO;

export interface StoryMountOptions {
    props?: Record<string, unknown>;
    data?: unknown;
    theme?: 'light' | 'dark';
}

/**
 * Story-based `interactionObject` fixture.
 *
 * Uses Playwright's built-in `mount` fixture to render a story from the gallery,
 * then wraps the mounted component in the given Serenity/JS Interaction Object.
 *
 * The `storyPath` follows Playwright's path-like convention for story identifiers:
 * `<path under app/ without .story.ts>/<ExportName>`, e.g.
 * `'components/common/ResultCount/Default'`.
 *
 * @param io - Interaction Object class
 * @param storyPath - Story path, e.g. 'components/common/ResultCount/Default'
 * @param options - Optional props, data, theme
 */
type InteractionObjectFixture = <IO>(
    io: InteractionObjectConstructor<IO>,
    storyPath: string,
    options?: StoryMountOptions,
) => Promise<IO>;

type StoryFixtures = {
    interactionObject: InteractionObjectFixture;
};

export const {
    describe,
    it,
    test,
    expect,
    beforeEach,
    afterEach,
} = useFixtures<StoryFixtures>({

    interactionObject: async ({ mount }, use) => {
        async function mountStory<IO>(io: InteractionObjectConstructor<IO>, storyPath: string, options: StoryMountOptions = {}): Promise<IO> {
            const { props = {}, data, theme } = options;

            const mountProps = {
                ...props,
                ...(data !== undefined && { data }),
                ...(theme !== undefined && { theme }),
            };

            await mount(storyPath, Object.keys(mountProps).length > 0 ? mountProps : undefined);

            const rootElement = PageElement.located(By.css('#root > *')).describedAs('mounted component');
            return new io(rootElement);
        }

        await use(mountStory);
    },
});
