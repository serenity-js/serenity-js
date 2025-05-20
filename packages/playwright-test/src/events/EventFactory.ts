import { type Location, type TestCase, type TestResult } from '@playwright/test/reporter';
import { Duration, Timestamp } from '@serenity-js/core';
import {
    type DomainEvent,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected
} from '@serenity-js/core/lib/events';
import { FileSystem, FileSystemLocation, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io';
import type { Outcome, Tag } from '@serenity-js/core/lib/model';
import { Category, CorrelationId, Name, ScenarioDetails, Tags } from '@serenity-js/core/lib/model';

export class EventFactory {
    private requirementsHierarchy: RequirementsHierarchy;

    constructor(rootDirectory: Path) {
        this.requirementsHierarchy = new RequirementsHierarchy(
            new FileSystem(rootDirectory),
        );
    }

    createSceneStartEvents(test: Pick<TestCase, 'id' | 'titlePath' | 'location' | 'tags'>, startTime: Timestamp): DomainEvent[] {
        const sceneId = new CorrelationId(test.id);

        const { featureName, name } = this.scenarioMetadataFrom(test);
        const scenarioDetails       = this.scenarioDetailsFrom(featureName, name, test.location);
        const tagsFromTitle         = this.tagsFromText(featureName, name);
        const arbitraryTags         = test.tags.flatMap(tag => Tags.from(tag));
        const hierarchyTags         = this.requirementsHierarchy.requirementTagsFor(
            scenarioDetails.location.path,
            scenarioDetails.category.value,
        )

        const allTags = [
            ...hierarchyTags,
            ...this.uniqueTags(...tagsFromTitle, ...arbitraryTags),
        ];

        const sceneTaggedEvents = allTags.map(tag => new SceneTagged(sceneId, tag, startTime))

        return [
            new SceneStarts(sceneId, scenarioDetails, startTime),
            new TestRunnerDetected(sceneId, new Name('Playwright'), startTime),
            ...sceneTaggedEvents,
        ];
    }

    createSceneFinishedEvent(test: TestCase, result: TestResult, scenarioOutcome: Outcome): SceneFinished {
        const sceneId = new CorrelationId(test.id);
        const sceneEndTime = new Timestamp(result.startTime).plus(Duration.ofMilliseconds(result.duration));

        const { featureName, name } = this.scenarioMetadataFrom(test);
        const scenarioDetails       = this.scenarioDetailsFrom(featureName, name, test.location);

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

    private scenarioDetailsFrom(featureName: string, name: string, location: Location): ScenarioDetails {
        return new ScenarioDetails(
            new Name(Tags.stripFrom(name)),
            new Category(Tags.stripFrom(featureName)),
            new FileSystemLocation(Path.from(location.file), location.line, location.column),
        );
    }

    private tagsFromText(...chunks: string[]): Tag[] {
        return Tags.from(chunks.join(' '));
    }
}
