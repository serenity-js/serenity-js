import { LogicError } from '@serenity-js/core';
import { Key, PageElement, SelectOption, SwitchableOrigin } from '@serenity-js/web';
import * as scripts from '@serenity-js/web/lib/scripts';
import * as wdio from 'webdriverio';

import { WebdriverIOLocator } from './locators';
import { WebdriverProtocolErrorCode } from './WebdriverProtocolErrorCode';

/**
 * WebdriverIO-specific implementation of {@apilink PageElement}.
 *
 * @group Models
 */
export class WebdriverIOPageElement extends PageElement<wdio.Element<'async'>> {
    of(parent: WebdriverIOPageElement): WebdriverIOPageElement {
        return new WebdriverIOPageElement(this.locator.of(parent.locator))
    }

    async clearValue(): Promise<void> {
        // eslint-disable-next-line unicorn/consistent-function-scoping
        function times(length: number, key: string) {
            return Array.from({ length }).map(() => key);
        }

        // eslint-disable-next-line unicorn/consistent-function-scoping
        async function removeCharactersFrom(browser: wdio.Browser<'async'>, inputElement: wdio.Element<'async'>, numberOfCharacters: number): Promise<void> {
            const homeKey   = browser.isDevTools ? Key.Home.devtoolsName : Key.Home.utf16codePoint;
            const deleteKey = browser.isDevTools ? Key.Delete.devtoolsName : Key.Delete.utf16codePoint;

            await browser.execute(
                /* istanbul ignore next */
                function focusOn(element: any) {
                    element.focus();
                },
                element
            );
            await inputElement.keys([
                homeKey,
                ...times(numberOfCharacters, deleteKey),
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
        const element = await this.nativeElement();
        await element.addValue(value);
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
            /* istanbul ignore next */
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

    async switchTo(): Promise<SwitchableOrigin> {
        try {
            const element: wdio.Element<'async'> = await this.locator.nativeElement()

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
                        await locator.switchToParentFrame();
                    }
                }
            }
            else {
                // focus on element
                const previouslyFocusedElement = await browser.execute(
                    /* istanbul ignore next */
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
                            /* istanbul ignore next */
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

    private async browserFor(nativeElement: wdio.Element<'async'> | wdio.Browser<'async'>): Promise<wdio.Browser<'async'>> {
        const element = nativeElement as wdio.Element<'async'>;
        return element.parent
            ? this.browserFor(element.parent)
            : nativeElement
    }
}
