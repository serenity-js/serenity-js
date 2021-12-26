import { LogicError } from '../../errors';
import { format } from '../../io';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Adapter } from '../model';
import { Question } from '../Question';
import { Expectation } from './Expectation';
import { ExpectationMet } from './expectations';
import { MetaQuestion } from './MetaQuestion';

const f = format({ markQuestions: false });

export class List<Item_Type> extends Question<Promise<Item_Type[]>> {
    private subject: string;

    static of<IT>(collection: Answerable<Array<IT>>): List<IT> {
        return new List<IT>(collection);
    }

    constructor(
        protected readonly collection: Answerable<Array<Item_Type>>,
    ) {
        super();
        this.subject = f`${ collection }`;
    }

    eachMappedTo<Mapped_Item_Type>(
        question: MetaQuestion<Item_Type, Promise<Mapped_Item_Type> | Mapped_Item_Type>,
    ): List<Mapped_Item_Type> {
        return new List(new EachMappedTo(this.collection, question));
    }

    where<Answer_Type>(
        question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>
    ): this {
        return new List<Item_Type>(new Where(this.collection, question, expectation)) as this;
    }

    count(): Question<Promise<number>> & Adapter<number> {
        return Question.about(`the number of ${ this.subject }`, async actor => {
            const items = await this.answeredBy(actor);
            return items.length;
        });
    }

    first(): Question<Promise<Item_Type>> & Adapter<Item_Type> {
        return Question.about(`the first of ${ this.subject }`, async actor => {
            const items = await this.answeredBy(actor);

            if (items.length === 0) {
                throw new LogicError(f`Can't retrieve the first item from a list with 0 items: ${ items }`)
            }

            return items[0];
        });
    }

    last(): Question<Promise<Item_Type>> & Adapter<Item_Type> {
        return Question.about(`the last of ${ this.subject }`, async actor => {
            const items = await this.answeredBy(actor);

            if (items.length === 0) {
                throw new LogicError(f`Can't retrieve the last item from a list with 0 items: ${ items }`)
            }

            return items[items.length - 1];
        });
    }

    get(index: number): Question<Promise<Item_Type>> & Adapter<Item_Type> {
        return Question.about(`the ${ ordinal(index + 1) } of ${ this.subject }`, async actor => {
            const items = await this.answeredBy(actor);

            if (index < 0 || items.length <= index) {
                throw new LogicError(`Can't retrieve the ${ ordinal(index) } item from a list with ${ items.length } items: ` + f`${ items }`)
            }

            return items[index];
        });
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<Item_Type>> {
        const collection = await actor.answer(this.collection);

        if (! Array.isArray(collection)) {
            throw new LogicError(f`A List has to wrap an Array-compatible object. ${ collection } given.`);
        }

        return collection;
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}

/**
 * @package
 * @param {number} index
 */
function ordinal(index: number): string {
    const
        lastDigit     = Math.abs(index) % 10,
        lastTwoDigits = Math.abs(index) % 100;

    switch (true) {
        case (lastDigit === 1 && lastTwoDigits !== 11):
            return index + 'st';
        case (lastDigit === 2 && lastTwoDigits !== 12):
            return index + 'nd';
        case (lastDigit === 3 && lastTwoDigits !== 13):
            return index + 'rd';
        default:
            return index + 'th';
    }
}

/**
 * @package
 */
class Where<Item_Type, Answer_Type>
    extends Question<Promise<Array<Item_Type>>>
{
    private subject: string;

    constructor(
        private readonly collection: Answerable<Array<Item_Type>>,
        private readonly question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>
    ) {
        super();

        const prefix = this.collection instanceof Where
            ? 'and'
            : 'where';

        this.subject = f `${ collection } ` + prefix + f ` ${ question } does ${ expectation }`;
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<Item_Type>> {
        try {
            const collection    = await actor.answer(this.collection);
            const expectation   = await actor.answer(this.expectation);

            const results: Item_Type[] = [];

            for (const item of collection) {
                const answer = await actor.answer(this.question.of(item));
                const expectationOutcome = await expectation(answer);

                if (expectationOutcome instanceof ExpectationMet) {
                    results.push(item);
                }
            }

            return results;
        } catch (error) {
            throw new LogicError(f`Couldn't check if ${ this.question } of an item of ${ this.collection } does ${ this.expectation }`, error);
        }
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}

/**
 * @package
 */
class EachMappedTo<Item_Type, Mapped_Item_Type> extends Question<Promise<Array<Mapped_Item_Type>>> {

    private subject: string;

    constructor(
        private readonly collection: Answerable<Array<Item_Type>>,
        private readonly mapping: MetaQuestion<Item_Type, Promise<Mapped_Item_Type> | Mapped_Item_Type>,
    ) {
        super();

        this.subject = f `${ collection } mapped to ${ this.mapping }`;
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<Mapped_Item_Type>> {
        const collection: Array<Item_Type> = await actor.answer(this.collection);

        const mapped: Mapped_Item_Type[] = [];

        for (const item of collection) {
            mapped.push(await actor.answer(this.mapping.of(item)))
        }

        return mapped;
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}
