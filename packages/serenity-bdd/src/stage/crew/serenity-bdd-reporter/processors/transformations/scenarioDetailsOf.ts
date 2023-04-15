import { Path } from '@serenity-js/core/lib/io';
import { ScenarioDetails } from '@serenity-js/core/lib/model';
import { ensure, isNotBlank } from 'tiny-types';

import { dashify, escapeHtml } from '../mappers';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function scenarioDetailsOf<Context extends SerenityBDDReportContext>(details: ScenarioDetails): (context: Context) => Context  {
    return (context: Context): Context => {
        const name      = ensure('scenario name', details.name.value, isNotBlank());
        const category  = ensure('scenario category', details.category.value, isNotBlank());

        context.report.name = escapeHtml(name);
        context.report.title = escapeHtml(name);
        context.report.manual = false;
        context.report.testSteps = [];
        context.report.userStory = {
            id: dashify(category),
            storyName: escapeHtml(category),
            path: isFeatureFile(details.location.path)
                ? details.location.path.value
                : '',
            type: 'feature',
        };

        return context;
    }
}

/**
 * @package
 * @param {Path} path
 */
function isFeatureFile(path: Path): boolean {
    return path && path.value.endsWith('.feature');
}
