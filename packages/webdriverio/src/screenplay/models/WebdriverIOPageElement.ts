import { LogicError } from '@serenity-js/core';
import { PageElement, SelectOption, SwitchableOrigin } from '@serenity-js/web';
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
        const element = await this.nativeElement();
        const tagName = await element.getTagName();

        const isClearable = ['input', 'textarea'].includes(tagName);

        if (isClearable) {
            return element.clearValue();
        }

        const contentEditable = await element.getAttribute('contenteditable');
        const hasContentEditable = contentEditable !== null && contentEditable !== undefined && contentEditable !== 'false';

        if (hasContentEditable) {
            const browser = await this.browserFor(element);

            await browser.execute(
                /* istanbul ignore next */
                (htmlElement: HTMLElement) => {
                    htmlElement.textContent = '';
                },
                element as unknown
            );
        }
    }

    async click(): Promise<void> {
        const element = await this.nativeElement();
        return element.click();
    }

    async doubleClick(): Promise<void> {
        const element = await this.nativeElement();
        return element.doubleClick();
    }

    async enterValue(value: string | number | Array<string | number>): Promise<void> {
        const element = await this.nativeElement();
        return element.addValue(value);
    }

    async scrollIntoView(): Promise<void> {
        const element = await this.nativeElement();
        return element.scrollIntoView();
    }

    async hoverOver(): Promise<void> {
        const element = await this.nativeElement();
        return element.moveTo();
    }

    async rightClick(): Promise<void> {
        const element = await this.nativeElement();
        return element.click({ button: 'right' });
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
        return element.getAttribute(name);
    }

    async text(): Promise<string> {
        const element = await this.nativeElement();
        return element.getText();
    }

    async value(): Promise<string> {
        const element = await this.nativeElement();
        return element.getValue();
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
        return element.isFocused();
    }

    async isClickable(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isClickable();
    }

    async isEnabled(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isEnabled();
    }

    async isPresent(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isExisting();
    }

    async isSelected(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isSelected();
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

            return browser.execute(scripts.isVisible, element as unknown as HTMLElement);
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
