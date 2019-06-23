import WriteStream = NodeJS.WriteStream;
import { DomainEvent } from '../../../events';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';

/**
 * @desc
 *  Serialises all the {@link DomainEvent} objects it receives and streams
 *  them as [ndjson](http://ndjson.org/)
 *  to the output stream.
 *
 * @example <caption>Writing DomainEvents to standard output</caption>
 * import { serenity, StreamReporter } form '@serenity-js/core';
 *
 * serenity.setTheStage(
 *     new StreamReporter(process.stdout),
 * );
 *
 * @example <caption>Writing DomainEvents to a file</caption>
 * import { serenity, StreamReporter } form '@serenity-js/core';
 * import fs = require('fs');
 *
 * serenity.setTheStage(
 *     new StreamReporter(fs.createWriteStream('./events.ndjson')),
 * );
 *
 * @extends {StageCrewMember}
 */
export class StreamReporter implements StageCrewMember {

    /**
     * @param {WriteStream} output - A WriteStream that should receive the output
     * @param {Stage} [stage=null] - The stage this {@link StageCrewMember} should be assigned to
     */
    constructor(
        private readonly output: WriteStream = process.stdout,
        private readonly stage: Stage = null,
    ) {
    }

    /**
     * @desc
     *  Creates a new instance of this {@link StageCrewMember} and assigns it to a given {@link Stage}.
     *
     * @see {@link StageCrewMember}
     *
     * @param {Stage} stage - An instance of a {@link Stage} this {@link StageCrewMember} will be assigned to
     * @returns {StageCrewMember} - A new instance of this {@link StageCrewMember}
     */
    assignedTo(stage: Stage): StageCrewMember {
        return new StreamReporter(this.output, stage);
    }

    /**
     * @desc
     *  Handles {@link DomainEvent} objects emitted by the {@link StageManager}.
     *
     * @see {@link StageCrewMember}
     *
     * @param {DomainEvent} event
     * @returns {void}
     */
    notifyOf(event: DomainEvent): void {
        this.output.write(
            JSON.stringify({ type: event.constructor.name, event: event.toJSON() }) + '\n',
        );
    }
}
