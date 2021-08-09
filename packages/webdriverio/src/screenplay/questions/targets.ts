/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Answerable, AnswersQuestions, Expectation, List, LogicError, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import type { Element, ElementArray } from 'webdriverio';

import { ElementArrayListAdapter } from './lists';
import { Locator } from './locators';
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
 * @typedef {List<ElementArrayListAdapter, Promise<Element<'async'>>, Promise<ElementArray>>} TargetList
 */
export type TargetList = List<ElementArrayListAdapter, Promise<Element<'async'>>, Promise<ElementArray>>;

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
 *   const apple: Question<Promise<Element<'async'>>>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .first()
 *
 *  @example <caption>Getting last item matched by a locator</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target } from '@serenity-js/webdriverio';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { Element } from 'webdriverio';
 *
 *   const date: Question<Promise<Element<'async'>>>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .last()
 *
 *  @example <caption>Getting nth item matched by a locator</caption>
 *   import { Question } from '@serenity-js/core';
 *   import { by, Target } from '@serenity-js/webdriverio';
 *   import { Element } from 'webdriverio';
 *
 *   const banana: Question<Promise<Element<'async'>>>  =
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
 *   const date: Question<Promise<Element<'async'>>>  =
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
            located(locator: Locator): TargetElement {
                return new TargetElement(`the ${ description }`, locator);
            },

            of(parent: Answerable<Element<'async'>>) {
                return {
                    located(locator: Locator): TargetNestedElement {
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
            located(locator: Locator): TargetElements {
                return new TargetElements(description, locator);
            },

            of(parent: Answerable<Element<'async'>>) {
                return {
                    located(locator: Locator): TargetNestedElements {
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
    extends Question<Promise<ElementArray>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<ElementArray>>
{
    private readonly list: List<ElementArrayListAdapter, Promise<Element<'async'>>, Promise<ElementArray>>;

    constructor(
        description: string,
        private readonly locator: Locator,
    ) {
        super(description);
        this.list = new List(new ElementArrayListAdapter(this));
    }

    of(parent: Answerable<Element<'async'>>): TargetNestedElements {
        return new TargetNestedElements(parent, this);
    }

    count(): Question<Promise<number>> {
        return this.list.count();
    }

    first(): Question<Promise<Element<'async'>>> {
        return this.list.first()
    }

    last(): Question<Promise<Element<'async'>>> {
        return this.list.last()
    }

    get(index: number): Question<Promise<Element<'async'>>> {
        return this.list.get(index);
    }

    where<Answer_Type>(
        question: MetaQuestion<Answerable<Element<'async'>>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): TargetList {
        return this.list.where(question, expectation);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementArray> {
        return this.locator.allMatching()
            .describedAs(this.subject)
            .answeredBy(actor);
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
    extends Question<Promise<ElementArray>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<ElementArray>>
{
    private readonly list: List<ElementArrayListAdapter, Promise<Element<'async'>>, Promise<ElementArray>>;

    constructor(
        private readonly parent: Answerable<Element<'async'>>,
        private readonly children: Answerable<ElementArray>,
    ) {
        super(`${ children } of ${ parent }`);
        this.list = new List(new ElementArrayListAdapter(this));
    }

    of(parent: Answerable<Element<'async'>>): Question<Promise<ElementArray>> {
        return new TargetNestedElements(parent, this);
    }

    count(): Question<Promise<number>> {
        return this.list.count();
    }

    first(): Question<Promise<Element<'async'>>> {
        return this.list.first()
    }

    last(): Question<Promise<Element<'async'>>> {
        return this.list.last()
    }

    get(index: number): Question<Promise<Element<'async'>>> {
        return this.list.get(index);
    }

    where<Answer_Type>(
        question: MetaQuestion<Answerable<Element<'async'>>, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): TargetList {
        return this.list.where(question, expectation);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementArray> {
        const parent   = await actor.answer(this.parent);
        const children = await actor.answer(this.children);

        if (! parent) {
            throw new LogicError(formatted `Couldn't find ${ this.parent }`);
        }

        return parent.$$(children.selector);
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
    extends Question<Promise<Element<'async'>>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<Element<'async'>>>
{
    constructor(
        description: string,
        private readonly locator: Locator,
    ) {
        super(description);
    }

    of(parent: Answerable<Element<'async'>>): Question<Promise<Element<'async'>>> {
        return new TargetNestedElement(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Element<'async'>> {
        return this.locator.firstMatching()
            .describedAs(this.subject)
            .answeredBy(actor);
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
    extends Question<Promise<Element<'async'>>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<Element<'async'>>>
{
    constructor(
        private readonly parent: Answerable<Element<'async'>>,
        private readonly child: Answerable<Element<'async'>>,
    ) {
        super(`${ child } of ${ parent }`);
    }

    of(parent: Answerable<Element<'async'>>): Question<Promise<Element<'async'>>> {
        return new TargetNestedElement(parent, this);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Element<'async'>> {
        const parent = await actor.answer(this.parent);
        const child  = await actor.answer(this.child);

        if (! parent) {
            throw new LogicError(formatted `Couldn't find ${ this.parent }`);
        }

        return parent.$(child.selector);
    }
}
