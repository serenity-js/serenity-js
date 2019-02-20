import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { NoAnswerFound } from './errors';
import { Expectation } from './Expectation';
import { ExpectationMet } from './outcomes';

export class Pick<T> {
    static from<I>(items: KnowableUnknown<I[]>) {
        return new Pick(items);
    }

    constructor(
        private readonly question: KnowableUnknown<T[]>,
        private readonly filters: Filters<T> = new Filters<T>(),
    ) {
    }

    all(): Question<Promise<T[]>> {
        return new AllMatchingAnswers(this.question, this.filters);
    }

    first(): Question<Promise<T>> {
        return new FirstAnswer(this.question, this.filters);
    }

    last(): Question<Promise<T>> {
        return new LastAnswer(this.question, this.filters);
    }

    get(itemIndex: number): Question<Promise<T>> {
        return new NthAnswer(this.question, this.filters, itemIndex);
    }

    count(): Question<Promise<number>> {
        return new NumberOfMatchingAnswers(this.question, this.filters);
    }

    where<Attribute>(
        questionFactory: (item: T) => Question<Attribute | Promise<Attribute>>,
        expectation: Expectation<any, Attribute>,
    ): Pick<T> {
        return new Pick<T>(
            this.question,
            this.filters.append(new Filter<T, Attribute>(questionFactory, expectation)),
        );
    }
}

class Filters<T> {
    constructor(private readonly filters: Array<Filter<T, any>> = []) {
    }

    append(filter: Filter<T, any>) {
        return new Filters(this.filters.concat(filter));
    }

    processAs(actor: AnswersQuestions & UsesAbilities, questions: T[]): Promise<T[]> {
        return this.filters.reduce((filteredItems, filter) => {
            return filteredItems.then(fis => filter.processAs(actor, fis));
        }, Promise.resolve(questions));
    }
}

class Filter<T, Attribute> {
    constructor(
        private readonly questionFactory: (item: T) => Question<Attribute |  Promise<Attribute>>,
        private readonly expectation: Expectation<any, Attribute>,
    ) {
    }

    processAs(actor: AnswersQuestions & UsesAbilities, items: T[]): Promise<T[]> {
        const expectation = this.expectation.answeredBy(actor);

        return Promise
            .all(items.map(item => this.questionFactory(item).answeredBy(actor)))
            .then(answers => Promise.all(answers.map(answer => expectation(answer))))
            .then(results => items.filter((item, id) => results[id] instanceof ExpectationMet));
    }
}

class AllMatchingAnswers<T> implements Question<Promise<T[]>> {
    constructor(
        private readonly question: KnowableUnknown<T[]>,
        private readonly filters: Filters<T>,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<T[]> {
        return actor.answer(this.question)
            .then(items => this.filters.processAs(actor, items));
    }

    toString() {
        return formatted `all of ${ this.question }`;
    }
}

class FirstAnswer<T> implements Question<Promise<T>> {
    constructor(
        private readonly question: KnowableUnknown<T[]>,
        private readonly filters: Filters<T>,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<T> {
        return actor.answer(this.question)
            .then(items => this.filters.processAs(actor, items))
            .then(items => {
                if (items[0] === undefined) {
                    throw new NoAnswerFound(`There's no ${ this.toString() }`);
                }

                return items[0];
            });
    }

    toString() {
        return formatted `first of ${ this.question }`;
    }
}

class LastAnswer<T> implements Question<Promise<T>> {
    constructor(
        private readonly question: KnowableUnknown<T[]>,
        private readonly filters: Filters<T>,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<T> {
        return actor.answer(this.question)
            .then(items => this.filters.processAs(actor, items))
            .then(items => {
                if (items[items.length - 1] === undefined) {
                    throw new NoAnswerFound(`There's no ${ this.toString() }`);
                }

                return items[items.length - 1];
            });
    }

    toString() {
        return formatted `last of ${ this.question }`;
    }
}

class NthAnswer<T> implements Question<Promise<T>> {
    constructor(
        private readonly question: KnowableUnknown<T[]>,
        private readonly filters: Filters<T>,
        private readonly index: number,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<T> {
        return actor.answer(this.question)
            .then(items => this.filters.processAs(actor, items))
            .then(items => {
                if (items[this.index] === undefined) {
                    throw new NoAnswerFound(`There's no ${ this.toString() }`);
                }

                return items[this.index];
            });
    }

    toString() {
        return this.ordinalSuffixOf(this.index + 1) + formatted ` of ${ this.question }`;
    }

    private ordinalSuffixOf(index: number) {
        const
            j = index % 10,
            k = index % 100;

        switch (true) {
            case (j === 1 && k !== 11):
                return index + 'st';
            case (j === 2 && k !== 12):
                return index + 'nd';
            case (j === 3 && k !== 13):
                return index + 'rd';
            default:
                return index + 'th';
        }
    }
}

class NumberOfMatchingAnswers<T> implements Question<Promise<number>> {
    constructor(
        private readonly question: KnowableUnknown<T[]>,
        private readonly filters: Filters<T>,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        return actor.answer(this.question)
            .then(items => this.filters.processAs(actor, items))
            .then(items => items.length);
    }

    toString() {
        return formatted `number of ${ this.question }`;
    }
}
