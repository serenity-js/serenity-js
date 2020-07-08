import { ensure, isDefined, isGreaterThan, property, TinyType } from 'tiny-types';

/**
 * @package
 */
export class SceneReportId extends TinyType {

    public readonly values: string[] = [];

    constructor(segment: string) {
        super();

        this.values = [this.verified(segment)];
    }

    append(segment: string): SceneReportId {
        this.values.push(this.verified(segment));

        return this;
    }

    public value(): string {
        return [...new Set(this.values)].map(value => this.dashify(value)).join(';');
    }

    private verified(segment: string) {
        return ensure('SceneReportId segment', segment, isDefined(), property('length', isGreaterThan(0)));
    }

    private dashify(text: string) {
        return text
            .replace(/[ \t\W]/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase();
    }
}
