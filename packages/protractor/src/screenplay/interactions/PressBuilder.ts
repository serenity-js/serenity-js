import { Question } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core/lib/screenplay';
import { ElementFinder } from 'protractor';
import { AlertPromise } from 'selenium-webdriver';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Interaction}
 *  to {@link Press} more readable.
 *
 * @see {@link Press}
 *
 * @interface
 */
export interface PressBuilder {

    /**
     * @desc
     *  Instantiates an {@link @serenity-js/core/lib/screenplay~Interaction}
     *  to {@link Press}.
     *
     * @param {Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise} field
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Target}
     */
    in: (field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise) => Interaction;
}
