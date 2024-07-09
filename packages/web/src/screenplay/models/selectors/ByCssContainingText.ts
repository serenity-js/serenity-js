import { Selector } from './Selector';

/**
 * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) with a given [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText)
 * using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
 *
 * **Pro tip:** Instantiate using [`By.cssContainingText`](https://serenity-js.org/api/web/class/By/#cssContainingText)
 *
 * @group Models
 */
export class ByCssContainingText extends Selector {
    constructor(public readonly value: string, public readonly text: string) {
        super();
    }
}
