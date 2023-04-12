import { LogicError } from '@serenity-js/core';
import { PageElement, SelectOption, SwitchableOrigin } from '@serenity-js/web';
import * as scripts from '@serenity-js/web/lib/scripts';
import { by, ElementFinder, protractor } from 'protractor';
import { Locator, WebElement } from 'selenium-webdriver';

import { promised } from '../promised';
import { ProtractorLocator } from './locators';

/**
 * Protractor-specific implementation of {@apilink PageElement}.
 *
 * @group Models
 */
export class ProtractorPageElement extends PageElement<ElementFinder> {

    of(parent: ProtractorPageElement): PageElement<ElementFinder> {
        return new ProtractorPageElement(this.locator.of(parent.locator));
    }

    async clearValue(): Promise<void> {
        // eslint-disable-next-line unicorn/consistent-function-scoping
        function times(length: number, key: string) {
            return Array.from({ length }).map(() => key);
        }

        // eslint-disable-next-line unicorn/consistent-function-scoping
        async function focusOn(element: ElementFinder) {
            const webElement = await element.getWebElement();
            await promised(webElement.getDriver().executeScript(`arguments[0].focus()`, webElement));
        }

        // eslint-disable-next-line unicorn/consistent-function-scoping
        async function removeCharactersFrom(elf: ElementFinder, numberOfCharacters: number): Promise<void> {
            if (numberOfCharacters > 0) {
                await focusOn(elf);
                await elf.sendKeys(
                    protractor.Key.HOME,
                    ...times(numberOfCharacters, protractor.Key.DELETE),
                );
            }
        }

        const value = await this.value();
        const hasValue = value !== null && value !== undefined;

        const element = await this.nativeElement();

        if (hasValue) {
            return removeCharactersFrom(element, value.length);
        }

        const contentEditable = await promised(element.getAttribute('contenteditable'));
        const hasContentEditable = contentEditable !== null && contentEditable !== undefined && contentEditable !== 'false';

        if (hasContentEditable) {
            const text = await this.text();
            return removeCharactersFrom(element, text.length);
        }
    }

    async click(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();

        await promised(element.click());
    }

    async doubleClick(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        await promised(
            webElement.getDriver().actions()
                .doubleClick(webElement, protractor.Button.LEFT)
                .perform(),
        );
    }

    async enterValue(value: string | number | Array<string | number>): Promise<void> {
        const element: ElementFinder = await this.nativeElement();

        await promised(element.sendKeys(
            [].concat(value).join(''),
        ));
    }

    async scrollIntoView(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        await promised(
            webElement.getDriver().executeScript('arguments[0].scrollIntoView(true);', webElement),
        );
    }

    async hoverOver(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        await promised(
            webElement.getDriver().actions()
                .mouseMove(webElement)
                .perform(),
        );
    }

    async rightClick(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        await promised(
            webElement.getDriver().actions()
                .click(webElement, protractor.Button.RIGHT)
                .perform(),
        );
    }

    async selectOptions(...options: SelectOption[]): Promise<void> {
        const element: ElementFinder = await this.nativeElement();

        for (const option of options) {
            if (option.value) {
                await promised(element.element(by.xpath(`//option[@value='${ option.value }']`) as Locator).click());
            }
            else if (option.label) {
                await promised(element.element(by.cssContainingText('option', option.label) as Locator).click());
            }
        }
    }

    async selectedOptions(): Promise<SelectOption[]> {
        const element: ElementFinder = await this.locator.nativeElement();

        const webElement = await element.getWebElement();

        const browser = element.browser_;

        const options: Array<{ label: string, value: string, selected: boolean, disabled: boolean }> = await browser.executeScript(
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
            webElement as unknown
        );

        return options.map(option =>
            new SelectOption(option.label, option.value, option.selected, option.disabled)
        );
    }

    async attribute(name: string): Promise<string> {
        const element: ElementFinder = await this.nativeElement();

        return await promised(element.getAttribute(name));
    }

    async text(): Promise<string> {
        const element: ElementFinder = await this.nativeElement();

        return await promised(element.getText());
    }

    async value(): Promise<string> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return await promised(webElement.getDriver().executeScript(
            /* istanbul ignore next */
            function getValue(webElement) {
                return webElement.value;
            },
            webElement,
        ));
    }

    async switchTo(): Promise<SwitchableOrigin> {
        const element: ElementFinder = await this.locator.nativeElement();

        try {
            const tagName = await element.getTagName();

            if ([ 'iframe', 'frame' ].includes(tagName)) {
                const locator = (this.locator as ProtractorLocator);
                await locator.switchToFrame(element);

                return {
                    switchBack: async (): Promise<void> => {
                        await locator.switchToParentFrame();
                    },
                };
            }
            else {
                // https://github.com/angular/protractor/issues/1846#issuecomment-82634739;
                const webElement = await element.getWebElement();

                // focus on element
                const previouslyFocusedElement = await promised(webElement.getDriver().switchTo().activeElement());

                await promised(webElement.getDriver().executeScript(`arguments[0].focus()`, webElement));

                return {
                    switchBack: async (): Promise<void> => {
                        await promised(webElement.getDriver().executeScript(`arguments[0].focus()`, previouslyFocusedElement));
                    },
                };
            }
        } catch (error) {
            throw new LogicError(`Couldn't switch to page element located ${ this.locator }`, error);
        }
    }

    async isActive(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return await promised(webElement.getDriver().switchTo().activeElement().then((active: WebElement) =>
            element.equals(active),
        ));
    }

    async isClickable(): Promise<boolean> {
        return await this.isEnabled();
    }

    async isEnabled(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return await promised(element.isEnabled());
    }

    async isPresent(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return await promised(element.isPresent());
    }

    async isSelected(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return await promised(element.isSelected());
    }

    async isVisible(): Promise<boolean> {
        try {
            const element: ElementFinder = await this.nativeElement();

            if (! await element.isDisplayed()) {
                return false;
            }

            const webElement: WebElement = await element.getWebElement();

            // get element at cx/cy and see if the element we found is our element, and therefore it's visible.
            return await promised(webElement.getDriver().executeScript(
                scripts.isVisible,
                webElement,
            ));
        }
        catch (error) {

            if (error.name === 'NoSuchElementError') {
                return false;
            }

            throw error;
        }
    }
}
