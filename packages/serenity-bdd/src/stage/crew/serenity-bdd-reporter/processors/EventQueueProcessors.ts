import { SceneStarts } from '@serenity-js/core/lib/events';
import { Artifact, CorrelationId, Name, TestReport } from '@serenity-js/core/lib/model';

import { SerenityBDDReport } from '../SerenityBDDJsonSchema';
import { EventQueues } from './EventQueues';
import { SingleSceneEventQueueProcessor } from './single-scene';
import { SceneSequenceEventQueueProcessor } from './scene-sequence';

/**
 * @package
 */
export class EventQueueProcessors {

    private readonly singleSceneProcessor = new SingleSceneEventQueueProcessor();
    private readonly sceneSequenceProcessor = new SceneSequenceEventQueueProcessor();

    // todo: move `name` to Artifact and return Artifact[]... and sceneId?
    process(queues: EventQueues): Array<{artifact: Artifact, name: Name, sceneId: CorrelationId }> {
        const results: Array<{artifact: Artifact, name: Name, sceneId: CorrelationId }> = [];

        queues.forEach(queue => {
            const report: SerenityBDDReport = queue.first() instanceof SceneStarts
                ? this.singleSceneProcessor.process(queue)
                : this.sceneSequenceProcessor.process(queue)

            results.push({
                name: new Name(report.name),
                artifact: TestReport.fromJSON(report),
                sceneId: queue.sceneId,
            });
        });

        return results;
    }
}
