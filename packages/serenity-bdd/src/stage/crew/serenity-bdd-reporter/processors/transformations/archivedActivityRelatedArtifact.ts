import { Timestamp } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { ArtifactType, CorrelationId, Photo } from '@serenity-js/core/lib/model';

import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function archivedActivityRelatedArtifact<Context extends SerenityBDDReportContext>(activityId: CorrelationId, type: ArtifactType, path: Path, timestamp: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {

        if (type === Photo && context.steps.has(activityId.value)) {
            context.steps.get(activityId.value).step.screenshots.push({
                screenshot: path.basename(),
                timeStamp: timestamp.toMilliseconds(),
            });
        }

        return context;
    }
}
