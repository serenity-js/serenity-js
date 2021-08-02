import { Answerable } from '@serenity-js/core';
import { ElementHandle } from 'playwright';

import { NestedTargetBuilder, TargetBuilder } from './builders';
import { Locator } from './locators';
import { TargetElement } from './TargetElement';
// import { TargetElements } from "./TargetElements";
// import { TargetNestedElements } from "./TargetNestedElements";

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
 *       <div id="summary"><strong class="out-of-stock">Coconut</strong> is not available</div>
 *       <button type="submit">Proceed to Checkout</button>
 *   </body>
 *
 *  @example <caption>Locating a single element</caption>
 *   import { Target } from '@serenity-js/protractor';
 *   import { by } from 'protractor';
 *
 *   const proceedToCheckoutButton =
 *       Target.the('Proceed to Checkout button').located(by.css(`button[type='submit']`));
 *
 *  @example <caption>Locating multiple elements</caption>
 *   import { Target } from '@serenity-js/protractor';
 *   import { by } from 'protractor';
 *
 *   const basketItems =
 *       Target.all('items in the basket').located(by.css('ul#basket li'));
 *
 *  @example <caption>Locating element relative to another element</caption>
 *   import { Target } from '@serenity-js/protractor';
 *   import { by } from 'protractor';
 *
 *   const summary =
 *       Target.the('summary').located(by.id('message'));
 *
 *   const outOfStockItem =
 *       Target.the('out of stock item').of(summary).located(by.css('.out-of-stock'))
 *
 *  @example <caption>Filtering elements matched by a locator</caption>
 *   import { Target, Text } from '@serenity-js/protractor';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { by } from 'protractor';
 *
 *   const basketItems =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .where(Text, endsWith('e'));    // Apple, Date
 *
 *  @example <caption>Counting items matched by a locator</caption>
 *   import { Target, Text } from '@serenity-js/protractor';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { Question } from '@serenity-js/core';
 *   import { by } from 'protractor';
 *
 *   const basketItemsCount: Question<Promise<number>> =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .count()    // 4
 *
 *  @example <caption>Getting first item matched by a locator</caption>
 *   import { Target, Text } from '@serenity-js/protractor';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { by, ElementHandle } from 'protractor';
 *
 *   const apple: Question<ElementHandle>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .first()
 *
 *  @example <caption>Getting last item matched by a locator</caption>
 *   import { Target, Text } from '@serenity-js/protractor';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { by, ElementHandle } from 'protractor';
 *
 *   const date: Question<ElementHandle>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .last()
 *
 *  @example <caption>Getting nth item matched by a locator</caption>
 *   import { Target, Text } from '@serenity-js/protractor';
 *   import { endsWith } from '@serenity-js/assertions';
 *   import { by, ElementHandle } from 'protractor';
 *
 *   const banana: Question<ElementHandle>  =
 *       Target.all('items in the basket').located(by.css('ul#basket li'))
 *          .get(1)
 *
 *  @example <caption>Using multiple filters and nested targets</caption>
 *   import { Target, Text } from '@serenity-js/protractor';
 *   import { contain, endsWith } from '@serenity-js/assertions';
 *   import { by, ElementHandle } from 'protractor';
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
 *   const date: Question<ElementHandle>  =
 *       Basket.items
 *          .where(Text, endsWith('e'))
 *          .where(CSSClasses.of(Basket.link), contain('has-discount'))
 *          .first()
 *
 *  @example <caption>Clicking on an element</caption>
 *   import { actorCalled } from '@serenity-js/core';
 *   import { BrowseTheWeb, Click } from '@serenity-js/protractor';
 *   import { protractor } from 'protractor';
 *
 *   actorCalled('Jane')
 *       .whoCan(BrowseTheWeb.using(protractor.browser))
 *       .attemptsTo(
 *           Click.on(proceedToCheckoutButton),
 *       );
 *
 *  @example <caption>Retrieving text of multiple elements and performing an assertion</caption>
 *   import { Ensure, contain } from '@serenity-js/assertions';
 *   import { actorCalled } from '@serenity-js/core';
 *   import { BrowseTheWeb, Click, Text } from '@serenity-js/protractor';
 *   import { protractor } from 'protractor';
 *
 *   const basketItemNames = Text.ofAll(basketItems);
 *
 *   actorCalled('Jane')
 *       .whoCan(BrowseTheWeb.using(protractor.browser))
 *       .attemptsTo(
 *           Ensure.that(basketItemNames, contain('Apple'))
 *       );
 *
 *  @example <caption>Waiting on an element</caption>
 *   import { actorCalled } from '@serenity-js/core';
 *   import { BrowseTheWeb, Click, Text, Wait, isClickable } from '@serenity-js/protractor';
 *   import { protractor } from 'protractor';
 *
 *   actorCalled('Jane')
 *       .whoCan(BrowseTheWeb.using(protractor.browser))
 *       .attemptsTo(
 *           Wait.until(proceedToCheckoutButton, isClickable()),
 *       );
 */
export class Target {
    /**
   * @desc
   *  Locates a single web element
   *
   * @param {string} name - A human-readable name of the element to be used in the report
   * @returns {TargetBuilder<TargetElement> & NestedTargetBuilder<TargetElement>}
   */
    static the(
        name: string
    ): TargetBuilder<TargetElement> & NestedTargetBuilder<TargetElement> {
        return {
            located: (selector: Locator): TargetElement =>
                TargetElement.at(selector.selector).as(`the ${name}`),

            of: (parent: Answerable<ElementHandle>) => {
                return {
                    located: (selector: Locator): TargetElement =>
                        TargetElement.at(selector.selector).as(`the ${name}`).of(parent),
                };
            },
        };
    }

    /**
   * @desc
   *  Locates a single web element
   *
   * @param {string} selector - selector to get the element from a page
   * @returns {TargetElement}
   */
    static $(selector: Locator): TargetElement {
        return TargetElement.at(selector.selector);
    }

    // /**
    //  * @desc
    //  *  Locates a group of web elements
    //  *
    //  * @param {string} name - A human-readable name of the elements to be used in the report
    //  * @returns {TargetBuilder<TargetElements> & NestedTargetBuilder<TargetNestedElements>}
    //  */
    // static all(
    //   name: string
    // ): TargetBuilder<TargetElements> & NestedTargetBuilder<TargetNestedElements> {
    //   return {
    //     selectedBy: (selector: string): TargetElements =>
    //       new TargetElements(name, selector),

    //     of: (parent: Question<ElementHandle> | ElementHandle) => {
    //       return {
    //         selectedBy: (selector: string): TargetNestedElements =>
    //           new TargetNestedElements(
    //             parent,
    //             new TargetElements(name, selector)
    //           ),
    //       };
    //     },
    //   };
    // }
}
