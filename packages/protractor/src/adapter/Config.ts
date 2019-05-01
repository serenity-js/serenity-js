import { StageCrewMember } from '@serenity-js/core/lib/stage';
import { Config as ProtractorConfig } from 'protractor';

export interface Config extends ProtractorConfig {
    serenity: {
        runner?: string;
        crew?:   StageCrewMember[];
    };
}
