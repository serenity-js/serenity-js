import { ActivityFinished, ActivityStarts, DomainEvent, SceneFinished, SceneStarts } from './domain/events';
import { Activity, Outcome, Result, Scene } from './domain/model';
import { Chronicle, Chronicler } from './recording/chronicles';

export class Serenity {
    private static serenity: Serenity;

    // todo: get DI, seriously. http://stackoverflow.com/questions/12795666/ioc-for-typescript
    private chronicler = new Chronicler(new Chronicle());

    public static get instance() {
        return Serenity.serenity || (Serenity.serenity = new Serenity());
    }

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
     * @param scenario  The Scene that is about to start
     */
    public scenarioStarts(scenario: Scene) {
        this.chronicler.record(new SceneStarts(scenario));
    }

    /**
     * Notify Serenity that a test step is about to start
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     */
    public stepStarts(step: Activity) {
        this.chronicler.record(new ActivityStarts(step));
    }

    /**
     * Notify Serenity that a test step has completed and a result is available
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     * @param result    The result of the step, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the step
     */
    public stepCompleted(step: Activity, result: Result, error?: Error) {
        this.chronicler.record(new ActivityFinished(new Outcome(step, result, error)));
    }

    /**
     * Notify Serenity that a test scenario has completed and a result is available
     *
     * @param scenario  The scenario that just got completed
     * @param result    The result of the scenario, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the scenario
     */
    public scenarioCompleted(scenario: Scene, result: Result, error?: Error) {
        this.chronicler.record(new SceneFinished(new Outcome(scenario, result, error)));
    }
}
