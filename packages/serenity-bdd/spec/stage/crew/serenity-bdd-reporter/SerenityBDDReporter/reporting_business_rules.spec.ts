
import type { EventRecorder } from '@integration/testing-tools';
import { expect, PickEvent } from '@integration/testing-tools';
import type { Stage } from '@serenity-js/core';
import {
    ArtifactGenerated,
    BusinessRuleDetected,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTemplateDetected,
    TestRunFinishes,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    BusinessRule,
    Category,
    CorrelationId,
    Description,
    ExecutionSuccessful,
    Name,
    ScenarioDetails,
    ScenarioParameters
} from '@serenity-js/core/lib/model';
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

    it('captures information about the business rule for single-scene scenarios', () => {
        stage.announce(
            new SceneStarts(sceneIds[0], scenarios[0]),
            new BusinessRuleDetected(sceneIds[0], scenarios[0], new BusinessRule(new Name('my rule name'), new Description('my rule description'))),
            new SceneFinished(sceneIds[0], scenarios[0], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.rule.name).to.equal('my rule name');
                expect(report.rule.description).to.equal('my rule description');
            });
    });

    it('escapes HTML entities in business rule name and description', () => {
        stage.announce(
            new SceneStarts(sceneIds[0], scenarios[0]),
            new BusinessRuleDetected(sceneIds[0], scenarios[0], new BusinessRule(new Name(`my <script>alert('xss')</script> rule name`), new Description(`my <script>alert('xss')</script> rule description`))),
            new SceneFinished(sceneIds[0], scenarios[0], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.rule.name).to.equal('my &lt;script&gt;alert(&apos;xss&apos;)&lt;/script&gt; rule name');
                expect(report.rule.description).to.equal('my &lt;script&gt;alert(&apos;xss&apos;)&lt;/script&gt; rule description');
            });
    });

    it('captures information about the business rule for scene sequences', () => {
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
            new BusinessRuleDetected(sceneIds[0], scenarios[0], new BusinessRule(new Name('my rule name'), new Description('my rule description'))),
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
            new BusinessRuleDetected(sceneIds[1], scenarios[1], new BusinessRule(new Name('my rule name'), new Description('my rule description'))),
            new SceneFinished(sceneIds[1], scenarios[1], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.rule.name).to.equal('my rule name');
                expect(report.rule.description).to.equal('my rule description');
            });
    });
});
