/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Answerable, AnswersQuestions, Expectation, List, LogicError, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { UIElement, UIElementList, UIElementLocation } from '../../ui';
import { BrowseTheWeb } from '../abilities';
import { ElementListAdapter } from './lists';
import { NestedTargetBuilder } from './NestedTargetBuilder';
import { TargetBuilder } from './TargetBuilder';

/**
 * @desc
 *  A type alias representing a {@link @serenity-js/core/lib/screenplay/questions~List} of WebdriverIO Web elements.
 *
 * @public
 *
 * @see {@link @serenity-js/core/lib/screenplay/questions~List}
 *
 * @typedef {List<ElementListAdapter, Promise<UIElement>, Promise<UIElementList>>} TargetList
 */
export type TargetList = List<ElementListAdapter, Promise<UIElement>, Promise<UIElementList>>;

/**
 * @desc
 *  Provides a convenient way to retrieve a single web element or multiple web elements,
 *  so that they can be used with Serenity/JS {@link @serenity-js/core/lib/screenplay~Interaction}s.
 *
 *  Check out the examples below, as well as the unit tests demonstrating the usage.
 *
 *  @example <caption>Imaginary website under test</caption>
 *   <body>
 *       <ul id="basket">
 *           <li><a href="#">Apple</a></li>
 *           <li><a href="#">Banana</a></li>
 *           <li><a href="#">Coconut</a></li>
 *           <li><a href="#" class="has-discount">Date</a></li>
 *       </ul>
 *       <div id="summary">
 *           <strong class="out-of-stock">Coconut</strong> is not available
 *       </div>
 *       <button type="submit">Proceed to Checkout</button>
 *   </body>
 *
 *  @example <caption>Locating a single element</caption>
 *   import { by, Target, TargetElement } from '@serenity-js/webdriverio';
 *
 *   const proceedToCheckoutButton: TargetElement =
 *       Target.the('Proceed to Checkout button').located(by.css(`button[type='submit']`));
 *
 *  @example <caption>Locating multiple elements</caption>
 *   import { by, Target, TargetElements } from '@serenity-js/webdriverio';
 *
 *   const basketItems: TargetElements =
 *       Target.all('items in the basket').located(by.css('ul#basket li'));
 *
 *  @example <caption>Locating element relative to another element</caption>
 *   import { by, Target, TargetElement } from '@serenity-js/webdriverio';
 *
 *   const summary: TargetElement =
 *       Target.the('summary').located(by.id('message'));
 *
 *   const outOfStockItem: TargetElement =
 *       Target.the('out of stock item').of(summary).located(by.css('.out-of-stock'))
 *
 *  @example <caption>Filtering elements matched by a locator</caption>
 *   import { by, Target, Text } from '@serenity-js/webdriverio';
 *   import { endsWith } from '@serenity-js/assertions';
 *
 *   const basketItems =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .where(Text, endsWith('e'));    // Apple, Date
 *
 *  @example <caption>Counting items matched by a locator</caption>
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target, Text } from '@serenity-js/webdriverio';
 *
 *   const basketItemsCount: Question<Promise<number>> =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .count()    // 4
 *
 *  @example <caption>Getting first item matched by a locator</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target } from '@serenity-js/webdriverio';
 *   import { Element } from 'webdriverio';
 *
 *   const apple: Question<Promise<UIElement>>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .first()
 *
 *  @example <caption>Getting last item matched by a locator</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target } from '@serenity-js/webdriverio';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { Element } from 'webdriverio';
 *
 *   const date: Question<Promise<UIElement>>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .last()
 *
 *  @example <caption>Getting nth item matched by a locator</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target } from '@serenity-js/webdriverio';
 *   import { Element } from 'webdriverio';
 *
 *   const banana: Question<Promise<UIElement>>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .get(1)
 *
 *  @example <caption>Using multiple filters and nested targets</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { contain, endsWith } from '@serenity-js/assertions';
 *   import { by, CSSClasses, Target, Text } from '@serenity-js/webdriverio';
 *   import { Element } from 'webdriverio';
 *
 *   class Basket {
 *       static component = Target.the('basket').located(by.id('basket'));
 *
 *       static items     = Target.all('items').located(by.css('li'))
 *          .of(Basket.component);
 *
 *       static link      = Target.the('link').located(by.css('a'));
 *   }
 *
 *   const date: Question<Promise<UIElement>>  =
 *       Basket.items
 *          .where(Text, endsWith('e'))
 *          .where(CSSClasses.of(Basket.link), contain('has-discount'))
 *          .first()
 *
 *  @example <caption>Clicking on an element</caption>
 *   import { actorCalled } from '@serenity-js/core';
 *   import { BrowseTheWeb, Click } from '@serenity-js/webdriverio';
 *
 *   actorCalled('Jane')
 *       .whoCan(BrowseTheWeb.using(browser))
 *       .attemptsTo(
 *           Click.on(proceedToCheckoutButton),
 *       );
 *
 *  @example <caption>Retrieving text of multiple elements and performing an assertion</caption>
 *   import { Ensure, contain } from '@serenity-js/assertions';
 *   import { actorCalled } from '@serenity-js/core';
 *   import { BrowseTheWeb, Text } from '@serenity-js/webdriverio';
 *
 *   const basketItemNames = Text.ofAll(basketItems);
 *
 *   actorCalled('Jane')
 *       .whoCan(BrowseTheWeb.using(browser))
 *       .attemptsTo(
 *           Ensure.that(basketItemNames, contain('Apple'))
 *       );
 *
 *  @example <caption>Waiting on an element</caption>
 *   import { actorCalled } from '@serenity-js/core';
 *   import { BrowseTheWeb, Wait, isClickable } from '@serenity-js/webdriverio';
 *
 *   actorCalled('Jane')
 *       .whoCan(BrowseTheWeb.using(browser))
 *       .attemptsTo(
 *           Wait.until(proceedToCheckoutButton, isClickable()),
 *       );
 */
