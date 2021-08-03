import { Ensure } from '@serenity-js/assertions';
import {
    Answerable,
    AnswersQuestions,
    MetaQuestion,
    PerformsActivities,
    Question,
    UsesAbilities,
} from '@serenity-js/core';
import { ElementHandle } from 'playwright';

import {
    ElementHandleAnswer,
    extend,
} from '../../../answerTypes/ElementHandleAnswer';
import { isPresent } from '../../../expectations';
import { BrowseTheWeb } from '../../abilities';
import { Locator } from './locators';

/**
 * @desc
 *  Locates a single {@link WebElement}.
 *
 *  Instead of using this class directly, please use {@link Target.the} instead.
 *
 * @public
 * @see {@link Target}
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class TargetElement
    extends Question<Promise<ElementHandle>>
    implements MetaQuestion<Answerable<ElementHandle>, Promise<ElementHandle>>
{
    /**
     *
     * @param selector
     * @returns TargetElement found by selector
     */
    public static located(selector: Locator): TargetElement {
        return new this(selector);
    }
    /**
     * @desc
     *
     * @param {string} description - A human-readable description to be used in the report
     * @param {string} locator - A selector to be used when searching for the element
     */
    protected constructor(
        protected readonly locator: Locator,
        protected readonly parent?: Answerable<ElementHandle>
    ) {
        super(locator.toString());
    }

    /**
     * @desc
     *  Retrieves a {@link WebElement} located by `locator`,
     *  resolved in the context of a `parent` {@link WebElement}.
     *
     * @param {Question<ElementHandle> | ElementHandle} parent
     * @returns {TargetNestedElement}
     *
     * @see {@link Target}
     */
    of(parent: Answerable<ElementHandle>): TargetElement {
        return new TargetElement(this.locator, parent).as(
            `${this.toString()} of ${parent.toString()}`
        );
    }

    /**
     *
     * @param description
     * @returns adds description to the element. Description is prefixed by article 'the'. See examples in tests
     */
    as(description: string): TargetElement {
        this.describedAs(description);
        return this;
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
    public async answeredBy(
        actor: AnswersQuestions & UsesAbilities & PerformsActivities
    ): Promise<ElementHandleAnswer> {
        const parent = await this.getRealParent(actor);

        const element = extend(await this.locator.firstMatchingAt(parent).answeredBy(actor));

        this.overrideToString(element, this.toString());

        return element;
    }

    protected async getRealParent(
        actor: AnswersQuestions & UsesAbilities & PerformsActivities
    ): Promise<ElementHandle | BrowseTheWeb> {
        const hierarchyParent = this.parent && (await actor.answer(this.parent));

        if (hierarchyParent) {
            await actor.attemptsTo(Ensure.that(hierarchyParent, isPresent()));
        }

        return hierarchyParent || BrowseTheWeb.as(actor);
    }

    protected overrideToString(
        element: ElementHandleAnswer,
        description: string
    ): void {
        // this seems to be the only way to make Ensure errors work correctly
        // according to formatted.spec.ts in @serenityjs/core
        element.toString = function () {
            return description;
        };
    }
}
