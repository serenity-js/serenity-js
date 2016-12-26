import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Photo,
    PhotoAttempted,
    PhotoReceipt,
    Result,
} from '../../serenity/domain';

import { FileSystem } from '../../serenity/io/file_system';
import { UsesAbilities } from '../../serenity/screenplay';
import { Default_Path_To_Reports } from '../../serenity/serenity';
import { Stage, StageCrewMember } from '../../serenity/stage';
import { BrowseTheWeb } from '../screenplay/abilities';
import { NoPhoto, TakeAPhoto, TimingBehaviour } from './photographer-timing';

import { Md5 } from 'ts-md5/dist/md5';

export function photographer(): StageCrewMember {
    return Photographer.who(_ => _);
}

export class ActivityOfInterest {

    constructor(private resultsOfInterest: Result) {
    }

    isAResultOfInterest(result: Result): boolean {
        return !! (result & this.resultsOfInterest);
    }

    isAnActivityOfInterest(activity: Activity): boolean {
        return true;
    }
}

export class PhotographySchedule {

    Failures                 = new ActivityOfInterest(Result.Failed);
    Tasks_and_Interactions   = new ActivityOfInterest(Result.Finished);

    Activity_Starts_and_Finishes = new TimingBehaviour(new TakeAPhoto(), new TakeAPhoto());
    Activity_Starts              = new TimingBehaviour(new TakeAPhoto(), new NoPhoto());
    Activity_Finishes            = new TimingBehaviour(new NoPhoto(),    new TakeAPhoto());

    private activityOfInterest: ActivityOfInterest     = this.Tasks_and_Interactions;
    private photoTiming: TimingBehaviour               = this.Activity_Finishes;
    private pathToPhotos: string                       = Default_Path_To_Reports;
    private photoNamingStrategy: PictureNamingStrategy = new Md5HashedPictureNames('png');

    takesPhotosOf(activityOfInterest: ActivityOfInterest): PhotographySchedule {
        this.activityOfInterest = activityOfInterest;

        return this;
    }

    takesPhotosWhen(photoTiming: TimingBehaviour): PhotographySchedule {
        this.photoTiming = photoTiming;

        return this;
    }

    storesPhotosAt(pathToPhotos: string): PhotographySchedule {
        this.pathToPhotos = pathToPhotos;

        return this;
    }

    build(): Photographer {
        return new Photographer(
            this.activityOfInterest,
            this.photoTiming,
            new FileSystem(this.pathToPhotos),
            this.photoNamingStrategy,
        );
    }
}

export class Photographer implements StageCrewMember {
    private static Events_of_Interest = [ ActivityStarts, ActivityFinished ];

    private stage: Stage;
    private strategy: PhotoTakingStrategy;

    static who(scheduler: (schedule: PhotographySchedule) => PhotographySchedule): Photographer {
        return scheduler(new PhotographySchedule()).build();
    }

    constructor(private fieldOfInterest: ActivityOfInterest,
                behaviour: TimingBehaviour,
                private fs: FileSystem,
                private naming: PictureNamingStrategy = new Md5HashedPictureNames('png')) {
        this.strategy = new PhotoTakingStrategy(fieldOfInterest, behaviour);
    }

    assignTo(stage: Stage) {
        this.stage = stage;

        this.stage.manager.registerInterestIn(Photographer.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {

        switch (event.constructor.name) {
            case ActivityStarts.name:   this.strategy.activityStarts(event, this);   break;
            case ActivityFinished.name: this.strategy.activityFinished(event, this); break;
            default: break;
        }
    }

    public canWork(): boolean {
        return !! this.stage && this.stage.theShowHasStarted();
    }

    public photograph(subject: Activity, timestamp: number) {
        let promisedPicture = this.photographWorkOf(this.stage.theActorInTheSpotlight());

        this.stage.manager.notifyOf(new PhotoAttempted(new PhotoReceipt(subject, promisedPicture), timestamp));
    }

    private photographWorkOf(actor: UsesAbilities): PromiseLike<Photo> {

        let saveScreenshot = data => this.fs.store(this.naming.nameFor(data), new Buffer(data, 'base64'));

        let ignoreInactiveBrowserButReportAnyOther = (error: Error) => {
            if (error.message.indexOf('does not have a valid session ID') > -1) {
                return undefined;
            }

            throw error;
        };

        return BrowseTheWeb.as(actor).takeScreenshot()
            .then(saveScreenshot)
            .then(
                path  => new Photo(path),
                error => ignoreInactiveBrowserButReportAnyOther(error),
            );
    }
}

// todo extract
export interface PictureNamingStrategy {
    nameFor(base64encodedData: string): string;
}

export class Md5HashedPictureNames implements PictureNamingStrategy {

    constructor(private fileExtension: string = '') {
    }

    nameFor(base64encodedData: string): string {
        return Md5.hashStr(base64encodedData) + this.extension();
    }

    private extension() {
        return !! this.fileExtension ? '.' + this.fileExtension : '';
    }
}

class PhotoTakingStrategy {
    constructor(private interests: ActivityOfInterest, private timing: TimingBehaviour) {
    }

    activityStarts(event: ActivityStarts, photographer: Photographer) {
        if (photographer.canWork() && this.interests.isAnActivityOfInterest(event.value) ) {
            this.timing.takeABeforePhoto(event, photographer);
        }
    }

    activityFinished(event: ActivityFinished, photographer: Photographer) {
        if (photographer.canWork() && this.interests.isAnActivityOfInterest(event.value.subject) && this.interests.isAResultOfInterest(event.value.result)) {
            this.timing.takeAnAfterPhoto(event, photographer);
        }
    }
}
