import { LogicError } from '../../errors';
import { formatted } from '../../io';
import { Ability, AnswersQuestions, UsesAbilities } from '..';

export class Translate implements Ability {

    constructor(dictionaries: Array<unknown>, private readonly deaultLocale: string) {
        this.translations = new Object();
        dictionaries.forEach((element) => {
            this.translations = Object.assign(this.translations, element);
        });
    }

    private translations: unknown;

    static as(actor: UsesAbilities & AnswersQuestions): Translate {
        return actor.abilityTo(Translate);
    }

    static using(dictionaries: Array<unknown>, locale: string): Translate {
        return new Translate(dictionaries, locale)
    }

    answerTo(translationString: string, locale: string): Promise<string> {
        try {
            return Promise.resolve(this.translations[translationString][locale] ?? this.translations[translationString][this.deaultLocale]);
        } catch (error) {
            Promise.reject(new LogicError(formatted`Translation error for "${translationString}" and locale "${locale}": ${error}`));
        }
    }

    answerToDefaultLocale(): Promise<string> {
        return Promise.resolve(this.deaultLocale);
    }
}
