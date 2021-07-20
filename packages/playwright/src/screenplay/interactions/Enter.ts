import {
    Answerable,
    AnswersQuestions,
    Interaction,
    PerformsActivities,
    UsesAbilities,
} from '@serenity-js/core';
import { ElementHandle } from 'playwright';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  enter a value into a [form `input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) field.
 *
 * @example <caption>Example widget</caption>
 *  <form>
 *    <input type="text" name="example" id="example" />
 *  </form>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { Target } from '@serenity-js/playwright';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .selectedBy('[id="example"]');
 *  }
 *
 * @example <caption>Enternig the value into a form field</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Enter } from '@serenity-js/playwright';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Esme')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          enter('Hello world!').into(Form.exampleInput),
 *      );
 *
 * @see {@link Target}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export const enter = (value: Answerable<string>): { into: (element: Answerable<ElementHandle>) => Enter; } => ({
    into: (element: Answerable<ElementHandle>) =>
        Enter.theValue(value).into(element),
});

interface FillOptions {
    noWaitAfter?: boolean;
    timeout?: number;
}

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  enter a value into a [form `input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) field.
 *
 * @example <caption>Example widget</caption>
 *  <form>
 *    <input type="text" name="example" id="example" />
 *  </form>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { Target } from '@serenity-js/playwright';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .selectedBy('[id="example"]');
 *  }
 *
 * @example <caption>Enternig the value into a form field</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Enter } from '@serenity-js/playwright';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Esme')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          Enter.theValue('Hello world!').into(Form.exampleInput),
 *      );
 *
 * @see {@link Target}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class Enter implements Interaction {
    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {Answerable<ElementHandle>} value
   *  The value to be entered
   *
   * @returns {EnterBuilder}
   */
    static theValue(value: Answerable<string | number>): EnterBuilder {
        return {
            into: (field: Answerable<ElementHandle>) => new Enter(value, field),
        };
    }

    protected constructor(
        private readonly valueAnswerable: Answerable<string | number>,
        private readonly elementAnswerable: Answerable<ElementHandle>,
        private readonly options?: FillOptions
    ) {}

    public withOptions(options: FillOptions): Interaction {
        return new Enter(
            this.valueAnswerable,
            this.elementAnswerable,
            options
        );
    }

    /**
   * @desc
   *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
   *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {UsesAbilities & AnswersQuestions} actor
   *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
   *
   * @returns {PromiseLike<void>}
   *
   * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
   * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
   * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
   */
    public async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const [value, element] = await Promise.all([
            actor.answer(this.valueAnswerable),
            actor.answer(this.elementAnswerable),
        ]);

        await element.fill((value && value.toString()) || '', this.options);
    }
}

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
   * @param {Answerable<ElementHandle>} field
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   *
   * @see {@link Target}
   */
    into: (field: Answerable<ElementHandle>) => Enter;
}
