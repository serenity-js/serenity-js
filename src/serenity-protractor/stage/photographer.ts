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

import { Md5 } from 'ts-md5/dist/md5';

export const TakeAPicture = {
    Before_Activity:           [ ActivityStarts ],
    After_Activity:            [ ActivityFinished ],
    Before_And_After_Activity: [ ActivityStarts, ActivityFinished ],
};

export function photographer(
    eventsOfInterest: { new (v: any): DomainEvent<any>}[] = TakeAPicture.After_Activity,
    pathToReports: string = Default_Path_To_Reports): StageCrewMember
{
    return new Photographer(eventsOfInterest, new FileSystem(pathToReports));
}

export class Photographer implements StageCrewMember {
    private stage: Stage;
    private eventsOfInterest: { new (v: any): DomainEvent<any>} [] = [];

    constructor(
        eventsOfInterest: { new (v: any): DomainEvent<any>} [],
        private fs: FileSystem,
        private naming: PictureNamingStrategy = new Md5HashedPictureNames('png'))
    {
        this.eventsOfInterest = this.eventsOfInterest.concat(eventsOfInterest);
    }

    assignTo(stage: Stage) {
        this.stage = stage;

        this.stage.manager.registerInterestIn(this.eventsOfInterest, this);
    }

    notifyOf(event: DomainEvent<any>): void {

        switch (event.constructor.name) {
            case ActivityStarts.name:   this.whenActivityStarts(event);   break;
            case ActivityFinished.name: this.whenActivityFinished(event); break;
            default: break;
        }
    }

    private whenActivityStarts(event: ActivityStarts) {
        if (!! this.stage && this.stage.theShowHasStarted()) {
            this.takeAPhotoAndSendAReceipt(event.value, event.timestamp);
        }
    }

    private whenActivityFinished(event: ActivityFinished) {
        let skip = Result.COMPROMISED | Result.ERROR | Result.FAILURE | Result.SUCCESS;

        if (event.value.result & skip) {
            this.takeAPhotoAndSendAReceipt(event.value.subject, event.timestamp);
        }
    }

    // todo: verify the Significance
    private takeAPhotoAndSendAReceipt(subject: Activity, timestamp: number) {
        let promisedPicture = this.photographWorkOf(this.stage.theActorInTheSpotlight());

        this.stage.manager.notifyOf(new PhotoAttempted(new PhotoReceipt(subject, promisedPicture), timestamp));
    }

    private photographWorkOf(actor: UsesAbilities): Promise<Photo> {

        let saveScreenshot = (data) => this.fs.store(this.naming.nameFor(data), new Buffer(data, 'base64'));

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
                error => ignoreInactiveBrowserButReportAnyOther(error)
            );
    }
}

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
