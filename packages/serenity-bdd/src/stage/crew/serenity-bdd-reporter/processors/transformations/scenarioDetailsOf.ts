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
        context.report.name = ensure('scenario name', details.name.value, isNotBlank());
        context.report.title = details.name.value;
        context.report.manual = false;
        context.report.testSteps = [];
        context.report.userStory = {
            id: dashify(details.category.value),
            storyName: details.category.value,
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
