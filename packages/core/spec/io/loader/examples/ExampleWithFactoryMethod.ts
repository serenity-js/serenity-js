export class ExampleWithFactoryMethod {
    static fromJSON(value: { name: string }): ExampleWithFactoryMethod {
        return new ExampleWithFactoryMethod(value.name)
    }

    constructor(public readonly name: string) {
    }
}
