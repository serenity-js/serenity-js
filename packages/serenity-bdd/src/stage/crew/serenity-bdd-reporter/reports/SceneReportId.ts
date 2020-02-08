import { ensure, isDefined, isGreaterThan, property, TinyType } from 'tiny-types';

export class SceneReportId extends TinyType {

    public readonly value: string;

    constructor(segment: string, base?: string) {
        super();
        ensure('ID segment', segment, isDefined(), property('length', isGreaterThan(0)));

        this.value = [
            base,
            this.dashify(segment),
        ].filter(_ => !! _).join(';');
    }

    append(segment: string): SceneReportId {
        return new SceneReportId(segment, this.value);
    }

    private dashify(text: string) {
        return text
            .replace(/[ \t\W]/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase();
    }
}
