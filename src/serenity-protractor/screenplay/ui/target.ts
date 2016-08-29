import * as webdriver from 'selenium-webdriver';

export class Target {

    static the(name: string) {
        return new TargetBuilder(name);
    }

    of(...tokenReplacements: string[]): Target {
        let locator = Object.assign({}, this.locator);
        locator.__proto__ = Object.getPrototypeOf(this.locator);
        locator.value = interpolated(this.locator.value, tokenReplacements);

        return new Target(this.name, locator);
    }

    called(newName: string): Target {
        return new Target(newName, this.locator);
    }

    resolveUsing(resolver: (locator: webdriver.Locator) => protractor.ElementFinder): protractor.ElementFinder {
        return resolver(this.locator);
    }

    resolveAllUsing(resolver: { all: (locator: webdriver.Locator) => protractor.ElementArrayFinder }): protractor.ElementArrayFinder {
        return resolver.all(this.locator);
    }

    toString(): string {
        return `the ${ this.name }`;
    }

    constructor(private name: string, private locator: webdriver.Locator) {
    }
}

export class TargetBuilder {

    constructor(private name: string) {
    }

    located(byLocator: webdriver.Locator): Target {
        return new Target(this.name, byLocator);
    }

    toString(): string {
        return `TargetBuilder for the ${ this.name }`;
    }
}

function interpolated(template: string, replacements: string[]) {
    let argToken     = /{(\d+)}/g,
        interpolator = (token: string, field: number) => replacements[ field ];

    return template.replace(argToken, interpolator);
}
