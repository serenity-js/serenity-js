import { JSONObject } from '../io/json';

/**
 * A JSON object which needs to be returned to Protractor when SerenityProtractorFramework
 * is done with executing the tests.
 *
 * @link https://github.com/angular/protractor/blob/master/lib/frameworks/README.md#requirements
 */
export interface FullReport extends JSONObject {
    scenes: SceneReport[];
}

export interface SceneReport extends JSONObject {
    id: string;
    title: string;
    name: string;
    description: string;
    context: string;
    testSource?: string;
    // testCaseName: string;
    startTime: number;
    duration: number;
    sessionId?: string;
    manual: boolean;
    result: string;
    userStory: UserStoryReport;
    tags: TagReport[];
    issues: string[];
    testSteps: ActivityReport[];

    testFailureCause?: ErrorReport;
    testFailureClassname?: string;
    testFailureMessage?: string;
    annotatedResult?: string;
}

export interface ActivityReport extends JSONObject {
    number?: number;
    description: string;
    duration: number;
    startTime: number;
    screenshots: ScreenshotReport[];
    result: string;
    children?: ActivityReport[];
    exception?: ErrorReport;
}

export interface UserStoryReport extends JSONObject {
    id: string;
    storyName: string;
    storyClassName?: string;
    path: string;
    type: string;
}

export interface TagReport extends JSONObject {
    name: string;
    type: string;
}

export interface ErrorReport extends JSONObject {
    errorType: string;
    message: string;
    stackTrace: ErrorReportStackFrame[];
}

export interface ErrorReportStackFrame extends JSONObject {
    declaringClass: string;
    methodName: string;
    fileName: string;
    lineNumber: number;
}

export interface ScreenshotReport extends JSONObject {
    screenshot: string;
}
