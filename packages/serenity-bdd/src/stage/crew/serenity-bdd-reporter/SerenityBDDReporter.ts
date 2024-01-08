import type { Stage, StageCrewMember , StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import { ConfigurationError, DomainEventQueues } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ArtifactGenerated, AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, TestRunFinishes } from '@serenity-js/core/lib/events';
import type { FileSystem} from '@serenity-js/core/lib/io';
import { Path } from '@serenity-js/core/lib/io';
import { CorrelationId, Description, Name } from '@serenity-js/core/lib/model';
import { isDefined } from 'tiny-types';
import { ensure } from 'tiny-types';

import { EventQueueProcessors } from './processors';
import type { SerenityBDDReporterConfig } from './SerenityBDDReporterConfig';

/**
 * A {@apilink StageCrewMember} that produces [Serenity BDD](http://serenity-bdd.info/)-standard JSON reports
 * to be parsed by [Serenity BDD CLI Reporter](https://github.com/serenity-bdd/serenity-cli)
 * to produce HTML reports and living documentation.
 *
 * ## Registering Serenity BDD Reporter programmatically
 *
 * ```ts
 * import { ArtifactArchiver, configure } from '@serenity-js/core';
 * import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 *
 * configure({
 *   crew: [
 *     ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *     new SerenityBDDReporter()
 *   ],
 * })
 * ```
 *
 * ## Using Serenity BDD Reporter with Playwright Test
 *
 * ```ts
 * // playwright.config.ts
 * import { devices } from '@playwright/test';
 * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test';
 *
 * const config: PlaywrightTestConfig = {
 *
 *   reporter: [
 *     [ 'line' ],
 *     [ 'html', { open: 'never' } ],
 *     [ '@serenity-js/playwright-test', {
 *       crew: [
 *         '@serenity-js/serenity-bdd',
 *         [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *       ]
 *     }]
 *   ],
 * }
 * ```
 *
 * ## Using Serenity BDD Reporter with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import { ArtifactArchiver } from '@serenity-js/core';
 * import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     crew: [
 *       '@serenity-js/serenity-bdd',
 *        [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *     ],
 *     // other Serenity/JS config
 *   },
 *   // other Protractor config
 * }
 * ```
 *
 * ## Using Serenity BDD Reporter with Protractor
 *
 * ```js
 * // protractor.conf.js
 * const
 *   { ArtifactArchiver }    = require('@serenity-js/core'),
 *   { SerenityBDDReporter } = require('@serenity-js/serenity-bdd')
 *
 * exports.config = {
 *   framework:     'custom',
 *   frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *     crew: [
 *         '@serenity-js/serenity-bdd',
 *          [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *     ],
 *     // other Serenity/JS config
 *   },
 *
 *   // other Protractor config
 * }
 * ```
 *
 * @group Stage
 */
export class SerenityBDDReporter implements StageCrewMember {
    private readonly eventQueues = new DomainEventQueues();
    private readonly processors: EventQueueProcessors;

    static fromJSON(config: SerenityBDDReporterConfig): StageCrewMemberBuilder<SerenityBDDReporter> {
        return new SerenityBDDReporterBuilder(config);
    }

    /**
     * @param {Path} specDirectory
     * @param {Stage} [stage]
     *  The stage this {@apilink StageCrewMember} should be assigned to
     */
    constructor(
        private readonly specDirectory: Path,
        private stage?: Stage,
    ) {
        this.processors = new EventQueueProcessors(this.specDirectory)
    }

    /**
     * @inheritDoc
     */
    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    /**
     * @inheritDoc
     */
    notifyOf(event: DomainEvent): void {

        if (this.isSceneSpecific(event)) {
            this.eventQueues.enqueue(event);
        }

        else if (event instanceof TestRunFinishes) {
            const id = CorrelationId.create();

            this.stage.announce(new AsyncOperationAttempted(
                new Name(this.constructor.name),
                new Description(`Generating Serenity BDD JSON reports...`),
                id,
                this.stage.currentTime(),
            ));

            try {
                this.processors
                    .process(this.eventQueues)
                    .forEach(result => {
                        this.stage.announce(new ArtifactGenerated(
                            result.sceneId,
                            result.name,
                            result.artifact,
                            this.stage.currentTime(),
                        ));
                    });

                this.stage.announce(new AsyncOperationCompleted(
                    id,
                    this.stage.currentTime(),
                ));
            }
            catch (error) {
                this.stage.announce(new AsyncOperationFailed(
                    error,
                    id,
                    this.stage.currentTime(),
                ));
            }
        }
    }

    private isSceneSpecific(event: DomainEvent): event is DomainEvent & { sceneId: CorrelationId } {
        return Object.prototype.hasOwnProperty.call(event, 'sceneId');
    }
}

class SerenityBDDReporterBuilder implements StageCrewMemberBuilder<SerenityBDDReporter> {

    private readonly specDirectoryCandidates = [
        `features`,
        `spec`,
        `tests`,
        `test`,
        `src`,
    ];

    constructor(private readonly config: SerenityBDDReporterConfig) {
    }

    build({ stage, fileSystem }: StageCrewMemberBuilderDependencies): SerenityBDDReporter {
        ensure('stage', stage, isDefined());
        ensure('fileSystem', fileSystem, isDefined());

        return new SerenityBDDReporter(this.specDirectoryFrom(fileSystem), stage);
    }

    private specDirectoryFrom(fileSystem: FileSystem): Path {
        return this.config.specDirectory
            ? this.userDefinedSpecDir(fileSystem, this.config.specDirectory)
            : this.guessedSpecDir(fileSystem);
    }

    private userDefinedSpecDir(fileSystem: FileSystem, configuredSpecDirectory: string): Path {
        const specDirectory = Path.from(configuredSpecDirectory);

        if (! fileSystem.exists(specDirectory)) {
            throw new ConfigurationError(`Configured specDirectory \`${ this.config.specDirectory }\` does not exist`);
        }

        return fileSystem.resolve(specDirectory);
    }

    private guessedSpecDir(fileSystem: FileSystem): Path {
        for (const candidate of this.specDirectoryCandidates) {
            const candidateSpecDirectory = Path.from(candidate);
            if (fileSystem.exists(Path.from(candidate))) {
                return fileSystem.resolve(candidateSpecDirectory);
            }
        }

        // default to current working directory
        return fileSystem.resolve(Path.from('.'));
    }
}