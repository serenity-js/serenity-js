import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    FeatureNarrativeDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TestRunFinished,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import {
    ActivityDetails,
    CapabilityTag,
    Category,
    Description,
    FeatureTag,
    Name,
    Outcome,
    ScenarioDetails,
    Tag,
    ThemeTag,
} from '@serenity-js/core/lib/model';
import { StageManager } from '@serenity-js/core/lib/stage';

import { Feature, Scenario, ScenarioOutline, Step } from '../gherkin';
import { FeatureFileNode } from '../gherkin/model/FeatureFileNode';

function notEmpty<T>(list: T[]) {
    return list.filter(item => !! item);
}

export class Notifier {
    constructor(private readonly stageManager: StageManager) {
    }

    outlineDetected(scenario: Scenario, outline: ScenarioOutline, feature: Feature): void {
        const
            outlineDetails  = this.detailsOf(outline, feature),
            scenarioDetails = this.detailsOf(scenario, feature),
            template        = outline.steps.map(step => step.name.value).join('\n');

        this.emit(...notEmpty([
            new SceneSequenceDetected(outlineDetails),
            new SceneTemplateDetected(new Description(template)),
            new SceneParametersDetected(
                scenarioDetails,
                outline.parameters[ scenario.location.line ],
            ),
        ]));
    }

    scenarioStarts(scenario: Scenario, feature: Feature): void {
        const details = this.detailsOf(scenario, feature);

        this.emit(...notEmpty([
            new SceneStarts(details),
            feature.description && new FeatureNarrativeDetected(feature.description),
            new TestRunnerDetected(new Name('Cucumber')),
            ...this.scenarioHierarchyTagsFor(feature).map(tag => new SceneTagged(details, tag)),
            !! scenario.description && new SceneDescriptionDetected(scenario.description),
            ...scenario.tags.map(tag => new SceneTagged(details, tag)),
        ]));
    }

    stepStarts(step: Step): void {
        this.emit(new ActivityStarts(new ActivityDetails(step.name)));
    }

    stepFinished(step: Step, outcome: Outcome): void {
        this.emit(
            new ActivityFinished(
                new ActivityDetails(step.name),
                outcome,
            ),
        );
    }

    scenarioFinished(scenario: Scenario, feature: Feature, outcome: Outcome): void {
        const details = this.detailsOf(scenario, feature);

        this.emit(
            new SceneFinished(
                details,
                outcome,
            ),
        );
    }

    testRunFinished() {
        this.emit(
            new TestRunFinished(),
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
        const humanReadable = (text: string) => text.replace(/[_-]+/g, ' ');

        const
            directories     = notEmpty(feature.location.path.directory().split()),
            featuresIndex   = directories.indexOf('features'),
            hierarchy       = [ ...directories.slice(featuresIndex + 1), feature.name.value ] as string[];

        const [ featureName, capabilityName, themeName ]: string[] = hierarchy.reverse();

        return notEmpty([
            themeName       && new ThemeTag(humanReadable(themeName)),
            capabilityName  && new CapabilityTag(humanReadable(capabilityName)),
            feature         && new FeatureTag(featureName),
        ]);
    }

    private emit(...events: DomainEvent[]) {
        events.forEach(event => this.stageManager.notifyOf(event));
    }
}
