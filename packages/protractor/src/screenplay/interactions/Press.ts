import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder, Key } from 'protractor';
import { withAnswerOf } from '../withAnswerOf';

/**
 * @desc
 *  Note that modifier keys, such as Command, won't work on Mac - https://github.com/angular/protractor/issues/690
 */
export class Press extends Interaction {

    static the(...keys: string[]) {
        return {
            in: (field: Question<ElementFinder> | ElementFinder) => new Press(keys, field),
        };
    }

    constructor(
        private readonly keys: string[],
        private readonly field: Question<ElementFinder> | ElementFinder,
    ) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<any> {
        return Promise.all(this.keys.map(key => actor.answer(key)))
            .then(keys => withAnswerOf(actor, this.field, elf => elf.sendKeys(...keys)));
    }

    toString() {
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
        if (Key.hasOwnProperty(candidate) && Key[ candidate ] === key) {
            return candidate;
        }
    }

    return key;
}

function capitalised(name: string) {
    return name.charAt(0).toLocaleUpperCase() + name.slice(1).toLocaleLowerCase();
}
