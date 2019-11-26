import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { promiseOf } from '../../promiseOf';
import { withAnswerOf } from '../withAnswerOf';

export class SelectedOption implements Question<Promise<string>> {
  static of = (target: Question<ElementFinder> | ElementFinder) => new SelectedOption(target);

  constructor(private target: Question<ElementFinder> | ElementFinder) {
  }

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
    return promiseOf(withAnswerOf(actor, this.target, element => element.$('option:checked').getAttribute('value')));
  }

  toString = () => `the selected value of ${this.target}`;
}

export class SelectedOptions implements Question<Promise<string[]>> {
  static of(target: Question<ElementFinder> | ElementFinder) {
    return new SelectedOptions(target);
  }

  constructor(private target: Question<ElementFinder> | ElementFinder) {
  }

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
    return promiseOf(withAnswerOf(actor, this.target, element => element.$$('option')
        .filter(option => option.isSelected())
        .map(values => values.getAttribute('value'))));
  }

  toString = () => `the selected values of ${this.target}`;
}
