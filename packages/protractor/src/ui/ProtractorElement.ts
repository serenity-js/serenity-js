import { UIElement, UIElementList, UIElementLocation, UIElementLocator } from '@serenity-js/web';
import { ElementArrayFinder, ElementFinder, Locator, protractor, ProtractorBrowser } from 'protractor';
import { WebElement } from 'selenium-webdriver';
import { ensure, isDefined } from 'tiny-types';

import { promiseOf } from '../promiseOf';
import { ProtractorElementList } from './ProtractorElementList';
import { ProtractorElementLocator } from './ProtractorElementLocator';

export class ProtractorElement implements UIElement {
    private readonly $:  UIElementLocator<ElementFinder>;
    private readonly $$: UIElementLocator<ElementArrayFinder>;

    constructor(
        private readonly browser: ProtractorBrowser,
        private readonly element: ElementFinder,
        private readonly elementLocation: UIElementLocation,
    ) {
        ensure('browser', browser, isDefined());
        ensure('element', element, isDefined());
        ensure('elementLocation', elementLocation, isDefined());

        this.$  = new ProtractorElementLocator(this.element.element.bind(this.element) as (selector: Locator) => ElementFinder);
        this.$$ = new ProtractorElementLocator(this.element.all.bind(this.element) as (selector: Locator) => ElementArrayFinder);
    }

    nativeElement(): any {
        return this.element;
    }

    location(): UIElementLocation {
        return this.elementLocation;
    }

    locateChildElement(location: UIElementLocation): Promise<UIElement> {
        return this.$
            .locate(location)
            .then(element => new ProtractorElement(this.browser, element, location));
    }

    locateAllChildElements(location: UIElementLocation): Promise<UIElementList> {
        return this.$$
            .locate(location)
            .then(elements => new ProtractorElementList(this.browser, elements, location));
    }

    async clearValue(): Promise<void> {
        function removeCharactersFrom(elf: ElementFinder, numberOfCharacters: number): PromiseLike<void> {
            return numberOfCharacters === 0
                ? Promise.resolve(void 0)
                : elf.sendKeys(
                    protractor.Key.END,
                    ...times(numberOfCharacters, protractor.Key.BACK_SPACE),
                );
        }

        // eslint-disable-next-line unicorn/consistent-function-scoping
        function times(length: number, key: string) {
            return Array.from({ length }).map(() => key);
        }

        const currentValue = await this.getValue();

        if (currentValue !== null && currentValue !== undefined) {
            return removeCharactersFrom(this.nativeElement(), currentValue.length);
        }
    }

    click(): Promise<void> {
        return promiseOf(
            this.element.click()
        );
    }

    async doubleClick(): Promise<void> {
        return promiseOf(
            this.browser.actions()
                .mouseMove(this.element as unknown as WebElement)
                .doubleClick()
                .perform()
        );
    }

    enterValue(value: string | number | Array<string | number>): Promise<void> {
        return promiseOf(
            this.element.sendKeys([].concat(value).join(''))
        );
    }

    scrollIntoView(): Promise<void> {
        return promiseOf(
            this.browser.executeScript('arguments[0].scrollIntoView(true);', this.element)
        );
    }

    hoverOver(): Promise<void> {
        return promiseOf(
            this.browser.actions()
                .mouseMove(this.element as unknown as WebElement)
                .perform()
        );
    }

    async rightClick(): Promise<void> {
        return promiseOf(
            this.browser.actions()
                .mouseMove(this.element as unknown as WebElement)
                .click(protractor.Button.RIGHT)
                .perform()
        );
    }

    getAttribute(name: string): Promise<string> {
        return promiseOf(this.element.getAttribute(name));
    }

    getText(): Promise<string> {
        return promiseOf(this.element.getText());
    }

    getValue(): Promise<string> {
        return promiseOf(this.browser.executeScript(
            /* istanbul ignore next */
            function getValue(webElement) {
                return webElement.value;
            },
            this.element.getWebElement(),
        ));
    }

    isActive(): Promise<boolean> {
        return promiseOf(this.element.getWebElement().then(element =>
            element.getDriver().switchTo().activeElement().then((active: WebElement) =>
                this.element.equals(active),
            ),
        ));
    }

    isClickable(): Promise<boolean> {
        return this.isEnabled();
    }

    isDisplayed(): Promise<boolean> {
        return promiseOf(this.element.isDisplayed());
    }

    isEnabled(): Promise<boolean> {
        return promiseOf(this.element.isEnabled());
    }

    isPresent(): Promise<boolean> {
        return promiseOf(this.element.isPresent());
    }

    isSelected(): Promise<boolean> {
        return promiseOf(this.element.isSelected());
    }

    toString(): string {
        return this.element.toString(); // todo: or location?
    }
}
