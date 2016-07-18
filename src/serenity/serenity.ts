import { Md5HashedPictureNames, Photographer } from '../serenity-protractor/recording/photographer';
import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    PhotoTaken,
    SceneFinished,
    SceneStarts,
} from './domain/events';
import { Activity, Outcome, PhotoReceipt, Result, Scene } from './domain/model';
import { Journal, StageManager } from './recording/stage_management';
import { FileSystemOutlet } from './reporting/outlet';
import { Cast, Stage } from './screenplay/stage';

export class Serenity {
    private static serenity: Serenity;

    // todo: get DI, seriously. http://stackoverflow.com/questions/12795666/ioc-for-typescript

    private theStageManager = new StageManager(new Journal());
    private theStage: Stage;

    private photographer = new Photographer(
        new FileSystemOutlet(`${process.cwd()}/target/site/serenity/`),
        new Md5HashedPictureNames('png')
    );

    public static callToStage(cast: Cast): Stage {

        Serenity.serenity.theStage = new Stage(cast);

        return Serenity.instance.theStage;
    }

    public static get instance() {
        return Serenity.serenity || (Serenity.serenity = new Serenity());
    }

    constructor() {
        this.theStageManager.on(ActivityFinished, (event: ActivityStarts) => {

            if (this.theStage.theShowHasStarted()) {

                let promisedPicture = this.photographer.photographWorkOf(this.theStage.theActorInTheSpotlight());

                this.theStageManager.record(new PhotoTaken(new PhotoReceipt(event.value, promisedPicture), event.timestamp));
            }

        //
        //     // todo: verify the Significance
        //     // todo: check config, are we interested in "activity starts" events?
        //
        //     if (event.value.actor) {
        //         let promisedpicture = this.photographer.photographWorkOf(event.value.actor);

        //  todo: Actor.inTheSpotlight()?
        //
        //         this.sm.record(new PhotoTaken(new PhotoReceipt(event.value, promisedpicture), event.timestamp));
        //     }
        });
    }

    public name() {
        return 'Serenity';
    }

    // todo: rename or get from a DIC
    public stageManager() {
        return this.theStageManager;
    }

    /**
     * Record a domain event so that it can be later on retrieved, or used to notify listeners interested in it.
     *
     * @param event
     */
    public record(event: DomainEvent<any>) {
        this.theStageManager.record(event);
    }

    /**
     * Notify Serenity that a test scenario is about to start
     *
     * @param scenario  The Scene that is about to start
     */
    public scenarioStarts(scenario: Scene) {
        this.theStageManager.record(new SceneStarts(scenario));
    }

    /**
     * Notify Serenity that a test step is about to start
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     */
    public stepStarts(step: Activity) {
        this.theStageManager.record(new ActivityStarts(step));
    }

    /**
     * Notify Serenity that a test step has completed and a result is available
     *
     * @param name      The name of the step, such as "When Bob views his profile"
     * @param result    The result of the step, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the step
     */
    public stepCompleted(step: Activity, result: Result, error?: Error) {
        this.theStageManager.record(new ActivityFinished(new Outcome(step, result, error)));
    }

    /**
     * Notify Serenity that a test scenario has completed and a result is available
     *
     * @param scenario  The scenario that just got completed
     * @param result    The result of the scenario, such as Result.SUCCESS or Result.Failure
     * @param error     Optional error object telling Serenity what went wrong with the scenario
     */
    public scenarioCompleted(scenario: Scene, result: Result, error?: Error) {
        this.theStageManager.record(new SceneFinished(new Outcome(scenario, result, error)));
    }
}
