import { ensure, isArray, isNumber } from 'tiny-types';

import { formatted } from '../../../io';
import { AnswersQuestions, UsesAbilities } from '../../actor';
import { Answerable } from '../../Answerable';
import { Question } from '../../Question';
import { Expectation } from '../Expectation';
import { ExpectationMet } from '../expectations';
import { MetaQuestion } from '../MetaQuestion';
import { ListAdapter } from './ListAdapter';

/**
 * @desc
 *  Adapts an {@link Array} so that it can be used with {@link List}
 *
 * @implements {ListAdapter}
 */
export class ArrayListAdapter<Item_Type> implements ListAdapter<Item_Type, Item_Type[], Promise<Item_Type>, Promise<Item_Type[]>> {

    /**
     * @param {Answerable<Item_Type[]>} array
     */
    constructor(private readonly array: Answerable<Item_Type[]>) {
    }

    /**
     * @desc
     *  Returns the number of items the underlying {@link Array} contains,
     *  left after applying any filters.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<number>}
     */
    count(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        return this.arrayAs(actor)
            .then(items => items.length);
    }

    /**
     * @desc
     *  Returns the underlying {@link Array},
     *  with any filters applied.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<number>}
     */
    items(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type[]> {
        return this.arrayAs(actor);
    }

    /**
     * @desc
     *  Returns the first of items the underlying {@link Array} contains,
     *  left after applying any filters.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<Item_Type>}
     */
    first(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type> {
        return this.arrayAs(actor)
            .then(items => this.getItemAt(items, 0));
    }

    /**
     * @desc
     *  Returns the nth of items the underlying {@link Array} contains,
     *  left after applying any filters.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     *
     * @param {number} index
     *  Zero-based index of the item to return
     *
     * @returns {Promise<Item_Type>}
     */
    get(actor: AnswersQuestions & UsesAbilities, index: number): Promise<Item_Type> {
        return this.arrayAs(actor)
            .then(items => this.getItemAt(items, index));
    }

    /**
     * @desc
     *  Returns the last of items the underlying {@link Array} contains,
     *  left after applying any filters.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<Item_Type>}
     */
    last(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type> {
        return this.arrayAs(actor)
            .then(items => this.getItemAt(items, items.length - 1));
    }

    /**
     * @desc
     *  Filters the underlying {@link Array} so that the result contains only those items that meet the {@link Expectation}
     *
     * @param {MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>} question
     * @param {Expectation<any, Answer_Type>} expectation
     *
     * @returns {ListAdapter<Item_Type, Item_Type[], Promise<Item_Type>, Promise<Item_Type[]>>}
     *
     * @see {MetaQuestion}
     */
    withFilter<Answer_Type>(
        question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>
    ): ListAdapter<Item_Type, Item_Type[], Promise<Item_Type>, Promise<Item_Type[]>> {
        return new ArrayListAdapter(
            new ArrayListFilter(this.array, question, expectation)
        );
    }

    /**
     * @desc
     *  Returns a human-readable description of the underlying {@link Array}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `${ this.array }`
    }

    private arrayAs(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type[]> {
        return actor.answer(this.array)
            .then(array => ensure('ArrayListAdapter constructor parameter', array, isArray()));
    }

    private getItemAt(items: Item_Type[], index: number): Item_Type {

        ensure('index', index, isNumber());

        const collectionDescription = this.toString();
        const itemsDescription = formatted`${ items }`;
        const description = collectionDescription !== itemsDescription
            ? `${ collectionDescription } ${ itemsDescription }`
            : itemsDescription;

        if (items.length === 0) {
            throw new Error(`${ description } is empty`);
        }

        if (index in items) {
            return items[index];
        }

        throw new Error(`${ description } has no item at index ${ index }`);
    }
}

/**
 * @package
 */
class ArrayListFilter<Item_Type, Answer_Type>
    extends Question<Promise<Item_Type[]>>
{
    constructor(
        private readonly collection: Answerable<Item_Type[]>,
        private readonly question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>
    ) {
        super([
            formatted `${ collection }`,
            collection instanceof ArrayListFilter ? 'and' : 'where',
            formatted `${ question } does ${ expectation }`
        ].join(' '));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type[]> {

        return actor.answer(this.collection)
            .then(array => ensure('ArrayListAdapter constructor parameter', array, isArray()))  // todo: extract to avoid duplication?
            .then(array =>
                Promise.all(array.map(item =>
                    Promise.resolve(this.question.of(item).answeredBy(actor))
                        .then(answer => this.expectation.answeredBy(actor)(answer))
                        .then(outcome => ({ item, outcome }))
                ))
            )
            .then(results =>
                results.filter(result => result.outcome instanceof ExpectationMet)
                    .map(result => result.item)
            );
    }
}

