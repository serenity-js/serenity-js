import { Ability, Duration, UsesAbilities } from '@serenity-js/core';

import { Key } from '../../input';
import { UIElement, UIElementList, UIElementLocation } from '../../ui';
import { BrowserCapabilities } from './BrowserCapabilities';

export abstract class BrowseTheWeb implements Ability {
    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWeb}
     *  from within the {@link @serenity-js/core/lib/screenplay~Interaction} classes,
     *  such as {@link Click}.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~UsesAbilities} actor
     * @return {BrowseTheWeb}
     */
    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    abstract navigateTo(destination: string): Promise<void>;

    abstract navigateBack(): Promise<void>;

    abstract navigateForward(): Promise<void>;

    abstract reloadPage(): Promise<void>;

    abstract waitFor(duration: Duration): Promise<void>;

    abstract waitUntil(condition: () => boolean | Promise<boolean>, timeout: Duration): Promise<void>;

    abstract locateElementAt(location: UIElementLocation): Promise<UIElement>;

    abstract locateAllElementsAt(location: UIElementLocation): Promise<UIElementList>;

    abstract getTitle(): Promise<string>;

    abstract getCurrentUrl(): Promise<string>;

    abstract getBrowserCapabilities(): Promise<BrowserCapabilities>;

    abstract sendKeys(keys: Array<Key | string>): Promise<void>;

    abstract executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result>;

    abstract executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [ ...parameters: Parameters, callback: (result: Result) => void ]) => void),
        ...args: Parameters
    ): Promise<Result>;

    abstract getLastScriptExecutionResult<R = any>(): R;

    abstract takeScreenshot(): Promise<string>;

    abstract switchToFrame(targetOrIndex: UIElement | number | string): Promise<void>;
    abstract switchToParentFrame(): Promise<void>;
    abstract switchToDefaultContent(): Promise<void>;
    abstract switchToWindow(nameOrHandleOrIndex: string | number): Promise<void>;
    abstract switchToOriginalWindow(): Promise<void>;
    abstract getCurrentWindowHandle(): Promise<string>;
    abstract getAllWindowHandles(): Promise<string[]>;
    abstract closeCurrentWindow(): Promise<void>;
}

