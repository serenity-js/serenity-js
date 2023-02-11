import { Path } from '@serenity-js/core/lib/io';
import { ScenarioDetails } from '@serenity-js/core/lib/model';
import { ensure, isNotBlank } from 'tiny-types';

import { dashify } from '../mappers';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function scenarioDetailsOf<Context extends SerenityBDDReportContext>(details: ScenarioDetails): (context: Context) => Context  {
    return (context: Context): Context => {
        const name      = ensure('scenario name', details.name.value, isNotBlank());
        const category  = ensure('scenario category', details.category.value, isNotBlank());

        context.report.name = name;
        context.report.title = name;
        context.report.manual = false;
        context.report.testSteps = [];
        context.report.userStory = {
            id: dashify(category),
            storyName: category,
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
 * @returns {boolean}
 */
function isFeatureFile(path: Path): boolean {
    return path && path.value.endsWith('.feature');
}
