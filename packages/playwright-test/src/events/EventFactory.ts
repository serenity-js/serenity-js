import type { FullProject } from '@playwright/test/reporter';
import { type TestCase, type TestResult } from '@playwright/test/reporter';
import { Duration, Timestamp } from '@serenity-js/core';
import {
    type DomainEvent,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TestRunnerDetected
} from '@serenity-js/core/lib/events';
import { FileSystem, FileSystemLocation, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io';
import type { Outcome, Tag } from '@serenity-js/core/lib/model';
import {
    Category,
    Description,
    Name,
    ProjectTag,
    ScenarioDetails,
    ScenarioParameters,
    Tags
} from '@serenity-js/core/lib/model';

import { PlaywrightSceneId } from './PlaywrightSceneId';

export class EventFactory {
    private requirementsHierarchy: RequirementsHierarchy;

    constructor(rootDirectory: Path) {
        this.requirementsHierarchy = new RequirementsHierarchy(
            new FileSystem(rootDirectory),
        );
    }

    createSceneStartEvents(test: TestCase, result: TestResult): DomainEvent[] {
        const sceneId = PlaywrightSceneId.from(test.parent.project()?.name, test, result);
        const startTime = new Timestamp(result.startTime);

        const project: FullProject | undefined = test.parent.project();
        const projectName = project?.name ?? '';

        const scenarioDetails = this.scenarioDetailsFrom(test);

        const allTags = this.tagsFrom(
            scenarioDetails,
            test.tags,
        );

        if (projectName) {
            allTags.push(new ProjectTag(projectName));
        }

        const events: DomainEvent[] = [];

        if (test.retries > 0) {
            events.push(
                ...this.createSceneSequenceEvents(
                    sceneId,
                    startTime,
                    scenarioDetails,
                    test,
                    result
                )
            );
        }

        events.push(
            new SceneStarts(sceneId,
                scenarioDetails,
                startTime
            ),
            new TestRunnerDetected(sceneId, new Name('Playwright'), startTime),
            ...allTags.map(tag => new SceneTagged(sceneId, tag, startTime))
        )

        return events;
    }

    private createSceneSequenceEvents(
        sceneId: PlaywrightSceneId,
        startTime: Timestamp,
        scenarioDetails: ScenarioDetails,
        test: TestCase,
        result: TestResult
    ): DomainEvent[] {

        const attempt = result.retry + 1;
        const parameters = {
            Retries: `Attempt #${ attempt }`
        };

        return [
            new SceneSequenceDetected(sceneId, scenarioDetails, startTime),
            new SceneTemplateDetected(
                sceneId,
                new Description(''),
                startTime,
            ),
            new SceneParametersDetected(
                sceneId,
                scenarioDetails,
                new ScenarioParameters(
                    new Name(''),
                    new Description(`Max retries: ${ test.retries }`),
                    parameters,
                )
            ),
        ];
    }

    createSceneFinishedEvent(test: TestCase, result: TestResult, scenarioOutcome: Outcome): SceneFinished {
        const sceneId = PlaywrightSceneId.from(test.parent.project()?.name, test, result);
        const duration = Duration.ofMilliseconds(result.duration);
        const sceneEndTime = new Timestamp(result.startTime).plus(duration);

        const scenarioDetails = this.scenarioDetailsFrom(test);

        return new SceneFinished(
            sceneId,
            scenarioDetails,
            scenarioOutcome,
            sceneEndTime,
        );
    }

    private uniqueTags(...tags: Tag[]) {
        const uniqueTags: Record<string, Tag> = { };

        for (const tag of tags) {
            const { name, type } = tag.toJSON();
            const key = `${ name } ${ type }`;
            uniqueTags[key] = tag;
        }

        return Object.values(uniqueTags);
    }

    private scenarioDetailsFrom(test: Pick<TestCase, 'titlePath' | 'location' | 'parent' | 'repeatEachIndex'>): ScenarioDetails {

        const { featureName, name } = this.scenarioMetadataFrom(test);
        const { file, line, column } = test.location;

        const nameWithoutTags = Tags.stripFrom(name);

        const repetitionSuffix = test.repeatEachIndex
            ? ` - Repetition ${ test.repeatEachIndex }`
            : '';

        const scenarioName = `${ nameWithoutTags }${ repetitionSuffix }`;

        return new ScenarioDetails(
            new Name(scenarioName),
            new Category(Tags.stripFrom(featureName)),
            new FileSystemLocation(Path.from(file), line, column),
        );
    }

    private scenarioMetadataFrom(test: Pick<TestCase, 'titlePath' | 'location'>): { featureName: string, name: string } {
        const [
            root_,
            browserName_,
            fileName,
            describeOrItBlockTitle,
            ...nestedTitles
        ] = test.titlePath();

        const scenarioName = nestedTitles.join(' ').trim();

        const name = scenarioName || describeOrItBlockTitle;
        const featureName = scenarioName ? describeOrItBlockTitle : fileName;

        return {
            featureName,
            name,
        };
    }

    private tagsFrom(scenarioDetails: ScenarioDetails, extraTagValues: string[]): Tag[] {

        const tagsFromRequirementsHierarchy  = this.requirementsHierarchy.requirementTagsFor(
            scenarioDetails.location.path,
            scenarioDetails.category.value,
        );

        const tagsFromTitle = Tags.from([
            scenarioDetails.category.value,
            scenarioDetails.name.value,
        ].join(' '));

        const extraTags = extraTagValues
            .filter(Boolean)
            .flatMap(tagValue => Tags.from(tagValue));

        return [
            ...tagsFromRequirementsHierarchy,
            ...this.uniqueTags(
                ...tagsFromTitle,
                ...extraTags,
            )
        ]
    }
}