export class Target {

    /**
     * @desc
     *  Locates a single Web element
     *
     * @param {string} description
     *  A human-readable name of the element, which will be used in the report
     *
     * @returns {TargetBuilder<TargetElement> & NestedTargetBuilder<TargetNestedElement>}
     */
    static the(description: string): TargetBuilder<TargetElement> & NestedTargetBuilder<TargetNestedElement> {
        return {
            located(location: UIElementLocation): TargetElement {
                return new TargetElement(`the ${ description }`, location);
            },

            of(parent: Answerable<UIElement>) {
                return {
                    located(locator: UIElementLocation): TargetNestedElement {
                        return new TargetNestedElement(parent, new TargetElement(description, locator));
                    }
                }
            }
        }
    }

    /**
     * @desc
     *  Locates a group of Web elements
     *
     * @param {string} description
     *  A human-readable name of the group of elements, which will be used in the report
     *
     * @returns {TargetBuilder<TargetElements> & NestedTargetBuilder<TargetNestedElements>}
     */
    static all(description: string): TargetBuilder<TargetElements> & NestedTargetBuilder<TargetNestedElements> {
        return {
            located(locator: UIElementLocation): TargetElements {
                return new TargetElements(description, locator);
            },

            of(parent: Answerable<UIElement>) {
                return {
                    located(locator: UIElementLocation): TargetNestedElements {
                        return new TargetNestedElements(parent, new TargetElements(description, locator));
                    }
                }
            }
        }
    }
}

/**
 * @desc
 *  You probably don't want to use this class directly. See {@link Target} instead.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 *
 * @see {@link Target}
 */
