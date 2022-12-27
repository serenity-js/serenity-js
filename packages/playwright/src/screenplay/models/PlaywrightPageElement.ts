import { LogicError } from '@serenity-js/core';
import { PageElement, SelectOption, SwitchableOrigin } from '@serenity-js/web';
import * as scripts from '@serenity-js/web/lib/scripts';
import type * as playwright from 'playwright-core';
import { ensure, isDefined } from 'tiny-types';

import { PlaywrightLocator } from './locators';

/**
 * Playwright-specific implementation of {@apilink PageElement}.
 *
 * @group Models
 */
export class PlaywrightPageElement extends PageElement<playwright.ElementHandle> {
    of(parent: PageElement<playwright.ElementHandle>): PageElement<playwright.ElementHandle> {
        return new PlaywrightPageElement(this.locator.of(parent.locator));
    }

    async enterValue(value: string | number | Array<string | number>): Promise<void> {
        const text = [].concat(value).join('');

        const element = await this.nativeElement();
        return element.fill(text);
    }

    async clearValue(): Promise<void> {
        try {
            const element = await this.nativeElement();
            await element.fill('');
        }
        catch(error) {
            throw new LogicError(`The input field doesn't seem to have a 'value' attribute that could be cleared.`, error);
        }
    }

    async click(): Promise<void> {
        const element = await this.nativeElement();
        return element.click();
    }

    async doubleClick(): Promise<void> {
        const element = await this.nativeElement();
        return element.dblclick();
    }

    async scrollIntoView(): Promise<void> {
        const element = await this.nativeElement();
        return element.scrollIntoViewIfNeeded();
    }

    async hoverOver(): Promise<void> {
        const element = await this.nativeElement();
        return element.hover();
    }

    async rightClick(): Promise<void> {
        const element = await this.nativeElement();
        return element.click({ button: 'right' });
    }

    async selectOptions(...options: Array<SelectOption>): Promise<void> {
        const element = await this.nativeElement();

        const optionsToSelect = options.map(option =>
            ({
                value: option.value,
                label: option.label,
            })
        );

        await element.selectOption(optionsToSelect);
    }

    async selectedOptions(): Promise<Array<SelectOption>> {
        const element = await this.nativeElement();

        const options = await element.$$eval(
            'option',
            /* istanbul ignore next */
            (optionNodes: Array<HTMLOptionElement>) =>
                optionNodes.map((optionNode: HTMLOptionElement) => {
                    return {
                        selected:   optionNode.selected,
                        disabled:   optionNode.disabled,
                        label:      optionNode.label,
                        value:      optionNode.value,
                    }
                })
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
        return element.innerText();                     // eslint-disable-line unicorn/prefer-dom-node-text-content
    }

    async value(): Promise<string> {
        const element = await this.nativeElement();
        return element.inputValue();
    }

    async switchTo(): Promise<SwitchableOrigin> {
        try {
            const element = await this.nativeElement();

            const frame = await element.contentFrame();

            if (frame) {
                const locator = (this.locator as PlaywrightLocator);

                await locator.switchToFrame(element);

                return {
                    switchBack: async (): Promise<void> => {
                        await locator.switchToParentFrame();
                    }
                }
            }

            const previouslyFocusedElement = await element.evaluateHandle(
                /* istanbul ignore next */
                (domNode: HTMLElement) => {
                    const currentlyFocusedElement = document.activeElement;
                    domNode.focus();
                    return currentlyFocusedElement;
                }
            );

            return new PreviouslyFocusedElementSwitcher(previouslyFocusedElement);
        } catch(error) {
            throw new LogicError(`Couldn't switch to page element located ${ this.locator }`, error);
        }
    }

    async isActive(): Promise<boolean> {
        try {
            const element = await this.nativeElement();
            return element.evaluate(
                /* istanbul ignore next */
                domNode => domNode === document.activeElement
            );
        } catch {
            return false;
        }
    }

    async isClickable(): Promise<boolean> {
        try {
            const element = await this.nativeElement();
            await element.click({ trial: true });

            return true;
        } catch {
            return false;
        }
    }

    async isEnabled(): Promise<boolean> {
        try {
            const element = await this.nativeElement();
            return element.isEnabled();
        } catch {
            return false;
        }
    }

    async isSelected(): Promise<boolean> {

        try {
            const element: playwright.ElementHandle = await this.nativeElement();

            // works for <option />
            const selected = await element.getAttribute('selected');
            if (selected !== null) {
                return true;
            }

            // works only for checkboxes and radio buttons, throws for other elements
            return await element.isChecked();
        } catch {
            return false;
        }
    }

    async isVisible(): Promise<boolean> {
        try {
            const element = await this.nativeElement();

            const isVisible = await element.isVisible();
            if (! isVisible) {
                return false;
            }

            return await element.evaluate(scripts.isVisible);
        } catch {
            return false;
        }
    }
}

/**
 * @private
 */
class PreviouslyFocusedElementSwitcher implements SwitchableOrigin {
    constructor(private readonly node: playwright.JSHandle) {
        ensure('DOM element', node, isDefined());
    }

    async switchBack (): Promise<void> {
        await this.node.evaluate(
            /* istanbul ignore next */
            (domNode: HTMLElement) => {
                domNode.focus();
            },
            this.node
        );
    }
}
