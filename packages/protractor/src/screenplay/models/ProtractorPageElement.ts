import { PageElement } from '@serenity-js/web';
import { ElementFinder, protractor } from 'protractor';
import { WebElement } from 'selenium-webdriver';

import { promised } from '../promised';
import { ProtractorNativeElementLocator } from './ProtractorNativeElementLocator';

export class ProtractorPageElement
    extends PageElement<ElementFinder>
{
    of(parent: ProtractorPageElement): PageElement<ElementFinder> {
        return new ProtractorPageElement(this.selector, new ProtractorNativeElementLocator(() => parent.nativeElement()));
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

        const currentValue = await this.value();

        if (currentValue !== null && currentValue !== undefined) {
            const element = await this.nativeElement();
            return removeCharactersFrom(element, currentValue.length);
        }
    }

    async click(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();

        return element.click();
    }

    async doubleClick(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().actions()
                .mouseMove(webElement)
                .doubleClick()
                .perform()
        );
    }

    async enterValue(value: string | number | Array<string | number>): Promise<void> {
        const element: ElementFinder = await this.nativeElement();

        return element.sendKeys(
            [].concat(value).join('')
        );
    }

    async scrollIntoView(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().executeScript('arguments[0].scrollIntoView(true);', webElement)
        );
    }

    async hoverOver(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().actions()
                .mouseMove(webElement)
                .perform()
        );
    }

    async rightClick(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().actions()
                .mouseMove(webElement)
                .click(protractor.Button.RIGHT)
                .perform()
        );
    }

    async attribute(name: string): Promise<string> {
        const element: ElementFinder = await this.nativeElement();

        return element.getAttribute(name);
    }

    async text(): Promise<string> {
        const element: ElementFinder = await this.nativeElement();

        return element.getText();
    }

    async value(): Promise<string> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(webElement.getDriver().executeScript(
            /* istanbul ignore next */
            function getValue(webElement) {
                return webElement.value;
            },
            webElement,
        ));
    }

    async isActive(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return webElement.getDriver().switchTo().activeElement().then((active: WebElement) =>
            element.equals(active),
        );
    }

    async isClickable(): Promise<boolean> {
        return this.isEnabled();
    }

    async isEnabled(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return element.isEnabled();
    }

    async isPresent(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return element.isPresent();
    }

    async isSelected(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return element.isSelected();
    }

    async isVisible(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        if (! await element.isDisplayed()) {
            return false;
        }

        const webElement: WebElement = await element.getWebElement();

        // get element at cx/cy and see if the element we found is our element, and therefore it's visible.
        return promised(webElement.getDriver().executeScript(
            `
            var  elem = arguments[0];
            
            if (! elem.getBoundingClientRect) {
                return false;
            }
            
            var
                box = elem.getBoundingClientRect(),
                cx = box.left + box.width / 2,
                cy = box.top + box.height / 2,
                e = document.elementFromPoint(cx, cy);
            
            for (; e; e = e.parentElement) {
                if (e === elem)
                    return true;
            }
            return false;
            `,
            webElement,
        ));
    }
}
