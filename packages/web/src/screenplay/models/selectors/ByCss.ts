import { Selector } from './Selector';

/**
 * Locates a {@apilink PageElement} using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
 *
 * **Pro tip:** Instantiate using {@apilink By.css}
 *
 * @group Models
 */
export class ByCss extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
