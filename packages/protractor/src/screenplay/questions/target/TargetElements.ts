import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../../abilities';
import { RelativeQuestion } from '../RelativeQuestion';
import { override } from './override';
import { TargetNestedElements } from './TargetNestedElements';

/**
 * @public
 */
export class TargetElements
    implements Question<ElementArrayFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{
    constructor(
        private readonly description: string,
        private readonly locator: Locator,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElements(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return override(
            BrowseTheWeb.as(actor).locateAll(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }

    toString() {
        return `the ${ this.description }`;
    }
}
