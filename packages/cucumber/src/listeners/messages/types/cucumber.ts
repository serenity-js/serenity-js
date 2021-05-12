/*
 * Cucumber interfaces duplicated here to avoid having to depend on the
 * '@cucumber/cucumber' package, which won't be available on projects
 * using older versions.
 */

import { messages } from '@cucumber/messages';

/**
 * https://github.com/cucumber/cucumber-js/blob/3d8d2327c794c01fd9c9fca58f4f924b9f9bde7a/src/formatter/helpers/event_data_collector.ts#L15
 *
 * @package
 */
export interface ITestCaseAttempt {
    attempt: number;
    gherkinDocument: messages.IGherkinDocument;
    pickle: messages.IPickle;
    stepAttachments: { [ key: string ]: messages.IAttachment[] };
    stepResults: { [ key: string ]: messages.TestStepFinished.ITestStepResult };
    testCase: messages.ITestCase;
    worstTestStepResult: messages.TestStepFinished.ITestStepResult;
}

/**
 * https://github.com/cucumber/cucumber-js/blob/3d8d2327c794c01fd9c9fca58f4f924b9f9bde7a/src/formatter/helpers/event_data_collector.ts#L25
 *
 * @package
 */
export interface EventDataCollector {
    readonly undefinedParameterTypes: messages.IUndefinedParameterType[];
    getGherkinDocument(uri: string): messages.IGherkinDocument;
    getPickle(pickleId: string): messages.IPickle;
    getTestCaseAttempts(): ITestCaseAttempt[];
    getTestCaseAttempt(testCaseStartedId: string): ITestCaseAttempt;
    parseEnvelope(envelope: messages.Envelope): void;
    initTestCaseAttempt(testCaseStarted: messages.ITestCaseStarted): void;
    storeAttachment({ testCaseStartedId, testStepId, body, mediaType, }: messages.IAttachment): void;
    storeTestStepResult({ testCaseStartedId, testStepId, testStepResult, }: messages.ITestStepFinished): void;
    storeTestCaseResult({ testCaseStartedId }: messages.ITestCaseFinished): void;
}

/**
 * https://github.com/cucumber/cucumber-js/blob/eaaca2d7063c34aa17e33d66fc386c46ec99dd25/src/types/index.ts#L1
 *
 * @package
 */
export interface ILineAndUri {
    line: number;
    uri: string;
}

/**
 * https://github.com/cucumber/cucumber-js/blob/eaaca2d7063c34aa17e33d66fc386c46ec99dd25/src/formatter/helpers/test_case_attempt_parser.ts#L18
 *
 * @package
 */
export interface IParsedTestStep {
    actionLocation?: ILineAndUri;
    argument?: messages.IPickleStepArgument;
    attachments: messages.IAttachment[];
    keyword: string;
    result: messages.TestStepFinished.ITestStepResult;
    snippet?: string;
    sourceLocation?: ILineAndUri;
    text?: string;
}
