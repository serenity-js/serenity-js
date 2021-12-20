import { PageElement } from '@serenity-js/web';
import { ElementHandle } from 'playwright';
import { PlaywrightNativeRootElement } from './PlaywrightNativeRootElement';

export class PlaywrightPageElement extends PageElement<PlaywrightNativeRootElement, ElementHandle> {
    of(parent: PlaywrightPageElement): PageElement<PlaywrightNativeRootElement, ElementHandle> {
        return new PlaywrightPageElement(() => parent.nativeElement(), this.locator);
    }

    async enterValue(value: string | number | (string | number)[]): Promise<void> {
        const nativeElement = await this.nativeElement();
        return nativeElement.fill(value as string);
    }

    async clearValue(): Promise<void> {
        const nativeElement = await this.nativeElement();
        return nativeElement.fill('');
    }

    async click(): Promise<void> {
        const nativeElement = await this.nativeElement();
        return nativeElement.click();
    }

    async doubleClick(): Promise<void> {
        const nativeElement = await this.nativeElement();
        return nativeElement.dblclick();
    }

    async scrollIntoView(): Promise<void> {
        const nativeElement = await this.nativeElement();
        return nativeElement.scrollIntoViewIfNeeded();
    }

    async hoverOver(): Promise<void> {
        const nativeElement = await this.nativeElement();
        return nativeElement.hover();
    }

    async rightClick(): Promise<void> {
        const nativeElement = await this.nativeElement();
        return nativeElement.click({
            button: 'right',
        });
    }

    async attribute(name: string): Promise<string> {
        const nativeElement = await this.nativeElement();
        return nativeElement.getAttribute(name);
    }

    async text(): Promise<string> {
        const nativeElement = await this.nativeElement();
        return nativeElement.textContent();
    }

    async value(): Promise<string> {
        const nativeElement = await this.nativeElement();
        return nativeElement.inputValue();
    }

    async isActive(): Promise<boolean> {
        const nativeElement = await this.nativeElement();
        return nativeElement.evaluate((el) => el === document.activeElement);
    }

    async isClickable(): Promise<boolean> {
        try {
            const nativeElement = await this.nativeElement();
            // the most precise way to check clickability in playwright
            await nativeElement.click({
                timeout: 100,
                trial: true // tries to click without clicking
            });
            return true;
        } catch(err) {
            return false;
        }
    }

    async isDisplayed(): Promise<boolean> {
        const nativeElement = await this.nativeElement();
        return nativeElement.isVisible();
    }

    async isEnabled(): Promise<boolean> {
        const nativeElement = await this.nativeElement();
        const isDisabled = await nativeElement.isDisabled();
        return !isDisabled;
    }

    async isPresent(): Promise<boolean> {
        const nativeElement = await this.nativeElement();
        return Boolean(nativeElement);
    }

    isSelected(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

}

