import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts
} from '@serenity-js/core/lib/events';
import {
    ArbitraryTag,
    CapabilityTag,
    CorrelationId,
    ExecutionSuccessful,
    FeatureTag,
    ImplementationPending,
    IssueTag,
    ManualTag,
    Name,
    ThemeTag
} from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { jasmine } from '../src/jasmine';

describe('@serenity-js/jasmine', function () {

    it('emits custom tags if present on describe or test title so that Serenity BDD can aggregate them correctly', () => jasmine( 'examples/custom_tags/custom_tags_in_title.spec.js')
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {
            expect(result.exitCode).to.equal(0);

            let currentSceneId: CorrelationId;

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Examples')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Custom tags')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('My feature')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('feature')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('scenario')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new IssueTag('JIRA-1')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('positive')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new IssueTag('JIRA-2')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new IssueTag('JIRA-3')))
            
                // triggered by requiring actorCalled
                .next(SceneFinishes,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(SceneFinished,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('A scenario manual test'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Examples')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Custom tags')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('My feature')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('feature')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('scenario')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new IssueTag('JIRA-1')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ManualTag('Manual')))

                .next(SceneFinished,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.be.instanceof(ImplementationPending);
                })
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        }));
});
