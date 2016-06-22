import {DomainEvents} from "./events/eventbus";
import {
    TestIsStarted,
    TestLifecycleListener,
    TestIsFinished,
    TestLifecycleListenerInterface,
    TestStepIsStarted,
    TestStepIsFinished
} from "./events/test_lifecycle";
import {RuntimeInterfaceDescriptor} from "./typesafety";
import {Test, Identifiable} from "./domain";
import {Md5} from "ts-md5/dist/md5";
import id = webdriver.By.id;

export class TestLifecycleReporter implements TestLifecycleListener {
    private tests: {[key: string]: Test;} = {}

    private hash(thing: Identifiable): string {
        return <string>Md5.hashAsciiStr(thing.id());
    }


    whenTestIsStarted(event:TestIsStarted) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value(), this.hash(event.value()));

        let test = event.value();

        this.tests[this.hash(test)] = test;
    }

    whenTestIsFinished(event:TestIsFinished) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())


    }

    whenTestStepIsStarted(event:TestStepIsStarted) {
        // console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    whenTestStepIsFinished(event:TestStepIsFinished) {
        // console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    get handledEventTypes(): {new (): RuntimeInterfaceDescriptor}[] {
        return [
            TestIsStarted.interface,
            TestIsFinished.interface,
            TestStepIsStarted.interface,
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
        return "Serenity";
    }

    public domainEvents(): DomainEvents<any> {
        return this.domainEventBus;
    }
}