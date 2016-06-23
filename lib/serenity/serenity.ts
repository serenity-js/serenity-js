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
import {Identifiable} from "./domain";
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
        }).then(console.log, console.error);
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

    private domainEventBus = new DomainEvents<any>();
    private reporter       = new TestExecutionMonitor();

    constructor() {
        this.reporter.handledEventTypes.forEach((eventType) => {
            this.domainEventBus.register(this.reporter, TestExecutionMonitor.interface, eventType);
        });
    }

    public name() {
        return 'Serenity';
    }

    public domainEvents(): DomainEvents<any> {
        return this.domainEventBus;
    }
}