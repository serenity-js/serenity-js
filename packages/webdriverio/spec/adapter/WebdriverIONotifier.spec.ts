/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { Cast, Clock, Duration, Stage, StageManager } from '@serenity-js/core';
import { given } from 'mocha-testdata';

import { WebdriverIONotifier } from '../../src/adapter/WebdriverIONotifier';
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
    retryableSceneStarts,
    scene1FinishedWith, scene1Id,
    scene1Starts,
    scene2FinishedWith,
    scene2Starts,
    successThreshold,
    testRunFinished,
    testRunFinishes,
    testRunStarts,
    testSuiteFinished,
    testSuiteStarts,
    when
} from './fixtures';
import EventEmitter = require('events');
import sinon = require('sinon');

describe('WebdriverIONotifier', () => {

    const specs = [
        '/users/jan/project/feature.spec.ts'
    ];

    let notifier: WebdriverIONotifier,
        reporter: sinon.SinonStubbedInstance<EventEmitter>,
        stage: Stage;

    beforeEach(() => {

        reporter = sinon.createStubInstance(EventEmitter);

        stage = new Stage(
            Cast.whereEveryoneCan(/* do nothing much */),
            new StageManager(Duration.ofMilliseconds(250), new Clock())
        );

        notifier = new WebdriverIONotifier(
            reporter,
            successThreshold,
            cid,
            specs
        );

        stage.assign(notifier);
    });

    describe('failureCount()', () => {

        given([{
            description: 'no scenarios',
            expectedFailureCount: 0,
            events: []
        }, {
            description: 'all successful',
            expectedFailureCount: 0,
            events: [
                scene1Starts,
                scene1FinishedWith(executionSuccessful)
            ]
        }, {
            description: 'one failure',
            expectedFailureCount: 1,
            events: [
                scene1Starts,
                scene1FinishedWith(executionFailedWithError)
            ]
        }, {
            description: 'two failures',
            expectedFailureCount: 2,
            events: [
                scene1Starts,
                scene1FinishedWith(executionFailedWithError),
                scene2Starts,
                scene2FinishedWith(executionFailedWithError)
            ]
        }, {
            description: 'failure and success',
            expectedFailureCount: 1,
            events: [
                scene1Starts,
                scene1FinishedWith(executionSuccessful),
                scene2Starts,
                scene2FinishedWith(executionFailedWithError)
            ]
        }]).it('returns the number of scenarios that failed', ({ events, expectedFailureCount }) => {
            when(notifier).receives(
                testRunStarts,
                ...events,
                testRunFinishes,
                testRunFinished,
            );

            expect(notifier.failureCount()).to.equal(expectedFailureCount);
        });

        given([
            { description: 'successful',        expectedFailureCount: 0, outcome: executionSuccessful },
            { description: 'skipped',           expectedFailureCount: 0, outcome: executionSkipped },
            { description: 'ignored',           expectedFailureCount: 0, outcome: executionIgnored },
            { description: 'pending',           expectedFailureCount: 1, outcome: implementationPending },
            { description: 'assertion failure', expectedFailureCount: 1, outcome: executionFailedWithAssertionError },
            { description: 'error',             expectedFailureCount: 1, outcome: executionFailedWithError },
            { description: 'compromised',       expectedFailureCount: 1, outcome: executionCompromised },
        ]).it('counts results above the success threshold as successful', ({ expectedFailureCount, outcome }) => {
            when(notifier).receives(
                testRunStarts,
                scene1Starts,
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
                retryableSceneFinishedWith(0, executionIgnored),

                retryableSceneStarts(1),
                retryableSceneDetected(1),
                retryableSceneFinishedWith(1, executionIgnored),

                retryableSceneStarts(2),
                retryableSceneDetected(2),
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
})
