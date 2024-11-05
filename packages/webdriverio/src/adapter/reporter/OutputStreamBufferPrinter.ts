import type { Stage, StageCrewMember } from '@serenity-js/core';
import type { OutputStream } from '@serenity-js/core/lib/adapter/index.js';
import type { DomainEvent} from '@serenity-js/core/lib/events/index.js';
import { SceneFinished } from '@serenity-js/core/lib/events/index.js';

import type { OutputStreamBuffer } from './OutputStreamBuffer.js';

/**
 * @package
 */
export class OutputStreamBufferPrinter implements StageCrewMember {
    constructor(
        private readonly buffer: OutputStreamBuffer,
        private readonly outputStream: OutputStream,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneFinished && this.buffer.hasContent()) {
            this.outputStream.write(this.buffer.flush());
        }
    }
}
