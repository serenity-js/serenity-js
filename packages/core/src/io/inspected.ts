import type { InspectOptions } from 'node:util';
import { inspect } from 'node:util';

export function inspected(value: unknown, options: InspectOptions = {}): string {
    return inspect(value, {
        depth: Number.POSITIVE_INFINITY,
        breakLength: Number.POSITIVE_INFINITY,
        customInspect: true,
        compact:  false,
        sorted: true,
        showProxy: false,
        showHidden: false,
        ...options,
    });
}
