export abstract class ElementLocation {
    constructor(
        public readonly description: string,
        public readonly value: string,
    ) {
    }

    toString(): string {
        return this.description;
    }
}
