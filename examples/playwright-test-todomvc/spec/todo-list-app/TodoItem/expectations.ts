import { not } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';

export const hasCssClass = Expectation.define(
    'hasCssClass', 'have css class',
    async (actual: PageElement, expectedCssClassName: string) => {
        const attributeValue = await actual.attribute('class');
        const cssClass = attributeValue ?? '';
        return cssClass
            .replace(/\s+/, ' ')
            .trim()
            .split(' ')
            .filter(Boolean)
            .includes(expectedCssClassName);
    },
);

export const isDisplayedAsCompleted = () =>
    Expectation.to<PageElement>('get displayed as completed')
        .soThatActual(hasCssClass('completed'));

export const isDisplayedAsOutstanding = () =>
    Expectation.to<PageElement>('get displayed as outstanding')
        .soThatActual(not(hasCssClass('completed')));
