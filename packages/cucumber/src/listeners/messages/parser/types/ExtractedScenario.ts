import type { BusinessRule, Description, Name, Tag } from '@serenity-js/core/model';

export interface ExtractedScenario {
    featureDescription?: Description;
    rule?: BusinessRule;
    scenarioDescription?: Description;
    testRunnerName: Name;
    tags: Tag[];
}
