import { Serenity } from '../../serenity/serenity';
import { StageCrewMember, jsonReporter } from '../../serenity/stage';

import { PluginConfig, ProtractorPlugin } from 'protractor';

export class SerenityProtractorPlugin implements ProtractorPlugin {

    config: SerenityProtractorPluginConfig = {};

    setup() {
        Serenity.assignCrewMembers(...this.crewMembers());
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
