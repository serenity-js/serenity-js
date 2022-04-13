import { Answerable, AnswersQuestions, UsesAbilities } from '..';
import { Translate } from '../abilities/Translate';
import { Question } from '../Question';
import { MetaQuestion, translationDefaultLocale } from '.';

export class Translations extends Question<Promise<string[]>> implements MetaQuestion<Answerable<string[]>, Promise<string[]>> {

    private description: string;

    constructor(private readonly translationStrings: string[], private readonly locale?: string) {
        super();
        this.description = locale ?
            `translation of ${this.translationStrings} with locale ${locale}`
            : `translation of ${this.translationStrings} with default locale`;
    }

    of(translationStrings: string[]): Translations {
        return new Translations(translationStrings, this.locale);
    }

    static of(translationStrings: string[]): Translations {
        return new Translations(translationStrings);
    }

    toString(): string {
        return this.description;
    }
    describedAs(description: string): this {
        this.description = description;
        return this;
    }

    static to(locale: string): Translations {
        return new Translations(undefined, locale);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities & Translate): Promise<string[]> {
        const elements: string[] =
            await Promise.all(this.translationStrings.map(item => Translate.as(actor).answerTo(item, this.locale)));
        return elements;
    }

    static defaultLocale = () : Question<Promise<string>>  => translationDefaultLocale();
}
