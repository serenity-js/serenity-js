import { By, PageElement } from '@serenity-js/web';

// see https://github.com/serenity-js/serenity-js/issues/1106
export class ExportedPageElements {
    // return type omitted on purpose, see issue #1106
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static childParentStrategySection = () =>
        PageElement.located(By.css('[data-test-id="child-parent-locator-pattern"]'))
            .describedAs('child-parent locator strategy section');

    // return type omitted on purpose, see issue #1106
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static parent = () =>
        PageElement.located(By.css('[data-test-id="parent-1"]'))
            .of(ExportedPageElements.childParentStrategySection())
            .describedAs('parent 1');
}
