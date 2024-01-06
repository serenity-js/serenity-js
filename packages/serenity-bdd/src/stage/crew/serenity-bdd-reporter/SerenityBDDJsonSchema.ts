import type { JSONObject } from 'tiny-types';

// https://github.com/serenity-bdd/serenity-core/tree/50a3b1824001f192da2cdca6326d7525d4dd7f25/serenity-model/src/test/resources
// https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/TestOutcome.java

/** @package */
export interface SerenityBDD3ReportSchema extends JSONObject {
    backgroundDescription?: string;
    additionalIssues?: string[];
    backgroundTitle?: string;
    context?: string;
    dataTable?: DataTable;
    description: string;
    driver?: string;
    duration: number;
    featureTag: Tag;
    id: string;
    issues?: string[];
    manual: boolean;                 // todo [ ]     protractor
    name: string;                 // todo [ ]     protractor
    projectKey: string;                    // todo [ ]     protractor     'chrome:jill'
    result: string;
    rule: BusinessRule;
    sessionId?: string;
    startTime: number;
    tags: Tag[];
    testFailureCause?: ErrorDetails;
    testFailureClassname?: string;
    testFailureMessage?: string;
    testFailureSummary?: string;
    testSource: string;
    testSteps: TestStep[];
    title: string;
    userStory: UserStory;
}

export interface BusinessRule extends JSONObject {
    name: string;
    description?: string;
}

export interface TestStep extends JSONObject {
    children?: TestStep[];
    description: string;
    duration: number;
    exception?: ErrorDetails;
    number: number;
    reportData: ReportData[];
    restQuery?: RESTQuery;
    result: string;
    screenshots?: Screenshot[];
    startTime: number;
    // precondition: false;             // not needed?
}

// https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/ReportData.java
export interface ReportData extends JSONObject {
    contents: string;
    id: string;
    isEvidence: boolean;
    path: string;
    title: string;
}

/**
 * https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/screenshots/ScreenshotAndHtmlSource.java
 */
export interface Screenshot extends JSONObject {
    htmlSource?: string;
    screenshot: string;
    timeStamp: number;     // "htmlSource": "pagesource7953468346968205961.html.txt"
}

export interface UserStory extends JSONObject {
    id: string;             // dashified feature name
    narrative?: string;      // feature name
    path: string;           // relative feature file path
    storyName: string;           // 'feature'
    type: string;     // cucumber narrative, if any
}

export interface Tag extends JSONObject {
    displayName: string;
    name: string;
    type: string;
}

export interface DataTable extends JSONObject {
    dataSetDescriptors: DataTableDataSetDescriptor[];
    headers: string[];
    predefinedRows: boolean;
    rows: DataTableRow[];
    scenarioOutline: string;
}

export interface DataTableRow extends JSONObject {
    values: string[];
    result?: string;
}

export interface DataTableDataSetDescriptor extends JSONObject {
    description: string;
    name: string;
    rowCount: number;
    startRow: number;
}

export interface RESTQuery extends JSONObject {
    content: string;
    contentType: string;
    method: string;
    path: string;
    requestCookies: string;
    requestHeaders: string;
    responseBody: string;
    responseCookies: string;
    responseHeaders: string;
    statusCode: number;
}

export interface ErrorDetails extends JSONObject {
    errorType: string;
    message: string;
    stackTrace: Array<{
        declaringClass: string,
        methodName: string,
        fileName: string,
        lineNumber: number,
    }>;
    rootCause?: ErrorDetails;
}
