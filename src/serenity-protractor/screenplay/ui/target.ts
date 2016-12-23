import { ElementArrayFinder, ElementFinder } from 'protractor';
import { Locator } from 'protractor/built/locators';

export class Target {

    static the(name: string) {
        return new TargetBuilder(name);
    }

    of(...tokenReplacements: string[]): Target {
        return new Target(this.name, new Interpolated(this.locator).with(tokenReplacements));
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

    public with(tokenReplacements: string[]) {

        // note: ProtractorBy is not compatible with WebdriverBy https://github.com/angular/protractor/issues/3508
        if (! this.canBeInterpolated()) {
            throw new Error(this.locator.toString() +
                ' is not a webdriver-compatible locator so you won\'t be able to use token replacement with it');
        }

        let cloned: any  = Object.assign({}, this.locator);
        cloned.__proto__ = Object.getPrototypeOf(this.locator);
        cloned.value     = this.interpolated((<any> this.locator).value, tokenReplacements);

        return cloned;
    }

    private canBeInterpolated(): boolean {
        return !! (<any> this.locator).value;
    }

    private interpolated(template: string, replacements: string[]) {
        let argToken     = /\\?\{(\d+)\\?\}/g,
            interpolator = (token: string, field: number) => replacements[ field ];

        return template.replace(argToken, interpolator);
    }
}

export class TargetBuilder {

    constructor(private name: string) {
    }

    located(byLocator: Locator): Target {
        return new Target(this.name, byLocator);
    }

    toString(): string {
        return `TargetBuilder for the ${ this.name }`;
    }
}
