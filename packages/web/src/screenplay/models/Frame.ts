import { Answerable, d, Optional, Question, QuestionAdapter } from '@serenity-js/core';
import { ensure, isDefined } from 'tiny-types';

import { BrowseTheWeb } from '../abilities';
import { Locator } from './Locator';
import { Selector } from './selectors';
import { Switchable } from './Switchable';

export abstract class Frame<Native_Element_Type = any> implements Optional, Switchable {
    static located<NET>(selector: Answerable<Selector>): QuestionAdapter<Frame<NET>> {
        return Question.about(d`frame located ${ selector }`, async actor => {
            const bySelector = await actor.answer(selector);
            return BrowseTheWeb.as<NET>(actor).frame(bySelector);
        });
    }

    constructor(protected readonly locator: Locator<Native_Element_Type>) {
        ensure('native element locator', locator, isDefined());
    }

    /**
     * @desc
     *  Switches the current browsing context to the given frame
     *  and returns an object that allows the caller to switch back
     *  to the previous context if needed.
     *
     * @returns {Promise<{ switchBack(): Promise<void> }>}
     */
    abstract switchTo(): Promise<{ switchBack(): Promise<void> }>;

    /**
     * @desc
     *  Returns an {@link Promise} that resolves to `true` when the frame
     *  is present, `false` otherwise.
     *
     * @returns {Promise<boolean>}
     */
    abstract isPresent(): Promise<boolean>;

    toString(): string {
        return `frame located ${ this.locator }`;
    }
}
