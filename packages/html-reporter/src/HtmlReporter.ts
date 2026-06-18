import type { Stage, StageCrewMember, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    TestRunStarts,
    TestRunFinishes,
} from '@serenity-js/core/events';
import { FileSystem, Path } from '@serenity-js/core/io';
import { CorrelationId, Description, Name } from '@serenity-js/core/model';
import { Timestamp } from '@serenity-js/core';
import { ensure, isDefined } from 'tiny-types';

import type { HtmlReporterConfig } from './HtmlReporterConfig.js';

/**
 * A {@link StageCrewMember} that produces a self-contained static HTML report.
 *
 * ## Registering the HTML Reporter
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 * import { HtmlReporter } from '@serenity-js/html-reporter';
 *
 * configure({
 *   crew: [
 *     HtmlReporter.fromJSON({
 *       outputDirectory: './reports/serenity-js',
 *     }),
 *   ],
 * });
 * ```
 *
 * @group Stage
 */
export class HtmlReporter implements StageCrewMember {

    static fromJSON(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<HtmlReporter> {
        return new HtmlReporterBuilder(config);
    }

    constructor(
        private readonly outputFileSystem: FileSystem,
        private stage?: Stage,
    ) {
        ensure('outputFileSystem', outputFileSystem, isDefined());
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {
        // TODO: implement event handling
    }
}

class HtmlReporterBuilder implements StageCrewMemberBuilder<HtmlReporter> {

    constructor(private readonly config: HtmlReporterConfig) {
    }

    build({ stage }: StageCrewMemberBuilderDependencies): HtmlReporter {
        ensure('stage', stage, isDefined());

        const outputDir = Path.from(this.config.outputDirectory || './reports/serenity-js');
        const outputFileSystem = new FileSystem(outputDir);

        return new HtmlReporter(outputFileSystem, stage);
    }
}
