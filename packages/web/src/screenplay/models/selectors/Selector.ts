import { Answerable, AnswersQuestions, format, Question, UsesAbilities } from '@serenity-js/core';

const f = format({ markQuestions: true });

export abstract class Selector<Parameters extends unknown[]>
    extends Question<Promise<[ ...Parameters ]>>
{
    private subject: string;

    constructor(private readonly selectors: { [K in keyof Parameters]: Answerable<Parameters[K]> }) {
        super();
        this.subject = `${ this.constructor.name.replace(/([a-z]+)([A-Z])/g, '$1 $2').toLowerCase() } (${ selectors.map(selector => f`${selector}`).join(', ') })`;
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<[...Parameters]> {
        return Promise.all(
            this.selectors.map(selector =>
                actor.answer(selector)
            )
        ) as Promise<[...Parameters]>;
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}
