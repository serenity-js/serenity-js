import { Answerable, AnswersQuestions, Expectation, ExpectationMet, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ListAdapter } from '@serenity-js/core/lib/screenplay/questions/lists';
import type { Element, ElementArray } from 'webdriverio';

/**
 * @desc
 *  Adapts {@link ElementArray} so that it can be used with {@link @serenity-js/core/lib/screenplay/questions~List}.
 *
 *  You most likely won't need to use this class directly. Instead, check out {@link Target} and {@link Target.all}.
 *
 * @see {@link Target}
 *
 * @implements {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter}
 */
export class ElementArrayListAdapter implements ListAdapter<Promise<Element<'async'>>, Promise<ElementArray>> {

    constructor(private readonly collection: Answerable<ElementArray>) {
    }

    /**
     * @desc
     *  Returns the number of {@link Element}s that the underlying {@link ElementArray} contains,
     *  left after applying any filters.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<number>}
     */
    async count(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        const elements = await this.elements(actor);
        return elements.length;
    }

    /**
     * @desc
     *  Returns the first of {@link Element}s that the underlying {@link ElementArray} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    async first(actor: AnswersQuestions & UsesAbilities): Promise<Element<'async'>> {
        const elements = await this.elements(actor);
        return elements[0];
    }

    /**
     * @desc
     *  Returns the last of {@link Element}s that the underlying {@link ElementArray} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    async last(actor: AnswersQuestions & UsesAbilities): Promise<Element<'async'>> {
        const elements = await this.elements(actor);
        return elements[elements.length - 1];
    }

    /**
     * @desc
     *  Returns the nth of {@link Element}s that the underlying {@link ElementArray} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     *
     * @param {number} index
     *  Zero-based index of the item to return
     *
     * @returns {Element<'async'>}
     */
    async get(actor: AnswersQuestions & UsesAbilities, index: number): Promise<Element<'async'>> {
        const elements = await this.elements(actor);
        return elements[index];
    }

    /**
     * @desc
     *  Returns the underlying {@link ElementArray},
     *  with any filters applied.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    items(actor: AnswersQuestions & UsesAbilities): Promise<ElementArray> {
        return this.elements(actor);
    }

    /**
     * @desc
     *  Filters the underlying {@link ElementArray} so that the result contains only those {@link Element<'async'>}s that meet the {@link Expectation}
     *
     * @param {@serenity-js/core/lib/screenplay/questions~MetaQuestion<Answerable<Element<'async'>>, Promise<Answer_Type> | Answer_Type>} question
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<any, Answer_Type>} expectation
     *
     * @returns {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter<Element<'async'>, ElementArrayFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    withFilter<Answer_Type>(
        question: MetaQuestion<Answerable<Element<'async'>>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>
    ): ListAdapter<Promise<Element<'async'>>, Promise<ElementArray>> {
        return new ElementArrayListAdapter(
            new ElementArrayListFilter(this.collection, question, expectation)
        );
    }

    /**
     * @desc
     *  Returns a human-readable description of the underlying {@link ElementArray}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `${ this.collection }`;
    }

    private elements(actor: AnswersQuestions & UsesAbilities): Promise<ElementArray> {
        return actor.answer(this.collection);
    }
}

/**
 * @private
 */
class ElementArrayListFilter<Answer_Type>
    extends Question<Promise<ElementArray>>
{
    constructor(
        private readonly collection: Answerable<ElementArray>,
        private readonly question: MetaQuestion<Answerable<Element<'async'>>, Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>
    ) {
        super([
            formatted `${ collection }`,
            collection instanceof ElementArrayListFilter ? 'and' : 'where',
            formatted `${ question } does ${ expectation }`
        ].join(' '));
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementArray> {

        const collection = await actor.answer(this.collection);
        const outcomes   = await Promise.all(
            collection.map((element: Element<'async'>) =>
                actor.answer(this.question.of(element))
                    .then((answer: Answer_Type) => this.expectation.answeredBy(actor)(answer))
            )
        );

        const matching = collection.filter((element: Element<'async'>, index: number) => outcomes[index] instanceof ExpectationMet) as ElementArray;

        matching.selector   = collection.selector;
        matching.parent     = collection.parent;
        matching.foundWith  = collection.foundWith;
        matching.props      = collection.props;

        return matching;
    }
}
