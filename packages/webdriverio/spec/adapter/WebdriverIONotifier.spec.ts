
import { expect } from '@integration/testing-tools';
import { Cast, Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';
import type { Capabilities, Frameworks } from '@wdio/types';
import { EventEmitter } from 'events';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { WebdriverIONotifier } from '../../src/adapter/WebdriverIONotifier.js';
import type { WebdriverIOConfig } from '../../src/index.js';
import {
    cid,
    executionCompromised,
    executionFailedWithAssertionError,
    executionFailedWithError,
    executionIgnored,
    executionSkipped,
    executionSuccessful,
    implementationPending,
    retryableSceneDetected,
    retryableSceneFinishedWith,
    retryableSceneFinishesWith,
    retryableSceneStarts,
    scene1FinishedWith,
    scene1FinishesWith,
    scene1Id,
    scene1Starts,
    scene2FinishedWith,
    scene2FinishesWith,
    scene2Starts,
    successThreshold,
    testRunFinished,
    testRunFinishes,
    testRunStarts,
    testSuiteFinished,
    testSuiteStarts,
    when,
} from './fixtures.js';

describe('WebdriverIONotifier', () => {

    const capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedStandaloneCapabilities[] | Capabilities.RequestedMultiremoteCapabilities | Capabilities.RequestedMultiremoteCapabilities[] = {
        browserName: 'chrome',
    };

    const specs = [
        '/users/jan/project/feature.spec.ts'
    ];

    const configSandbox = sinon.createSandbox();

    let config: Partial<WebdriverIOConfig> & {
        beforeSuite: sinon.SinonSpy<[ suite: Frameworks.Suite ], void>,
        beforeTest: sinon.SinonSpy<[ test: Frameworks.Test, context: any ], void>,
        afterTest: sinon.SinonSpy<[ test: Frameworks.Test, context: any, result: Frameworks.TestResult ], void>,
        afterSuite: sinon.SinonSpy<[ suite: Frameworks.Suite ], void>,
    }

    let notifier: WebdriverIONotifier,
        reporter: sinon.SinonStubbedInstance<EventEmitter>,
        stage: Stage;

    beforeEach(() => {

        const clock = new Clock();
        const cueTimeout = Duration.ofSeconds(5);
        const interactionTimeout = Duration.ofSeconds(2);

        config = {
            beforeSuite: configSandbox.spy() as sinon.SinonSpy<[ suite: Frameworks.Suite ], void>,
            beforeTest: configSandbox.spy() as sinon.SinonSpy<[ test: Frameworks.Test, context: any ], void>,
            afterTest: configSandbox.spy() as sinon.SinonSpy<[ test: Frameworks.Test, context: any, result: Frameworks.TestResult ], void>,
            afterSuite: configSandbox.spy() as sinon.SinonSpy<[ suite: Frameworks.Suite ], void>,
        }

        reporter = sinon.createStubInstance(EventEmitter);

        stage = new Stage(
            Cast.where(actor => actor/* who can do nothing much */),
            new StageManager(cueTimeout, clock),
            new ErrorFactory(),
            clock,
            interactionTimeout,
        );

        notifier = new WebdriverIONotifier(
            config as WebdriverIOConfig,
            capabilities,
            reporter,
            successThreshold,
            cid,
            specs
        );

        stage.assign(notifier);
        notifier.assignedTo(stage);
    });

    afterEach(() => {
        configSandbox.reset();
    });

    describe('failureCount()', () => {

        given([ {
            description: 'no scenarios',
            expectedFailureCount: 0,
            events: []
        }, {
            description: 'all successful',
            expectedFailureCount: 0,
            events: [
                scene1Starts,
                scene1FinishesWith(executionSuccessful),
                scene1FinishedWith(executionSuccessful)
            ]
        }, {
            description: 'one failure',
            expectedFailureCount: 1,
            events: [
                scene1Starts,
                scene1FinishesWith(executionFailedWithError),
                scene1FinishedWith(executionFailedWithError)
            ]
        }, {
            description: 'two failures',
            expectedFailureCount: 2,
            events: [
                scene1Starts,
                scene1FinishesWith(executionFailedWithError),
                scene1FinishedWith(executionFailedWithError),
                scene2Starts,
                scene2FinishesWith(executionFailedWithError),
                scene2FinishedWith(executionFailedWithError)
            ]
        }, {
            description: 'failure and success',
            expectedFailureCount: 1,
            events: [
                scene1Starts,
                scene1FinishesWith(executionSuccessful),
                scene1FinishedWith(executionSuccessful),
                scene2Starts,
                scene2FinishesWith(executionFailedWithError),
                scene2FinishedWith(executionFailedWithError)
            ]
        } ]).it('returns the number of scenarios that failed', ({ events, expectedFailureCount }) => {
            when(notifier).receives(
                testRunStarts,
                ...events,
                testRunFinishes,
                testRunFinished,
            );

            expect(notifier.failureCount()).to.equal(expectedFailureCount);
        });

        given([
            { description: 'successful', expectedFailureCount: 0, outcome: executionSuccessful },
            { description: 'skipped', expectedFailureCount: 0, outcome: executionSkipped },
            { description: 'ignored', expectedFailureCount: 0, outcome: executionIgnored },
            { description: 'pending', expectedFailureCount: 1, outcome: implementationPending },
            { description: 'assertion failure', expectedFailureCount: 1, outcome: executionFailedWithAssertionError },
            { description: 'error', expectedFailureCount: 1, outcome: executionFailedWithError },
            { description: 'compromised', expectedFailureCount: 1, outcome: executionCompromised },
        ]).it('counts results above the success threshold as successful', ({ expectedFailureCount, outcome }) => {
            when(notifier).receives(
                testRunStarts,
                scene1Starts,
                scene1FinishesWith(outcome),
                scene1FinishedWith(outcome),
                testRunFinishes,
                testRunFinished,
            );

            expect(notifier.failureCount()).to.equal(expectedFailureCount);
        });

        it('does not count retried scenarios', () => {
            when(notifier).receives(
                testRunStarts,
                retryableSceneStarts(0),
                retryableSceneDetected(0),
                retryableSceneFinishesWith(0, executionIgnored),
                retryableSceneFinishedWith(0, executionIgnored),

                retryableSceneStarts(1),
                retryableSceneDetected(1),
                retryableSceneFinishesWith(1, executionIgnored),
                retryableSceneFinishedWith(1, executionIgnored),

                retryableSceneStarts(2),
                retryableSceneDetected(2),
                retryableSceneFinishesWith(2, executionSuccessful),
                retryableSceneFinishedWith(2, executionSuccessful),

                testRunFinishes,
                testRunFinished,
            );

            expect(notifier.failureCount()).to.equal(0);
        });
    });

    describe('notifications', () => {

        it('emits events when a test suite starts and is finished', () => {
            when(notifier).receives(
                testRunStarts,
                testSuiteStarts(0, 'Checkout'),
                testSuiteFinished(0, 'Checkout', executionSuccessful),
                testRunFinishes,
                testRunFinished,
            );

            expect(reporter.emit.getCalls().map(_ => _.args)).to.deep.equal([
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ]
            ])
        });

        it('emits events when a nested test suite starts and is finished', () => {
            when(notifier).receives(
                testRunStarts,
                testSuiteStarts(0, 'Checkout'),
                testSuiteStarts(1, 'Credit card payment'),
                testSuiteFinished(1, 'Credit card payment', executionSuccessful),
                testSuiteFinished(0, 'Checkout', executionSuccessful),
                testRunFinishes,
                testRunFinished,
            );

            expect(reporter.emit.getCalls().map(_ => _.args)).to.deep.equal([
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ]
            ]);
        });

        it('emits events when a nested test starts and is finished', () => {
            when(notifier).receives(
                testRunStarts,
                testSuiteStarts(0, 'Checkout'),
                testSuiteStarts(1, 'Credit card payment'),
                scene1Starts,
                scene1FinishesWith(executionSuccessful),
                scene1FinishedWith(executionSuccessful),
                testSuiteFinished(1, 'Credit card payment', executionSuccessful),
                testSuiteFinished(0, 'Checkout', executionSuccessful),
                testRunFinishes,
                testRunFinished,
            );

            expect(reporter.emit.getCalls().map(_ => _.args)).to.deep.equal([
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],

                [
                    'test:start',
                    {
                        cid,
                        file: 'payments/checkout.feature',
                        fullTitle: 'Checkout Credit card payment Paying with a default card',
                        parent: 'Credit card payment',
                        pending: false,
                        'specs': [
                            '/users/jan/project/feature.spec.ts',
                        ],
                        title: 'Paying with a default card',
                        type: 'test:start',
                        uid: scene1Id.value,
                    }
                ],
                [
                    'test:pass',
                    {
                        cid,
                        duration: 500,
                        file: 'payments/checkout.feature',
                        fullTitle: 'Checkout Credit card payment Paying with a default card',
                        parent: 'Credit card payment',
                        pending: false,
                        'specs': [
                            '/users/jan/project/feature.spec.ts',
                        ],
                        title: 'Paying with a default card',
                        type: 'test:pass',
                        uid: scene1Id.value,
                    }
                ],
                [
                    'test:end',
                    {
                        cid,
                        duration: 500,
                        file: 'payments/checkout.feature',
                        fullTitle: 'Checkout Credit card payment Paying with a default card',
                        parent: 'Credit card payment',
                        pending: false,
                        'specs': [
                            '/users/jan/project/feature.spec.ts',
                        ],
                        title: 'Paying with a default card',
                        type: 'test:end',
                        uid: scene1Id.value,
                    }
                ],

                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ]
            ]);
        })
    });

    describe('hooks', () => {

        describe('when scenario is successful', () => {

            beforeEach(() => {
                when(notifier).receives(
                    testRunStarts,
                    testSuiteStarts(0, 'Checkout'),
                    testSuiteStarts(1, 'Credit card payment'),
                    scene1Starts,
                    scene1FinishesWith(executionSuccessful),
                    scene1FinishedWith(executionSuccessful),
                    testSuiteFinished(1, 'Credit card payment', executionSuccessful),
                    testSuiteFinished(0, 'Checkout', executionSuccessful),
                    testRunFinishes,
                    testRunFinished,
                );
            });

            it('invokes beforeSuite when TestSuiteStarts', () => {

                expect(config.beforeSuite.getCalls().map(_ => _.args)).to.deep.equal([ [ {
                    type: 'suite:start',
                    uid: 'suite-0',
                    cid: '0-0',
                    title: 'Checkout',
                    fullTitle: 'Checkout',
                    parent: '',
                    file: 'payments/checkout.feature',
                    specs: [ '/users/jan/project/feature.spec.ts' ],
                    pending: false
                } ], [ {
                    type: 'suite:start',
                    uid: 'suite-1',
                    cid,
                    title: 'Credit card payment',
                    fullTitle: 'Checkout Credit card payment',
                    parent: 'Checkout',
                    file: 'payments/checkout.feature',
                    specs,
                    pending: false
                } ] ]);
            });

            it('invokes afterSuite when TestSuiteFinished', () => {

                expect(config.afterSuite.getCalls().map(_ => _.args)).to.deep.equal([ [ {
                    type: 'suite:end',
                    uid: 'suite-1',
                    cid,
                    title: 'Credit card payment',
                    fullTitle: 'Checkout Credit card payment',
                    parent: 'Checkout',
                    file: 'payments/checkout.feature',
                    specs,
                    pending: false,
                    duration: 500
                } ], [ {
                    type: 'suite:end',
                    uid: 'suite-0',
                    cid,
                    title: 'Checkout',
                    fullTitle: 'Checkout',
                    parent: '',
                    file: 'payments/checkout.feature',
                    specs,
                    pending: false,
                    duration: 500
                } ] ]);
            });

            it('invokes beforeTest when SceneStarts', () => {
                const expectedContext = {};

                expect(config.beforeTest.getCalls().map(_ => _.args)).to.deep.equal([
                    [
                        {
                            ctx: expectedContext,
                            file: 'payments/checkout.feature',
                            fullName: 'Checkout Credit card payment Paying with a default card',
                            fullTitle: 'Checkout Credit card payment Paying with a default card',
                            parent: 'Credit card payment',
                            pending: false,
                            title: 'Paying with a default card',
                            type: 'test',
                        },
                        expectedContext,
                    ],
                ]);
            });

            it('invokes afterTest when SceneFinished with success', () => {
                const expectedContext = {};
                const expectedResult: Frameworks.TestResult = {
                    passed: true,
                    duration: 500,
                    retries: {
                        limit: 0,
                        attempts: 0,
                    },
                    exception: '',
                    status: 'passed',
                };

                expect(config.afterTest.getCalls().map(_ => _.args)).to.deep.equal([
                    [
                        {
                            ctx: {},
                            file: 'payments/checkout.feature',
                            fullName: 'Checkout Credit card payment Paying with a default card',
                            fullTitle: 'Checkout Credit card payment Paying with a default card',
                            parent: 'Credit card payment',
                            pending: false,
                            title: 'Paying with a default card',
                            type: 'test',
                        },
                        expectedContext,
                        expectedResult
                    ],
                ]);
            });
        });

        describe('when scenario is not successful', () => {

            it('invokes afterTest when SceneFinished with assertion error', () => {

                when(notifier).receives(
                    testRunStarts,
                    testSuiteStarts(0, 'Checkout'),
                    testSuiteStarts(1, 'Credit card payment'),
                    scene1Starts,
                    scene1FinishesWith(executionFailedWithAssertionError),
                    scene1FinishedWith(executionFailedWithAssertionError),
                    testSuiteFinished(1, 'Credit card payment', executionFailedWithAssertionError),
                    testSuiteFinished(0, 'Checkout', executionFailedWithAssertionError),
                    testRunFinishes,
                    testRunFinished,
                );

                const expectedContext = {};

                const [ test, context, result ] = config.afterTest.getCall(0).args;

                expect(test).to.deep.equal({
                    ctx: expectedContext,
                    file: 'payments/checkout.feature',
                    fullName: 'Checkout Credit card payment Paying with a default card',
                    fullTitle: 'Checkout Credit card payment Paying with a default card',
                    parent: 'Credit card payment',
                    pending: false,
                    title: 'Paying with a default card',
                    type: 'test',
                });

                expect(context).to.deep.equal(expectedContext);
                expect(result.duration).to.equal(500);
                expect(result.exception).to.equal('Expected false to be true');
                expect(result.passed).to.equal(false);
                expect(result.status).to.equal('failed');
                expect(result.retries).to.deep.equal({ attempts: 0, limit: 0 });
                expect(result.error.message).to.equal('Expected false to be true');
                expect(result.error.name).to.equal('AssertionError');
                expect(result.error.type).to.equal('AssertionError');
                expect(result.error.stack).to.match(/^AssertionError: Expected false to be true/);
            });
        });
    });
})
