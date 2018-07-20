import { JSONObject, match } from 'tiny-types';

import {
    ActivityDetails,
    AssertionFailed,
    BrowserTag,
    ContextTag,
    ErrorOccurred,
    ExecutionCompromised,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    ImplementationPending,
    IssueTag,
    ManualTag, Name,
    Outcome,
    ScenarioDetails,
    Tag,
    TestRunnerType,
    Timestamp,
} from '../../../domain';
import { ErrorParser } from './ErrorParser';
import { IDGenerator } from './IDGenerator';
import { ErrorDetails, SerenityBDDReport, TestStep } from './SerenityBDDJsonSchema';

export class ScenarioReport {
    private static errorParser = new ErrorParser();
    private static idGenerator = new IDGenerator();

    private readonly report: Partial<SerenityBDDReport> & { children?: Array<Partial<TestStep>> };
    private readonly activities = new Stack<Partial<TestStep>>();

    constructor(public readonly scenarioDetails: ScenarioDetails) {

        this.report = {
            name:   this.scenarioDetails.name.value,
            title:  this.scenarioDetails.name.value,
            id:     ScenarioReport.idGenerator.generateFrom(this.scenarioDetails.category, this.scenarioDetails.name),
            manual: false,
            testSteps: [],
            get children() {
                // fake reference to make the report and the test step interfaces compatible
                // removed in 'toJSON'
                return this.testSteps;
            },
            userStory: {
                id:         ScenarioReport.idGenerator.generateFrom(this.scenarioDetails.category),
                storyName:  this.scenarioDetails.category.value,
                path:       this.scenarioDetails.location.path.value,
                type:       'feature',
            },
        };

        this.activities.push(this.report);
    }

    sceneStartedAt(time: Timestamp): ScenarioReport {
        return this.withMutated(report => {
            report.startTime = time.toMillisecondTimestamp();
        });
    }

    executedBy(testRunner: TestRunnerType): ScenarioReport {
        return this.withMutated(report => {
            report.testSource = testRunner.value;
        });
    }

    sceneTaggedWith(tag: Tag) {
        return this.withMutated(report => {
            if (! report.tags) {
                report.tags = [];
            }

            report.tags.push(tag.toJSON());

            match(tag)
                .when(ManualTag,    _ => report.manual = true)
                .when(FeatureTag,   _ => report.featureTag = tag.toJSON())
                .when(IssueTag,     _ => (report.issues    = report.issues   || []).push(tag.name))
                .when(BrowserTag,   _ => (report.context   = report.context  || tag.name))
                .when(ContextTag,   _ => (report.context   = tag.name))
                .else(_ => void 0);
        });
    }

    sceneFinishedAt(time: Timestamp): ScenarioReport {
        return this.withMutated(report => {
            report.duration = Timestamp.fromMillisecondTimestamp(report.startTime).diff(time).milliseconds;
        });
    }

    activityBegan(activity: ActivityDetails, time: Timestamp) {
        return this.withMutated(report => {
            const activityReport: Partial<TestStep> = {
                description: activity.name.value,
                startTime: time.toMillisecondTimestamp(),
                children: [],
                screenshots: [],
            };

            this.activities.mostRecentlyAccessedItem().children.push(activityReport as any);
            this.activities.push(activityReport);
        });
    }

    photoTaken(name: Name) {
        return this.withMutated(report => {
            this.activities.mostRecentlyAccessedItem().screenshots.push({ screenshot: name.value });
        });
    }

    activityFinished(value: ActivityDetails, outcome: Outcome, time: Timestamp) {
        return this.withMutated(report => this.mapOutcome(outcome, (result: string, error?: ErrorDetails) => {

            const activityReport = this.activities.pop();

            activityReport.result    = result;
            activityReport.exception = error;
            activityReport.duration  = Timestamp.fromMillisecondTimestamp(activityReport.startTime).diff(time).milliseconds;
        }));
    }

    executionFinishedWith(outcome: Outcome): ScenarioReport {
        return this.withMutated(report => this.mapOutcome(outcome, (result: string, error: ErrorDetails = undefined) => {
            report.result = result;
            report.testFailureCause = error;
        }));
    }

    toJSON(): Partial<SerenityBDDReport> {
        const report = this.copyOf(this.report);

        delete report.children; // remove the fake reference

        // todo: optimise the report, remove empty arrays
        return report;
    }

    private mapOutcome(outcome: Outcome, mapAs: (result: string, error?: ErrorDetails) => void) {
        const parse = ScenarioReport.errorParser.parse;

        return match<Outcome, void>(outcome).
            when(ExecutionCompromised,  ({ error }: ExecutionCompromised )  => mapAs('COMPROMISED', parse(error))).
            when(ErrorOccurred,         ({ error }: ErrorOccurred )         => mapAs('ERROR', parse(error))).
            when(AssertionFailed,       ({ error }: AssertionFailed )       => mapAs('FAILURE', parse(error))).
            when(ExecutionSkipped,      _ => mapAs('SKIPPED')).
            when(ExecutionIgnored,      _ => mapAs('IGNORED')).
            when(ImplementationPending, _ => mapAs('PENDING')).
            else(/* ExecutionSuccessful */ _ => /* ignore */ mapAs('SUCCESS'));
    }

    private withMutated(mutate: (copied: Partial<SerenityBDDReport>) => void): ScenarioReport {
        mutate(this.report);

        return this;
    }

    private copyOf<T extends JSONObject>(json: T): T {
        return JSON.parse(JSON.stringify(json));
    }
}

class Stack<T> {
    private readonly items: T[] = [];
    private mostRecent: T = undefined;

    push(item: T): T {
        this.items.push(item);
        this.mostRecent = item;

        return this.mostRecent;
    }

    pop() {
        const item = this.items.pop();
        this.mostRecent = item;

        return this.mostRecent;
    }

    mostRecentlyAccessedItem() {
        return this.mostRecent;
    }
}
