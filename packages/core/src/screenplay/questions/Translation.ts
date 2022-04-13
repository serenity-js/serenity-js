import { Answerable, AnswersQuestions, UsesAbilities } from '..';
import { Translate } from '../abilities/Translate';
import { Question } from '../Question';
import { MetaQuestion, translationDefaultLocale } from '.';

export class Translation extends Question<Promise<string>> implements MetaQuestion<Answerable<string>, Promise<string>> {

    private description: string;

    constructor(private readonly translationString: string, private readonly locale?: string) {
        super();
        this.description = locale ?
            `translation of ${this.translationString} with locale ${locale}`
            : `translation of ${this.translationString} with default locale`;
    }

    of(translationString: string): Translation {
        return new Translation(translationString, this.locale);
    }

    static of(translationString: string): Translation {
        return new Translation(translationString);
    }

    toString(): string {
        return this.description;
    }
    describedAs(description: string): this {
        this.description = description;
        return this;
    }

    static to(locale: string): Translation {
        return new Translation(undefined, locale);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities & Translate): Promise<string> {
        return Translate.as(actor).answerTo(this.translationString, this.locale);
    }

    static defaultLocale = () : Question<Promise<string>>  => translationDefaultLocale();
}
