import { Serenity } from '../../serenity/serenity';
import { jsonReporter, StageCrewMember } from '../../serenity/stage';

import { PluginConfig } from 'protractor/built/plugins';

// todo: implement ProtractorPlugin when https://github.com/angular/protractor/issues/3790 is fixed and I don't need Q
export class SerenityProtractorPlugin /* implements ProtractorPlugin */  {

    config: SerenityProtractorPluginConfig = {};

    setup(): Promise<any> {
        Serenity.assignCrewMembers(...this.crewMembers());

        return Promise.resolve();
    }

    teardown() {
        return Serenity.stageManager().allDone();
    }

    private crewMembers(): StageCrewMember[] {
        return (!! this.config.crew)
            ? this.config.crew
            : [ jsonReporter() ];
    }
}

export interface SerenityProtractorPluginConfig extends PluginConfig {
    crew?: StageCrewMember[];
}
