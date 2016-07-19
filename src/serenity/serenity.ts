import { Md5HashedPictureNames, Photographer } from '../serenity-protractor/recording/photographer';
import { ActivityFinished, DomainEvent, PhotoAttempted } from './domain/events';
import { PhotoReceipt } from './domain/model';
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

    public static callToStageFor(cast: Cast): Stage {

        Serenity.serenity.theStage = new Stage(cast);

        return Serenity.instance.theStage;
    }

    public static get instance() {
        return Serenity.serenity || (Serenity.serenity = new Serenity());
    }

    public static notify(event: DomainEvent<any>) {
        Serenity.instance.theStageManager.record(event);
    }

    constructor() {
        this.theStageManager.on(ActivityFinished, (event: ActivityFinished) => {

            // todo: externalise
            // todo: verify the Significance
            // todo: check config, are we interested in "activity starts" events?

            if (!! this.theStage && this.theStage.theShowHasStarted()) {

                let promisedPicture = this.photographer.photographWorkOf(this.theStage.theActorInTheSpotlight());

                this.theStageManager.record(new PhotoAttempted(new PhotoReceipt(event.value.subject, promisedPicture), event.timestamp));
            }
        });
    }

    // todo: rename or get from a DIC
    public stageManager() {
        return this.theStageManager;
    }
}
