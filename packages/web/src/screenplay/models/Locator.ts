import { LogicError } from '@serenity-js/core';
import { inspectedObject } from '@serenity-js/core/lib/io';
import * as util from 'util'; // eslint-disable-line unicorn/import-style

import type { PageElement } from './PageElement';
import { RootLocator } from './RootLocator';
import { ByCss, ById, ByTagName, type Selector } from './selectors';

/**
 * [`Locator`](https://serenity-js.org/api/web/class/Locator/) uses a [`Selector`](https://serenity-js.org/api/web/class/Selector/) to locate a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) or [`PageElement`](https://serenity-js.org/api/web/class/PageElements/)
 * within the [`Page`](https://serenity-js.org/api/web/class/Page/).
 *
 * ## Learn more
 * - [`RootLocator`](https://serenity-js.org/api/web/class/RootLocator/)
 * - [`Page.locate`](https://serenity-js.org/api/web/class/Page/#locate)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElements/)
 *
 * @group Models
 */
export abstract class Locator<Native_Element_Type, Native_Selector_Type = any>
    extends RootLocator<Native_Element_Type>
{
    protected constructor(
        protected readonly parent: RootLocator<Native_Element_Type>,
        public readonly selector: Selector,
    ) {
        super();
    }

    public abstract nativeElement(): Promise<Native_Element_Type>;
    public abstract allNativeElements(): Promise<Array<Native_Element_Type>>;

    async switchToFrame(element: Native_Element_Type): Promise<void> {
        await this.parent.switchToFrame(element);
    }

    async switchToParentFrame(): Promise<void> {
        await this.parent.switchToParentFrame();
    }

    async switchToMainFrame(): Promise<void> {
        await this.parent.switchToMainFrame();
    }

    protected abstract nativeSelector(): Native_Selector_Type;

    abstract of(parent: RootLocator<Native_Element_Type>): Locator<Native_Element_Type>;
    abstract closestTo(child: Locator<Native_Element_Type>): Locator<Native_Element_Type>;
    abstract locate(child: Locator<Native_Element_Type>): Locator<Native_Element_Type>;

    /**
     * Expresses [`ByCss`](https://serenity-js.org/api/web/class/ByCss/), [`ById`](https://serenity-js.org/api/web/class/ById/), or [`ByTagName`](https://serenity-js.org/api/web/class/ByTagName/) as a [`ByCss`](https://serenity-js.org/api/web/class/ByCss/) selector.
     *
     * @throws LogicError
     *  if the `selector` can't be expressed as [`ByCss`](https://serenity-js.org/api/web/class/ByCss/)
     *
     * @param selector
     * @protected
     */
    protected asCssSelector(selector: Selector): ByCss {
        if (selector instanceof ByCss) {
            return selector;
        }

        if (selector instanceof ById) {
            return new ByCss(`#${ selector.value }`);
        }

        if (selector instanceof ByTagName) {
            return new ByCss(`${ selector.value }`);
        }

        throw new LogicError(`${ selector } can't be expressed as a CSS selector`)
    }

    abstract element(): PageElement<Native_Element_Type>;

    abstract allElements(): Promise<Array<PageElement<Native_Element_Type>>>;

    toString(): string {
        return this.selector.toString();
    }

    /**
     * Custom [Node.js inspection method](https://nodejs.org/api/util.html#utilinspectcustom).
     */
    [util.inspect.custom] = inspectedObject(this, [ 'parent' as keyof this, 'selector' ]);
}
