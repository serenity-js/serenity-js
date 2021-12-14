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

export interface Mappable<Item_Type, Collection_Type> {
    map<Mapped_Item_Type>(
        mapping: (item: Item_Type, index?: number, collection?: Collection_Type) => Mapped_Item_Type
    ): Promise<Array<Awaited<Mapped_Item_Type>>> | Array<Mapped_Item_Type>;
}

export class List<Item_Type, Collection_Type> extends Question<Promise<Array<Item_Type>>> {
    private readonly predicates: Array<Predicate<Item_Type, unknown>> = [];
    private subject: string;

    static of<IT, CT>(collection: Answerable<Mappable<IT, CT>>): List<IT, CT> {
        return new List<IT, CT>(collection);
    }

    constructor(private readonly collection: Answerable<Mappable<Item_Type, Collection_Type>>) {
        super();
        this.subject = f`${ collection }`;
    }

    where<Answer_Type>(
        question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>
    ): this {

        this.predicates.push(new Predicate(question, expectation));

        return this;
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

        if (! (collection && typeof collection.map === 'function')) {
            throw new LogicError(f`A \`List\` has to wrap a mappable object, such as Array or PageElements. \`${ collection }\` has no \`.map()\` method`)
        }

        const promisedResults = collection.map(async item => {
            for(const predicate of this.predicates) {
                if (! await predicate.appliedTo(item).answeredBy(actor)) {
                    return { item, keep: false };
                }
            }
            return { item, keep: true };
        });

        const results = await (
            Array.isArray(promisedResults)
                ? Promise.all(promisedResults)
                : Promise.resolve(promisedResults)
        );

        return results.reduce((acc, result) => {
            return result.keep
                ? acc.concat(result.item)
                : acc
        }, [])
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
class Predicate<Item_Type, Answer_Type> {
    constructor(
        private readonly question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>
    ) {
    }

    appliedTo(item: Item_Type): AppliedPredicate<Answer_Type> {
        return new AppliedPredicate<Answer_Type>(this.question.of(item), this.expectation);
    }
}

/**
 * @package
 */
class AppliedPredicate<Answer_Type> extends Question<Promise<boolean>>{

    private subject: string;

    constructor(
        private readonly question: Question<Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>,
    ) {
        super();
        this.subject = format({ markQuestions: false })`${ question }  does ${ expectation }`;
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<boolean> {

        try {
            const answer        = await actor.answer(this.question);
            const expectation   = await actor.answer(this.expectation);

            const result = await expectation(answer);

            return result instanceof ExpectationMet;
        } catch (error) {
            throw new LogicError(`Couldn't check if ${ this.question } does ${ this.expectation }`, error);
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
