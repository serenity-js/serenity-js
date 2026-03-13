import type { Description, ScenarioDetails, ScenarioParameters } from '@serenity-js/core/lib/model/index.js';

export interface ExtractedScenarioOutline {
    details: ScenarioDetails;
    template: Description;
    parameters: ScenarioParameters;
}
