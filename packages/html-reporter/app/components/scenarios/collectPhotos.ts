import type { ReportActivity } from '../../../src/cli/ReportData';

export interface PhotoEntry {
    path: string;
    name: string;
    wallClock: string | undefined;
    offsetMs: number;
}

/**
 * Recursively collects all PNG screenshot artifacts from a tree of activities,
 * preserving traversal order (parent artifacts before children's).
 */
export function collectPhotos(activities: ReportActivity[], scenarioStartedAt: string): PhotoEntry[] {
    const scenarioStart = new Date(scenarioStartedAt).getTime();

    function flatten(acts: ReportActivity[]): PhotoEntry[] {
        return acts.flatMap(activity => {
            const ownPhotos = (activity.artifacts ?? [])
                .filter(art => art.path && art.path.endsWith('.png'))
                .map(art => {
                    const actStart = activity.startedAt ? new Date(activity.startedAt).getTime() : scenarioStart;
                    return {
                        path: art.path,
                        name: activity.name,
                        wallClock: activity.startedAt,
                        offsetMs: actStart - scenarioStart,
                    };
                });

            const childPhotos = flatten(activity.children ?? []);

            return [...ownPhotos, ...childPhotos];
        });
    }

    return flatten(activities);
}
