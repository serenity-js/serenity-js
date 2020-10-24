import { Path } from '@serenity-js/core/lib/io';
import { ArtifactType, CorrelationId, Photo, Timestamp } from '@serenity-js/core/lib/model';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function archivedActivityRelatedArtifact<Context extends SerenityBDDReportContext>(activityId: CorrelationId, type: ArtifactType, path: Path, timestamp: Timestamp) {
    return (context: Context): Context => {

        if (type === Photo && context.steps.has(activityId.value)) {
            context.steps.get(activityId.value).step.screenshots.push({
                screenshot: path.basename(),
                timeStamp: timestamp.toMillisecondTimestamp(),
            });
        }

        return context;
    }
}
