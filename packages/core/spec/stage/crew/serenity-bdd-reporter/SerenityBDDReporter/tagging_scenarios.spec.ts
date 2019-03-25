import 'mocha';

import * as sinon from 'sinon';

import { SceneFinished, SceneStarts, SceneTagged, TestRunFinished } from '../../../../../src/events';
import { ArbitraryTag, BrowserTag, CapabilityTag, ContextTag, ExecutionSuccessful, FeatureTag, IssueTag, ManualTag, ThemeTag } from '../../../../../src/model';
import { SerenityBDDReporter, StageManager } from '../../../../../src/stage';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { expect } from '../../../../expect';
import { given } from '../../given';
import { defaultCardScenario } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

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
                    new SceneStarts(defaultCardScenario),
                );
            });

            describe('@manual', () => {

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {TestRunFinished}
                 * @test {ExecutionSuccessful}
                 */
                it('is marked map automated (non-manual) by default', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.manual).to.equal(false);
                });

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinished}
                 * @test {ExecutionSuccessful}
                 * @test {ManualTag}
                 */
                it('can be optionally tagged map manual', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(defaultCardScenario, new ManualTag()),
                        new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.manual).to.equal(true);
                    expect(report.tags).to.deep.include.members([{
                        name: 'Manual',
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
                 * @test {TestRunFinished}
                 * @test {ExecutionSuccessful}
                 * @test {IssueTag}
                 */
                it('can be tagged with an issue number', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(defaultCardScenario, new IssueTag('ABC-1234')),
                        new SceneTagged(defaultCardScenario, new IssueTag('DEF-5678')),
                        new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.tags).to.deep.include.members([{
                        name: 'ABC-1234',
                        type: 'issue',
                    }, {
                        name: 'DEF-5678',
                        type: 'issue',
                    }]);

                    expect(report.issues).to.deep.equal([
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
                 * @test {TestRunFinished}
                 * @test {ExecutionSuccessful}
                 * @test {ArbitraryTag}
                 */
                it('can be tagged with an arbitrary tag', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(defaultCardScenario, new ArbitraryTag('regression')),
                        new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.tags).to.deep.include.members([{
                        name: 'regression',
                        type: 'tag',
                    }]);
                });
            });

            describe('to indicate that a scenario', () => {

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinished}
                 * @test {ExecutionSuccessful}
                 * @test {FeatureTag}
                 */
                it('belongs to a feature', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(defaultCardScenario, new FeatureTag('Checkout')),
                        new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.tags).to.deep.include.members([{
                        name: 'Checkout',
                        type: 'feature',
                    }]);

                    expect(report.featureTag).to.deep.equal({
                        name: 'Checkout',
                        type: 'feature',
                    });
                });

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinished}
                 * @test {ExecutionSuccessful}
                 * @test {FeatureTag}
                 * @test {CapabilityTag}
                 */
                it('belongs to a capability', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(defaultCardScenario, new CapabilityTag('E-Commerce')),
                        new SceneTagged(defaultCardScenario, new FeatureTag('Checkout')),
                        new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.tags).to.deep.include.members([{
                        name: 'E-Commerce',
                        type: 'capability',
                    }, {
                        name: 'E-Commerce/Checkout',
                        type: 'feature',
                    }]);

                    expect(report.featureTag).to.deep.equal({
                        name: 'Checkout',
                        type: 'feature',
                    });
                });

                /**
                 * @test {SerenityBDDReporter}
                 * @test {SceneStarts}
                 * @test {SceneFinished}
                 * @test {SceneTagged}
                 * @test {TestRunFinished}
                 * @test {ExecutionSuccessful}
                 * @test {FeatureTag}
                 * @test {CapabilityTag}
                 * @test {ThemeTag}
                 */
                it('belongs to a theme', () => {
                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneTagged(defaultCardScenario, new ThemeTag('Digital')),
                        new SceneTagged(defaultCardScenario, new CapabilityTag('E-Commerce')),
                        new SceneTagged(defaultCardScenario, new FeatureTag('Checkout')),
                        new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                    expect(report.tags).to.deep.include.members([{
                        name: 'Digital',
                        type: 'theme',
                    }, {
                        name: 'Digital/E-Commerce',
                        type: 'capability',
                    }, {
                        name: 'Digital/E-Commerce/Checkout',
                        type: 'feature',
                    }]);

                    expect(report.featureTag).to.deep.equal({
                        name: 'Checkout',
                        type: 'feature',
                    });
                });

                describe('is executed in the context and', () => {

                    /**
                     * @test {SerenityBDDReporter}
                     * @test {SceneStarts}
                     * @test {SceneFinished}
                     * @test {SceneTagged}
                     * @test {TestRunFinished}
                     * @test {ExecutionSuccessful}
                     * @test {BrowserTag}
                     */
                    it('indicates the web browser where the test was executed', () => {
                        given(reporter).isNotifiedOfFollowingEvents(
                            new SceneTagged(defaultCardScenario, new BrowserTag('chrome')),
                            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinished(),
                        );

                        report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                        expect(report.context).to.equal('chrome');

                        expect(report.tags).to.deep.include.members([{
                            name: 'chrome',
                            type: 'browser',
                        }]);
                    });

                    /**
                     * @test {SerenityBDDReporter}
                     * @test {SceneStarts}
                     * @test {SceneFinished}
                     * @test {SceneTagged}
                     * @test {TestRunFinished}
                     * @test {ExecutionSuccessful}
                     * @test {ContextTag}
                     */
                    it('indicates the operating system where the test was executed', () => {
                        given(reporter).isNotifiedOfFollowingEvents(
                            new SceneTagged(defaultCardScenario, new ContextTag('iphone')),
                            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinished(),
                        );

                        report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                        expect(report.context).to.equal('iphone');

                        expect(report.tags).to.deep.include.members([{
                            name: 'iphone',
                            type: 'context',
                        }]);
                    });

                    /**
                     * @test {SerenityBDDReporter}
                     * @test {SceneStarts}
                     * @test {SceneFinished}
                     * @test {SceneTagged}
                     * @test {TestRunFinished}
                     * @test {ExecutionSuccessful}
                     * @test {BrowserTag}
                     * @test {ContextTag}
                     */
                    it('ensures that the user-specified context takes precedence over browser context', () => {
                        given(reporter).isNotifiedOfFollowingEvents(
                            new SceneTagged(defaultCardScenario, new BrowserTag('safari')),
                            new SceneTagged(defaultCardScenario, new ContextTag('iphone')),
                            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                            new TestRunFinished(),
                        );

                        report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                        expect(report.context).to.equal('iphone');

                        expect(report.tags).to.deep.include.members([{
                            name: 'safari',
                            type: 'browser',
                        }, {
                            name: 'iphone',
                            type: 'context',
                        }]);
                    });
                });
            });
        });
    });
});
