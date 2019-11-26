import { Answerable, AnswersQuestions, Question } from '@serenity-js/core';
import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { by, ElementFinder, protractor } from 'protractor';
import { promiseOf } from '../../promiseOf';
import { withAnswerOf } from '../withAnswerOf';
import { RelativeQuestion } from '../questions/RelativeQuestion';

export class Select {

    static option(value: string | Answerable<string>) {
        return {from: (target: Question<ElementFinder> | ElementFinder): Interaction => new SelectOption(value, target)};
    }

    static options(values: string[] | Question<Promise<string[]>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>) {
        return {from: (target: Question<ElementFinder> | ElementFinder): Interaction => new SelectOptions(values, target)};
    }

    static text(value: string | Answerable<string>) {
        return {from: (target: Question<ElementFinder> | ElementFinder): Interaction => new SelectText(value, target)};
    }

    static textValues(values: string[] | Question<Promise<string[]>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>) {
        return {from: (target: Question<ElementFinder> | ElementFinder): Interaction => new SelectTextValues(values, target)};
    }
}

class SelectOption implements Interaction {

    constructor(private value: string | Answerable<string>, private target: Question<ElementFinder> | ElementFinder) {
    }

    resolveValueAs(actor: UsesAbilities & AnswersQuestions) {
        if (typeof this.value === "string") {
            return Promise.resolve(this.value);
        } else {
            return actor.answer(this.value);
        }
    };

    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return this.resolveValueAs(actor)
            .then(resolvedValue => {
                return promiseOf(withAnswerOf(actor, this.target, element => element
                    .element(by.css(`option[value=${resolvedValue}]`)))
                    .click());
            });
    }

    toString = () => `#actor selects "${this.value}" from ${this.target}`;
}

class SelectOptions implements Interaction {

    constructor(private values: string[] | Question<Promise<string[]>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>, private target: Question<ElementFinder> | ElementFinder) {
    }

    resolveValuesAs(actor: AnswersQuestions) {
        if (Array.isArray(this.values)) {
            return Promise.resolve(this.values);
        } else {
            return actor.answer(this.values);
        }
    };

    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {

        return this.resolveValuesAs(actor).then(resolvedValues => {

            const hasRequiredValue = (option: ElementFinder) => option.getAttribute('value').then(value => !!~resolvedValues.indexOf(value)),
                isAlreadySelected = (option: ElementFinder) => option.isSelected(),
                ensureOnlyOneApplies = (list: boolean[]) => list.filter(_ => _ === true).length === 1,
                select = (option: ElementFinder) => option.click();

            const optionsToClick = (option: ElementFinder) => protractor.promise.all(
                [hasRequiredValue(option),
                    isAlreadySelected(option)]).then(ensureOnlyOneApplies);

            return promiseOf(withAnswerOf(actor, this.target, element => element.all(by.css('option'))
                .filter(optionsToClick)
                .each(select)));
        });

    }

    toString = () => `#actor selects "${this.values}" from ${this.target}`;
}

class SelectText implements Interaction {

    constructor(private value: string | Answerable<string>, private target: Question<ElementFinder> | ElementFinder) {
    }

    resolveValueAs(actor: UsesAbilities & AnswersQuestions) {
        if (typeof this.value === "string") {
            return Promise.resolve(this.value);
        } else {
            return actor.answer(this.value);
        }
    };

    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return this.resolveValueAs(actor)
            .then(resolvedValue => {
                return promiseOf(withAnswerOf(actor, this.target, element => element
                    .element(by.cssContainingText('option', resolvedValue)))
                    .click());
            });
    }

    toString = () => `#actor selects "${this.value}" from ${this.target}`;
}

class SelectTextValues implements Interaction {

    constructor(private values: string[] | Question<Promise<string[]>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>, private target: Question<ElementFinder> | ElementFinder) {
    }

    resolveValuesAs(actor: AnswersQuestions) {
        if (Array.isArray(this.values)) {
            return Promise.resolve(this.values);
        } else {
            return actor.answer(this.values);
        }
    };

    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return this.resolveValuesAs(actor)
            .then(resolvedValues => {

                const hasRequiredText = (option: ElementFinder) => option.getText().then(value => !!~resolvedValues.indexOf(value)),
                    isAlreadySelected = (option: ElementFinder) => option.isSelected(),
                    ensureOnlyOneApplies = (list: boolean[]) => list.filter(_ => _ === true).length === 1,
                    select = (option: ElementFinder) => option.click();

                const optionsToClick = (option: ElementFinder) => protractor.promise.all([
                    hasRequiredText(option),
                    isAlreadySelected(option),
                ])
                    .then(ensureOnlyOneApplies);

                return promiseOf(withAnswerOf(actor, this.target, element => element.all(by.css('option'))
                    .filter(optionsToClick)
                    .each(select)));
            });
    }

    toString = () => `#actor selects "${this.values}" from ${this.target}`;
}
