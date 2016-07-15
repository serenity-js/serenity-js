import { defer } from '../../../serenity/recording/async';
import * as webdriver from 'selenium-webdriver';

export class Target {

    private locator: ElementLocator;

    static the(name: string) {
        return new Target(name);
    }

    // todo: add locator chaining
    // todo: add token substitution

    located(byLocator: webdriver.Locator): Target {
        this.locator = new SingleElementLocator(byLocator);

        return this;
    }

    resolveUsing(resolver: (locator: webdriver.Locator) => protractor.ElementFinder): WebElement {
        return new WebElement(resolver(this.locator.webdriverLocator));
    }

    resolveAllUsing(resolver: { all: (locator: webdriver.Locator) => protractor.ElementArrayFinder }): WebElements {
        return new WebElements(resolver.all(this.locator.webdriverLocator));
    }

    toString(): string {
        return `the ${this.name}`;
    }

    constructor(private name: string) {
    }
}

export class WebElements /* should implement something akin to protractor.ElementFinder */ {
    // todo: this API barely scratches the surface of what's needed ...

    text(): Promise<string[]> {
        return defer(() => this.finder.getText());
    }

    constructor(private finder: protractor.ElementArrayFinder) {
    }

    // first(): protractor.ElementFinder {
    //     return undefined;
    // }
    //
    // last(): protractor.ElementFinder {
    //     return undefined;
    // }
    //
    // count(): webdriver.promise.Promise<number> {
    //     return undefined;
    // }
    //
    // each(fn: (element: protractor.ElementFinder, index: number)=>void): void {
    // }
    //
    // map<T>(mapFn: (element: protractor.ElementFinder, index: number)=>T): webdriver.promise.Promise<T[]> {
    //     return undefined;
    // }
    //
    // map<T, T2>(mapFn: (element: protractor.ElementFinder, index: number)=>T2): webdriver.promise.Promise<T[]> {
    //     return undefined;
    // }
    //
    // filter(filterFn: (element: protractor.ElementFinder, index: number)=>any): protractor.ElementArrayFinder {
    //     return undefined;
    // }
    //
    // reduce<T>(reduceFn: (acc: T, element: protractor.ElementFinder, index: number, arr: protractor.ElementFinder[])=>webdriver.promise.Promise<T>,
    //  initialValue: T): webdriver.promise.Promise<T> {
    //     return undefined;
    // }
    //
    // reduce<T>(reduceFn: (acc: T, element: protractor.ElementFinder, index: number, arr: protractor.ElementFinder[])=>T,
    //  initialValue: T): webdriver.promise.Promise<T> {
    //     return undefined;
    // }
    //
    // asElementFinders_(): webdriver.promise.Promise<protractor.ElementFinder[]> {
    //     return undefined;
    // }
    //
    // clone(): protractor.ElementArrayFinder {
    //     return undefined;
    // }
    //
    // all(locator: webdriver.Locator): protractor.ElementArrayFinder {
    //     return undefined;
    // }
    //
    // $$(selector: string): protractor.ElementArrayFinder {
    //     return undefined;
    // }
    //
    // private toElementFinder_(): protractor.ElementFinder {
    //     return undefined;
    // }
    //
    // locator(): webdriver.Locator {
    //     return undefined;
    // }
    //
    // evaluate(expression: string): protractor.ElementArrayFinder {
    //     return undefined;
    // }
    //
    // allowAnimations(value: boolean): protractor.ElementArrayFinder {
    //     return undefined;
    // }
    //
    // click(): webdriver.promise.Promise<void> {
    //     return undefined;
    // }
    //
    // sendKeys(var_args: string): webdriver.promise.Promise<void> {
    //     return undefined;
    // }
    //
    // getTagName(): webdriver.promise.Promise<string[]> {
    //     return undefined;
    // }
    //
    // getCssValue(cssStyleProperty: string): webdriver.promise.Promise<string[]> {
    //     return undefined;
    // }
    //
    // getAttribute(attributeName: string): webdriver.promise.Promise<string[]> {
    //     return undefined;
    // }
    //
    // getText(): webdriver.promise.Promise<string[]> {
    //     return undefined;
    // }
    //
    // getSize(): webdriver.promise.Promise<webdriver.ISize[]> {
    //     return undefined;
    // }
    //
    // getLocation(): webdriver.promise.Promise<webdriver.ILocation[]> {
    //     return undefined;
    // }
    //
    // isEnabled(): webdriver.promise.Promise<boolean[]> {
    //     return undefined;
    // }
    //
    // isSelected(): webdriver.promise.Promise<boolean[]> {
    //     return undefined;
    // }
    //
    // submit(): webdriver.promise.Promise<void> {
    //     return undefined;
    // }
    //
    // clear(): webdriver.promise.Promise<void> {
    //     return undefined;
    // }
    //
    // isDisplayed(): webdriver.promise.Promise<boolean[]> {
    //     return undefined;
    // }
    //
    // getOuterHtml(): webdriver.promise.Promise<string[]> {
    //     return undefined;
    // }
    //
    // getId(): webdriver.promise.Promise<webdriver.IWebElementId[]> {
    //     return undefined;
    // }
    //
    // getInnerHtml(): webdriver.promise.Promise<string[]> {
    //     return undefined;
    // }
}

export class WebElement {

    static create(finder: webdriver.IWebElement) {
        return new WebElement(finder);
    }

    constructor(private element: webdriver.IWebElement) {
    }

    click(): Promise<void> {
        return defer(() => this.element.click());
    }

    sendKeys(...var_args): Promise<void> {
        return defer<void>(() => this.element.sendKeys.apply(this.element, var_args));
    }

    tagName(): Promise<string> {
        return defer(() => this.element.getTagName());
    }

    cssValue(cssStyleProperty: string): Promise<string> {
        return defer(() => this.element.getCssValue(cssStyleProperty));
    }

    attribute(attributeName: string): Promise<string> {
        return defer(() => this.element.getAttribute(attributeName));
    }

    text(): Promise<string> {
        return defer(() => this.element.getText());
    }

    size(): Promise<webdriver.ISize> {
        return defer(() => this.element.getSize());
    }

    location(): Promise<webdriver.ILocation> {
        return defer(() => this.element.getLocation());
    }

    isEnabled(): Promise<boolean> {
        return defer(() => this.element.isEnabled());
    }

    isSelected(): Promise<boolean> {
        return defer(() => this.element.isSelected());
    }

    submit(): Promise<void> {
        return defer(() => this.element.submit());
    }

    clear(): Promise<void> {
        return defer(() => this.element.clear());
    }

    isDisplayed(): Promise<boolean> {
        return defer(() => this.element.isDisplayed());
    }

    outerHtml(): Promise<string> {
        return defer(() => this.element.getOuterHtml());
    }

    id(): Promise<webdriver.IWebElementId> {
        return defer(() => this.element.getId());
    }

    innerHtml(): Promise<string> {
        return defer(() => this.element.getInnerHtml());
    }
}

// function head<T>(list: T[]): T {
//     return list[0];
// }
//
// function tail<T>(list: T[]): T[] {
//     return list.slice(1);
// }

interface ElementLocator {
    webdriverLocator: webdriver.Locator;
}

class SingleElementLocator implements ElementLocator {
    constructor(public webdriverLocator: webdriver.Locator) {
    }
}

class ElementSetLocator implements ElementLocator {
    constructor(public webdriverLocator: webdriver.Locator) {
    }
}
