import {
    Answerable,
    AnswersQuestions,
    Interaction,
    UsesAbilities,
} from '@serenity-js/core';
import { ElementHandle } from 'playwright';

export type Modifier = 'Shift' | 'Control' | 'Alt' | 'Meta' | 'ShiftLeft';

export type Key = string | NormalizedKey;

export interface NormalizedKey {
    key: string;
    modifiers?: Modifier[];
}

const normalizeKey = (key: Key): NormalizedKey => {
    let result = key;
    if (typeof key === 'string') {
        result = {
            key,
            modifiers: [],
        };
    }
    return result as NormalizedKey;
};

const stringifyNormalizedKey = (key: NormalizedKey): string =>
    [...key.modifiers, key.key].join('+');

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  send a key press or a sequence of keys to a Web element.
 *
 *  **Please note** that you should use "Meta" modifier to emulate Command ⌘ key on Mac
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
 *          .selectedBy('input'));
 *  }
 *
 * @example <caption>Pressing keys</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Press, Value } from '@serenity-js/playwright';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Priyanka')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          Press.the('H', 'i', '!').in(Form.exampleInput),
 *          Ensure.that(Value.of(Form.exampleInput), equals('Hi!')),
 *      );
 *
 * @example <caption>Pressing keys with modifiers</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Press, Value } from '@serenity-js/playwright';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Priyanka')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          Press.the('H', 'i', '!', 'Control+a', 'Backspace').in(Form.exampleInput),
 *          Ensure.that(Value.of(Form.exampleInput), equals('')),
 *      );
 *
 * @example <caption>Pressing keys with modifiers - version 2</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Press, Value } from '@serenity-js/playwright';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Priyanka')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          Press.the("H", "i", "!").in($("[id='example']")),
 *          Ensure.that(Value.of($("[id='example']")), equals("Hi!")),
 *          Press.the(
 *            {
 *              key: "a",
 *              modifiers: ["Meta"], // Meta is the command key on Mac
 *            },
 *            "Backspace"
 *          ).in($("[id='example']")),
 *          Ensure.that(Value.of($("[id='example']")), equals(""))
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Target}
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions/lib/expectations~equals}
 * @see {@link selenium-webdriver~Key}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class Press extends Interaction {
    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {...keys: string[]} keys
   *  A sequence of one or more keys to press
   *
   * @returns {PressBuilder}
   */
    static the(...keys: Key[]): PressBuilder {
        return {
            in: (field: Answerable<ElementHandle>) => new Press(keys, field),
        };
    }

    /**
   * @param {string[]} keys
   *  A sequence of one or more keys to press
   *
   * @param {Question<ElementFinder> | ElementFinder} field
   *  Web element to send the keys to
   */
    constructor(
        private readonly keys: Key[],
        private readonly field: Answerable<ElementHandle>
    ) {
        super();
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
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<any> {
        const element = await actor.answer(this.field);
        await element.focus();
        const pressPromises = this.normalizeStringifiedKeys().map((key) =>
            element.press(key)
        );
        await Promise.all(pressPromises);
    }

    private normalizeStringifiedKeys() {
        return this.keys.map(normalizeKey).map(stringifyNormalizedKey);
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return `#actor presses ${this.normalizeStringifiedKeys().join(
            '+'
        )} in ${this.field.toString()}`;
    }
}

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
    in: (field: Answerable<ElementHandle>) => Interaction;
}
