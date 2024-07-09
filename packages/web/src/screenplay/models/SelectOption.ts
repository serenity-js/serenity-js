import { TinyType } from 'tiny-types';

/**
 * Describes the [`<option />`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
 * elements to select.
 *
 * ## Learn more
 *
 * - [`Select`](https://serenity-js.org/api/web/class/Select/)
 * - [`Selected`](https://serenity-js.org/api/web/class/Selected/)
 * - [`PageElement.selectOptions`](https://serenity-js.org/api/web/class/PageElement/#selectOptions)
 * - [`PageElement.selectedOptions`](https://serenity-js.org/api/web/class/PageElement/#selectedOptions)
 *
 * @group Models
 */
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
