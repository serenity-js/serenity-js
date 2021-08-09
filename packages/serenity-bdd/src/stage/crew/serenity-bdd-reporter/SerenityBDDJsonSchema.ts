import { JSONObject } from 'tiny-types';

// https://github.com/serenity-bdd/serenity-core/tree/50a3b1824001f192da2cdca6326d7525d4dd7f25/serenity-model/src/test/resources
// https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/TestOutcome.java

/** @package */
export interface SerenityBDDReport extends JSONObject {
    name: string;
    id: string;
    testSteps: TestStep[];
    userStory: UserStory;
    // https://github.com/serenity-bdd/serenity-core/blob/c89cd6ee4127738ac88525d29d99537921f34701/
    // serenity-core/src/test/resources/historical-reports/sample-report-4.json

    featureTag: Tag;
    title: string;
    description: string;
    tags: Tag[];
    startTime: number;
    duration: number;
    rule: BusinessRule;
    projectKey: string;                 // todo [ ]     protractor
    sessionId?: string;                 // todo [ ]     protractor
    driver?: string;                    // todo [ ]     protractor     'chrome:jill'
    context?: string;
    dataTable?: DataTable;
    manual: boolean;
    issues?: string[];
    additionalIssues?: string[];
    testSource: string;
    result: string;
    testFailureCause?: ErrorDetails;
    testFailureClassname?: string;
    testFailureMessage?: string;
    testFailureSummary?: string;
    backgroundTitle?: string;
    backgroundDescription?: string;
}

export interface BusinessRule extends JSONObject {
    name: string;
    description?: string;
}

export interface TestStep extends JSONObject {
    number: number;
    description: string;
    duration: number;
    startTime: number;
    result: string;
    children?: TestStep[];
    screenshots?: Screenshot[];
    reportData: ReportData[];
    restQuery?: RESTQuery;
    exception?: ErrorDetails;
    // precondition: false;             // not needed?
}

// https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/ReportData.java
export interface ReportData extends JSONObject {
    id: string;
    isEvidence: boolean;
    path: string;
    title: string;
    contents: string;
}

/**
 * https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/screenshots/ScreenshotAndHtmlSource.java
 */
export interface Screenshot extends JSONObject {
    screenshot: string;
    timeStamp: number;
    htmlSource?: string;     // "htmlSource": "pagesource7953468346968205961.html.txt"
}

export interface UserStory extends JSONObject {
    id: string;             // dashified feature name
    storyName: string;      // feature name
    path: string;           // relative feature file path
    type: string;           // 'feature'
    narrative?: string;     // cucumber narrative, if any
}

export interface Tag extends JSONObject {
    name: string;
    displayName: string;
    type: string;
}

export interface DataTable extends JSONObject {
    headers: string[];
    rows: DataTableRow[];
    predefinedRows: boolean;
    scenarioOutline: string;
    dataSetDescriptors: DataTableDataSetDescriptor[];
}

export interface DataTableRow extends JSONObject {
    values: string[];
    result?: string;
}

export interface DataTableDataSetDescriptor extends JSONObject {
    startRow: number;
    rowCount: number;
    name: string;
    description: string;
}

export interface RESTQuery extends JSONObject {
    method: string;
    path: string;
    content: string;
    contentType: string;
    requestHeaders: string;
    requestCookies: string;
    responseHeaders: string;
    responseCookies: string;
    responseBody: string;
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
