import { Question } from '..';
import { Translate } from '../abilities/Translate';

export const translationDefaultLocale = (): Question<Promise<string>> =>
    Question.about('the current default locale for translations', (actor) =>
        Translate.as(actor).answerToDefaultLocale()
    );

