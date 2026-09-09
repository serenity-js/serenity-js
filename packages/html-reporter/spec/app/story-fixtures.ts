import type { Answerable } from '@serenity-js/core';
import { useFixtures } from '@serenity-js/playwright-test';
import { By, PageElement } from '@serenity-js/web';

type InteractionObjectConstructor<IO> = new (rootElement: Answerable<PageElement>) => IO;

export interface StoryMountOptions {
    props?: Record<string, any>;
    data?: unknown;
    theme?: 'light' | 'dark';
    hash?: string;
}

/**
 * Story-based `interactionObject` fixture.
 *
 * Uses the built-in `story` fixture from `@serenity-js/playwright-test` to mount
 * a story from the gallery, then wraps the mounted component in the given
 * Serenity/JS Interaction Object via `.as(Constructor)`.
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

    interactionObject: async ({ story, actor }, use) => {
        async function mountStory<IO>(io: InteractionObjectConstructor<IO>, storyPath: string, options: StoryMountOptions = {}): Promise<IO> {
            const { props = {}, data, theme, hash } = options;

            // The gallery entry handles data, theme, and hash as special keys
            // within the props object — see playwright/gallery/entry.ts.
            const mountProps = {
                ...props,
                ...(data !== undefined && { data }),
                ...(theme !== undefined && { theme }),
                ...(hash !== undefined && { hash }),
            };

            // Mount the story via the built-in story fixture. The story fixture
            // returns a PageElement for #root; scope to the first child to get
            // the component's own root element (matching the old #root > * selector).
            const storyRoot = story(storyPath, Object.keys(mountProps).length > 0 ? mountProps : undefined);
            const componentRoot = storyRoot.element(By.css(':scope > *')).describedAs('mounted component');

            return actor.answer(componentRoot.as(io));
        }

        await use(mountStory);
    },
});
