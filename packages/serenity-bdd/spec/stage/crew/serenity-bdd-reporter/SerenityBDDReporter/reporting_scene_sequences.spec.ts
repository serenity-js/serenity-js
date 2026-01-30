/* eslint-disable @stylistic/indent */
import type { EventRecorder} from '@integration/testing-tools';
import { expect, PickEvent } from '@integration/testing-tools';
import type { Stage } from '@serenity-js/core';
import { ArtifactGenerated, SceneFinished, SceneParametersDetected, SceneSequenceDetected, SceneStarts, SceneTagged, SceneTemplateDetected, TestRunFinishes } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { BrowserTag, Category, CorrelationId, Description, ExecutionFailedWithError, ExecutionSuccessful, Name, PlatformTag, ScenarioDetails, ScenarioParameters } from '@serenity-js/core/lib/model';
import { beforeEach, describe, it } from 'mocha';

import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stage: Stage,
        recorder: EventRecorder;

    beforeEach(() => {
        const env = create();

        stage       = env.stage;
        recorder    = env.recorder;
    });

    // see examples/cucumber/features/reporting_results/reports_scenario_outlines.feature for more context
    const
        sceneIds = [ new CorrelationId('scene-0'), new CorrelationId('scene-1') ],
        category = new Category('Reporting results'),
        name     = new Name('Reports scenario outlines'),
        path     = new Path(`reporting_results/reports_scenario_outlines.feature`),
        template = new Description(`
            When <Developer> makes a contribution of:
              | value      |
              | time       |
              | talent     |
              | great code |
            Then they help bring serenity to fellow devs
        `),
        sequence = new ScenarioDetails(name, category, new FileSystemLocation(
            path,
            7,
        )),
        scenarios = [
            new ScenarioDetails(name, category, new FileSystemLocation(path, 25)),
            new ScenarioDetails(name, category, new FileSystemLocation(path, 26)),
        ]
    ;

    it('captures information about a sequence of scenes (2 scenes in a sequence)', () => {
        stage.announce(
            new SceneSequenceDetected(sceneIds[0], sequence),
                new SceneTemplateDetected(sceneIds[0], template),
                new SceneParametersDetected(
                    sceneIds[0],
                    scenarios[0],
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'jan-molak', Twitter_Handle: '@JanMolak' },
                    ),
                ),
                new SceneStarts(sceneIds[0], scenarios[0]),
                new SceneFinished(sceneIds[0], scenarios[0], new ExecutionSuccessful()),
            new SceneSequenceDetected(sceneIds[1], sequence),
                new SceneTemplateDetected(sceneIds[1], template),
                new SceneParametersDetected(
                    sceneIds[1],
                    scenarios[1],
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'wakaleo', Twitter_Handle: '@wakaleo' },
                    ),
                ),
                new SceneStarts(sceneIds[1], scenarios[1]),
                new SceneFinished(sceneIds[1], scenarios[1], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.name).to.equal(name.value);
                expect(report.dataTable).to.exist;
                expect(report.dataTable.scenarioOutline).to.equal(template.value);
                expect(report.dataTable.headers).to.deep.equal([
                    'Developer',
                    'Twitter_Handle',
                ]);

                expect(report.dataTable.dataSetDescriptors).to.deep.equal([{
                    startRow: 0,
                    rowCount: 2,
                    name: 'Serenity/JS contributors',
                    description: 'Some of the people who have contributed their time and talent to the Serenity/JS project',
                }]);

                expect(report.dataTable.rows).to.deep.equal([
                    { values: [ 'jan-molak', '@JanMolak' ], result: 'SUCCESS' },
                    { values: [ 'wakaleo', '@wakaleo' ], result: 'SUCCESS' },
                ]);

                expect(report.testSteps).to.have.lengthOf(2);
                expect(report.testSteps[0].description)
                    .to.equal(`${name.value} #1 - Developer: jan-molak, Twitter_Handle: @JanMolak`);

                expect(report.testSteps[1].description)
                    .to.equal(`${name.value} #2 - Developer: wakaleo, Twitter_Handle: @wakaleo`);
            });
    });

    it('determines the result of the sequence based on the worst result of the contributing scenarios', () => {
        stage.announce(
            new SceneSequenceDetected(sceneIds[0], sequence),
                new SceneTemplateDetected(sceneIds[0], template),
                new SceneParametersDetected(
                    sceneIds[0],
                    scenarios[0],
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'jan-molak', Twitter_Handle: '@JanMolak' },
                    ),
                ),
                new SceneStarts(sceneIds[0], scenarios[0]),
                new SceneFinished(sceneIds[0], scenarios[0], new ExecutionFailedWithError(new Error('Something happened'))),

            new SceneSequenceDetected(sceneIds[1], sequence),
                new SceneTemplateDetected(sceneIds[1], template),
                new SceneParametersDetected(
                    sceneIds[1],
                    scenarios[1],
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'wakaleo', Twitter_Handle: '@wakaleo' },
                    ),
                ),
                new SceneStarts(sceneIds[1], scenarios[1]),
                new SceneFinished(sceneIds[1], scenarios[1], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.dataTable.rows).to.deep.equal([
                    { values: [ 'jan-molak', '@JanMolak' ], result: 'ERROR' },
                    { values: [ 'wakaleo', '@wakaleo' ], result: 'SUCCESS' },
                ]);

                expect(report.testSteps).to.have.lengthOf(2);
                expect(report.testSteps[0].description)
                    .to.equal(`${name.value} #1 - Developer: jan-molak, Twitter_Handle: @JanMolak`);
                // todo: check for error somewhere here
                // todo: map well map the main report

                expect(report.testSteps[1].description)
                    .to.equal(`${name.value} #2 - Developer: wakaleo, Twitter_Handle: @wakaleo`);
            });
    });

    it('ensures that context and tags are not duplicated despite having multiple scenarios in a sequence', () => {
        stage.announce(
            new SceneSequenceDetected(sceneIds[0], sequence),
            new SceneTemplateDetected(sceneIds[0], template),
            new SceneParametersDetected(
                sceneIds[0],
                scenarios[0],
                new ScenarioParameters(
                    new Name('Serenity/JS contributors'),
                    new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                    { Developer: 'jan-molak', Twitter_Handle: '@JanMolak' },
                ),
            ),
            new SceneStarts(sceneIds[0], scenarios[0]),
                new SceneTagged(
                    sceneIds[0],
                    new BrowserTag('chrome', '83.0.4103.106'),
                ),
                new SceneTagged(
                    sceneIds[0],
                    new PlatformTag('Mac OS X'),
                ),
            new SceneFinished(sceneIds[0], scenarios[0], new ExecutionFailedWithError(new Error('Something happened'))),

            new SceneSequenceDetected(sceneIds[1], sequence),
            new SceneTemplateDetected(sceneIds[1], template),
            new SceneParametersDetected(
                sceneIds[1],
                scenarios[1],
                new ScenarioParameters(
                    new Name('Serenity/JS contributors'),
                    new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                    { Developer: 'wakaleo', Twitter_Handle: '@wakaleo' },
                ),
            ),
            new SceneStarts(sceneIds[1], scenarios[1]),
                new SceneTagged(
                    sceneIds[1],
                    new BrowserTag('chrome', '83.0.4103.106'),
                ),
                new SceneTagged(
                    sceneIds[1],
                    new PlatformTag('Mac OS X'),
                ),
            new SceneFinished(sceneIds[1], scenarios[1], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.id).to.equal('reporting-results;reports-scenario-outlines;chrome-83-0-4103-106;mac-os-x');

                expect(report.context).to.equal('chrome,mac');

                expect(report.tags).to.deep.equal([{
                    browserName: 'chrome',
                    browserVersion: '83.0.4103.106',
                    displayName: 'chrome 83.0.4103.106',
                    name: 'chrome 83.0.4103.106',
                    type: 'browser',
                }, {
                    displayName: 'Mac OS X',
                    name: 'Mac OS X',
                    platformName: 'Mac OS X',
                    platformVersion: '',
                    type: 'platform',
                }]);
            });
    });
});
