import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder, Key } from 'protractor';
import { AlertPromise } from 'selenium-webdriver';
import { withAnswerOf } from '../withAnswerOf';
import { PressBuilder } from './PressBuilder';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  send a key press or a sequence of keys to a Web element.
 *
 *  **Please note** that modifier keys, such as Command ⌘, [won't work on Mac](https://github.com/angular/protractor/issues/690)
 *
 * @example <caption>Example widget</caption>
 *  <form>
 *    <input type="text" name="example" id="example" />
 *  </form>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .located(by.id('example'));
 *  }
 *
 * @example <caption>Pressing keys</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Press, Value } from '@serenity-js/protractor';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { protractor, Key } from 'protractor';
 *
 *  actorCalled('Priyanka')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Press.the('H', 'i', '!', Key.ENTER).in(Form.exampleInput),
 *          Ensure.that(Value.of(Form.exampleInput), equals('Hi!')),
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
    static the(...keys: string[]): PressBuilder {
        return {
            in: (field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise) => new Press(keys, field),
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
        private readonly keys: string[],
        private readonly field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise,
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
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<any> {
        return withAnswerOf(actor, this.field, (elf: ElementFinder) => elf.sendKeys(...this.keys));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor presses ${ describeSequenceOf(this.keys) } in ${ this.field.toString() }`;
    }
}

function describeSequenceOf(keys: string[]) {
    return keys.map(key => [
        capitalised(nameOf(key)),
        isModifier(key) ? '-' : ', ',
    ]).
    reduce((acc, current) => acc.concat(current), []).
    slice(0, keys.length * 2 - 1).
    join('');
}

function isModifier(key: string) {
    return !! ~ [ Key.ALT, Key.COMMAND, Key.CONTROL, Key.SHIFT ].indexOf(key);
}

function nameOf(key: string) {

    for (const candidate in Key) {
        if (Object.prototype.hasOwnProperty.call(Key, candidate) && Key[ candidate ] === key) {
            return candidate;
        }
    }

    return key;
}

function capitalised(name: string) {
    return name.charAt(0).toLocaleUpperCase() + name.slice(1).toLocaleLowerCase();
}
