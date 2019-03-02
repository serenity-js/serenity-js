import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { withAnswerOf } from '../../withAnswerOf';
import { RelativeQuestion } from '../RelativeQuestion';
import { override } from './override';

/**
 * @public
 */
export class TargetNestedElements
    implements Question<ElementArrayFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{

    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly children: Question<ElementArrayFinder> | ElementArrayFinder,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElements(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return withAnswerOf<ElementFinder, ElementArrayFinder>(actor, this.parent, parent =>
            withAnswerOf<ElementArrayFinder, ElementArrayFinder>(actor, this.children, children => override(
                parent.all(children.locator()),
                'toString',
                this.toString.bind(this),
            )));
    }

    toString() {
        return `${ this.children.toString() } of ${ this.parent }`;
    }
}
