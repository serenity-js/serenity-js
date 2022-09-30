import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, when } from '@integration/testing-tools';
import { BusinessRuleDetected, FeatureNarrativeDetected, SceneDescriptionDetected, SceneFinished, SceneFinishes, SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import { BusinessRule, CorrelationId, Description, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, () => {

    when(7 <= cucumberVersion().major())
        .it(`recognises rules and examples`, () =>
            cucumber('features/rules.feature', 'rules.steps.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(0);

                    const expectedFeatureNarrative = new Description(trimmed`
                        | As a Frequent Flyer Member
                        | I want to transfer points that I don't need to members of my family
                        | So that the points don't go to waste
                    `.trim());

                    const firstBusinessRule = new BusinessRule(
                        new Name(`Frequent Flyer members in the same family can transfer points`),
                        new Description(`Each family has a unique family code`),
                    );

                    const secondBusinessRule = new BusinessRule(
                        new Name(`Members cannot transfer more points than they have`),
                        new Description(``),    // no description represented as empty description
                    );

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        // Rule 1, Example 1
                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('Transfer points between existing members'));
                            currentSceneId = event.sceneId;
                        })
                        .next(FeatureNarrativeDetected, event => {
                            expect(event.description).to.equal(expectedFeatureNarrative);
                        })
                        .next(SceneDescriptionDetected, event => {
                            expect(event.description).to.equal(new Description('Sarah and Steve are members of the same family'));
                        })
                        .next(BusinessRuleDetected, event => {
                            expect(event.rule).to.equal(firstBusinessRule);
                        })
                        .next(SceneTagged, event => {
                            expect(event.tag).to.equal(new FeatureTag('Transferring points between members'));
                        })
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.equal(new ExecutionSuccessful());
                        })

                        // Rule 1, Example 2
                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name(`Transfer points between non-family members`));
                            currentSceneId = event.sceneId;
                        })
                        .next(FeatureNarrativeDetected, event => {
                            expect(event.description).to.equal(expectedFeatureNarrative);
                        })
                        .next(SceneDescriptionDetected, event => {
                            expect(event.description).to.equal(new Description('Sarah and Fred are members of different families'));
                        })
                        .next(BusinessRuleDetected, event => {
                            expect(event.rule).to.equal(firstBusinessRule);
                        })
                        .next(SceneTagged, event => {
                            expect(event.tag).to.equal(new FeatureTag('Transferring points between members'));
                        })
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.equal(new ExecutionSuccessful());
                        })

                        // Rule 2, Example 1
                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name(`Steve tries to transfer more points than he has`));
                            currentSceneId = event.sceneId;
                        })
                        .next(FeatureNarrativeDetected, event => {
                            expect(event.description).to.equal(expectedFeatureNarrative);
                        })
                        .next(BusinessRuleDetected, event => {
                            expect(event.rule).to.equal(secondBusinessRule);
                        })
                        .next(SceneTagged, event => {
                            expect(event.tag).to.equal(new FeatureTag('Transferring points between members'));
                        })
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.equal(new ExecutionSuccessful());
                        })
                    ;
                }));
});
