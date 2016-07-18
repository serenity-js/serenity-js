import { Photo } from '../../serenity/domain/model';
import { Outlet } from '../../serenity/reporting/outlet';
import { UsesAbilities } from '../../serenity/screenplay/actor';
import { BrowseTheWeb } from '../screenplay/abilities/browse_the_web';
import { Md5 } from 'ts-md5/dist/md5';

export class Photographer {

    constructor(private outlet: Outlet, private naming: PictureNamingStrategy) {
    }

    photographWorkOf(actor: UsesAbilities): Promise<Photo> {

        let saveScreenshot = (data) => this.outlet.sendPicture(this.naming.nameFor(data), data);

        let ignoreInactiveBrowserButReportAnyOther = (error: Error) => {
            if (error.message.match(/does not have a valid session ID/)) {
                return undefined;
            }

            throw error;
        };

        return BrowseTheWeb.as(actor).takeScreenshot()
            .then(saveScreenshot)
            .then(
                path => new Photo(path),
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
