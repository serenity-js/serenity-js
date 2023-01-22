import { ArrayChange, Change, diffArrays, diffJson } from 'diff';
import { equal } from 'tiny-types/lib/objects';

import { isPrimitive, typeOf } from '../io';
import { inspected, isPlainObject } from '../io/inspected';
import { Unanswered } from '../screenplay';
import { ErrorOptions } from './ErrorOptions';
import { RuntimeError } from './RuntimeError';

export class ErrorFactory {

    // todo: add configurable rendering function to mark differences
    // todo: add interaction callstack to options object
    create<RE extends RuntimeError>(errorType: new (...args: any[]) => RE, options: ErrorOptions): RE {

        const message = [
            this.title(options.message),
            options.diff && this.diffFrom(options.diff),
            // todo: add interaction details
        ].
        filter(Boolean).
        join('\n');

        return new errorType(message, options?.cause) as unknown as RE;
    }

    private title(value: string): string {
        return String(value).trim();
    }

    private diffFrom(diff: { expected: unknown, actual: unknown }): string {
        return new Diff(diff.expected, diff.actual).toString();
    }
}

class DiffValue {
    private nameAndType: string;
    private readonly summary?: string;
    private changes?: string;

    public desiredNameFieldLength: number;

    constructor(
        name: string,
        public readonly value: unknown,
    ) {
        this.nameAndType            = `${ name } ${ typeOf(value) }`;
        this.desiredNameFieldLength = this.nameAndType.length;
        this.summary                = this.summaryOf(value);
    }

    withChanges(changes: string): this {
        this.changes = changes;

        return this;
    }

    withDesiredFieldLength(columns: number): this {
        this.desiredNameFieldLength = columns;
        return this;
    }

    hasSummary() {
        return this.summary !== undefined;
    }

    type(): string {
        return typeOf(this.value);
    }

    isComplex(): boolean {
        return typeof this.value === 'object'
            && ! (this.value instanceof RegExp)
            && ! (this.value instanceof Unanswered);
    }

    isArray(): boolean {
        return Array.isArray(this.value);
    }

    isComparableAsJson() {
        if (! this.value || this.value instanceof Unanswered) {
            return false;
        }

        return isPlainObject(this.value)
            || this.value['toJSON'];
    }

    toString(): string {
        const labelWidth = this.desiredNameFieldLength - this.nameAndType.length;

        return [
            this.nameAndType,
            this.summary && ': '.padEnd(labelWidth + 2),
            this.summary,
            this.changes && this.changes.padStart(labelWidth + 5),
        ].
        filter(Boolean).
        join('');
    }

    private summaryOf(value: unknown): string | undefined {
        if (value instanceof Date) {
            return value.toISOString();
        }

        const isDefined = value !== undefined && value !== null;

        if (isDefined && (isPrimitive(value) || value instanceof RegExp)) {
            return String(value);
        }

        return undefined;
    }
}

class Diff {
    private readonly diff: string;

    constructor(
        expectedValue: unknown,
        actualValue: unknown,
    ) {
        this.diff = this.render(this.diffFrom(expectedValue, actualValue));
    }

    toString(): string {
        return this.diff;
    }

    private render({ expected, actual, diff }: { expected: DiffValue, actual: DiffValue, diff: string }): string {
        return `\n${ expected }\n${ actual }\n${ diff }`;
    }

    private diffFrom(expectedValue: unknown, actualValue: unknown): { expected: DiffValue, actual: DiffValue, diff: string } {
        const { expected, actual } = this.aligned(
            new DiffValue('Expected', expectedValue),
            new DiffValue('Received', actualValue)
        );

        if (this.shouldRenderActualValueOnly(expected, actual)) {
            return this.renderActualValue(expected, actual);
        }

        if (this.shouldRenderJsonDiff(expected, actual)) {
            return this.renderJsonDiff(expected, actual);
        }

        if (this.shouldRenderArrayDiff(expected, actual)) {
            return this.renderArrayDiff(expected, actual);
        }

        return { expected, actual, diff: '' };
    }

    private shouldRenderActualValueOnly(expected: DiffValue, actual: DiffValue): boolean {
        return actual.isComplex()
            && ! actual.hasSummary()
            && expected.type() !== actual.type();
    }

    private shouldRenderJsonDiff(expected: DiffValue, actual: DiffValue): boolean {
        return expected.isComparableAsJson()
            && actual.isComparableAsJson()
            && ! expected.hasSummary()
            && ! actual.hasSummary()
    }

    private shouldRenderArrayDiff(expected: DiffValue, actual: DiffValue): boolean {
        return expected.isArray()
            && actual.isArray();
    }

    private aligned(expected: DiffValue, actual: DiffValue): { expected: DiffValue, actual: DiffValue } {
        const maxFieldLength = Math.max(
            expected.desiredNameFieldLength,
            actual.desiredNameFieldLength
        );

        return {
            expected: expected.withDesiredFieldLength(maxFieldLength),
            actual:   actual.withDesiredFieldLength(maxFieldLength)
        };
    }

    private renderActualValue(expected: DiffValue, actual: DiffValue): { expected: DiffValue, actual: DiffValue, diff: string } {
        return {
            expected,
            actual,
            diff: `\n${ inspected(actual.value, { inline: false, markQuestions: false }) }\n`,
        };
    }

    private renderJsonDiff(expected: DiffValue, actual: DiffValue): { expected: DiffValue, actual: DiffValue, diff: string } {
        const changes = diffJson(expected.value as object, actual.value as object);

        const diff = changes.reduce((acc, change) => {
            const lines = change.value.split('\n');
            return acc + lines.map(line =>
                this.decorated(line, change)
            ).join('\n').trimEnd() + '\n'
        }, '\n');

        const { added, removed } = this.countOf(changes);

        return {
            expected:   expected.withChanges(this.decorated(`${ removed }`, { removed })),
            actual:     actual.withChanges(this.decorated(`${ added }`, { added })),
            diff
        };
    }

    private renderArrayDiff(expected: DiffValue, actual: DiffValue): { expected: DiffValue, actual: DiffValue, diff: string }  {
        const changes = diffArrays(expected.value as Array<unknown>, actual.value as Array<unknown>, { comparator: equal } );

        const diff = changes.reduce((acc, change) => {
            const items = change.value;
            return acc + items.map(item =>
                `\n${ this.decorated('  ' + inspected(item, { inline:true, markQuestions: false }), change) }`
            ).join('');
        }, '\n  [') + `\n  ]\n`;

        const { added, removed } = this.countOf(changes);

        return {
            expected:   expected.withChanges(this.decorated(`${ removed }`, { removed })),
            actual:     actual.withChanges(this.decorated(`${ added }`, { added })),
            diff
        };
    }

    private countOf(changes: Array<Change | ArrayChange<unknown>>): { added: number, removed: number } {
        return changes.reduce(({ removed, added }, change) => {
            return {
                removed: removed + (change.removed ? change.count : 0),
                added:   added +   (change.added ? change.count : 0),
            }
        }, { removed: 0, added: 0 });
    }

    private decorated(line: string, change: { added?: boolean | number, removed?: boolean | number }): string {
        const trimmedLine = line.trim();

        if (! trimmedLine) {
            return line;
        }

        if (change.added) {
            return `+ ${ line }`;
        }

        if (change.removed) {
            return `- ${ line }`;
        }

        return `  ${ line }`;
    }
}
