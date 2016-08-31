import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';

export class Target {

    static the(name: string) {
        return new TargetBuilder(name);
    }

    of(...tokenReplacements: string[]): Target {
        let locator = Object.assign({}, this.locator);
        locator.__proto__ = Object.getPrototypeOf(this.locator);

        // fixme: remove the cast once the protractor issue is fixed: https://github.com/angular/protractor/issues/3508
        locator.value = interpolated((<any> this.locator).value, tokenReplacements);

        return new Target(this.name, locator);
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

function interpolated(template: string, replacements: string[]) {
    let argToken     = /{(\d+)}/g,
        interpolator = (token: string, field: number) => replacements[ field ];

    return template.replace(argToken, interpolator);
}
