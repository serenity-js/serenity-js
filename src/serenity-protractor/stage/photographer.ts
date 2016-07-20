import { ActivityFinished, ActivityStarts, DomainEvent, PhotoAttempted } from '../../serenity/domain/events';
import { Activity, Photo, PhotoReceipt, Result } from '../../serenity/domain/model';
import { Outlet } from '../../serenity/reporting/outlet';
import { UsesAbilities } from '../../serenity/screenplay/actor';
import { Stage, StageCrewMember } from '../../serenity/stage';
import { BrowseTheWeb } from '../screenplay/abilities/browse_the_web';
import { Md5 } from 'ts-md5/dist/md5';

export class Photographer implements StageCrewMember {
    private stage: Stage;

    constructor(private outlet: Outlet, private naming: PictureNamingStrategy) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;

        // todo: make it configurable what stages of performance the Photographer should be interested in.
        this.stage.manager.registerInterestIn([ ActivityStarts, ActivityFinished ], this);
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

        let saveScreenshot = (data) => this.outlet.sendPicture(this.naming.nameFor(data), data);

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
