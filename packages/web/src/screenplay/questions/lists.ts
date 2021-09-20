import { Answerable, AnswersQuestions, Expectation, ExpectationMet, ExpectationOutcome, MetaQuestion, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ListAdapter } from '@serenity-js/core/lib/screenplay/questions/lists';

import { UIElement, UIElementList } from '../../ui';
import { UIElementQuestion } from './UIElementQuestion';

/**
 * @desc
 *  Adapts {@link UIElementList} so that it can be used with {@link @serenity-js/core/lib/screenplay/questions~List}.
 *
 *  You most likely won't need to use this class directly. Instead, check out {@link Target} and {@link Target.all}.
 *
 * @see {@link Target}
 *
 * @implements {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter}
 */
export class ElementListAdapter implements ListAdapter<Promise<UIElement>, Promise<UIElementList>> {

    constructor(private readonly collection: Answerable<UIElementList>) {
    }

    /**
     * @desc
     *  Returns the number of {@link Element}s that the underlying {@link UIElementList} contains,
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
     *  Returns the first of {@link Element}s that the underlying {@link UIElementList} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    async first(actor: AnswersQuestions & UsesAbilities): Promise<UIElement> {
        const elements = await this.elements(actor);
        return elements.first();
    }

    /**
     * @desc
     *  Returns the last of {@link Element}s that the underlying {@link UIElementList} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    async last(actor: AnswersQuestions & UsesAbilities): Promise<UIElement> {
        const elements = await this.elements(actor);
        return elements.last();
    }

    /**
     * @desc
     *  Returns the nth of {@link Element}s that the underlying {@link UIElementList} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     *
     * @param {number} index
     *  Zero-based index of the item to return
     *
     * @returns {Element<'async'>}
     */
    async get(actor: AnswersQuestions & UsesAbilities, index: number): Promise<UIElement> {
        const elements = await this.elements(actor);
        return elements.get(index);
    }

    /**
     * @desc
     *  Returns the underlying {@link UIElementList},
     *  with any filters applied.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Element<'async'>}
     */
    items(actor: AnswersQuestions & UsesAbilities): Promise<UIElementList> {
        return this.elements(actor);
    }

    /**
     * @desc
     *  Filters the underlying {@link UIElementList} so that the result contains only those {@link Element<'async'>}s that meet the {@link Expectation}
     *
     * @param {@serenity-js/core/lib/screenplay/questions~MetaQuestion<Answerable<Element<'async'>>, Promise<Answer_Type> | Answer_Type>} question
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<any, Answer_Type>} expectation
     *
     * @returns {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter<Element<'async'>, UIElementListFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    withFilter<Answer_Type>(
        question: MetaQuestion<Answerable<UIElement>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>
    ): ListAdapter<Promise<UIElement>, Promise<UIElementList>> {
        return new ElementListAdapter(
            new UIElementListFilter(this.collection, question, expectation)
        );
    }

    /**
     * @desc
     *  Returns a human-readable description of the underlying {@link UIElementList}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `${ this.collection }`;
    }

    private elements(actor: AnswersQuestions & UsesAbilities): Promise<UIElementList> {
        return actor.answer(this.collection);
    }
}

/**
 * @private
 */
class UIElementListFilter<Answer_Type>
    extends UIElementQuestion<Promise<UIElementList>>
{
    constructor(
        private readonly collection: Answerable<UIElementList>,
        private readonly question: MetaQuestion<Answerable<UIElement>, Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>
    ) {
        super([
            formatted `${ collection }`,
            collection instanceof UIElementListFilter ? 'and' : 'where',
            formatted `${ question } does ${ expectation }`
        ].join(' '));
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<UIElementList> {

        const collection: UIElementList = await this.resolve(actor, this.collection);
        const outcomes: Array<ExpectationOutcome<any, Answer_Type>> = await collection.map((element: UIElement) =>
            actor.answer(this.question.of(element))
                .then((answer: Answer_Type) => {
                    return this.expectation.answeredBy(actor)(answer)
                })
        );

        return collection.filter(
            (element: UIElement, index: number) => outcomes[index] instanceof ExpectationMet
        ) as UIElementList;
    }
}
