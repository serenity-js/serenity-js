/* eslint-disable unicorn/filename-case, @typescript-eslint/indent */
import type { EventRecorder } from '@integration/testing-tools';
import { expect, PickEvent } from '@integration/testing-tools';
import type { Actor, Stage } from '@serenity-js/core';
import { Ability } from '@serenity-js/core';
import {
    ArtifactGenerated,
    SceneFinished,
    SceneFinishes,
    SceneSequenceDetected,
    SceneStarts,
    TestRunFinished,
    TestRunFinishes,
    TestRunStarts
} from '@serenity-js/core/lib/events';
import type { CorrelationId, ScenarioDetails } from '@serenity-js/core/lib/model';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model';
import type { SerialisedAbility } from '@serenity-js/core/src';
import { beforeEach, describe, it } from 'mocha';

import { authenticationScenario, defaultCardScenario, voucherScenario } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stage: Stage,
        recorder: EventRecorder;

    beforeEach(() => {
        const env = create();

        stage = env.stage;
        recorder = env.recorder;
    });

    describe('when capturing information about actors', () => {

        describe('engaged in the test scenario scope', () => {

            it('includes the information about the actor and their abilities', async () => {
                await testRun(async () => {
                    await scene({ scenario: defaultCardScenario }, async ({ actorCalled }) => {
                        actorCalled('Alice');
                    });
                });

                PickEvent.from(recorder.events)
                    .last(ArtifactGenerated, event => {
                        const report = event.artifact.map(_ => _);

                        expect(report.actors).to.deep.equal([
                            {
                                name: 'Alice',
                                can: [
                                    'PerformActivities',
                                    'AnswerQuestions',
                                    'RaiseErrors',
                                    'ScheduleWork { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 2000 } } }',
                                ]
                            }
                        ]);
                    });
            });

            it('can include the information about multiple actors', async () => {
                await testRun(async () => {
                    await scene({ scenario: defaultCardScenario }, async ({ actorCalled }) => {
                        actorCalled('Alice');
                        actorCalled('Bob');
                    });
                });

                PickEvent.from(recorder.events)
                    .last(ArtifactGenerated, event => {
                        const report = event.artifact.map(_ => _);

                        expect(report.actors).to.deep.equal([
                            {
                                name: 'Alice',
                                can: [
                                    'PerformActivities',
                                    'AnswerQuestions',
                                    'RaiseErrors',
                                    'ScheduleWork { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 2000 } } }',
                                ]
                            },
                            {
                                name: 'Bob',
                                can: [
                                    'PerformActivities',
                                    'AnswerQuestions',
                                    'RaiseErrors',
                                    'ScheduleWork { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 2000 } } }',
                                ]
                            } ]
                        );
                    });
            });

            it('can include information about any new abilities that actors have acquired during the test scenario', async () => {
                class MakePhoneCalls extends Ability {
                    constructor(private readonly phoneNumber: string) {
                        super();
                    }

                    toJSON(): SerialisedAbility {
                        return {
                            ...super.toJSON(),
                            options: {
                                phoneNumber: this.phoneNumber,
                            }
                        };
                    }
                }

                await testRun(async () => {
                    await scene({ scenario: defaultCardScenario }, async ({ actorCalled }) => {
                        actorCalled('Alice').whoCan(new MakePhoneCalls('555-874-3291'));
                    });
                });

                PickEvent.from(recorder.events)
                    .last(ArtifactGenerated, event => {
                        const report = event.artifact.map(_ => _);

                        expect(report.actors).to.deep.equal([
                            {
                                name: 'Alice',
                                can: [
                                    'PerformActivities',
                                    'AnswerQuestions',
                                    'RaiseErrors',
                                    'ScheduleWork { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 2000 } } }',
                                    'MakePhoneCalls { phoneNumber: "555-874-3291" }',
                                ]
                            },
                        ]);
                    });
            });
        });

        describe('engaged outside the test scenario scope', () => {

            it('adds the information about the backstage actors sand their abilities', async () => {
                await testRun(async ({ actorCalled }) => {

                    // Actor enters the stage outside the test scenario scope, e.g. in a BeforeAll hook
                    actorCalled('Alice');

                    // Some scenarios might not involve the actor directly
                    await scene({ scenario: defaultCardScenario });

                    // Some scenarios might involve the actor
                    await scene({ scenario: voucherScenario }, async ({ actorCalled }) => {
                        actorCalled('Alice');
                    });

                    // Different scenario from another file still have access to the actor instantiated outside the test scenario scope
                    await scene({ scenario: authenticationScenario });
                });

                const artifacts = recorder.events.filter(event => event instanceof ArtifactGenerated)
                    .map(event => event.artifact.map(_ => _));

                const reports = artifacts.map(report => ({
                    name: report.name,
                    actors: report.actors,
                }));

                const expectedActors = {
                    actors: [
                        {
                            name: 'Alice',
                            can: [
                                'PerformActivities',
                                'AnswerQuestions',
                                'RaiseErrors',
                                'ScheduleWork { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 2000 } } }',
                            ]
                        }
                    ]
                }

                expect(reports).to.deep.equal([
                    { name: 'Paying with a default card', ...expectedActors },
                    { name: 'Paying with a voucher', ...expectedActors },
                    { name: 'Authenticating with social media', ...expectedActors },
                ]);
            });
        });

        describe('engaged in scene sequences', () => {

            it('adds the information about the actors sand their abilities', async () => {
                await testRun(async ({ actorCalled }) => {

                    const sceneId = stage.assignNewSceneId();

                    stage.announce(
                        new SceneSequenceDetected(sceneId, defaultCardScenario)
                    )

                    // Actor enters the stage outside the test scenario scope, e.g. in a BeforeAll hook
                    actorCalled('Alice');

                    // Some scenarios might not involve the actor directly
                    await scene({ sceneId, scenario: defaultCardScenario }, async ({ actorCalled }) => {
                        actorCalled('Bob');
                    });

                    // Some scenarios might involve the actor
                    await scene({ sceneId, scenario: defaultCardScenario }, async ({ actorCalled }) => {
                        actorCalled('Alice');
                        actorCalled('Bob');
                        actorCalled('Alice');
                    });
                });

                const artifacts = recorder.events.filter(event => event instanceof ArtifactGenerated)
                    .map(event => event.artifact.map(_ => _));

                const reports = artifacts.map(report => ({
                    name: report.name,
                    actors: report.actors,
                }));

                expect(reports).to.deep.equal([ {
                    name: 'Paying with a default card',
                    actors: [
                        {
                            name: 'Alice',
                            can: [
                                'PerformActivities',
                                'AnswerQuestions',
                                'RaiseErrors',
                                'ScheduleWork { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 2000 } } }',
                            ]
                        },
                        {
                            name: 'Bob',
                            can: [
                                'PerformActivities',
                                'AnswerQuestions',
                                'RaiseErrors',
                                'ScheduleWork { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 2000 } } }',
                            ]
                        }
                    ]
                } ]);
            });
        });
    });

    async function testRun(
        body: ({ actorCalled } : { actorCalled: (name: string) => Actor }) => Promise<void> | void = () => void 0
    ): Promise<void> {
        stage.announce(
            new TestRunStarts(),
        );

        await body({ actorCalled: (name: string) => stage.theActorCalled(name) });

        stage.announce(new TestRunFinishes());

        await stage.waitForNextCue();

        stage.announce(new TestRunFinished(new ExecutionSuccessful()));
    }

    async function scene(
        { sceneId = stage.assignNewSceneId(), scenario }: { sceneId?: CorrelationId, scenario: ScenarioDetails },
        body: ({ actorCalled } : { actorCalled: (name: string) => Actor }) => Promise<void> | void = () => void 0
    ): Promise<void> {
        stage.announce(new SceneStarts(sceneId, scenario));

        await body({ actorCalled: (name: string) => stage.theActorCalled(name) });

        stage.announce(new SceneFinishes(sceneId, new ExecutionSuccessful()));

        await stage.waitForNextCue();

        stage.announce(new SceneFinished(sceneId, scenario, new ExecutionSuccessful()));
    }
});
