import { Change, diffLines } from 'diff';

export class AssertionReportDiffer {
    constructor(private readonly mappers: AssertionReportDiffMappers) {
    }

    diff(expectedValue: string, actualValue: string): string {
        const changes = diffLines(actualValue, expectedValue)
            .map(change => this.markChanges(change));

        return [
            `Difference (${ this.mappers.expected('expected') }, ${ this.mappers.actual('actual') }):`,
            '',
            changes.length === 2
                ? changes.join('\n')
                : changes.join(''),
        ].join('\n');
    }

    private markChanges(change: Change): string {

        return change.added
            ? this.eachLineOf(change.value, this.mappers.expected)
            : (change.removed
                ? this.eachLineOf(change.value, this.mappers.actual)
                : this.eachLineOf(change.value, this.mappers.matching));
    }

    private eachLineOf(lines: string, mapper: (line: string) => string): string {
        return lines.split('\n').map(
            line =>
                line.trim()
                    ? mapper(line)
                    : line
        ).join('\n');
    }
}

export interface AssertionReportDiffMappers {
    expected:   (line: string) => string;
    actual:     (line: string) => string;
    matching:   (line: string) => string;
}
