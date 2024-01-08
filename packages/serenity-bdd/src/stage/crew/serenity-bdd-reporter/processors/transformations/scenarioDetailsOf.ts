import type { Path } from '@serenity-js/core/lib/io';
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

        const requirementsHierarchy = requirementsHierarchyFromPath(context.specDirectory, details.location.path);
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

function requirementsHierarchyFromPath(specDirectory: Path, path: Path): string[] {
    const relative = specDirectory.relative(path);
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

function humanReadable(name: string): string {
    const result = name
        .split('_')
        .join(' ');

    return result.charAt(0).toUpperCase() + result.slice(1);
}
