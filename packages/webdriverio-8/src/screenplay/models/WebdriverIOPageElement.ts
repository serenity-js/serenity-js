import 'webdriverio';

import { LogicError } from '@serenity-js/core';
import type { SwitchableOrigin } from '@serenity-js/web';
import { Key, PageElement, SelectOption } from '@serenity-js/web';
import * as scripts from '@serenity-js/web/lib/scripts/index.js';

import type { WebdriverIOLocator } from './locators/index.js';
import { WebdriverProtocolErrorCode } from './WebdriverProtocolErrorCode.js';

/**
 * WebdriverIO-specific implementation of [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * @group Models
 */
export class WebdriverIOPageElement extends PageElement<WebdriverIO.Element> {
    of(parent: WebdriverIOPageElement): WebdriverIOPageElement {
        return new WebdriverIOPageElement(this.locator.of(parent.locator))
    }

    closestTo(child: WebdriverIOPageElement): WebdriverIOPageElement {
        return new WebdriverIOPageElement(this.locator.closestTo(child.locator))
    }

    async clearValue(): Promise<void> {
        // eslint-disable-next-line unicorn/consistent-function-scoping
        function times(length: number, key: string) {
            return Array.from({ length }).map(() => key);
        }

        // eslint-disable-next-line unicorn/consistent-function-scoping
        async function removeCharactersFrom(browser: WebdriverIO.Browser, inputElement: WebdriverIO.Element, numberOfCharacters: number): Promise<void> {
            await browser.execute(
                /* c8 ignore next */
                function focusOn(element: any) {
                    element.focus();
                },
                element
            );
            await browser.keys([
                Key.Home.utf16codePoint,
                ...times(numberOfCharacters, Key.Delete.utf16codePoint),
            ]);
        }

        const element   = await this.nativeElement();
        const value     = await this.value();
        const hasValue  = value !== null && value !== undefined && value.length > 0;
        const browser   = await this.browserFor(element);

        if (hasValue) {
            return await removeCharactersFrom(browser, element, value.length);
        }

        const contentEditable = await element.getAttribute('contenteditable');
        const hasContentEditable = contentEditable !== null && contentEditable !== undefined && contentEditable !== 'false';

        if (hasContentEditable) {
            const text = await element.getText();
            return await removeCharactersFrom(browser, element, text.length);
        }
    }

    async click(): Promise<void> {
        const element = await this.nativeElement();
        await element.click();
    }

    async doubleClick(): Promise<void> {
        const element = await this.nativeElement();
        await element.doubleClick();
    }

    async enterValue(value: string | number | Array<string | number>): Promise<void> {
        const text      = Array.isArray(value) ? value.join('') : value;
        const element   = await this.nativeElement();

        await element.addValue(text);
    }

    async scrollIntoView(): Promise<void> {
        const element = await this.nativeElement();
        await element.scrollIntoView();
    }

    async hoverOver(): Promise<void> {
        const element = await this.nativeElement();
        await element.moveTo();
    }

    async rightClick(): Promise<void> {
        const element = await this.nativeElement();
        await element.click({ button: 'right' });
    }

    async selectOptions(...options: SelectOption[]): Promise<void> {
        const element = await this.nativeElement();

        for (const option of options) {
            if (option.value) {
                await element.selectByAttribute('value', option.value);
            }
            else if (option.label) {
                await element.selectByVisibleText(option.label);
            }
        }
    }

    async selectedOptions(): Promise<SelectOption[]> {
        const element = await this.nativeElement();
        const browser = await this.browserFor(element);

        const options = await browser.execute(
            /* c8 ignore start */
            (select: HTMLSelectElement) => {
                const options = [];
                select.querySelectorAll('option').forEach((option: HTMLOptionElement) => {
                    options.push({
                        selected:   option.selected,
                        disabled:   option.disabled,
                        label:      option.label,
                        value:      option.value,
                    });
                });

                return options;
            },
            element as unknown
            /* c8 ignore stop */
        );

        return options.map(option =>
            new SelectOption(option.label, option.value, option.selected, option.disabled)
        );
    }

