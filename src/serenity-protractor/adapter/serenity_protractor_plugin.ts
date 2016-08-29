import { ActivityFinished } from '../../serenity/domain/events';
import { Serenity } from '../../serenity/serenity';
import { ConsoleReporter, FileSystem, JsonReporter } from '../../serenity/stage_crew';
import { Photographer } from '../stage/photographer';
import { ProtractorPlugin } from 'protractor/built/plugins';

export class SerenityProtractorPlugin extends ProtractorPlugin {

    setup() {

        // todo: this can be configurable now
        let fs = new FileSystem(`${process.cwd()}/target/site/serenity/`);

        Serenity.assignCrewMembers(
            new Photographer(
                [ ActivityFinished ],
                fs
            ),
            new JsonReporter(fs),
            new ConsoleReporter()
        );
    };

    teardown() {
        return Serenity.stageManager().allDone();
    }
}
