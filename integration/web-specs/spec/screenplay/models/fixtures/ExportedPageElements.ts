import { By, PageElement } from '@serenity-js/web';

// see https://github.com/serenity-js/serenity-js/issues/1106
export class ExportedPageElements {
    static childParentStrategySection = () =>
        PageElement.located(By.css('[data-test-id="child-parent-locator-pattern"]'))
            .describedAs('child-parent locator strategy section');

    static parent = () =>
        PageElement.located(By.css('[data-test-id="parent-1"]'))
            .of(ExportedPageElements.childParentStrategySection())
            .describedAs('parent 1');
}
