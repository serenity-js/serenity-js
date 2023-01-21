import { ArrayChange, Change, diffArrays, diffJson } from 'diff';
import { equal } from 'tiny-types/lib/objects';

import { isPrimitive, typeOf } from '../io';
import { inspected, isPlainObject } from '../io/inspected';
import { Unanswered } from '../screenplay';
import { ErrorOptions } from './ErrorOptions';
import { RuntimeError } from './RuntimeError';

export class ErrorFactory {
    // todo: add interaction callstack to options object

    create<RE extends RuntimeError>(errorType: new (...args: any[]) => RE, options: ErrorOptions): RE {

        const message = [
            this.title(options.message),
            options.diff && this.diff(options.diff),
        ].filter(Boolean).join('\n');

        return new errorType(message, options?.cause) as unknown as RE;
    }

    private title(value: string): string {
        return `${ value }`.trim();
    }

    private diff(diff: { expected: unknown, actual: unknown }): string {
        let expected = `Expected ${ typeOf(diff.expected) }`;
        let actual   = `Actual ${ typeOf(diff.actual) }`;

        let diffDescription = '';

        const labelLength = Math.max(expected.length, actual.length) + 2;

        if (isSummarisable(diff.expected)) {
            expected += `: `.padEnd(labelLength - expected.length) + summarised(diff.expected);
        }

        if (isSummarisable(diff.actual)) {
            actual += `: `.padEnd(labelLength - actual.length) + summarised(diff.actual);
        }

        if (isComplex(diff.actual) && ! sameType(diff.expected, diff.actual) && ! isSummarisable(diff.actual)) {
            diffDescription += `\n`;
            diffDescription += inspected(diff.actual, { inline: false, markQuestions: false });
            diffDescription += `\n`;
        }

        if (isComparableAsJson(diff.expected) && isComparableAsJson(diff.actual) && ! isSummarisable(diff.expected) && ! isSummarisable(diff.actual)) {
            const changes = diffJson(diff.expected, diff.actual);

            const { removed, added } = changes.reduce(({ removed, added }, change) => {
                return {
                    removed: removed +  (change.removed ? change.count : 0),
                    added:   added +    (change.added ? change.count : 0),
                }
            }, { removed: 0, added: 0 });

            expected += `  - ${removed}`
            actual   += `    + ${added}`

            diffDescription += `\n`;
            diffDescription += changes
                .reduce((acc, change) => {
                    const lines = change.value.split('\n');
                    return acc + lines.map(line => decorated(line, change)).join('\n').trimEnd() + '\n'
                }, '');
        }

        if (isArray(diff.expected) && isArray(diff.actual)) {
            const changes = diffArrays(diff.expected, diff.actual, { comparator: equal } );

            const { removed, added } = changes.reduce(({ removed, added }, change) => {
                return {
                    removed: removed +  (change.removed ? change.count : 0),
                    added:   added +    (change.added ? change.count : 0),
                }
            }, { removed: 0, added: 0 });

            expected += `  - ${removed}`
            actual   += `    + ${added}`

            diffDescription += `\n`;
            diffDescription += `  [`;

            diffDescription += changes.reduce((acc, change) => {
                const items = change.value;
                return acc + items.map(item => '\n' + decorated('  ' + inspected(item, { inline:true, markQuestions: false }), change)).join('');
            }, '');
            diffDescription += `\n  ]\n`;
        }

        return `\n${ expected }\n${ actual }\n${ diffDescription }`;
    }
}

function isSummarisable(value: unknown): boolean {
    return isDefined(value)
        && (
            isPrimitive(value)
            || value instanceof RegExp
            || value instanceof Date
        )
}

function summarised(value: unknown): string {
    if (value instanceof Date) {
        return value.toISOString();
    }

    return String(value);
}

function isComplex(value: unknown): boolean {
    return typeof value === 'object'
        && ! (value instanceof RegExp)
        && ! (value instanceof Unanswered);
}

function isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
}

function isDefined(value: unknown): boolean {
    return value !== undefined
        && value !== null;
}

function sameType(a: unknown, b: unknown): boolean {
    return typeOf(a) === typeOf(b);
}

function decorated(line: string, change: Change | ArrayChange<unknown>): string {
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

function isComparableAsJson(value: unknown): value is object {
    if (! value || value instanceof Unanswered) {
        return false;
    }

    return isPlainObject(value)
        || value['toJSON'];
}
