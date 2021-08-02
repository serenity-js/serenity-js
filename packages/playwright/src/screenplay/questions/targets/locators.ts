import { Question } from '@serenity-js/core';
import { ElementHandle, Page } from 'playwright';

import { BrowseTheWeb } from '../../abilities';

type Selector = string;

export class Locator {
    constructor(
        private readonly description: string,
        public readonly selector: Selector,
        private readonly parent?: Page | ElementHandle,
    ) {
    }

    firstMatching(): Question<Promise<ElementHandle>> {
        return Question.about(this.description, actor =>
            BrowseTheWeb.as(actor).$(this.selector)
        )
    }

    allMatching(): Question<Promise<ElementHandle[]>> {
        return Question.about(this.description, actor =>
            BrowseTheWeb.as(actor).$$(this.selector)
        )
    }
}

class Locators {

    id(id: string): Locator {
        return new Locator(
            `by id #${ id }`,
            `id=${id}`
        )
    }

    css(selector: Selector): Locator {
        return new Locator(
            `by css ${ selector }`,
            selector
        )
    }

    tagName(tagName: string): Locator {
        return new Locator(
            `by tag name <${ tagName } />`,
            tagName
        )
    }

    linkText(linkText: string): Locator {
        return new Locator(
            `by link text ${ linkText }`,
            `text="${ linkText }"`
        )
    }

    partialLinkText(partialLinkText: string): Locator {
        return new Locator(
            `by partial link text ${ partialLinkText }`,
            `text=${ partialLinkText }`
        )
    }

    xpath(xpath: string): Locator {
        return new Locator(
            `by xpath ${ xpath }`,
            `xpath=${xpath}`
        )
    }
}

export const by = new Locators();