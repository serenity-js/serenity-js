import { Question } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core/lib/screenplay';
import { ElementFinder } from 'protractor';
import { AlertPromise } from 'selenium-webdriver';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Interaction}
 *  to {@link Enter} more readable.
 *
 * @see {@link Enter}
 *
 * @interface
 */
export interface EnterBuilder {

    /**
     * @desc
     *  Instantiates an {@link @serenity-js/core/lib/screenplay~Interaction}
     *  to {@link Enter}.
     *
     * @param {Question<ElementFinder> | ElementFinder} field
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Target}
     */
    into: (field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise) => Interaction;
}
