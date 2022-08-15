import { Selector } from './Selector';

/**
 * Locates a {@apilink PageElement} using the name of its [HTML tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element).
 *
 * **Pro tip:** Instantiate using {@apilink By.tagName}
 *
 * @group Models
 */
export class ByTagName extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
