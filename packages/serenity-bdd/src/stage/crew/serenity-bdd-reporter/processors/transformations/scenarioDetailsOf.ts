import type { ScenarioDetails } from '@serenity-js/core/lib/model';
import { ensure, isNotBlank } from 'tiny-types';

import { dashify, escapeHtml } from '../mappers';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function scenarioDetailsOf<Context extends SerenityBDDReportContext>(details: ScenarioDetails): (context: Context) => Context  {
    return (context: Context): Context => {
        const name      = ensure('scenario name', details.name.value, isNotBlank());
        const category  = ensure('scenario category', details.category.value, isNotBlank());
        const storyName = escapeHtml(category);

        const requirementsHierarchy = context.requirementsHierarchy.hierarchyFor(details.location.path);

        const pathElements = requirementsHierarchy.map(name => ({
            name,
            description: humanReadable(name),
        }));

        context.report.name = escapeHtml(name);
        context.report.title = escapeHtml(name);
        context.report.manual = false;
        context.report.testSteps = [];
        context.report.userStory = {
            id: dashify(category),
            storyName: storyName,
            displayName: storyName,

            path: requirementsHierarchy.join('/'),
            type: 'feature',
            narrative: '',
            pathElements,
        };

        return context;
    }
}

function humanReadable(name: string): string {
    const result = name
        .split('_')
        .join(' ');

    return result.charAt(0).toUpperCase() + result.slice(1);
}
