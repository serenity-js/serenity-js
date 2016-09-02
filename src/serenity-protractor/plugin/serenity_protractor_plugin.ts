import { Serenity } from '../../serenity/serenity';
import { StageCrewMember } from '../../serenity/stage/stage_manager';

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
            : [];
    }
}

export interface SerenityProtractorPluginConfig extends PluginConfig {
    crew?: StageCrewMember[];
}
