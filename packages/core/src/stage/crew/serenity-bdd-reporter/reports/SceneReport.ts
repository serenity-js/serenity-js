import { JSONObject, match } from 'tiny-types';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports
import { inspect } from 'util';

import { Path } from '../../../../io';
import {
    ActivityDetails,
    BrowserTag,
    CapabilityTag,
    ContextTag,
    Description,
    ExecutionSuccessful,
    FeatureTag,
    IssueTag,
    ManualTag,
    Name,
    Outcome, RequestAndResponse,
    ScenarioDetails,
    ScenarioParameters,
    Tag,
    ThemeTag,
    Timestamp,
} from '../../../../model';
import {
    DataTable,
    DataTableDataSetDescriptor,
    ErrorDetails,
    SerenityBDDReport,
    TestStep,
} from '../SerenityBDDJsonSchema';
import { IDGenerator } from './IDGenerator';
import { OutcomeMapper } from './OutcomeMapper';

/** @access private */
function extractValues<T>(dictionary: {[key: string]: T}) {
    return Object.keys(dictionary).map(key => dictionary[key]);
}

/** @access private */
interface ScenarioParametersResultLocation {
    parameters: ScenarioParameters;
    line: number;
    index: number;
    outcome?: Outcome;
}

/** @access package */
export class SceneReport {
    private static outcomeMapper = new OutcomeMapper();
    private static idGenerator = new IDGenerator();

    private readonly report: Partial<SerenityBDDReport> & { children?: Array<Partial<TestStep>> };
    private readonly activities = new ActivityStack();
    private readonly parameters: ScenarioParametersResultLocation[] = [];
    private stepNumber = 0;

    constructor(public readonly scenarioDetails: ScenarioDetails) {

        this.report = {
            name:   this.scenarioDetails.name.value,
            title:  this.scenarioDetails.name.value,
            id:     SceneReport.idGenerator.generateFrom(this.scenarioDetails.category, this.scenarioDetails.name),
            manual: false,
            testSteps: [],
            get children() {
                // fake reference to make the report and the test step interfaces compatible
                // removed in 'toJSON'
                return this.testSteps;
            },
            userStory: {
                id:         SceneReport.idGenerator.generateFrom(this.scenarioDetails.category),
                storyName:  this.scenarioDetails.category.value,
                path:       this.scenarioDetails.location.path.value,
                type:       'feature',
            },
        };

        this.activities.push(this.report);
    }

    executionStartedAt(time: Timestamp): SceneReport {
        return this.withMutated(report => {
            report.startTime = report.startTime || time.toMillisecondTimestamp();
        });
    }

    executedBy(testRunner: Name): SceneReport {
        return this.withMutated(report => {
            report.testSource = testRunner.value;
        });
    }

    taggedWith(tag: Tag) {
        return this.withMutated(report => {
            const nameOfRecorded = (typeOfTag: { Type: string }) => (report.tags.find(t => t.type === typeOfTag.Type) || { name: void 0 }).name;
            const concatenated = (...names: string[]): string => names.filter(name => !! name).join('/');

            const serialisedTag = tag.toJSON();

            if (! report.tags) {
                report.tags = [];
            }

            match<Tag, void>(tag)
                .when(ManualTag,     _ => report.manual = true)
                .when(CapabilityTag, _ => serialisedTag.name = concatenated(nameOfRecorded(ThemeTag), tag.name))
                .when(FeatureTag,    _ => {
                    serialisedTag.name = concatenated(nameOfRecorded(CapabilityTag), tag.name);
                    report.featureTag = tag.toJSON();
                })
                .when(IssueTag,      _ => (report.issues    = report.issues   || []).push(tag.name))
                .when(BrowserTag,    _ => (report.context   = report.context  || tag.name))
                .when(ContextTag,    _ => (report.context   = tag.name))
                .else(_ => void 0);

            if (! report.tags.find(current => equal(current, serialisedTag))) {
                report.tags.push(serialisedTag);
            }
        });
    }

    executionFinishedAt(time: Timestamp): SceneReport {
        return this.withMutated(report => {
            report.duration = Timestamp.fromMillisecondTimestamp(report.startTime).diff(time).milliseconds;
        });
    }

    activityStarted(activity: ActivityDetails, time: Timestamp) {
        return this.withMutated(report => {
            const activityReport: Partial<TestStep> = {
                number:      ++this.stepNumber,
                description: activity.name.value,
                startTime:   time.toMillisecondTimestamp(),
                children:    [],
                screenshots: [],
            };

            this.activities.last().children.push(activityReport as any);
            this.activities.push(activityReport);
        });
    }

    activityFinished(value: ActivityDetails, outcome: Outcome, time: Timestamp) {
        return this.withMutated(report => this.mapOutcome(outcome, (result: string, error?: ErrorDetails) => {

            const activityReport = this.activities.pop();

            activityReport.result    = result;
            activityReport.duration  = Timestamp.fromMillisecondTimestamp(activityReport.startTime).diff(time).milliseconds;

            if (!! error && ! this.activities.haveFailed) {
                activityReport.exception = error;
                this.activities.haveFailed = true;
            }
        }));
    }

    withBackgroundOf(name: Name, description: Description) {
        return this.withMutated(report => {
            report.backgroundTitle       = name.value;
            report.backgroundDescription = description.value;
        });
    }

    withDescriptionOf(description: Description) {
        return this.withMutated(report => {
            report.description = description.value;
        });
    }

    withScenarioOutline(outline: Description) {
        return this.withMutated(report => {
            report.dataTable = this.dataTableFrom(report);

            report.dataTable.scenarioOutline = outline.value;
        });
    }

