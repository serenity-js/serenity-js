import {Scenario, Step, Result, Outcome} from "./domain/model";
import {Chronicler, Chronicle} from "./recording/chronicles";
import {DomainEvent, ScenarioStarted, StepStarted, StepCompleted, ScenarioCompleted} from "./domain/events";
import id = webdriver.By.id;

export class Serenity {
    // todo: get DI, seriously. http://stackoverflow.com/questions/12795666/ioc-for-typescript
    private chronicler = new Chronicler(new Chronicle());

    private static _instance: Serenity;

    public static get instance() {
        return Serenity._instance||(Serenity._instance = new Serenity());
    }

    constructor() { }

    public name() {
        return 'Serenity';
    }

    // todo: rename or get from a DIC
    public chronicles() {
        return this.chronicler;
    }

    /**
     * Record a domain event so that it can be later on retrieved, or used to notify listeners interested in it.
     *
     * @param event
     */
    public record(event: DomainEvent<any>) {
        this.chronicler.record(event);
    }

    /**
     * Notify Serenity that a test scenario is about to start
     *
     * @param scenario  The Scenario that is about to start
     */
    public scenarioStarts(scenario: Scenario) {
        this.chronicler.record(new ScenarioStarted(scenario));
    }

    /**
     * Notify Serenity that a test step is about to start
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     */
    public stepStarts(step: Step) {
        this.chronicler.record(new StepStarted(step));
    }

    /**
     * Notify Serenity that a test step has completed and a result is available
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     * @param result    The result of the step, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the step
     */
    public stepCompleted(step: Step, result: Result, error?: Error) {
        this.chronicler.record(new StepCompleted(new Outcome(step, result, error)));
    }

    /**
     * Notify Serenity that a test scenario has completed and a result is available
     *
     * @param scenario  The scenario that just got completed
     * @param result    The result of the scenario, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the scenario
     */
    public scenarioCompleted(scenario: Scenario, result: Result, error?: Error) {
        this.chronicler.record(new ScenarioCompleted(new Outcome(scenario, result, error)));
    }
}