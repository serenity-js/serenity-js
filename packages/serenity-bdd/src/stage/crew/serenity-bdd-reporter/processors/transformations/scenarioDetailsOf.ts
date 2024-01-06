import { Path } from '@serenity-js/core/lib/io';
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

        const requirementsHierarchy = requirementsHierarchyFromPath(details.location.path);
        const pathElements = requirementsHierarchy.map(name => ({ name, description: '' }));

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

function requirementsHierarchyFromPath(path: Path): string[] {
    const relative = Path.from(process.cwd()).relative(path);
    return relative.split().map((segment, i, segments) => {
        if (i < segments.length - 1) {
            return segment;
        }

        // If there is a dot in the file name, extract the substring before it; otherwise, use the entire string
        const firstDotIndex = segment.indexOf('.');
        return firstDotIndex === -1
            ? segment
            : segment.slice(0, firstDotIndex);
    });
}
