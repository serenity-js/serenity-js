import {DomainEvents} from "./domain_events";
import {TestStarted, TestLifecycleListener, TestFinished, TestLifecycleListenerInterface} from "./test_lifecycle_events"
import {InterfaceDescriptor} from "./typesafety";
import {TestStepStarted, TestStepFinished} from "./test_lifecycle_events";


export class TestLifecycleReporter implements TestLifecycleListener {
    onTestStarted(event:TestStarted) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    onTestFinished(event:TestFinished) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    onTestStepStarted(event:TestStepStarted) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    onTestStepFinished(event:TestStepFinished) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    get handledEventTypes(): {new (): InterfaceDescriptor}[] {
        return [
            TestStarted.interface,
            TestFinished.interface,
            TestStepStarted.interface,
            TestStepFinished.interface
        ]
    }

    static get interface(): {new (): InterfaceDescriptor}  {
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