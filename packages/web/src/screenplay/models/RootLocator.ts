import type { Optional } from '@serenity-js/core';
import { inspectedObject } from '@serenity-js/core/lib/io';
import * as util from 'util';   // eslint-disable-line unicorn/import-style

/**
 * [`RootLocator`](https://serenity-js.org/api/web/class/RootLocator/) represents the context in which [`Locator`](https://serenity-js.org/api/web/class/Locator/) looks for [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) or [`PageElement`](https://serenity-js.org/api/web/class/PageElements/).
 * This context is either a parent element, or some representation of the top-level browsing context.
 *
 * ## Learn more
 * - [`Locator`](https://serenity-js.org/api/web/class/Locator/)
 * - [`Page.locate`](https://serenity-js.org/api/web/class/Page/#locate)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElements/)
 *
 * @group Models
 */
export abstract class RootLocator<Native_Element_Type> implements Optional {
    public abstract switchToFrame(element: Native_Element_Type): Promise<void>;
    public abstract switchToParentFrame(): Promise<void>;
    public abstract switchToMainFrame(): Promise<void>;
    public abstract isPresent(): Promise<boolean>;

    public abstract nativeElement(): Promise<Partial<Native_Element_Type>>;

    toString(): string {
        return 'root locator';
    }

    [util.inspect.custom] = inspectedObject(this, [ ])
}
