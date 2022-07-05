import { TinyType } from 'tiny-types';

export class SelectOption extends TinyType {

    static withLabel(label: string): SelectOption {
        return new SelectOption(label);
    }

    static withValue(value: string): SelectOption {
        return new SelectOption(undefined, value);
    }

    constructor(
        public readonly label?: string,
        public readonly value?: string,
        public readonly selected?: boolean,
        public readonly disabled?: boolean,
    ) {
        super();
    }

    toString(): string {
        return `<option /> element with label: ${ this.label }, value: ${ this.value }`;
    }
}
