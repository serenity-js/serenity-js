
import type { EventRecorder} from '@integration/testing-tools';
import { expect, PickEvent } from '@integration/testing-tools';
import type { Stage } from '@serenity-js/core';
import {
    ArtifactGenerated,
    FeatureNarrativeDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneStarts,
    TestRunFinishes
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    Category,
    CorrelationId,
    Description,
    ExecutionSuccessful,
    Name,
    ScenarioDetails
} from '@serenity-js/core/lib/model';
import { beforeEach, describe, it } from 'mocha';

import { defaultCardScenario } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    const sceneId = new CorrelationId('a-scene-id');

    let stage: Stage,
        recorder: EventRecorder;

    beforeEach(() => {
        const env = create();

        stage       = env.stage;
        recorder    = env.recorder;
    });

    it('captures information about scenario background', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new SceneBackgroundDetected(sceneId, new Name('Background title'), new Description('Background description')),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.backgroundTitle).to.equal('Background title');
                expect(report.backgroundDescription).to.equal('Background description');
            });
    });

    it('escapes HTML entities in background title and description', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new SceneBackgroundDetected(sceneId, new Name(`Background title <script>alert('xss')</script>`), new Description(`Background description <script>alert('xss')</script>`)),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.backgroundTitle).to.equal('Background title &lt;script&gt;alert(&apos;xss&apos;)&lt;/script&gt;');
                expect(report.backgroundDescription).to.equal('Background description &lt;script&gt;alert(&apos;xss&apos;)&lt;/script&gt;');
            });
    });

    it('captures the description of the scenario', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new SceneDescriptionDetected(sceneId, new Description('Scenario description')),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.description).to.equal('Scenario description');
            });
    });

    it('captures the narrative behind the scenario', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new FeatureNarrativeDetected(sceneId, new Description('Feature narrative')),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.userStory.narrative).to.equal('Feature narrative');
            });
    });

    it('escapes HTML entities in narrative description', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new FeatureNarrativeDetected(sceneId, new Description(`Feature narrative <script>alert('xss')</script>`)),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.userStory.narrative).to.equal('Feature narrative &lt;script&gt;alert(&apos;xss&apos;)&lt;/script&gt;');
            });
    });

    // https://github.com/serenity-js/serenity-js/pull/1630
    it('escapes HTML entities in scenario name', () => {
        const scenario = new ScenarioDetails(
            new Name(`<abbr title="Questions and Answers">'Q&A'</abbr>`),
            new Category('Support'),
            new FileSystemLocation(
                new Path(`payments/qna.feature`),
            ),
        );

        const escaped = `&lt;abbr title=&quot;Questions and Answers&quot;&gt;&apos;Q&amp;A&apos;&lt;/abbr&gt;`;

        stage.announce(
            new SceneStarts(sceneId, scenario),
            new SceneFinished(sceneId, scenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.name).to.equal(escaped);
                expect(report.title).to.equal(escaped);
            });
    });
});
