import { Question } from '@serenity-js/core';
import { ElementHandle } from 'playwright';

type Selector = string;

export class Locator {
    constructor(
        private readonly description: string,
        public readonly selector: Selector
    ) {
    }

    firstMatchingAt(parent: { $(selector: string): Promise<ElementHandle> }): Question<Promise<ElementHandle>> {
        return Question.about(this.description, actor =>
            parent.$(this.selector)
        )
    }

    allMatchingAt(parent: { $$(selector: string): Promise<ElementHandle[]> }): Question<Promise<ElementHandle[]>> {
        return Question.about(this.description, actor =>
            parent.$$(this.selector)
        )
    }

    toString(): string {
        return this.description;
    }
}

class Locators {

    id(id: string): Locator {
        return new Locator(
            `id #${ id }`,
            `id=${id}`
        )
    }

    css(selector: Selector): Locator {
        return new Locator(
            `css ${ selector }`,
            selector
        )
    }

    tagName(tagName: string): Locator {
        return new Locator(
            `tag name <${ tagName } />`,
            tagName
        )
    }

    linkText(linkText: string): Locator {
        return new Locator(
            `link text ${ linkText }`,
            `text="${ linkText }"`
        )
    }

    partialLinkText(partialLinkText: string): Locator {
        return new Locator(
            `partial link text ${ partialLinkText }`,
            `text=${ partialLinkText }`
        )
    }

    xpath(xpath: string): Locator {
        return new Locator(
            `xpath ${ xpath }`,
            `xpath=${xpath}`
        )
    }
}

export const by = new Locators();