import type { Activity, Answerable, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Interaction, Question, the } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../abilities';
import type { PageElement } from '../models';
import { Key } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to send a key press or a sequence of keys to a Web element.
 *
 * **Note:** On macOS, some keyboard shortcuts might not work
 * with the [`devtools` protocol](https://webdriver.io/docs/automationProtocols/#devtools-protocol).
 *
 *  For example:
 *  - to *copy*, instead of [`Key.Meta`](https://serenity-js.org/api/web/class/Key/#Meta)+`C`, use [`Key.Control`](https://serenity-js.org/api/web/class/Key/#Control)+[`Key.Insert`](https://serenity-js.org/api/web/class/Key/#Insert)
 *  - to *cut*, instead of [`Key.Meta`](https://serenity-js.org/api/web/class/Key/#Meta)+`X`, use [`Key.Control`](https://serenity-js.org/api/web/class/Key/#Control)+[`Key.Delete`](https://serenity-js.org/api/web/class/Key/#Delete)
 *  - to *paste*, instead of [`Key.Meta`](https://serenity-js.org/api/web/class/Key/#Meta)+`V`, use [`Key.Shift`](https://serenity-js.org/api/web/class/Key/#Shift)+[`Key.Insert`](https://serenity-js.org/api/web/class/Key/#Insert)
 *
 * ## Example widget
 *
 * ```html
 * <form>
 *   <input type="text" name="example" id="example" />
 * </form>
 * ```
 *
 * ## Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/web'
 *
 * class Form {
 *   static exampleInput = () =>
 *     PageElement.located(By.id('example'))
 *       .describedAs('example input')
 * }
 * ```
 *
 * ## Pressing keys
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Key, Press, Value } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Priyanka')
 *   .attemptsTo(
 *     Press.the('H', 'i', '!', Key.ENTER).in(Form.exampleInput()),
 *     Ensure.that(Value.of(Form.exampleInput), equals('Hi!')),
 *   )
 * ```
 *
 * ## Learn more
 *
 * - [`Key`](https://serenity-js.org/api/web/class/Key/)
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * @group Activities
 */
export class Press extends PageElementInteraction {

    /**
     * Instantiates an [interaction](https://serenity-js.org/api/core/class/Interaction/)
     * that instructs the [actor](https://serenity-js.org/api/core/class/Actor/)
     * to press a sequence of [keys](https://serenity-js.org/api/web/class/Key/),
     *
     * When no `field` is specified, the key sequence will be sent to the currently focused element,
     * and if no element is focused - to the `document.body` to handle.
     *
     * @param keys
     *  A sequence of one or more keys to press
     */
    static the(...keys: Array<Answerable<Key | string | Key[] | string[]>>): Activity & { in: (field: Answerable<PageElement>) => Interaction } {
        return new Press(KeySequence.of(keys));
    }

    /**
     * Send the key sequence to a specific element.
     *
     * @param field
     */
    in(field: Answerable<PageElement>): Interaction {
        return new PressKeyInField(this.keys, field)
    }

    /**
     * @param keys
     *  A sequence of one or more keys to press
     */
    protected constructor(
        private readonly keys: Answerable<Array<Key | string>>
    ) {
        super(the `#actor presses ${ keys }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const keys = await actor.answer(this.keys);
        const page = await BrowseTheWeb.as(actor).currentPage();
        return page.sendKeys(keys);
    }
}

class PressKeyInField extends PageElementInteraction {
    /**
     * @param {Answerable<Array<Key | string>>} keys
     *  A sequence of one or more keys to press
     *
     * @param {Answerable<PageElement>} field
     *  Web element to send the keys to
     */
    constructor(
        private readonly keys: Answerable<Array<Key | string>>,
        private readonly field: Answerable<PageElement> /* todo | Question<AlertPromise> | AlertPromise */,
    ) {
        super(the`#actor presses ${ keys } in ${ field }`, Interaction.callerLocation(3));
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const field = await this.resolve(actor, this.field);
        const keys = await actor.answer(this.keys);
        const page = await BrowseTheWeb.as(actor).currentPage();

        // fix for protractor
        await page.executeScript(
            /* c8 ignore next */
            function focus(element: any) {
                element.focus();
            },
            await field,
        );

        return page.sendKeys(keys);
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

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<string | Key>> {
        const keys = await asyncMap(this.keys, key => actor.answer(key));

        return keys
            .flat()
            .filter(key => !! key);
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
