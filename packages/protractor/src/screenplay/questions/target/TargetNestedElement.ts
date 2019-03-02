import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { withAnswerOf } from '../../withAnswerOf';
import { RelativeQuestion } from '../RelativeQuestion';
import { override } from './override';

/**
 * @public
 */
export class TargetNestedElement
    implements Question<ElementFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder>
{
    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly child: Question<ElementFinder> | ElementFinder,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElement(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return withAnswerOf<ElementFinder, ElementFinder>(actor, this.parent, parent =>
            withAnswerOf<ElementFinder, ElementFinder>(actor, this.child, child => override(
                parent.element(child.locator()),
                'toString',
                this.toString.bind(this),
            )));
    }

    toString() {
        return `${ this.child.toString() } of ${ this.parent }`;
    }
}
