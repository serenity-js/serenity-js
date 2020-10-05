import { Question } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core/lib/screenplay';
import { ElementFinder } from 'protractor';

/**
 * @desc
 *  Configures the {@link Target} representing
 *  a [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select)
 *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to interact with.
 *
 * @interface
 */
export interface SelectBuilder {

    /**
     * @desc
     *  Configures the {@link Target} representing
     *  a [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to interact with
     *
     * @param {Question<ElementFinder> | ElementFinder} target
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Select}
     * @see {@link Select.option}
     * @see {@link Select.options}
     * @see {@link Select.value}
     * @see {@link Select.values}
     * @see {@link Target}
     */
    from: (target: Question<ElementFinder> | ElementFinder) => Interaction;
}
