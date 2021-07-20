import {
  Answerable,
  AnswersQuestions,
  MetaQuestion,
  PerformsActivities,
  Question,
  UsesAbilities,
} from "@serenity-js/core";
import { Ensure } from "@serenity-js/assertions";

import { ElementHandle } from "playwright";
import { BrowseTheWeb } from "../../abilities";
import {
  ElementHandleAnswer,
  extend,
} from "../../../answerTypes/ElementHandleAnswer";
import { isPresent } from "../../../expectations";
import { ElementHandleEvent } from "../../../expectations/ElementHandleExpectation";

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
   * @deprecated use {@link TargetElement}.at(selector).as(description)
   *
   * @param description
   * @param selector
   * @returns
   */
  public static whichIs(description: string, selector: string): TargetElement {
    return this.at(selector).as(description);
  }

  /**
   *
   * @param selector
   * @returns TargetElement found by selector
   */
  public static at(selector: string): TargetElement {
    return new this(selector);
  }
  /**
   * @desc
   *
   * @param {string} description - A human-readable description to be used in the report
   * @param {string} selector - A selector to be used when searching for the element
   */
  protected constructor(
    protected readonly selector: string,
    protected readonly parent?: Answerable<ElementHandle>
  ) {
    super(selector);
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
    return new TargetElement(this.selector, parent).as(
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
   *  Creates {@link TargetElement} that waits for a specific state, when actor looks for the answer
   *
   * @param {Expectation<boolean, ElementHandleAnswer>} state Expectation to wait to fulfill
   * @returns {TargetElement} TargetElement implementation that awaits for the state
   */
  whichShouldBecome(state: ElementHandleEvent): TargetElement {
    return new TargetElementInState(this.selector, this.parent, state);
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
    let parent = await this.getRealParent(actor);

    const element = extend(await parent.$(this.selector));

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

    return hierarchyParent || (await BrowseTheWeb.as(actor));
  }

  protected overrideToString(
    element: ElementHandleAnswer,
    description: string
  ) {
    // this seems to be the only way to make Ensure errors work correctly
    // according to formatted.spec.ts in @serenityjs/core
    element.toString = function () {
      return description;
    };
  }
}

class TargetElementInState extends TargetElement {
  constructor(
    selector: string,
    parent: Answerable<ElementHandle>,
    private readonly state: ElementHandleEvent
  ) {
    super(selector, parent);
  }

  public async answeredBy(
    actor: AnswersQuestions & UsesAbilities & PerformsActivities
  ): Promise<ElementHandleAnswer> {
    let parent = await this.getRealParent(actor);

    const element = extend(
      await parent.waitForSelector(this.selector, {
        state: this.state.expectedEvent(),
      })
    );

    this.overrideToString(element, this.toString());

    return element;
  }
}
