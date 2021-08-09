import { Activity, Answerable, AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Element } from 'webdriverio';

import { Key } from '../../input';
import { BrowseTheWeb } from '../abilities';
import { PressBuilder } from './PressBuilder';
import { WebElementInteraction } from './WebElementInteraction';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  send a key press or a sequence of keys to a Web element.
 *
 *  *Please note*: On macOS, some keyboard shortcuts might not work with the [`devtools` protocol](https://webdriver.io/docs/automationProtocols/#devtools-protocol).
 *
 *  For example:
 *  - to *copy*, instead of `Meta+C`, use `Control+Insert`
 *  - to *cut*, instead of `Meta+X`, use `Control+Delete`
 *  - to *paste*, instead of `Meta+V`, use `Shift+Insert`
 *
 * @example <caption>Example widget</caption>
 *  <form>
 *    <input type="text" name="example" id="example" />
 *  </form>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { by, Target } from '@serenity-js/webdriverio';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .located(by.id('example'));
 *  }
 *
 * @example <caption>Pressing keys</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Key, Press, Value } from '@serenity-js/webdriverio';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  actorCalled('Priyanka')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Press.the('H', 'i', '!', Key.ENTER).in(Form.exampleInput),
 *          Ensure.that(Value.of(Form.exampleInput), equals('Hi!')),
 *      );
 *
 * @see {@link Key}
 * @see {@link BrowseTheWeb}
 * @see {@link Target}
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions/lib/expectations~equals}
 *
 * @extends {WebElementInteraction}
 */
export class Press extends WebElementInteraction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {...keys: Array<Answerable<Key | string | Key[] | string[]>>} keys
     *  A sequence of one or more keys to press
     *
     * @returns {PressBuilder}
     */
    static  the(...keys: Array<Answerable<Key | string | Key[] | string[]>>): Activity & PressBuilder {
        return new Press(KeySequence.of(keys));
    }

    in(field: Answerable<Element<'async'>> /* | Question<AlertPromise> | AlertPromise */): Interaction {
        return new PressKeyInField(this.keys, field)
    }

    /**
     * @param {Answerable<Array<Key | string>>} keys
     *  A sequence of one or more keys to press
     */
    constructor(
        private readonly keys: Answerable<Array<Key | string>>
    ) {
        super(formatted `#actor presses ${ keys }`);
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
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const keys  = await actor.answer(this.keys);

        return BrowseTheWeb.as(actor).sendKeys(keys);
    }
}

class PressKeyInField extends WebElementInteraction {
    /**
     * @param {Answerable<Array<Key | string>>} keys
     *  A sequence of one or more keys to press
     *
     * @param {Answerable<Element<'async'>>} field
     *  Web element to send the keys to
     */
    constructor(
        private readonly keys: Answerable<Array<Key | string>>,
        private readonly field: Answerable<Element<'async'>> /* todo | Question<AlertPromise> | AlertPromise */,
    ) {
        super(formatted `#actor presses ${ keys } in ${ field }`);
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const field = await this.resolve(actor, this.field);
        const keys  = await actor.answer(this.keys);

        await BrowseTheWeb.as(actor).browser.execute(
            /* istanbul ignore next */
            function focus(element: any) {  // todo: fix type
                element.focus();
            },
            field,
        );

        return BrowseTheWeb.as(actor).sendKeys(keys);
    }
}

/**
 * @package
 */
class KeySequence extends Question<Promise<Array<Key | string>>> {
    static of(keys: Array<Answerable<Key | string | Key[] | string[]>>) {
        return new KeySequence(keys);
    }

    constructor(private readonly keys: Array<Answerable<Key | string | Key[] | string[]>>) {
        super(KeySequence.describe(keys));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<string | Key>> {
        return Promise.all(
            this.keys.map(part => actor.answer(part))
        ).then(keys => keys.flat().filter(key => !! key))
    }

    private static describe(keys: Array<Answerable<Key | string | Key[] | string[]>>): string {
        const prefix = keys.length === 1 ? 'key' : 'keys';

        const description = keys.reduce((acc, key, index) => {
            const separator = Key.isKey(key) && key.isModifier
                ? '-'
                : acc.separator;

            return {
                description: index === 0
                    ? `${ key }`
                    : `${ acc.description }${acc.separator}${ key }`,
                separator,
            }
        }, { description: '', separator: ', ' }).description;

        return `${ prefix } ${ description }`;
    }
}
