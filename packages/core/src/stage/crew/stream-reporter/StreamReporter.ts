import { Writable } from 'stream';

import { DomainEvent } from '../../../events';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';

/**
 * @desc
 *  Serialises all the {@link DomainEvent} objects it receives and streams
 *  them as [ndjson](http://ndjson.org/) to the output stream.
 *
 * @example <caption>Writing DomainEvents to standard output</caption>
 *  import { configure, StreamReporter } from '@serenity-js/core';
 *
 *  configure({
 *      crew: [
 *          new StreamReporter(process.stdout)
 *      ],
 *  });
 *
 * @example <caption>Writing DomainEvents to a file</caption>
 *  import { configure, StreamReporter } from '@serenity-js/core';
 *  import fs = require('fs');
 *
 *  configure({
 *      crew: [
 *          new StreamReporter(fs.createWriteStream('./events.ndjson'))
 *      ],
 *  });
 *
 * @example <caption>Registering StreamReporter using Protractor configuration</caption>
 *  // protractor.conf.js
 *  const { StreamReporter } = require('@serenity-js/core');
 *
 *  exports.config = {
 *    framework:     'custom',
 *    frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *    serenity: {
 *      crew: [
 *        new StreamReporter(process.stdout),
 *      ],
 *      // other Serenity/JS config
 *    },
 *
 *    // other Protractor config
 *  };
 *
 * @implements {StageCrewMember}
 */
export class StreamReporter implements StageCrewMember {

    /**
     * @param {stream~Writable} output
     *  A Writable stream that should receive the output
     *
     * @param {Stage} [stage]
     *  The stage this {@link StageCrewMember} should be assigned to
     */
    constructor(
        private readonly output: Writable = process.stdout,
        private readonly stage?: Stage,
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
     * @listens {DomainEvent}
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
