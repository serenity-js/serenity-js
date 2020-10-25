import { dashify } from '../mappers';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function reportIdIncluding<Context extends SerenityBDDReportContext>(...segments: string[]) {

    function nonempty(value: string | undefined) {
        return !! value;
    }

    function unique(values: string[]) {
        return [...new Set(values)];
    }

    return (context: Context): Context => {
        context.report.id = unique([
            ...(context.report.id || '').split(';'),
            ...segments.map(dashify)
        ].filter(nonempty)).join(';');

        return context;
    }
}
