import { PageElement } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIONativeElementSearchContext } from './WebdriverIONativeElementSearchContext';

export class WebdriverIOPageElement
    extends PageElement<WebdriverIONativeElementSearchContext, wdio.Element<'async'>>
{
    of(parent: WebdriverIOPageElement): PageElement<WebdriverIONativeElementSearchContext, wdio.Element<'async'>> {
        return new WebdriverIOPageElement(() => parent.nativeElement(), this.locator);
    }

    async clearValue(): Promise<void> {
        const element = await this.nativeElement();
        return element.clearValue();
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

    async isActive(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isFocused();
    }

    async isClickable(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isClickable();
    }

    async isDisplayed(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isDisplayed();
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
}
