import type { Timestamp } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';
import type { ArtifactType, CorrelationId} from '@serenity-js/core/lib/model';
import { Photo } from '@serenity-js/core/lib/model';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function archivedActivityRelatedArtifact<Context extends SerenityBDDReportContext>(activityId: CorrelationId, type: ArtifactType, path: Path, timestamp: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {

        if (type === Photo && context.steps.has(activityId.value)) {
            context.steps.get(activityId.value).step.screenshots.push({
                screenshot: path.basename(),
                screenshotName: path.basename(),
                timeStamp: timestamp.toMilliseconds(),
            });
        }

        return context;
    }
}
