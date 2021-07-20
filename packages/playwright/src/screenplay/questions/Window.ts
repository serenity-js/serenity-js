import { Question } from '@serenity-js/core';

import { UnsupportedOperationError } from '../../errors';
import { BrowseTheWeb } from '../abilities';

export class Window {
    /**
   * @desc
   *  Returns the size of the current browser window.
   *
   * @returns {Question<Promise<{ width: number, height: number }>>}
   */
    static size(): Question<Promise<{ width: number; height: number }>> {
        return Question.about(`browser window size`, (actor) =>
            BrowseTheWeb.as(actor).windowSize()
        );
    }

    /**
   * @deprecated playwright implementation doesn't support browser window position question
   *
   * @desc
   *  Returns the `{ x: number, y: number }` position of the current browser window.
   *
   * @returns {Question<Promise<{ x: number, y: number }>>}
   */
    static position(): Question<Promise<{ x: number; y: number }>> {
        throw new UnsupportedOperationError();
    }
}