    async attribute(name: string): Promise<string> {
        const element = await this.nativeElement();
        return await element.getAttribute(name);
    }

    async text(): Promise<string> {
        const element = await this.nativeElement();
        return await element.getText();
    }

    async value(): Promise<string> {
        const element = await this.nativeElement();
        return await element.getValue();
    }

    async html(): Promise<string> {
        const element = await this.nativeElement();
        return await element.getHTML(true);
    }

    async switchTo(): Promise<SwitchableOrigin> {
        try {
            const element: WebdriverIO.Element = await this.locator.nativeElement()

            if (element.error) {
                throw element.error;
            }

            const tagName = await element.getTagName();

            const browser = await this.browserFor(element);

            if ([ 'iframe', 'frame' ].includes(tagName)) {
                const locator = (this.locator as WebdriverIOLocator);

                await locator.switchToFrame(element);

                return {
                    switchBack: async (): Promise<void> => {
                        try {
                            await locator.switchToParentFrame();
                        }
                        catch {
                            // switchToParentFrame doesn't work on iOS devices, so we need a workaround
                            // https://github.com/appium/appium/issues/14882#issuecomment-1693326102
                            await locator.switchToFrame(null);  // eslint-disable-line unicorn/no-null
                        }
                    }
                }
            }
            else {
                // focus on element
                const previouslyFocusedElement = await browser.execute(
                    /* c8 ignore next */
                    function focusOn(element: any) {
                        const currentlyFocusedElement = document.activeElement;
                        element.focus();
                        return currentlyFocusedElement;
                    },
                    element
                );

                return {
                    switchBack: async (): Promise<void> => {
                        await browser.execute(
                            /* c8 ignore next */
                            function focusOn(element: any) {
                                element.focus();
                            },
                            previouslyFocusedElement
                        );
                    }
                }
            }
        }
        catch(error) {
            throw new LogicError(`Couldn't switch to page element located ${ this.locator }`, error);
        }
    }

    async isActive(): Promise<boolean> {
        const element = await this.nativeElement();
        return await element.isFocused();
    }

    async isClickable(): Promise<boolean> {
        const element = await this.nativeElement();
        return await element.isClickable();
    }

    async isEnabled(): Promise<boolean> {
        const element = await this.nativeElement();
        return await element.isEnabled();
    }

    async isPresent(): Promise<boolean> {
        const element = await this.nativeElement();
        return await element.isExisting();
    }

    async isSelected(): Promise<boolean> {
        const element = await this.nativeElement();
        return await element.isSelected();
    }

    async isVisible(): Promise<boolean> {
        try {
            const element = await this.nativeElement();

            if (! await element.isDisplayed()) {
                return false;
            }

            if (! await element.isDisplayedInViewport()) {
                return false;
            }

            const browser = await this.browserFor(element);

            return await browser.execute(scripts.isVisible, element as unknown as HTMLElement);
        }
        catch (error) {
            // an element that doesn't exist is treated as not visible
            if (
                error.name === WebdriverProtocolErrorCode.NoSuchElementError ||
                error.error === WebdriverProtocolErrorCode.NoSuchElementError ||
                /element.*not found/i.test(error.message)
            ) {
                return false;
            }

            throw error;
        }
    }

    // based on https://github.com/webdriverio/webdriverio/blob/dec6da76b0e218af935dbf39735ae3491d5edd8c/packages/webdriverio/src/utils/index.ts#L98

    private async browserFor(nativeElement: WebdriverIO.Element | WebdriverIO.Browser): Promise<WebdriverIO.Browser> {
        const element = nativeElement as WebdriverIO.Element;
        return element.parent
            ? this.browserFor(element.parent)
            : nativeElement as WebdriverIO.Browser
    }
}
