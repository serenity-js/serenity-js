import {DomainEvents} from './events/eventbus';
import {
    TestIsStarted,
    TestLifecycleListener,
    TestIsFinished,
    TestLifecycleListenerInterface,
    TestStepIsStarted,
    TestStepIsFinished, TestIsCompleted, TestStepIsCompleted
} from './events/test_lifecycle';
import {RuntimeInterfaceDescriptor} from './typesafety';
import {Test, Identifiable} from './domain';
import {Md5} from 'ts-md5/dist/md5';
import id = webdriver.By.id;

const fs:typeof QioFS = require('q-io/fs');

// todo: extract; this should interact with some sort of a test outcomes data structure
export class TestLifecycleReporter implements TestLifecycleListener {
    private tests: {[key: string]: Test;} = {}

    private hash(thing: Identifiable): string {
        return <string>Md5.hashAsciiStr(thing.id());
    }
    
    whenTestIsStarted(event:TestIsStarted) {
        // console.log('[DOMAIN EVENT] ', event.constructor.name, event.value(), this.hash(event.value()));

        let test = event.value();

        this.tests[this.hash(test)] = test;
    }

    whenTestIsCompleted(event:TestIsCompleted) {
        // console.log('[DOMAIN EVENT] ', event.constructor.name, event.value());

        let testResult = event.value();
        

        fs.makeTree(`${process.cwd()}/target/site/serenity`).then(() => {
            return fs.write(`${process.cwd()}/target/site/serenity/some.json`, JSON.stringify(testResult))
        }).then(console.log, console.error);
    }
    
    whenTestIsFinished(event:TestIsFinished) {
        // console.log('[DOMAIN EVENT] ', event.constructor.name, event.value())


    }

    whenTestStepIsStarted(event:TestStepIsStarted) {
        // console.log('[DOMAIN EVENT] ', event.constructor.name, event.value())
    }
    
    whenTestStepIsCompleted(event:TestStepIsCompleted) {
        
    }

    whenTestStepIsFinished(event:TestStepIsFinished) {
        // console.log('[DOMAIN EVENT] ', event.constructor.name, event.value())
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
    private reporter       = new TestLifecycleReporter();

    constructor() {
        this.reporter.handledEventTypes.forEach((eventType) => {
            this.domainEventBus.register(this.reporter, TestLifecycleReporter.interface, eventType);
        });
    }

    public name() {
        return 'Serenity';
    }

    public domainEvents(): DomainEvents<any> {
        return this.domainEventBus;
    }
}