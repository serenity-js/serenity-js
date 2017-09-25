import { describeAs } from '@serenity-js/core/lib/recording';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { Locator } from 'protractor/built/locators';

export class Target {

    static the = (name: string) => ({
        located: (byLocator: Locator): Target => new Target(name, byLocator),
    })

    of(...tokenReplacements: Array<string|number>): Target {
        return new Target(describeAs(this.name, ...tokenReplacements), new Interpolated(this.locator).with(tokenReplacements));
    }

    called(newName: string): Target {
        return new Target(newName, this.locator);
    }

    resolveUsing(resolver: (locator: Locator) => ElementFinder): ElementFinder {
        return resolver(this.locator);
    }

    resolveAllUsing(resolver: { all: (locator: Locator) => ElementArrayFinder }): ElementArrayFinder {
        return resolver.all(this.locator);
    }

    toString(): string {
        return `the ${ this.name }`;
    }

    constructor(private name: string, private locator: Locator) {
    }
}

class Interpolated {

    constructor(private locator: Locator) {
    }

    public with(tokenReplacements: Array<string|number>) {

        const unescaped = template => template.replace(/\\{(\d+)\\}/, '{$1}');
        const asString  = (locator: Locator): string => unescaped(`${(locator as any).value}`);

        // note: ProtractorBy is not compatible with WebdriverBy https://github.com/angular/protractor/issues/3508
        if (! this.canBeInterpolated()) {
            throw new Error(this.locator.toString() +
                ' is not a webdriver-compatible locator so you won\'t be able to use token replacement with it');
        }

        const cloned: any  = Object.assign({}, this.locator);
        cloned.__proto__ = Object.getPrototypeOf(this.locator);
        cloned.value     = describeAs(asString(this.locator), ...tokenReplacements);

        return cloned;
    }

    private canBeInterpolated = (): boolean => !! (this.locator as any).value;
}
