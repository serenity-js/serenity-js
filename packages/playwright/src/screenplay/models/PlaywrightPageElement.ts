import { Adapter, Answerable, Question } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';
import { ElementHandle } from 'playwright';
import { PlaywrightNativeRootElement } from './PlaywrightNativeRootElement';

export class PlaywrightPageElement extends PageElement<PlaywrightNativeRootElement, ElementHandle> {
    of(parent: PageElement<any, any>): PageElement<any, any> {
        throw new Error('Method not implemented.');
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
    rightClick(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    attribute(name: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    text(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    value(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    isActive(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isClickable(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isDisplayed(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isEnabled(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isPresent(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isSelected(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

}

