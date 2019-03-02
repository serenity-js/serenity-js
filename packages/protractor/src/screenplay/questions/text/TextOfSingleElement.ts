import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';

import { withAnswerOf } from '../../withAnswerOf';
import { RelativeQuestion } from '../RelativeQuestion';
import { TargetNestedElement } from '../targets';

/**
 * @package
 */
export class TextOfSingleElement
    implements RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
{
    constructor(protected readonly target: Question<ElementFinder> | ElementFinder) {
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new TextOfSingleElement(new TargetNestedElement(parent, this.target));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return withAnswerOf(actor, this.target, elf => elf.getText() as any);
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}
