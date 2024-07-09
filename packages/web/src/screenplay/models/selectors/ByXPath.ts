import { Selector } from './Selector';

/**
 * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using an [XPath selector](https://developer.mozilla.org/en-US/docs/Web/XPath).
 *
 * **Pro tip:** Instantiate using [`By.xpath`](https://serenity-js.org/api/web/class/By/#xpath)
 *
 * @group Models
 */
export class ByXPath extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
