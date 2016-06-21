import {
    DomainEvents, RegistersTestStarted, TestStartedHandlerInterface, TestStarted
} from "./domain_events";

export class Serenity {

    private static _instance: Serenity;

    public static get instance() {
        return Serenity._instance||(Serenity._instance = new Serenity());
    }

    private domainEventBus = new DomainEvents<any>();

    constructor() {
        console.log(">>>>>>>>>>>>>> INITIALISED Serenity Library using a constructor");

        this.domainEventBus.register(new RegistersTestStarted(), RegistersTestStarted.interface, TestStarted.interface);
    }

    public name() {
        return "Serenity";
    }

    public domainEvents(): DomainEvents<any> {
        return this.domainEventBus;
    }
}