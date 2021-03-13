import { ListAdapter } from '@serenity-js/core/lib/screenplay/questions/lists';
import { formatted } from '@serenity-js/core/lib/io';
import { AnswersQuestions, Expectation, ExpectationMet, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';

/**
 * @desc
 *  Adapts {@link ElementArrayFinder} so that it can be used with {@link @serenity-js/core/lib/screenplay/questions~List}.
 *
 *  You most likely won't need to use this class directly. Instead, check out {@link Target} and {@link Target.all}.
 *
 * @see {@link Target}
 *
 * @implements {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter}
 */
export class ElementArrayFinderListAdapter implements ListAdapter<ElementFinder, ElementArrayFinder> {

    /**
     * @param {Question<ElementArrayFinder> | ElementArrayFinder} collection
     */
    constructor(private readonly collection: Question<ElementArrayFinder> | ElementArrayFinder) {
    }

    /**
     * @desc
     *  Returns the number of {@link ElementFinder}s that the underlying {@link ElementArrayFinder} contains,
     *  left after applying any filters.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<number>}
     */
    count(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        return Promise.resolve(this.elements(actor).count());
    }

    /**
     * @desc
     *  Returns the first of {@link ElementFinder}s that the underlying {@link ElementArrayFinder} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {ElementFinder}
     */
    first(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return this.elements(actor).first();
    }

    /**
     * @desc
     *  Returns the last of {@link ElementFinder}s that the underlying {@link ElementArrayFinder} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {ElementFinder}
     */
    last(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return this.elements(actor).last();
    }

    /**
     * @desc
     *  Returns the nth of {@link ElementFinder}s that the underlying {@link ElementArrayFinder} contains,
     *  left after applying any filters
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     *
     * @param {number} index
     *  Zero-based index of the item to return
     *
     * @returns {ElementFinder}
     */
    get(actor: AnswersQuestions & UsesAbilities, index: number): ElementFinder {
        return this.elements(actor).get(index);
    }

    /**
     * @desc
     *  Returns the underlying {@link ElementArrayFinder},
     *  with any filters applied.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {ElementFinder}
     */
    items(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return this.elements(actor);
    }

    /**
     * @desc
     *  Filters the underlying {@link ElementArrayFinder} so that the result contains only those {@link ElementFinder}s that meet the {@link Expectation}
     *
     * @param {@serenity-js/core/lib/screenplay/questions~MetaQuestion<ElementFinder, Promise<Answer_Type> | Answer_Type>} question
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<any, Answer_Type>} expectation
     *
     * @returns {@serenity-js/core/lib/screenplay/questions/lists~ListAdapter<ElementFinder, ElementArrayFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    withFilter<Answer_Type>(
        question: MetaQuestion<ElementFinder, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>
    ): ListAdapter<ElementFinder, ElementArrayFinder> {
        return new ElementArrayFinderListAdapter(
            new ElementArrayFinderArrayListFilter(this.collection, question, expectation)
        );
    }

    /**
     * @desc
     *  Returns a human-readable description of the underlying {@link ElementArrayFinder}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `${ this.collection }`;
    }

    private elements(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return Question.isAQuestion(this.collection)
            ? this.collection.answeredBy(actor)
            : this.collection;
    }
}

/**
 * @private
 */
class ElementArrayFinderArrayListFilter<Answer_Type>
    extends Question<ElementArrayFinder>
{
    constructor(
        private readonly collection: Question<ElementArrayFinder> | ElementArrayFinder,
        private readonly question: MetaQuestion<ElementFinder, Promise<Answer_Type> | Answer_Type>,
        private readonly expectation: Expectation<any, Answer_Type>
    ) {
        super([
            formatted `${ collection }`,
            collection instanceof ElementArrayFinderArrayListFilter ? 'and' : 'where',
            formatted `${ question } does ${ expectation }`
        ].join(' '));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {

        return this.finderAs(actor)
            .filter((elementFinder: ElementFinder) =>
                Promise.resolve(this.question.of(elementFinder).answeredBy(actor))
                    .then(answer => this.expectation.answeredBy(actor)(answer))
                    .then(outcome => outcome instanceof ExpectationMet)
            );
    }

    private finderAs(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return Question.isAQuestion(this.collection)
            ? this.collection.answeredBy(actor)
            : this.collection;
    }
}
