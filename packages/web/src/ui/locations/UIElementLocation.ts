export abstract class UIElementLocation {
    constructor(
        public readonly description: string,
        public readonly value: string,
    ) {
    }

    toString(): string {
        return this.description;
    }
}
