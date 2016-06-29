import {DomainEvents} from "./events/eventbus";
import {
    TestIsStarted,
    TestLifecycleListener,
    TestIsFinished,
    TestLifecycleListenerInterface,
    TestStepIsStarted,
    TestStepIsFinished,
    TestIsCompleted,
    TestStepIsCompleted
} from "./events/test_lifecycle";
import {RuntimeInterfaceDescriptor} from "./typesafety";
import {Identifiable, Test, Step, Result, StepOutcome, TestOutcome} from "./domain";
import {Md5} from "ts-md5/dist/md5";
import {Recorder} from "./reporting/test_reports";
import id = webdriver.By.id;

const fs:typeof QioFS = require('q-io/fs');

// todo: extract; this should interact with some sort of a test outcomes data structure
export class TestExecutionMonitor implements TestLifecycleListener {
    private recorder = new Recorder();

    // todo: (1) extract together
    private hash(thing: Identifiable): string {
        return <string>Md5.hashAsciiStr(thing.id());
    }

    whenTestIsStarted(event:TestIsStarted) {
        this.recorder.startARecordingOf(event.value(), event.timestamp());
    }

    whenTestIsCompleted(event:TestIsCompleted) {
        let outcome = event.value();

        this.recorder.recordResultOf(outcome, event.timestamp());
    }
    
    whenTestIsFinished(event:TestIsFinished) {
        let test      = event.value();
        let recording = this.recorder.extractRecordingFor(test);

        // todo: (1) extract together 
        fs.makeTree(`${process.cwd()}/target/site/serenity`).then(() => {
            return fs.write(`${process.cwd()}/target/site/serenity/${this.hash(test)}.json`, JSON.stringify(recording))
        }).then(() => {}, console.error);
    }

    whenTestStepIsStarted(event:TestStepIsStarted) {
        this.recorder.recordStep(event.value(), event.timestamp());
    }
    
    whenTestStepIsCompleted(event:TestStepIsCompleted) {
        let outcome = event.value();
        this.recorder.recordStepResultOf(outcome, event.timestamp());
    }

    whenTestStepIsFinished(event:TestStepIsFinished) {
        
    }

    get handledEventTypes(): {new (): RuntimeInterfaceDescriptor}[] {
        return [
            TestIsStarted.interface,
            TestIsCompleted.interface,
            TestIsFinished.interface,
            TestStepIsStarted.interface,
            TestStepIsCompleted.interface,
            TestStepIsFinished.interface
        ]
    }

    static get interface(): {new (): RuntimeInterfaceDescriptor}  {
        return TestLifecycleListenerInterface;
    }
}

export class Serenity {

    private static _instance: Serenity;

    public static get instance() {
        return Serenity._instance||(Serenity._instance = new Serenity());
    }

    private events   = new DomainEvents<any>();
    private reporter = new TestExecutionMonitor();

    constructor() {
        this.reporter.handledEventTypes.forEach((eventType) => {
            this.events.register(this.reporter, TestExecutionMonitor.interface, eventType);
        });
    }

    public name() {
        return 'Serenity';
    }

    /**
     * Notify Serenity that a test scenario is about to start
     *
     * @param name      The name of an `it` block in jasmine/mocha, the `Scenario` in cucumber, or the method name in something like jUnit
     * @param feature   Name of the describe block in jasmine/mocha, the Feature in cucumber, or the class name in something like jUnit
     * @param filePath  The path to a file where the scenario is defined
     */
    public scenarioStarts(name: string, feature:string, filePath: string) {
        this.events.trigger(new TestIsStarted(new Test(
            name,
            feature,
            filePath
        )), TestIsStarted.interface);
    }

    /**
     * Notify Serenity that a test step is about to start
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     */
    public stepStarts(name: string) {
        this.events.trigger(new TestStepIsStarted(new Step(name)), TestStepIsStarted.interface)
    }

    /**
     * Notify Serenity that a test step has completed and a result is available
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     * @param result    The result of the step, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the step
     */
    public stepCompleted(name: string, result: Result, error?: Error) {
        // todo: maybe trigger a different event depending on if the error is present to avoid conditional logic in the StepOutcome

        this.events.trigger(new TestStepIsCompleted(new StepOutcome(new Step(name), result, error)), TestStepIsStarted.interface);
    }

    /**
     * Notify Serenity that a test scenario has completed and a result is available
     *
     * @param name      The name of an `it` block in jasmine/mocha, the `Scenario` in cucumber, or the method name in something like jUnit
     * @param feature   Name of the describe block in jasmine/mocha, the Feature in cucumber, or the class name in something like jUnit
     * @param filePath  The path to a file where the scenario is defined
     *
     * @param result    The result of the scenario, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the scenario
     */
    public scenarioCompleted(name: string, feature: string, filePath: string, result: Result, error?: Error) {
        this.events.trigger(new TestIsCompleted(new TestOutcome(
            new Test(name, feature, filePath),
            result,
            error
        )), TestIsCompleted.interface);
    }

    /**
     * Notify Serenity that a test step has finished
     *
     * @param name      The name of an `it` block in jasmine/mocha, the `Scenario` in cucumber, or the method name in something like jUnit
     * @param feature   Name of the describe block in jasmine/mocha, the Feature in cucumber, or the class name in something like jUnit
     * @param filePath  The path to a file where the scenario is defined
     */
    public scenarioFinished(name: string, feature: string, filePath: string) {
        this.events.trigger(new TestIsFinished(new Test(
            name,
            feature,
            filePath
        )), TestIsFinished.interface);
    }
}