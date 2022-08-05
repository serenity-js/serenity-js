import { Writable } from 'stream';

import { DomainEvent } from '../../../events';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';

/**
 * Serialises all the {@link DomainEvent} objects it receives and streams
 * them as [ndjson](http://ndjson.org/) to the output stream.
 *
 * Useful when debugging issues related to custom Serenity/JS test runner adapters.
 *
 * ## Registering `StreamReporter` programmatically
 *
 * ```ts
 * import { configure, StreamReporter } from '@serenity-js/core'
 *
 * configure({
 *   crew: [
 *     new StreamReporter(process.stdout)
 *   ],
 * })
 * ```
 *
 * ## Writing `DomainEvents` to a file
 *
 * ```ts
 * import { configure, StreamReporter } from '@serenity-js/core'
 * import fs = require('fs')
 *
 * configure({
 *   crew: [
 *     new StreamReporter(fs.createWriteStream('./events.ndjson'))
 *   ],
 * })
 * ```
 *
 * ## Registering `StreamReporter` using Protractor configuration
 *
 * ```js
 * // protractor.conf.js
 * const { StreamReporter } = require('@serenity-js/core');
 *
 * exports.config = {
 *   framework:     'custom',
 *   frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *     crew: [
 *       new StreamReporter(process.stdout),
 *     ],
 *     // other Serenity/JS config
 *   },
 *   // other Protractor config
 * };
 * ```
 *
 * ## Registering `StreamReporter` using WebdriverIO configuration
 *
 * ```ts
 * // wdio.conf.js
 * import { StreamReporter } from '@serenity-js/core'
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig = {
 *
 *     framework: '@serenity-js/webdriverio',
 *
 *     serenity: {
 *         crew: [
 *           new StreamReporter(process.stdout),
 *         ]
 *         // other Serenity/JS config
 *     },
 *   },
 *   // other WebdriverIO config
 * }
 * ```
 *
 * @group Stage
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
     * Creates a new instance of this {@link StageCrewMember} and assigns it to a given {@link Stage}.
     *
     * @param stage
     *  An instance of a {@link Stage} this {@link StageCrewMember} will be assigned to
     *
     * @returns {StageCrewMember}
     *  A new instance of this {@link StageCrewMember}
     */
    assignedTo(stage: Stage): StageCrewMember {
        return new StreamReporter(this.output, stage);
    }

    /**
     * Handles {@link DomainEvent} objects emitted by the {@link StageManager}.
     *
     * @listens {DomainEvent}
     *
     * @param event
     */
    notifyOf(event: DomainEvent): void {
        this.output.write(
            JSON.stringify({ type: event.constructor.name, event: event.toJSON() }) + '\n',
        );
    }
}
