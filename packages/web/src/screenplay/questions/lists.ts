import { Answerable, AnswersQuestions, Expectation, ExpectationMet, ExpectationOutcome, MetaQuestion, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ListAdapter } from '@serenity-js/core/lib/screenplay/questions/lists';

import { Element, ElementList } from '../../ui';
import { ElementQuestion } from './ElementQuestion';

/**
 * @desc
 *  Adapts {@link ElementList} so that it can be used with {@link @serenity-js/core/lib/screenplay/questions~List}.
 *
 *  You most likely won't need to use this class directly. Instead, check out {@link Target} and {@link Target.all}.
 *
 * @see {@link Target}
 *
 * @implements {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter}
 */
export class ElementListAdapter implements ListAdapter<Promise<Element>, Promise<ElementList>> {

    constructor(private readonly collection: Answerable<ElementList>) {
    }

    /**
     * @desc
     *  Returns the number of {@link Element}s that the underlying {@link ElementList} contains,
     *  left after applying any filters.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<number>}
     */
    async count(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        const elements = await this.elements(actor);
        return elements.count();
    }

    /**
     * @desc
     *  Returns the first of {@link Element}s that the underlying {@link ElementList} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    async first(actor: AnswersQuestions & UsesAbilities): Promise<Element> {
        const elements = await this.elements(actor);
        return elements.first();
    }

    /**
     * @desc
     *  Returns the last of {@link Element}s that the underlying {@link ElementList} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    async last(actor: AnswersQuestions & UsesAbilities): Promise<Element> {
        const elements = await this.elements(actor);
        return elements.last();
    }

    /**
     * @desc
     *  Returns the nth of {@link Element}s that the underlying {@link ElementList} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     *
     * @param {number} index
     *  Zero-based index of the item to return
     *
     * @returns {Element<'async'>}
     */
    async get(actor: AnswersQuestions & UsesAbilities, index: number): Promise<Element> {
        const elements = await this.elements(actor);
        return elements.get(index);
    }

    /**
     * @desc
     *  Returns the underlying {@link ElementList},
     *  with any filters applied.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    items(actor: AnswersQuestions & UsesAbilities): Promise<ElementList> {
        return this.elements(actor);
    }

    /**
     * @desc
     *  Filters the underlying {@link ElementList} so that the result contains only those {@link Element<'async'>}s that meet the {@link Expectation}
     *
     * @param {@serenity-js/core/lib/screenplay/questions~MetaQuestion<Answerable<Element<'async'>>, Promise<Answer_Type> | Answer_Type>} question
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<any, Answer_Type>} expectation
     *
     * @returns {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter<Element<'async'>, ElementListFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    withFilter<Answer_Type>(
        question: MetaQuestion<Answerable<Element>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>
    ): ListAdapter<Promise<Element>, Promise<ElementList>> {
        return new ElementListAdapter(
            new ElementListFilter(this.collection, question, expectation)
        );
    }

    /**
     * @desc
     *  Returns a human-readable description of the underlying {@link ElementList}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `${ this.collection }`;
    }

    private elements(actor: AnswersQuestions & UsesAbilities): Promise<ElementList> {
        return actor.answer(this.collection);
    }
}

/**
 * @private
 */
class ElementListFilter<Answer_Type>
    extends ElementQuestion<Promise<ElementList>>
{
    constructor(
        private readonly collection: Answerable<ElementList>,
        private readonly question: MetaQuestion<Answerable<Element>, Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>
    ) {
        super([
            formatted `${ collection }`,
            collection instanceof ElementListFilter ? 'and' : 'where',
            formatted `${ question } does ${ expectation }`
        ].join(' '));
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementList> {

        const collection: ElementList = await this.resolve(actor, this.collection);
        const outcomes: Array<ExpectationOutcome<any, Answer_Type>> = await collection.map((element: Element) =>
            actor.answer(this.question.of(element))
                .then((answer: Answer_Type) => {
                    return this.expectation.answeredBy(actor)(answer)
                })
        );

        return collection.filter(
            (element: Element, index: number) => outcomes[index] instanceof ExpectationMet
        ) as ElementList;
    }
}
