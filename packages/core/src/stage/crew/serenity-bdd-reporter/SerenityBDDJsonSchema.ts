/** @access package */

import { JSONObject } from 'tiny-types';

// https://github.com/serenity-bdd/serenity-core/tree/50a3b1824001f192da2cdca6326d7525d4dd7f25/serenity-model/src/test/resources
// https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/TestOutcome.java

export interface SerenityBDDReport extends JSONObject {
    name: string;                       // done [x]
    id: string;                         // done [x]
    testSteps: TestStep[];              // todo [ ]
    userStory: UserStory;               // todo [~]    cucumber
    // https://github.com/serenity-bdd/serenity-core/blob/c89cd6ee4127738ac88525d29d99537921f34701/
    // serenity-core/src/test/resources/historical-reports/sample-report-4.json

    featureTag: Tag;                    // done [x]
    title: string;                      // done [x]
    description: string;                // done [x]
    tags: Tag[];                        // done [x]
    startTime: number;                  // done [x]
    duration: number;                   // done [x]
    projectKey: string;                 // todo [ ]     protractor                                                  <- this typically comes from an env variable
    sessionId?: string;                 // todo [ ]     protractor                                                  <- how is this used?
    driver?: string;                    // todo [ ]     protractor     'chrome:jill'                                <- how is this used?
    context?: string;                   // done [x]
    dataTable?: DataTable;              // done [x]     cucumber                                                    <- can I use this with mocha?
    manual: boolean;                    // done [x]
    issues?: string[];                  // done [x]
    testSource: string;                 // done [x]
    result: string;                     // done [x]
    testFailureCause?: ErrorDetails;    // done [x]
    backgroundTitle?: string;           // todo [ ]     cucumber
    backgroundDescription?: string;     // todo [ ]     cucumber
}

export interface TestStep extends JSONObject {
    number: number;                     // done [x]
    description: string;                // done [x]
    duration: number;                   // done [x]
    startTime: number;                  // done [x]
    result: string;                     // done [x]
    children?: TestStep[];              // done [x]
    screenshots?: Screenshot[];         // done [x]
    reportData?: ReportData;            // done [x]
    restQuery?: RESTQuery;              // done [x]
    exception?: ErrorDetails;           // done [X]
    // precondition: false;             // not needed?
}

// https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/ReportData.java
export interface ReportData extends JSONObject {
    title: string;
    contents: string;
}

/**
 * https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/screenshots/ScreenshotAndHtmlSource.java
 */
export interface Screenshot extends JSONObject {
    screenshot: string;
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
}
