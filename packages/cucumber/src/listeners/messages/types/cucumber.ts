/*
 * Cucumber interfaces duplicated here to avoid having to depend on the
 * '@cucumber/cucumber' package, which won't be available on projects
 * using older versions.
 */

import {
    Attachment,
    Envelope,
    GherkinDocument,
    Pickle,
    PickleStepArgument,
    TestCase,
    TestCaseFinished,
    TestCaseStarted,
    TestStepFinished,
    TestStepResult,
    UndefinedParameterType,
} from '@cucumber/messages';

/**
 * https://github.com/cucumber/cucumber-js/blob/3d8d2327c794c01fd9c9fca58f4f924b9f9bde7a/src/formatter/helpers/event_data_collector.ts#L15
 *
 * @package
 */
export interface ITestCaseAttempt {
    attempt: number;
    gherkinDocument: GherkinDocument;
    pickle: Pickle;
    stepAttachments: { [ key: string ]: Attachment[] };
    stepResults: { [ key: string ]: TestStepResult };
    testCase: TestCase;
    worstTestStepResult: TestStepResult;
}

/**
 * https://github.com/cucumber/cucumber-js/blob/3d8d2327c794c01fd9c9fca58f4f924b9f9bde7a/src/formatter/helpers/event_data_collector.ts#L25
 *
 * @package
 */
export interface EventDataCollector {
    readonly undefinedParameterTypes: UndefinedParameterType[];
    getGherkinDocument(uri: string): GherkinDocument;
    getPickle(pickleId: string): Pickle;
    getTestCaseAttempts(): ITestCaseAttempt[];
    getTestCaseAttempt(testCaseStartedId: string): ITestCaseAttempt;
    parseEnvelope(envelope: Envelope): void;
    initTestCaseAttempt(testCaseStarted: TestCaseStarted): void;
    storeAttachment({ testCaseStartedId, testStepId, body, mediaType, }: Attachment): void;
    storeTestStepResult({ testCaseStartedId, testStepId, testStepResult, }: TestStepFinished): void;
    storeTestCaseResult({ testCaseStartedId }: TestCaseFinished): void;
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
    argument?: PickleStepArgument;
    attachments: Attachment[];
    keyword: string;
    result: TestStepResult;
    snippet?: string;
    sourceLocation?: ILineAndUri;
    text?: string;
}
