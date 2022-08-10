import { Selector } from './Selector';

/**
 * Locates a {@link PageElement} using its [id](https://developer.mozilla.org/en-US/docs/Web/CSS/ID_selectors).
 *
 * **Pro tip:** Instantiate using [[By.id]]
 *
 * @group Models
 */
export class ById extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
