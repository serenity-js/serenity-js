import { Selector } from './Selector';

/**
 * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
 *
 * **Pro tip:** Instantiate using [`By.css`](https://serenity-js.org/api/web/class/By/#css)
 *
 * @group Models
 */
export class ByCss extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
