import sinon = require('sinon');
import expect = require('../../../expect');
import { given } from 'mocha-testdata';
import { Runner } from 'protractor/built/runner';
import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    RecordedScene,
    RecordedTask,
    Result,
    SceneFinished,
    SceneStarts,
} from '../../../../src/serenity/domain';

import { ProtractorReporter } from '../../../../src/serenity-protractor/reporting';
import { ProtractorReportExporter } from '../../../../src/serenity-protractor/reporting/protractor_reporter';
import { RehearsalReport } from '../../../../src/serenity/reporting';

describe('serenity-protractor', () => {

    describe('framework', () => {

        describe('ProtractorReporter', () => {

            const now         = 1485229959000,
                  feature     = 'Managing Shopping Basket',
                  scenario_1  = 'Adding a product to the basket affects the total price',
                  scenario_2  = 'Removing a product from the basket affects the total price',
                  featureFile = 'basket_management/pricing.feature',

                  scene_1 = new RecordedScene(
                      scenario_1,
                      feature,
                      featureFile,
                  ),
                  scene_1_duration = 10,
                  scene_2 = new RecordedScene(
                      scenario_2,
                      feature,
                      featureFile,
                  ),
                  scene_2_duration = 7,
                  logsIn = new RecordedTask('Logs in'),
                  logsIn_duration = 10,
                  entersUsername = new RecordedTask('Enters username'),
                  entersUsername_duration = 6,
                  entersPassword = new RecordedTask('Enters password'),
                  entersPassword_duration = 4,
                  selectsAProduct = new RecordedTask('Selects a product');

            const examplesOfSuccess = [ Result.SUCCESS, Result.PENDING, Result.IGNORED, Result.SKIPPED ],
                  examplesOfFailure    = [ Result.FAILURE, Result.COMPROMISED, Result.ERROR ];

            let protractor: Runner,
                reporter: ProtractorReporter;

            beforeEach(() => {
                protractor = sinon.createStubInstance(Runner) as any;
                reporter   = new ProtractorReporter(protractor);
            });

            describe('complies with the Protractor Framework specification:', () => {

                // Protractor Framework spec:
                // - https://github.com/angular/protractor/blob/master/lib/frameworks/README.md

                describe('notifies Protractor as soon as a test', () => {

                    given(...examplesOfSuccess).it('passes', result => {
                        reporter.notifyOf(new SceneStarts(scene_1));
                        reporter.notifyOf(new SceneFinished(new Outcome(scene_1, result)));

                        expect(protractor.emit, `scenario finished with ${ Result[ result ] }`).
                            to.have.been.calledWith('testPass', {
                                category: feature,
                                name: scenario_1,
                            });
                    });

                    given(...examplesOfFailure).it('fails', result => {
                        reporter.notifyOf(new SceneStarts(scene_1));
                        reporter.notifyOf(new SceneFinished(new Outcome(scene_1, result)));

                        expect(protractor.emit, `scenario finished with ${ Result[ result ] }`).
                            to.have.been.calledWith('testFail', {
                                category: feature,
                                name: scenario_1,
                            });
                    });
                });

                describe('provides Protractor with a test results object which', () => {

                    describe('specifies the correct number of failures when a test suite', () => {

                        given(...examplesOfSuccess).it ('succeeds', result => {
                            reporter.notifyOf(new SceneStarts(scene_1));
                            reporter.notifyOf(new SceneFinished(new Outcome(scene_1, result)));

                            expect(reporter.finalResults(), `scenario finished with ${ Result[ result ] }`).
                                to.eventually.have.property('failedCount', 0);
                        });

                        given(...examplesOfFailure).it ('fails because of one scenario failure', result => {
                            reporter.notifyOf(new SceneStarts(scene_1));
                            reporter.notifyOf(new SceneFinished(new Outcome(scene_1, result)));

                            expect(reporter.finalResults(), `scenario finished with ${ Result[ result ] }`).
                                to.eventually.have.property('failedCount', 1);
                        });

                        it ('fails because of failures in several scenarios', () => {
                            examplesOfFailure.forEach(result => {
                                reporter.notifyOf(new SceneStarts(scene_1));
                                reporter.notifyOf(new SceneFinished(new Outcome(scene_1, result)));
                            });

                            expect(reporter.finalResults()).
                                to.eventually.have.property('failedCount', examplesOfFailure.length);
                        });
                    });

                    describe('specifies the results for each scene, where', () => {

                        describe('one scene', () => {

                            given(...examplesOfSuccess).it('passed', result => {

                                const report = RehearsalReport.from([
                                    new SceneStarts(scene_1, now),
                                    new SceneFinished(new Outcome(scene_1, result), now + scene_1_duration),
                                ]);

                                return expect(report.exportedUsing(new ProtractorReportExporter())).to.eventually.deep.equal({
                                    failedCount: 0,
                                    specResults: [
                                        {
                                            description: scene_1.name,
                                            assertions: [],
                                            duration: scene_1_duration,
                                        },
                                    ],
                                });
                            });

                            given(...examplesOfFailure).it ('failed', result => {
                                const report = RehearsalReport.from([
                                    new SceneStarts(scene_1, now),
                                    new SceneFinished(new Outcome(scene_1, result), now + scene_1_duration),
                                ]);

                                return expect(report.exportedUsing(new ProtractorReportExporter())).to.eventually.deep.equal({
                                    failedCount: 1,
                                    specResults: [
                                        {
                                            description: scene_1.name,
                                            assertions: [],
                                            duration: scene_1_duration,
                                        },
                                    ],
                                });
                            });

                            describe('out of several', () => {
                                given(...examplesOfFailure).it ('failed', result => {
                                    const report = RehearsalReport.from([
                                        new SceneStarts(scene_1, now),
                                        new SceneFinished(new Outcome(scene_1, Result.SUCCESS), now + scene_1_duration),
                                        new SceneStarts(scene_2, now + scene_1_duration),
                                        new SceneFinished(new Outcome(scene_2, result), now + scene_1_duration + scene_2_duration),
                                    ]);

                                    return expect(report.exportedUsing(new ProtractorReportExporter())).to.eventually.deep.equal({
                                        failedCount: 1,
                                        specResults: [
                                            {
                                                description: scene_1.name,
                                                assertions: [],
                                                duration: scene_1_duration,
                                            },
                                            {
                                                description: scene_2.name,
                                                assertions: [],
                                                duration: scene_2_duration,
                                            },
                                        ],
                                    });
                                });
                            });
                        });
                    });

                    describe('specifies the results for each activity, where', () => {

                        const error = new Error('Session timed out');
                        error.stack = 'the stacktrace';

                        describe('an activity', () => {

                            given(...examplesOfSuccess).it('passed', result => {
                                const report = RehearsalReport.from([
                                    new SceneStarts(scene_1, now),
                                        new ActivityStarts(logsIn, now),
                                        new ActivityFinished(new Outcome(logsIn, result), now + logsIn_duration),
                                    new SceneFinished(new Outcome(scene_1, result), now + scene_1_duration),
                                ]);

                                return expect(report.exportedUsing(new ProtractorReportExporter())).to.eventually.deep.equal({
                                    failedCount: 0,
                                    specResults: [
                                        {
                                            description: scene_1.name,
                                            assertions: [ {
                                                passed: true,
                                                errorMsg: undefined,
                                                stackTrace: undefined,
                                            }],
                                            duration: scene_1_duration,
                                        },
                                    ],
                                });
                            });

                            given(...examplesOfFailure).it('failed', result => {
                                const report = RehearsalReport.from([
                                    new SceneStarts(scene_1, now),
                                    new ActivityStarts(logsIn, now),
                                    new ActivityFinished(new Outcome(logsIn, result, error), now + logsIn_duration),
                                    new SceneFinished(new Outcome(scene_1, result, error), now + scene_1_duration),
                                ]);

                                return expect(report.exportedUsing(new ProtractorReportExporter())).to.eventually.deep.equal({
                                    failedCount: 1,
                                    specResults: [
                                        {
                                            description: scene_1.name,
                                            assertions: [ {
                                                passed: false,
                                                errorMsg: error.message,
                                                stackTrace: error.stack,
                                            }],
                                            duration: scene_1_duration,
                                        },
                                    ],
                                });
                            });
                        });

                        describe('some activities', () => {
                            given(...examplesOfFailure).it('failed', result => {
                                const report = RehearsalReport.from([
                                    new SceneStarts(scene_1, now),
                                    new ActivityStarts(logsIn, now),
                                    new ActivityFinished(new Outcome(logsIn, Result.SUCCESS), now + logsIn_duration),
                                    new ActivityStarts(selectsAProduct, now),
                                    new ActivityFinished(new Outcome(selectsAProduct, result, error), now + logsIn_duration),
                                    new SceneFinished(new Outcome(scene_1, result, error), now + scene_1_duration),
                                ]);

                                return expect(report.exportedUsing(new ProtractorReportExporter())).to.eventually.deep.equal({
                                    failedCount: 1,
                                    specResults: [
                                        {
                                            description: scene_1.name,
                                            assertions: [{
                                                passed: true,
                                                errorMsg: undefined,
                                                stackTrace: undefined,
                                            }, {
                                                passed: false,
                                                errorMsg: error.message,
                                                stackTrace: error.stack,
                                            }],
                                            duration: scene_1_duration,
                                        },
                                    ],
                                });
                            });
                        });
                    });

                    describe('limits the result so that it', () => {

                        it('only specifies the results for top-level activities', () => {
                            const events: Array<DomainEvent<any>> = [
                                new SceneStarts(scene_1, now),
                                    new ActivityStarts(logsIn, now),
                                        new ActivityStarts(entersUsername,
                                            now),
                                        new ActivityFinished(new Outcome(entersUsername, Result.SUCCESS),
                                            now + entersUsername_duration),
                                        new ActivityStarts(entersPassword,
                                            now + entersUsername_duration),
                                        new ActivityFinished(new Outcome(entersPassword, Result.SUCCESS),
                                            now + entersUsername_duration + entersPassword_duration),
                                    new ActivityFinished(new Outcome(logsIn, Result.SUCCESS),
                                        now + entersUsername_duration + entersPassword_duration),
                                new SceneFinished(new Outcome(scene_1, Result.SUCCESS),
                                    now + scene_1_duration),
                            ];

                            const screenplay = RehearsalReport.from(events);

                            return expect(screenplay.exportedUsing(new ProtractorReportExporter())).to.eventually.deep.equal({
                                failedCount: 0,
                                specResults: [
                                    {
                                        description: scene_1.name,
                                        assertions: [ {
                                            passed: true,
                                            errorMsg: undefined,
                                            stackTrace: undefined,
                                        }],
                                        duration: 10,
                                    },
                                ],
                            });
                        });
                    });
                });
            });
        });
    });
});