    withScenarioParametersOf(scenario: ScenarioDetails, parameters: ScenarioParameters) {

        const
            parameterSetName = parameters.name && parameters.name.value,
            parameterSetDescription = parameters.description && parameters.description.value;

        const matches = (params: ScenarioParameters) => (descriptor: DataTableDataSetDescriptor) => {
            return descriptor.name === parameterSetName
                && descriptor.description === parameterSetDescription;
        };

        return this.withMutated(report => {
            report.dataTable = this.dataTableFrom(report);
            report.dataTable.headers = Object.keys(parameters.values);

            let descriptor: DataTableDataSetDescriptor = report.dataTable.dataSetDescriptors.find(matches(parameters));

            if (! descriptor) {
                descriptor = {
                    name:           parameterSetName,
                    description:    parameterSetDescription,
                    startRow:       report.dataTable.dataSetDescriptors.reduce((acc, current) => acc + current.rowCount, 0),
                    rowCount:       0,
                };

                report.dataTable.dataSetDescriptors.push(descriptor);
            }

            descriptor.rowCount++;

            const length = report.dataTable.rows.push(({
                values: extractValues(parameters.values),
            }));

            this.parameters.push({ parameters, index: length - 1, line: scenario.location.line });
        });
    }

    withFeatureNarrativeOf(description: Description) {
        return this.withMutated(report => {
            report.userStory.narrative = description.value;
        });
    }

    photoTaken(path: Path) {
        return this.withMutated(report => {
            this.activities.mostRecentlyAccessedItem().screenshots.push({ screenshot: path.basename() });
        });
    }

    arbitraryDataCaptured(name: Name, contents: string) {
        return this.withMutated(report => {
            this.activities.mostRecentlyAccessedItem().reportData = { title: name.value, contents };
        });
    }

    httpRequestCaptured(requestResponse: RequestAndResponse) {
        function mapToString(dictionary: {[key: string]: string}) {
            return Object.keys(dictionary).map(key => `${key}: ${dictionary[key]}`).join('\n');
        }

        return this.withMutated(report => {
            this.activities.mostRecentlyAccessedItem().restQuery = {
                method:          requestResponse.request.method.toUpperCase(),
                path:            requestResponse.request.url,
                content:         inspect(requestResponse.request.data),
                contentType:     requestResponse.request.headers['Content-Type'] || '', // todo: add a case insensitive proxy around this RFC 2616: 4.2
                requestHeaders:  mapToString(requestResponse.request.headers)  || '',
                requestCookies:  requestResponse.request.headers.Cookie || '', // todo: add a case insensitive proxy around this RFC 2616: 4.2
                statusCode:      requestResponse.response.status,
                responseHeaders: mapToString(requestResponse.response.headers) || '',
                responseCookies: requestResponse.response.headers.Cookie || '', // todo: add a case insensitive proxy around this RFC 2616: 4.2
                responseBody:    inspect(requestResponse.response.data) || '',
            };
        });
    }

    executionFinishedWith(scenario: ScenarioDetails, outcome: Outcome): SceneReport {
        return this.withMutated(report => this.mapOutcome(outcome, (result: string, error: ErrorDetails = undefined) => {

            report.result           = result;
            report.testFailureCause = error;

            if (this.parameters.length > 0) {
                const entry = this.parameters.find(p => p.line === scenario.location.line);
                if (!! entry) {
                    entry.outcome = outcome;

                    report.dataTable.rows[ entry.index ].result = result;

                    const worstOutcomeOverall = this.parameters
                        .filter(p => !! p.outcome)
                        .map(p => p.outcome)
                        .reduce((worstSoFar, current) => {
                            return current.isWorseThan(worstSoFar)
                                ? current
                                : worstSoFar;
                        }, new ExecutionSuccessful());

                    this.mapOutcome(worstOutcomeOverall, (r: string, e: ErrorDetails = undefined) => {
                        report.result           = r;
                        report.testFailureCause = e;
                    });
                }
            }
        }));
    }

    toJSON(): Partial<SerenityBDDReport> {
        const report = this.copyOf(this.report);

        delete report.children; // remove the fake reference

        this.parameters.forEach(entry => {

            const parameters = entry.parameters.values;
            const stringified = Object.keys(parameters).map(key => `${ key }: ${ parameters[key] }`).join(', ').trim();

            report.testSteps[entry.index].description += ` #${ entry.index + 1 } - ${ stringified }`;
        });

        // todo: optimise the report, remove empty arrays
        return report;
    }

    private dataTableFrom(report: Partial<SerenityBDDReport>): DataTable {
        return report.dataTable || {
            scenarioOutline: '',
            dataSetDescriptors: [],
            headers: [],
            rows: [],
            predefinedRows: true,
        };
    }

    private mapOutcome(outcome: Outcome, mapAs: (result: string, error?: ErrorDetails) => void) {
        return SceneReport.outcomeMapper.mapOutcome(outcome, mapAs);
    }

    private withMutated(mutate: (copied: Partial<SerenityBDDReport>) => void): SceneReport {
        mutate(this.report);

        return this;
    }

    private copyOf<T extends JSONObject>(json: T): T {
        return JSON.parse(JSON.stringify(json));
    }
}

/** @access private */
class ActivityStack {
    public haveFailed: boolean = false;
    private readonly items: Array<Partial<TestStep>> = [];
    private mostRecent: Partial<TestStep> = undefined;

    push(item: Partial<TestStep>): Partial<TestStep> {
        this.items.push(item);
        this.mostRecent = item;
        this.haveFailed = false;

        return this.mostRecent;
    }

    pop() {
        const item = this.items.pop();
        if (this.items.length === 0) {
            this.haveFailed = false;
        }

        this.mostRecent = item;

        return this.mostRecent;
    }

    last() {
        return this.items[this.items.length - 1];
    }

    mostRecentlyAccessedItem() {
        return this.mostRecent;
    }
}
