/*eslint-disable unicorn/filename-case */

import 'mocha';

import { expect } from '@integration/testing-tools';
import { StageManager } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TestRunFinishes } from '@serenity-js/core/lib/events';
import { ArbitraryTag, BrowserTag, CapabilityTag, ContextTag, CorrelationId, ExecutionSuccessful, FeatureTag, IssueTag, ManualTag, ThemeTag } from '@serenity-js/core/lib/model';
import * as sinon from 'sinon';

import { SerenityBDDReporter } from '../../../../../src/stage';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { given } from '../../given';
import { defaultCardScenario } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    const sceneId = new CorrelationId('a-scene-id');

    beforeEach(() => {
        const env = create();

        stageManager    = env.stageManager;
        reporter        = env.reporter;
    });

    describe('produces a SerenityBDDReport that', () => {

        let report: SerenityBDDReport;

        describe('can be tagged', () => {

            beforeEach(() => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneStarts(sceneId, defaultCardScenario),
                );
            });

            describe('@manual', () => {

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {TestRunFinishes}
                 * @test {ExecutionSuccessful}
                 */
                it('is marked as automated (non-manual) by default', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.manual).to.equal(false);
                });

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinishes}
                 * @test {ExecutionSuccessful}
                 * @test {ManualTag}
                 */
                it('can be optionally tagged as manual', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(sceneId, new ManualTag()),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.manual).to.equal(true);
                    expect(report.tags).to.deep.include.members([{
                        name: 'Manual',
                        displayName: 'Manual',
                        type: 'External Tests',
                    }]);
                });
            });

            describe('@issue', () => {

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinishes}
                 * @test {ExecutionSuccessful}
                 * @test {IssueTag}
                 */
                it('can be tagged with an issue number', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(sceneId, new IssueTag('ABC-1234')),
                        new SceneTagged(sceneId, new IssueTag('DEF-5678')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

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

            describe('@arbitrary-tag', () => {

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinishes}
                 * @test {ExecutionSuccessful}
                 * @test {ArbitraryTag}
                 */
                it('can be tagged with an arbitrary tag', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(sceneId, new ArbitraryTag('regression')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.tags).to.deep.include.members([{
                        name:        'regression',
                        displayName: 'regression',
                        type:        'tag',
                    }]);
                });
            });

            describe('to indicate that a scenario', () => {

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinishes}
                 * @test {ExecutionSuccessful}
                 * @test {FeatureTag}
                 */
                it('belongs to a feature', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(sceneId, new FeatureTag('Checkout')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

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

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinishes}
                 * @test {ExecutionSuccessful}
                 * @test {FeatureTag}
                 * @test {CapabilityTag}
                 */
                it('belongs to a capability', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(sceneId, new CapabilityTag('E-Commerce')),
                        new SceneTagged(sceneId, new FeatureTag('Checkout')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

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

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinishes}
                 * @test {ExecutionSuccessful}
                 * @test {FeatureTag}
                 * @test {CapabilityTag}
                 * @test {ThemeTag}
                 */
                it('belongs to a theme', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(sceneId, new ThemeTag('Digital')),
                        new SceneTagged(sceneId, new CapabilityTag('E-Commerce')),
                        new SceneTagged(sceneId, new FeatureTag('Checkout')),
                        new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinishes(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.tags).to.deep.include.members([{
                        name: 'Digital',
                        type: 'theme',
                        displayName: 'Digital',
                    }, {
                        name: 'Digital/E-Commerce',
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

                describe('is executed in the context and', () => {

                    /**
                     * @test {SerenityBDDReporter}
                     * @test {SceneStarts}
                     * @test {SceneFinished}
                     * @test {SceneTagged}
                     * @test {TestRunFinishes}
                     * @test {ExecutionSuccessful}
                     * @test {BrowserTag}
                     */
                    it('indicates the web browser where the test was executed', () => {
                        given(reporter).isNotifiedOfFollowingEvents(
                            new SceneTagged(sceneId, new BrowserTag('chrome', '80.0.3987.87')),
                            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinishes(),
                        );

                        report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                        expect(report.context).to.equal('chrome');

                        expect(report.tags).to.deep.include.members([{
                            browserName: 'chrome',
                            browserVersion: '80.0.3987.87',
                            name: 'chrome 80.0.3987.87',
                            displayName: 'chrome 80.0.3987.87',
                            type: 'browser',
                        }]);
                    });

                    /**
                     * @test {SerenityBDDReporter}
                     * @test {SceneStarts}
                     * @test {SceneFinished}
                     * @test {SceneTagged}
                     * @test {TestRunFinishes}
                     * @test {ExecutionSuccessful}
                     * @test {ContextTag}
                     */
                    it('indicates the operating system where the test was executed', () => {
                        given(reporter).isNotifiedOfFollowingEvents(
                            new SceneTagged(sceneId, new ContextTag('iphone')),
                            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinishes(),
                        );

                        report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                        expect(report.context).to.equal('iphone');

                        expect(report.tags).to.deep.include.members([{
                            name: 'iphone',
                            displayName: 'iphone',
                            type: 'context',
                        }]);
                    });

                    /**
                     * @test {SerenityBDDReporter}
                     * @test {SceneStarts}
                     * @test {SceneFinished}
                     * @test {SceneTagged}
                     * @test {TestRunFinishes}
                     * @test {ExecutionSuccessful}
                     * @test {BrowserTag}
                     * @test {ContextTag}
                     */
                    it('ensures that the user-specified context takes precedence over browser context', () => {
                        given(reporter).isNotifiedOfFollowingEvents(
                            new SceneTagged(sceneId, new BrowserTag('safari', '13.0.5')),
                            new SceneTagged(sceneId, new ContextTag('iphone')),
                            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinishes(),
                        );

                        report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                        expect(report.context).to.equal('iphone');

                        expect(report.tags).to.deep.include.members([{
                            name: 'safari 13.0.5',
                            displayName: 'safari 13.0.5',
                            type: 'browser',
                            browserName: 'safari',
                            browserVersion: '13.0.5',
                        }, {
                            name: 'iphone',
                            displayName: 'iphone',
                            type: 'context',
                        }]);
                    });
                });
            });
        });
    });
});
