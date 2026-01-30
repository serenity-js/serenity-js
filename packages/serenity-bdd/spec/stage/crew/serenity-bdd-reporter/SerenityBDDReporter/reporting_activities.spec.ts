/* eslint-disable @stylistic/indent */
import type { EventRecorder} from '@integration/testing-tools';
import { expect, PickEvent } from '@integration/testing-tools';
import type { Stage} from '@serenity-js/core';
import { Timestamp } from '@serenity-js/core';
import {
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    ArtifactGenerated,
    SceneFinished,
    SceneStarts,
    TaskFinished,
    TaskStarts,
    TestRunFinishes,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { ActivityDetails, CorrelationId, ExecutionSuccessful, JSONData, Name, Photo, TextData } from '@serenity-js/core/lib/model';
import { beforeEach, describe, it } from 'mocha';

import { defaultCardScenario, photo } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    const
        sceneId = new CorrelationId('a-scene-id'),
        activityIds = [ new CorrelationId('activity-0'), new CorrelationId('activity-1') ],
        fakeLocation = new FileSystemLocation(Path.from('fake.ts'), 0, 0);

    let stage: Stage,
        recorder: EventRecorder;

    beforeEach(() => {
        const env = create();

        stage       = env.stage;
        recorder    = env.recorder;
    });

    describe('when reporting activities that took place during scenario execution', () => {

        it('reports the outcome of a single activity', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'), fakeLocation);

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(1);
                    expect(report.testSteps[0].description).to.equal(pickACard.name.value);
                    expect(report.testSteps[0].result).to.equal('SUCCESS');
                });
        });

        it('reports the outcome of a sequence of several activities', () => {
            const pickACard   = new ActivityDetails(new Name('Pick the default credit card'), fakeLocation);
            const makePayment = new ActivityDetails(new Name('Make the payment'), fakeLocation);

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                    new TaskStarts(sceneId, activityIds[1], makePayment),
                    new TaskFinished(sceneId, activityIds[1], makePayment, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(2);
                    expect(report.testSteps[0].description).to.equal(pickACard.name.value);
                    expect(report.testSteps[0].result).to.equal('SUCCESS');
                    expect(report.testSteps[1].description).to.equal(makePayment.name.value);
                    expect(report.testSteps[1].result).to.equal('SUCCESS');
                });
        });

        it('reports the outcome of nested activities', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'), fakeLocation);
            const viewListOfCards = new ActivityDetails(new Name('View the list of available cards'), fakeLocation);

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new TaskStarts(sceneId, activityIds[1], viewListOfCards),
                        new TaskFinished(sceneId, activityIds[1], viewListOfCards, new ExecutionSuccessful()),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(1);
                    expect(report.testSteps[0].children).to.have.lengthOf(1);
                    expect(report.testSteps[0].children[0].description).to.equal(viewListOfCards.name.value);
                    expect(report.testSteps[0].children[0].result).to.equal('SUCCESS');
                });
        });

        it('reports the dynamic description of an activity', () => {
            const pickACardToString = new ActivityDetails(new Name('Pick the default credit card'), fakeLocation);
            const pickACardDynamicDescription = new ActivityDetails(new Name('Pick the "4111-XXXX-XXXX-1234" card'), fakeLocation);
            const expectedDescription = 'Pick the &quot;4111-XXXX-XXXX-1234&quot; card'

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                new TaskStarts(sceneId, activityIds[0], pickACardToString),
                new TaskFinished(sceneId, activityIds[0], pickACardDynamicDescription, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(1);
                    expect(report.testSteps[0].description).to.equal(expectedDescription);
                    expect(report.testSteps[0].result).to.equal('SUCCESS');
                });
        });

        // see https://github.com/serenity-js/serenity-js/issues/2695
        it('escapes HTML entities in activity descriptions', () => {
            const scenarioWithSpecialCharactersInDescription = new ActivityDetails(
                new Name(`Ensures that <<title>>.attribute('id') does equal <<expected title>>.attribute('id')`),
                fakeLocation
            );

            const descriptionWithSpecialCharactersEscaped = `Ensures that &lt;&lt;title&gt;&gt;.attribute(&apos;id&apos;) does equal &lt;&lt;expected title&gt;&gt;.attribute(&apos;id&apos;)`

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                new TaskStarts(sceneId, activityIds[0], scenarioWithSpecialCharactersInDescription),
                new TaskFinished(sceneId, activityIds[0], scenarioWithSpecialCharactersInDescription, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(1);
                    expect(report.testSteps[0].description).to.equal(descriptionWithSpecialCharactersEscaped);
                    expect(report.testSteps[0].result).to.equal('SUCCESS');
                });
        });
    });

    describe('order of events', () => {

        it('records the events in a correct order', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'), fakeLocation);

            const t1 = new Timestamp(new Date(0));
            const t2 = new Timestamp(new Date(10));

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo1'), photo),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo1'), Photo, new Path('target/site/serenity/photo1.png'), t1),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo2'), photo),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo2'), Photo, new Path('target/site/serenity/photo2.png'), t2),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .last(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(1);
                    expect(report.testSteps[0].screenshots).to.deep.equal([
                        { screenshot: 'photo1.png', screenshotName: 'photo1.png', timeStamp: t1.toMilliseconds() },
                        { screenshot: 'photo2.png', screenshotName: 'photo2.png', timeStamp: t2.toMilliseconds() },
                    ]);
                });
        });

        it('records the order of test steps so that the Serenity BDD reporter can display the reportData in the correct context', () => {
            const
                pickACard   = new ActivityDetails(new Name('Pick a credit card'), fakeLocation),
                makePayment = new ActivityDetails(new Name('Make a payment'), fakeLocation),
                artifactT1 = new Timestamp(new Date(0)),
                artifactT2 = new Timestamp(new Date(10));

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('pick a card message'), JSONData.fromJSON({ card: 'default' }), artifactT1),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('pick a card message'), JSONData, new Path('target/site/serenity/pick-a-card-message-md5hash.json'), artifactT1),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                    new TaskStarts(sceneId, activityIds[1], makePayment),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[1], new Name('make a payment message'), JSONData.fromJSON({ amount: '£42' }), artifactT2),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[1], new Name('make a payment message'), JSONData, new Path('target/site/serenity/make-a-payment-message-md5hash.json'), artifactT2),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[1], new Name('server log'), TextData.fromJSON({ contentType: 'text/plain', data: 'received payment request' })),
                    new TaskFinished(sceneId, activityIds[1], makePayment, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .last(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(2);
                    expect(report.testSteps[0].number).to.equal(1);
                    expect(report.testSteps[0].reportData[0].title).to.equal('pick a card message');
                    expect(report.testSteps[0].reportData[0].contents).to.equal('{\n    "card": "default"\n}');

                    expect(report.testSteps[1].number).to.equal(2);

                    expect(report.testSteps[1].reportData[0].title).to.equal('make a payment message');
                    expect(report.testSteps[1].reportData[0].contents).to.deep.equal('{\n    "amount": "£42"\n}');

                    expect(report.testSteps[1].reportData[1].title).to.equal('server log');
                    expect(report.testSteps[1].reportData[1].contents).to.deep.equal('received payment request');
                });
            });
    });

    describe('artifacts', () => {

        it('records the arbitrary JSON data emitted during the interaction', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'), fakeLocation);

            const t1 = new Timestamp(new Date(0));
            const t2 = new Timestamp(new Date(10));

            stage.announce(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo1'), photo, t1),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo1'), Photo, new Path('target/site/serenity/photo1.png'), t1),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo2'), photo, t2),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo2'), Photo, new Path('target/site/serenity/photo2.png'), t2),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .last(ArtifactGenerated, event => {
                    const report = event.artifact.map(_ => _);

                    expect(report.testSteps).to.have.lengthOf(1);
                    expect(report.testSteps[0].screenshots).to.deep.equal([
                        { screenshot: 'photo1.png', screenshotName: 'photo1.png', timeStamp: t1.toMilliseconds() },
                        { screenshot: 'photo2.png', screenshotName: 'photo2.png', timeStamp: t2.toMilliseconds() },
                    ]);
                });
        });
    });
});
