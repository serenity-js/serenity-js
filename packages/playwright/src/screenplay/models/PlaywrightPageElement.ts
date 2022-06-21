import { LogicError } from '@serenity-js/core';
import { PageElement, SwitchableOrigin } from '@serenity-js/web';
import * as playwright from 'playwright-core';

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

    switchTo(): Promise<SwitchableOrigin> {
        throw new Error('Method not implemented. switchTo');
    }

    isActive(): Promise<boolean> {
        throw new Error('Method not implemented. isActive');
    }

    async isClickable(): Promise<boolean> {
        throw new Error('Method not implemented. isClickable');
    }

    async isEnabled(): Promise<boolean> {
        const element = await this.nativeElement();

        return element
            && await element.isEnabled();
    }

    async isPresent(): Promise<boolean> {
        const element = await this.nativeElement();
        return element !== null;
    }

    async isSelected(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isChecked();
    }

    isVisible(): Promise<boolean> {
        throw new Error('Method not implemented. isVisible');
    }
}
