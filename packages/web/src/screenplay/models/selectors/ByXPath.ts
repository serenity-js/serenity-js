import { Selector } from './Selector';

/**
 * Locates a {@apilink PageElement} using an [XPath selector](https://developer.mozilla.org/en-US/docs/Web/XPath).
 *
 * **Pro tip:** Instantiate using {@apilink By.xpath}
 *
 * @group Models
 */
export class ByXPath extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
