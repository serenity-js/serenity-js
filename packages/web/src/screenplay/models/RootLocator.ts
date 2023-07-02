import type { Optional } from '@serenity-js/core';
import { inspectedObject } from '@serenity-js/core/lib/io';
import * as util from 'util';   // eslint-disable-line unicorn/import-style

/**
 * {@apilink RootLocator} represents the context in which {@apilink Locator} looks for {@apilink PageElement} or {@apilink PageElements}.
 * This context is either a parent element, or some representation of the top-level browsing context.
 *
 * ## Learn more
 * - {@apilink Locator}
 * - {@apilink Page.locate}
 * - {@apilink PageElement}
 * - {@apilink PageElements}
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
