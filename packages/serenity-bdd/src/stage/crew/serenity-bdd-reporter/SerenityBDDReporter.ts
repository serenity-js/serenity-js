import type { Stage, StageCrewMember, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import { DomainEventQueues } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ArtifactGenerated, AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, TestRunFinishes } from '@serenity-js/core/lib/events';
import { Path, RequirementsHierarchy } from '@serenity-js/core/lib/io';
import { CorrelationId, Description, Name } from '@serenity-js/core/lib/model';
import { ensure, isDefined } from 'tiny-types';

import { EventQueueProcessors } from './processors';
import type { SerenityBDDReporterConfig } from './SerenityBDDReporterConfig';

/**
 * A [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) that produces [Serenity BDD](http://serenity-bdd.info/)-standard JSON reports
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
 *     ArtifactArchiver.fromJSON({
 *       outputDirectory: './target/site/serenity'
 *     }),
 *     SerenityBDDReporter.fromJSON({
 *       specDirectory: './features'            // optional configuration
 *     })
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
 * ## Configuring Serenity BDD Reporter
 *
 * To override Serenity BDD Reporter default configuration, provide a [`SerenityBDDReporterConfig`](https://serenity-js.org/api/serenity-bdd/interface/SerenityBDDReporterConfig/)
 * as the second element of the [`SerenityBDDReporterConfig`](https://serenity-js.org/api/serenity-bdd/interface/SerenityBDDReporterConfig/) array
 * using your test runner-specific configuration mechanism.
 *
 * For example, to change the default location
 * of the [requirements hierarchy root directory](https://serenity-bdd.github.io/docs/reporting/living_documentation#the-requirements-hierarchy),
 * specify the `specDirectory` property:
 *
 * ```js
 *     crew: [
 *       [ '@serenity-js/serenity-bdd', { specDirectory: './features' } ],
 *       // ...
 *     ],
 * ```
 *
 * ### Learn more:
 * - [Serenity BDD Reporter integration documentation](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter/)
 * - [Serenity/JS examples on GitHub](https://github.com/serenity-js/serenity-js/tree/main/examples)
 *
 * @group Stage
 */
export class SerenityBDDReporter implements StageCrewMember {
    private readonly eventQueues = new DomainEventQueues();

    static fromJSON(config: SerenityBDDReporterConfig): StageCrewMemberBuilder<SerenityBDDReporter> {
        return new SerenityBDDReporterBuilder(config);
    }

    /**
     * @param {EventQueueProcessors} processors
     * @param {Stage} [stage]
     *  The stage this [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) should be assigned to
     */
    constructor(
        private readonly processors: EventQueueProcessors,
        private stage?: Stage,
    ) {
        ensure('processors', processors, isDefined());
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

    constructor(private readonly config: SerenityBDDReporterConfig) {
    }

    build({ stage, fileSystem }: StageCrewMemberBuilderDependencies): SerenityBDDReporter {
        ensure('stage', stage, isDefined());
        ensure('fileSystem', fileSystem, isDefined());

        const userDefinedSpecDirectory: Path | undefined = this.config.specDirectory && Path.from(this.config.specDirectory);
        const reporterConfig: Required<SerenityBDDReporterConfig['reporter']> = {
            includeAbilityDetails: this.config?.reporter?.includeAbilityDetails ?? true,
            ... this.config?.reporter,
        };

        const requirementsHierarchy = new RequirementsHierarchy(fileSystem, userDefinedSpecDirectory);
        const processors = new EventQueueProcessors(requirementsHierarchy, reporterConfig);

        return new SerenityBDDReporter(processors, stage);
    }
}
