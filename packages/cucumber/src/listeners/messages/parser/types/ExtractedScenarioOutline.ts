import type { Description, ScenarioDetails, ScenarioParameters } from '@serenity-js/core/model';

export interface ExtractedScenarioOutline {
    details: ScenarioDetails;
    template: Description;
    parameters: ScenarioParameters;
}
