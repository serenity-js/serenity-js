import {
    DomainEvents, TestStarted, TestLifecycleListener, InterfaceDescription, TestFinished, TestLifecycleListenerInterface
} from "./domain_events";


export class TestLifecycleReporter implements TestLifecycleListener {
    onTestStarted(event:TestStarted) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    onTestFinished(event:TestFinished) {
        console.log("[DOMAIN EVENT] ", event.constructor.name, event.value())
    }

    static get interface(): {new (): InterfaceDescription}  {
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
        console.log(">>>>>>>>>>>>>> INITIALISED Serenity Library using a constructor");
        
        this.domainEventBus.register(this.reporter, TestLifecycleReporter.interface, TestStarted.interface);
        this.domainEventBus.register(this.reporter, TestLifecycleReporter.interface, TestFinished.interface);
    }

    public name() {
        return "Serenity";
    }

    public domainEvents(): DomainEvents<any> {
        return this.domainEventBus;
    }
}