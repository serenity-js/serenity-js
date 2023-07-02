import { dashify } from '../mappers';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function reportIdIncluding<Context extends SerenityBDDReportContext>(...segments: string[]): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.id = unique([
            ...(context.report.id || '').split(';'),
            ...segments.map(dashify)
        ].filter(nonempty)).join(';');

        return context;
    }
}

/**
 * @package
 */
function nonempty(value: string | undefined) {
    return !! value;
}

/**
 * @package
 */
function unique(values: string[]) {
    return [...new Set(values)];
}
