import { not } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';
import { ElementExpectation, PageElement } from '@serenity-js/web';

export const hasCssClass = (expectedCssClassName: string) =>
    ElementExpectation.forElementTo('have css class', async actual => {
        const attributeValue = await actual.attribute('class');
        const cssClass = attributeValue ?? '';
        return cssClass
            .replace(/\s+/, ' ')
            .trim()
            .split(' ')
            .filter(Boolean)
            .includes(expectedCssClassName);
    });

export const isDisplayedAsCompleted = () =>
    Expectation.to<string[], PageElement>('get displayed as completed')
        .soThatActual(hasCssClass('completed'));

export const isDisplayedAsOutstanding = () =>
    Expectation.to<string[], PageElement>('get displayed as outstanding')
        .soThatActual(not(hasCssClass('completed')));
