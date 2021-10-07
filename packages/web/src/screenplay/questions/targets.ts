/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Answerable, AnswersQuestions, Expectation, List, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';

import { Element, ElementList, ElementLocation } from '../../ui';
import { BrowseTheWeb } from '../abilities';
import { ElementQuestion } from './ElementQuestion';
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
 * @typedef {List<ElementListAdapter, Promise<Element>, Promise<ElementList>>} TargetList
 */
export type TargetList = List<ElementListAdapter, Promise<Element>, Promise<ElementList>>;

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
 *   const apple: Question<Promise<Element>>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .first()
 *
 *  @example <caption>Getting last item matched by a locator</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target } from '@serenity-js/webdriverio';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { Element } from 'webdriverio';
 *
 *   const date: Question<Promise<Element>>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .last()
 *
 *  @example <caption>Getting nth item matched by a locator</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target } from '@serenity-js/webdriverio';
 *   import { Element } from 'webdriverio';
 *
 *   const banana: Question<Promise<Element>>  =
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
 *   const date: Question<Promise<Element>>  =
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
            located(location: ElementLocation): TargetElement {
                return new TargetElement(`the ${ description }`, location);
            },

            of(parent: Answerable<Element>) {
                return {
                    located(locator: ElementLocation): TargetNestedElement {
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
            located(locator: ElementLocation): TargetElements {
                return new TargetElements(description, locator);
            },

            of(parent: Answerable<Element>) {
                return {
                    located(locator: ElementLocation): TargetNestedElements {
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
    extends Question<Promise<ElementList>>
    implements MetaQuestion<Answerable<Element>, Promise<ElementList>>
{
    private readonly list: List<ElementListAdapter, Promise<Element>, Promise<ElementList>>;

    constructor(
        description: string,
        private readonly location: ElementLocation,
    ) {
        super(description);
        this.list = new List(new ElementListAdapter(this));
    }

    of(parent: Answerable<Element>): TargetNestedElements {
        return new TargetNestedElements(parent, this);
    }

    count(): Question<Promise<number>> {
        return this.list.count();
    }

    first(): Question<Promise<Element>> {
        return this.list.first()
    }

    last(): Question<Promise<Element>> {
        return this.list.last()
    }

    get(index: number): Question<Promise<Element>> {
        return this.list.get(index);
    }

    where<Answer_Type>(
        question: MetaQuestion<Answerable<Element>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): TargetList {
        return this.list.where(question, expectation);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementList> {
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
    extends ElementQuestion<Promise<ElementList>>
    implements MetaQuestion<Answerable<Element>, Promise<ElementList>>
{
    private readonly list: List<ElementListAdapter, Promise<Element>, Promise<ElementList>>;

    constructor(
        private readonly parent: Answerable<Element>,
        private readonly children: Answerable<ElementList>,
    ) {
        super(`${ children } of ${ parent }`);
        this.list = new List(new ElementListAdapter(this));
    }

    of(parent: Answerable<Element>): Question<Promise<ElementList>> {
        return new TargetNestedElements(parent, this);
    }

    count(): Question<Promise<number>> {
        return this.list.count();
    }

    first(): Question<Promise<Element>> {
        return this.list.first()
    }

    last(): Question<Promise<Element>> {
        return this.list.last()
    }

    get(index: number): Question<Promise<Element>> {
        return this.list.get(index);
    }

    where<Answer_Type>(
        question: MetaQuestion<Answerable<Element>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): TargetList {
        return this.list.where(question, expectation);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementList> {
        const parent   = await this.resolve(actor, this.parent);
        const children = await this.resolve(actor, this.children);

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
    extends Question<Promise<Element>>
    implements MetaQuestion<Answerable<Element>, Promise<Element>>
{
    constructor(
        description: string,
        private readonly location: ElementLocation,
    ) {
        super(description);
    }

    of(parent: Answerable<Element>): Question<Promise<Element>> {
        return new TargetNestedElement(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Element> {
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
    extends ElementQuestion<Promise<Element>>
    implements MetaQuestion<Answerable<Element>, Promise<Element>>
{
    constructor(
        private readonly parent: Answerable<Element>,
        private readonly child: Answerable<Element>,
    ) {
        super(`${ child } of ${ parent }`);
    }

    of(parent: Answerable<Element>): Question<Promise<Element>> {
        return new TargetNestedElement(parent, this);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Element> {
        const parent = await this.resolve(actor, this.parent);
        const child  = await this.resolve(actor, this.child);

        return parent.locateChildElement(child.location());
    }
}
