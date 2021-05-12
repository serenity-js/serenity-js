import { AnswersQuestions, Expectation, List, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../../abilities';
import { override } from './override';
import { TargetNestedElements } from './TargetNestedElements';
import { ElementArrayFinderListAdapter } from '../lists';

/**
 * @desc
 *  Locates a group of {@link WebElement}s.
 *
 *  Instead of using this class directly, please use {@link Target.all} instead.
 *
 * @public
 * @see {@link Target}
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class TargetElements
    extends Question<ElementArrayFinder>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{
    private readonly list: List<ElementArrayFinderListAdapter, ElementFinder, ElementArrayFinder>;

    /**
     * @desc
     *
     * @param {string} description - A human-readable description to be used in the report
     * @param {protractor~Locator} locator - A locator to be used when locating the element
     */
    constructor(
        private readonly description: string,
        private readonly locator: Locator,
    ) {
        super(`the ${ description }`);
        this.list = new List(new ElementArrayFinderListAdapter(this));
    }

    /**
     * @desc
     *  Retrieves a group of {@link WebElement}s located by `locator`,
     *  resolved in the context of a `parent` {@link WebElement}.
     *
     * @param {Question<ElementFinder> | ElementFinder} parent
     * @returns {TargetNestedElements}
     *
     * @see {@link Target}
     */
    of(parent: Question<ElementFinder> | ElementFinder): TargetNestedElements {
        return new TargetNestedElements(parent, this);
    }

    /**
     * @desc
     *  Returns the number of {@link ElementFinder}s matched by the `locator`
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<Promise<number>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~List}
     */
    count(): Question<Promise<number>> {
        return this.list.count();
    }

    /**
     * @desc
     *  Returns the first of {@link ElementFinder}s matched by the `locator`
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<ElementFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~List}
     */
    first(): Question<ElementFinder> {
        return this.list.first()
    }

    /**
     * @desc
     *  Returns the last of {@link ElementFinder}s matched by the `locator`
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<ElementFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~List}
     */
    last(): Question<ElementFinder> {
        return this.list.last()
    }

    /**
     * @desc
     *  Returns an {@link ElementFinder} at `index` for `locator`
     *
     * @param {number} index
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<ElementFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~List}
     */
    get(index: number): Question<ElementFinder> {
        return this.list.get(index);
    }

    /**
     * @desc
     *  Filters the list of {@link ElementFinder}s matched by `locator` to those that meet the additional {@link @serenity-js/core/lib/screenplay/questions~Expectation}s.
     *
     * @param {@serenity-js/core/lib/screenplay/questions~MetaQuestion<ElementFinder, Promise<Answer_Type> | Answer_Type>} question
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<any, Answer_type>} expectation
     *
     * @returns {@serenity-js/core/lib/screenplay/questions~List<ElementArrayFinderListAdapter, ElementFinder, ElementArrayFinder>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~List}
     */
    where<Answer_Type>(
        question: MetaQuestion<ElementFinder, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): List<ElementArrayFinderListAdapter, ElementFinder, ElementArrayFinder> {
        return this.list.where(question, expectation);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return override(
            BrowseTheWeb.as(actor).locateAll(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }
}
