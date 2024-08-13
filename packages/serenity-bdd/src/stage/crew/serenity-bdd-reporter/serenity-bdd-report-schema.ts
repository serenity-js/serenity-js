export interface SerenityBDD4ReportSchema /* extends JSONObject */ {
    actors: ActorSchema[];          // todo this is new
    additionalIssues?: string[];
    annotatedResult?: string;
    backgroundTitle?: string;
    backgroundDescription?: string;
    context: string;
    dataTable?: DataTableSchema;
    description?: string;
    driver?: string;  // todo JUnit 'testCaseName': 'net.serenitybdd.demos.todos.screenplay.completing_todos.CompleteATodo',
    duration: number;
    featureTag?: TagSchema;
    id: string;   // todo: Cucumber scenarios can have descriptions
    isManualTestingUpToDate: boolean;
    issues?: string[];
    manual: boolean;
    methodName: string;
    name: string;
    order?: number;    // todo: Cucumber scenarios can have rules
    projectKey: string;
    result: string;
    rule?: BusinessRuleSchema;
    scenarioId: string;
    sessionId?: string;
    startTime: string;
    tags: TagSchema[]; // todo JUnit 'sessionId': '8fe64e6822ffed061bea2886c264437937c858b7',
    testCaseName?: string;    // todo JUnity 'driver': 'remote',
    testFailureCause?: ErrorDetailsSchema;   // todo Cucumber 'annotatedResult': 'FAILURE',
    testFailureClassname?: string;
    testFailureMessage?: string;
    testFailureSummary?: string;
    testSource: string;
    testSteps: TestStepSchema[];
    title: string;
    userStory: UserStorySchema;
}

export interface UserStorySchema /* extends JSONObject */ {
    displayName: string;
    id: string;
    narrative: string;
    path: string;
    pathElements: PathElementSchema[];  // todo this is new
    storyClassName?: string;            // todo this is new 'net.serenitybdd.demos.todos.screenplay.completing_todos.CompleteATodo',
    storyName: string;
    type: string;
}

export interface PathElementSchema /* extends JSONObject */ {
    name: string;
    description: string;
}

export interface ActorSchema /* extends JSONObject */ {
    name: string;
    can?: string[];
    has?: string[];
}

export interface TagSchema /* extends JSONObject */ {
    displayName: string;
    name: string;
    type: string;
}

export interface BusinessRuleSchema /* extends JSONObject */ {
    name: string;
    description: string;
    background?: BackgroundSchema;
}

export interface BackgroundSchema /* extends JSONObject */ {
    name: string;
    description: string;
    steps?: string[];   // todo: that's new 'When he adds \u0027Buy some milk\u0027 to his list  '
}

export interface ErrorDetailsSchema /* extends JSONObject */ {
    errorType: string;
    message: string;
    rootCause?: ErrorDetailsSchema;
    stackTrace: StackTraceSchema[];
}

export interface StackTraceSchema /* extends JSONObject */ {
    declaringClass: string;
    fileName: string;
    lineNumber: number;
    methodName: string;
}

export interface TestStepSchema /* extends JSONObject */ {
    children?: TestStepSchema[];
    description: string;
    duration: number;
    exception?: ErrorDetailsSchema;
    level?: number;  // todo this is new and doesn't seem to be used
    number: number;
    precondition?: boolean;  // todo this is new and doesn't seem to be used
    reportData?: ReportDataSchema[];
    restQuery?: RESTQuerySchema;
    result: string;
    screenshots?: ScreenshotAndHtmlSourceSchema[];
    startTime: string;
}

/**
 * https://github.com/serenity-bdd/serenity-core/blob/main/serenity-model/src/main/java/net/thucydides/model/screenshots/ScreenshotAndHtmlSource.java
 */
export interface ScreenshotAndHtmlSourceSchema /* extends JSONObject */ {
    htmlSource?: string;
    screenshot: string;       // todo: we could remove it in favour of 'screenshotName': https://github.com/serenity-bdd/serenity-core/blob/5bebe8e77cf0c4ea99e0d3d1035d54822bcde9af/serenity-model/src/main/java/net/thucydides/model/screenshots/ScreenshotAndHtmlSource.java#L32
    screenshotName: string;   // this is now preferred over "screenshot": https://github.com/search?q=repo%3Aserenity-bdd%2Fserenity-core%20screenshotName&type=code
    timeStamp: number;
}

/**
 * https://github.com/serenity-bdd/serenity-core/blob/main/serenity-model/src/main/java/net/thucydides/model/domain/ReportData.java
 */
export interface ReportDataSchema /* extends JSONObject */ {
    contents: string;
    id: string;
    isEvidence: boolean;
    path: string;
    title: string;
}

export interface DataTableSchema /* extends JSONObject */ {
    dataSetDescriptors: DataTableDataSetDescriptorSchema[];
    headers: string[];
    predefinedRows: boolean;
    rows: DataTableRowSchema[];
    scenarioOutline: string;
}

export interface DataTableRowSchema /* extends JSONObject */ {
    values: string[];
    result?: string;
}

export interface DataTableDataSetDescriptorSchema /* extends JSONObject */ {
    description: string;
    name: string;
    rowCount: number;
    startRow: number;
}

/**
 * Todo:
 *  - review "parameters', should Serenity/JS populate that?
 *       https://github.com/serenity-bdd/serenity-core/blob/main/serenity-model/src/main/java/net/serenitybdd/model/rest/RestQuery.java#L18C52-L19
 *
 * https://github.com/serenity-bdd/serenity-core/blob/main/serenity-model/src/main/java/net/serenitybdd/model/rest/RestQuery.java
 */
export interface RESTQuerySchema /* extends JSONObject */ {
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
