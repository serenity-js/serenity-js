import {
    DomainEvent,
    FeatureNarrativeDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneFinishes,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ActivityDetails, CapabilityTag, Category, Description, FeatureTag, Name, Outcome, ScenarioDetails, Tag, ThemeTag } from '@serenity-js/core/lib/model';

import { Serenity } from '@serenity-js/core/lib/Serenity';
import { Feature, Scenario, ScenarioOutline, Step } from '../gherkin';
import { FeatureFileNode } from '../gherkin/model/FeatureFileNode';

function notEmpty<T>(list: T[]) {
    return list.filter(item => !! item);
}

/**
 * @private
 */
export class Notifier {
    private currentScenario: ScenarioDetails;

    constructor(private readonly serenity: Serenity) {
    }

    outlineDetected(scenario: Scenario, outline: ScenarioOutline, feature: Feature): void {
        const
            outlineDetails  = this.detailsOf(outline, feature),
            scenarioDetails = this.detailsOf(scenario, feature),
            template        = outline.steps.map(step => step.name.value).join('\n');

        this.emit(...notEmpty([
            new SceneSequenceDetected(outlineDetails, this.serenity.currentTime()),
            new SceneTemplateDetected(new Description(template), this.serenity.currentTime()),
            new SceneParametersDetected(
                scenarioDetails,
                outline.parameters[ scenario.location.line ],
                this.serenity.currentTime(),
            ),
        ]));
    }

    scenarioStarts(scenario: Scenario, feature: Feature): void {
        const details = this.detailsOf(scenario, feature);

        this.currentScenario = details;

        this.emit(...notEmpty([
            new SceneStarts(details, this.serenity.currentTime()),
            feature.description && new FeatureNarrativeDetected(feature.description, this.serenity.currentTime()),
            new TestRunnerDetected(new Name('Cucumber'), this.serenity.currentTime()),
            ...this.scenarioHierarchyTagsFor(feature).map(tag => new SceneTagged(details, tag, this.serenity.currentTime())),
            !! scenario.description && new SceneDescriptionDetected(scenario.description, this.serenity.currentTime()),
            ...scenario.tags.map(tag => new SceneTagged(details, tag, this.serenity.currentTime())),
        ]));
    }

    stepStarts(step: Step): void {
        this.emit(new TaskStarts(new ActivityDetails(step.name), this.serenity.currentTime()));
    }

    stepFinished(step: Step, outcome: Outcome): void {
        this.emit(
            new TaskFinished(
                new ActivityDetails(step.name),
                outcome,
                this.serenity.currentTime(),
            ),
        );
    }

    scenarioFinishes(scenario: Scenario, feature: Feature): void {
        this.emitSceneFinishes(this.detailsOf(scenario, feature));
    }

    currentScenarioFinishes() {
        this.emitSceneFinishes(this.currentScenario);
    }

    scenarioFinished(scenario: Scenario, feature: Feature, outcome: Outcome): void {
        const details = this.detailsOf(scenario, feature);

        this.emit(
            new SceneFinished(
                details,
                outcome,
                this.serenity.currentTime(),
            ),
        );
    }

    testRunFinishes() {
        this.emit(
            new TestRunFinishes(this.serenity.currentTime()),
        );
    }

    testRunFinished() {
        this.emit(
            new TestRunFinished(this.serenity.currentTime()),
        );
    }

    private emitSceneFinishes(details: ScenarioDetails) {
        this.emit(
            new SceneFinishes(
                details,
                this.serenity.currentTime(),
            ),
        );
    }

    private detailsOf(scenario: FeatureFileNode, feature: Feature): ScenarioDetails {
        return new ScenarioDetails(
            scenario.name,
            new Category(feature.name.value),
            scenario.location,
        );
    }

    private scenarioHierarchyTagsFor(feature: Feature): Tag[] {
        const
            directories     = notEmpty(feature.location.path.directory().split()),
            featuresIndex   = directories.indexOf('features'),
            hierarchy       = [ ...directories.slice(featuresIndex + 1), feature.name.value ] as string[];

        const [ featureName, capabilityName, themeName ]: string[] = hierarchy.reverse();

        return notEmpty([
            themeName       && new ThemeTag(themeName),
            capabilityName  && new CapabilityTag(capabilityName),
            feature         && new FeatureTag(featureName),
        ]);
    }

    private emit(...events: DomainEvent[]) {
        events.forEach(event => this.serenity.announce(event));
    }
}