export class TargetElements
    extends Question<Promise<UIElementList>>
    implements MetaQuestion<Answerable<UIElement>, Promise<UIElementList>>
{
    private readonly list: List<ElementListAdapter, Promise<UIElement>, Promise<UIElementList>>;

    constructor(
        description: string,
        private readonly location: UIElementLocation,
    ) {
        super(description);
        this.list = new List(new ElementListAdapter(this));
    }

    of(parent: Answerable<UIElement>): TargetNestedElements {
        return new TargetNestedElements(parent, this);
    }

    count(): Question<Promise<number>> {
        return this.list.count();
    }

    first(): Question<Promise<UIElement>> {
        return this.list.first()
    }

    last(): Question<Promise<UIElement>> {
        return this.list.last()
    }

    get(index: number): Question<Promise<UIElement>> {
        return this.list.get(index);
    }

    where<Answer_Type>(
        question: MetaQuestion<Answerable<UIElement>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): TargetList {
        return this.list.where(question, expectation);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<UIElementList> {
        return BrowseTheWeb.as(actor).locateAllElementsAt(this.location);
    }
}

/**
 * @desc
 *  You probably don't want to use this class directly. See {@link Target} instead.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 *
 * @see {@link Target}
 */
export class TargetNestedElements
    extends Question<Promise<UIElementList>>
    implements MetaQuestion<Answerable<UIElement>, Promise<UIElementList>>
{
    private readonly list: List<ElementListAdapter, Promise<UIElement>, Promise<UIElementList>>;

    constructor(
        private readonly parent: Answerable<UIElement>,
        private readonly children: Answerable<UIElementList>,
    ) {
        super(`${ children } of ${ parent }`);
        this.list = new List(new ElementListAdapter(this));
    }

    of(parent: Answerable<UIElement>): Question<Promise<UIElementList>> {
        return new TargetNestedElements(parent, this);
    }

    count(): Question<Promise<number>> {
        return this.list.count();
    }

    first(): Question<Promise<UIElement>> {
        return this.list.first()
    }

    last(): Question<Promise<UIElement>> {
        return this.list.last()
    }

    get(index: number): Question<Promise<UIElement>> {
        return this.list.get(index);
    }

    where<Answer_Type>(
        question: MetaQuestion<Answerable<UIElement>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): TargetList {
        return this.list.where(question, expectation);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<UIElementList> {
        const parent   = await actor.answer(this.parent);
        const children = await actor.answer(this.children);

        if (! parent) {
            throw new LogicError(formatted `Couldn't find ${ this.parent }`);
        }

        return parent.locateAllChildElements(children.location());
    }
}

/**
 * @desc
 *  You probably don't want to use this class directly. See {@link Target} instead.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 *
 * @see {@link Target}
 */
export class TargetElement
    extends Question<Promise<UIElement>>
    implements MetaQuestion<Answerable<UIElement>, Promise<UIElement>>
{
    constructor(
        description: string,
        private readonly location: UIElementLocation,
    ) {
        super(description);
    }

    of(parent: Answerable<UIElement>): Question<Promise<UIElement>> {
        return new TargetNestedElement(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<UIElement> {
        return BrowseTheWeb.as(actor).locateElementAt(this.location);
    }
}

/**
 * @desc
 *  You probably don't want to use this class directly. See {@link Target} instead.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 *
 * @see {@link Target}
 */
export class TargetNestedElement
    extends Question<Promise<UIElement>>
    implements MetaQuestion<Answerable<UIElement>, Promise<UIElement>>
{
    constructor(
        private readonly parent: Answerable<UIElement>,
        private readonly child: Answerable<UIElement>,
    ) {
        super(`${ child } of ${ parent }`);
    }

    of(parent: Answerable<UIElement>): Question<Promise<UIElement>> {
        return new TargetNestedElement(parent, this);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<UIElement> {
        const parent = await actor.answer(this.parent);
        const child  = await actor.answer(this.child);

        if (! parent) {
            throw new LogicError(formatted `Couldn't find ${ this.parent }`);
        }

        return parent.locateChildElement(child.location());
    }
}
