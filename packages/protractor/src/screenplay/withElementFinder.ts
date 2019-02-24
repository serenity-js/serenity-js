import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { promiseOf } from './promiseOf';

/**
 * @private
 * * @param {AnswersQuestions & UsesAbilities} actor
 * @param {Question<ElementFinder> | ElementFinder} target
 * @param fn
 */
export function withElementFinder<T>(
    actor: AnswersQuestions & UsesAbilities,
    target: Question<ElementFinder> | ElementFinder,
    fn: (el: ElementFinder) => T,
) {
    const finder = target instanceof ElementFinder
        ? target
        : target.answeredBy(actor);

    return fn(finder);
}
