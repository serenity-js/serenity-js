import type { Version } from '@serenity-js/core/io';
import type { BusinessRule, Description, Name, Tag } from '@serenity-js/core/model';

export interface ExtractedScenario {
    featureDescription?: Description;
    rule?: BusinessRule;
    scenarioDescription?: Description;
    testRunnerName: Name;
    testRunnerVersion: Version;
    tags: Tag[];
}
