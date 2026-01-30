
import type { EventRecorder} from '@integration/testing-tools';
import { expect, PickEvent } from '@integration/testing-tools';
import type { Stage } from '@serenity-js/core';
import { ArtifactGenerated, SceneFinished, SceneStarts, SceneTagged, TestRunFinishes } from '@serenity-js/core/lib/events';
import { ArbitraryTag, BrowserTag, CapabilityTag, CorrelationId, ExecutionSuccessful, FeatureTag, IssueTag, ManualTag, PlatformTag, ThemeTag } from '@serenity-js/core/lib/model';
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

    describe('produces a SerenityBDDReport that', () => {

        describe('can be tagged', () => {

            beforeEach(() => {
                stage.announce(
                    new SceneStarts(sceneId, defaultCardScenario),
                );
            });

            describe('@manual', () => {

                it('is marked as automated (non-manual) by default', () => {
                    stage.announce(
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    PickEvent.from(recorder.events)
                        .last(ArtifactGenerated, event => {
                            const report = event.artifact.map(_ => _);

                            expect(report.manual).to.equal(false);
                        });
                });

                it('can be optionally tagged as manual', () => {
                    stage.announce(
                        new SceneTagged(sceneId, new ManualTag()),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    PickEvent.from(recorder.events)
                        .last(ArtifactGenerated, event => {
                            const report = event.artifact.map(_ => _);

                            expect(report.manual).to.equal(true);
                            expect(report.tags).to.deep.include.members([{
                                name: 'Manual',
                                displayName: 'Manual',
                                type: 'External Tests',
                            }]);
                        });
                });
            });

            describe('@issue', () => {

                it('can be tagged with an issue number', () => {
                    stage.announce(
                        new SceneTagged(sceneId, new IssueTag('ABC-1234')),
                        new SceneTagged(sceneId, new IssueTag('DEF-5678')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    PickEvent.from(recorder.events)
                        .last(ArtifactGenerated, event => {
                            const report = event.artifact.map(_ => _);

                            expect(report.tags).to.deep.include.members([{
                                name:        'ABC-1234',
                                displayName: 'ABC-1234',
                                type:        'issue',
                            }, {
                                name:        'DEF-5678',
                                displayName: 'DEF-5678',
                                type:        'issue',
                            }]);

                            expect(report.issues).to.deep.equal([
                                'ABC-1234',
                                'DEF-5678',
                            ]);

                            expect(report.additionalIssues).to.deep.equal([
                                'ABC-1234',
                                'DEF-5678',
                            ]);
                        });
                });
            });

            describe('@arbitrary-tag', () => {

                it('can be tagged with an arbitrary tag', () => {
                    stage.announce(
                        new SceneTagged(sceneId, new ArbitraryTag('regression')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    PickEvent.from(recorder.events)
                        .last(ArtifactGenerated, event => {
                            const report = event.artifact.map(_ => _);

                            expect(report.tags).to.deep.include.members([{
                                name:        'regression',
                                displayName: 'regression',
                                type:        'tag',
                            }]);
                        });
                });
            });

            describe('to indicate that a scenario', () => {

                it('belongs to a feature', () => {
                    stage.announce(
                        new SceneTagged(sceneId, new FeatureTag('Checkout')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    PickEvent.from(recorder.events)
                        .last(ArtifactGenerated, event => {
                            const report = event.artifact.map(_ => _);

                            expect(report.tags).to.deep.include.members([{
                                name: 'Checkout',
                                type: 'feature',
                                displayName: 'Checkout',
                            }]);

                            expect(report.featureTag).to.deep.equal({
                                name: 'Checkout',
                                type: 'feature',
                                displayName: 'Checkout',
                            });
                        });
                });

                it('belongs to a capability', () => {
                    stage.announce(
                        new SceneTagged(sceneId, new CapabilityTag('E-Commerce')),
                        new SceneTagged(sceneId, new FeatureTag('Checkout')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    PickEvent.from(recorder.events)
                        .last(ArtifactGenerated, event => {
                            const report = event.artifact.map(_ => _);

                            expect(report.tags).to.deep.include.members([{
                                name: 'E-Commerce',
                                type: 'capability',
                                displayName: 'E-Commerce',
                            }, {
                                name: 'E-Commerce/Checkout',
                                type: 'feature',
                                displayName: 'Checkout',
                            }]);

                            expect(report.featureTag).to.deep.equal({
                                name: 'E-Commerce/Checkout',
                                type: 'feature',
                                displayName: 'Checkout',
                            });
                        });
                });

                it('belongs to a theme', () => {
                    stage.announce(
                        new SceneTagged(sceneId, new ThemeTag('Digital')),
                        new SceneTagged(sceneId, new CapabilityTag('E-Commerce')),
                        new SceneTagged(sceneId, new FeatureTag('Checkout')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    PickEvent.from(recorder.events)
                        .last(ArtifactGenerated, event => {
                            const report = event.artifact.map(_ => _);

                            expect(report.tags).to.deep.include.members([{
                                name: 'Digital',
                                type: 'theme',
                                displayName: 'Digital',
                            }, {
                                name: 'Digital/E-Commerce',
                                type: 'capability',
                                displayName: 'E-Commerce',
                            }, {
                                name: 'Digital/E-Commerce/Checkout',
                                type: 'feature',
                                displayName: 'Checkout',
                            }]);

                            expect(report.featureTag).to.deep.equal({
                                name: 'Digital/E-Commerce/Checkout',
                                type: 'feature',
                                displayName: 'Checkout',
                            });
                        });
                });

                describe('is executed in the context and', () => {

                    it('indicates the web browser where the test was executed', () => {
                        stage.announce(
                            new SceneTagged(sceneId, new BrowserTag('chrome', '80.0.3987.87')),
                            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinishes(),
                        );

                        PickEvent.from(recorder.events)
                            .last(ArtifactGenerated, event => {
                                const report = event.artifact.map(_ => _);

                                expect(report.context).to.equal('chrome');

                                expect(report.tags).to.deep.include.members([{
                                    browserName: 'chrome',
                                    browserVersion: '80.0.3987.87',
                                    name: 'chrome 80.0.3987.87',
                                    displayName: 'chrome 80.0.3987.87',
                                    type: 'browser',
                                }]);
                            });
                    });

                    it('indicates the operating system where the test was executed', () => {
                        stage.announce(
                            new SceneTagged(sceneId, new PlatformTag('iphone')),
                            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinishes(),
                        );

                        PickEvent.from(recorder.events)
                            .last(ArtifactGenerated, event => {
                                const report = event.artifact.map(_ => _);

                                expect(report.context).to.equal('iphone');

                                expect(report.tags).to.deep.include.members([{
                                    name: 'iphone',
                                    displayName: 'iphone',
                                    platformName: 'iphone',
                                    platformVersion: '',
                                    type: 'platform'
                                }]);
                            });
                    });

                    it('ensures that the user-specified context takes precedence over browser context', () => {
                        stage.announce(
                            new SceneTagged(sceneId, new BrowserTag('safari', '13.0.5')),
                            new SceneTagged(sceneId, new PlatformTag('iphone')),
                            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinishes(),
                        );

                        PickEvent.from(recorder.events)
                            .last(ArtifactGenerated, event => {
                                const report = event.artifact.map(_ => _);

                                expect(report.context).to.equal('safari,iphone');

                                expect(report.tags).to.deep.include.members([ {
                                    name: 'safari 13.0.5',
                                    type: 'browser',
                                    browserName: 'safari',
                                    browserVersion: '13.0.5',
                                    displayName: 'safari 13.0.5',
                                }, {
                                    name: 'iphone',
                                    type: 'platform',
                                    platformName: 'iphone',
                                    platformVersion: '',
                                    displayName: 'iphone'
                                } ]);
                            });
                    });
                });
            });
        });
    });
});
