import { Selector } from './Selector';

/**
 * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors)
 * capable of piercing [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)-piercing
 *
 * **Pro tip:** Instantiate using [`By.deepCss`](https://serenity-js.org/api/web/class/By/#deepCss)
 *
 * @group Models
 */
export class ByDeepCss extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
