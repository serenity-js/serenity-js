import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { Category, Name, ScenarioDetails, type Tag, Tags } from '@serenity-js/core/lib/model';
import type { Suite, Test } from 'mocha';

/**
 * @package
 */
export class MochaTestMapper {
    constructor(private readonly cwd: Path) {
    }

    public detailsOf(test: Test): { scenarioDetails: ScenarioDetails, scenarioTags: Tag[] } {

        function fileOf(t) {
            switch (true) {
                case !! t.ctx && !! t.ctx.currentTest && !! t.ctx.currentTest.file:
                    return t.ctx.currentTest.file;
                case !! t.file:
                    return t.file;
                case !! t.parent:
                    return fileOf(t.parent);
                default:
                    throw new Error(`Couldn't determine path of ${ t }`);
            }
        }

        const path = new Path(fileOf(test));
        const scenarioName = this.nameOf(test);
        const title = this.fullNameOf(test);

        const name = scenarioName || title;

        const featureName = scenarioName
            ? this.featureNameFor(test)
            : this.cwd.relative(path).value;

        return {
            scenarioDetails: new ScenarioDetails(
                new Name(Tags.stripFrom(name)),
                new Category(Tags.stripFrom(featureName)),
                new FileSystemLocation(path),
            ),
            scenarioTags: Tags.from(`${ featureName } ${ name }`),
        };
    }

    public featureNameFor(scenario: Test | Suite): string {
        const parentTitle = scenario?.parent?.title;

        return parentTitle !== undefined && parentTitle.trim() !== ''
            ? this.featureNameFor(scenario.parent)
            : scenario.title;
    }

    private fullNameOf(scenario: Test | Suite): string {
        return scenario.parent
            ? `${ this.fullNameOf(scenario.parent) } ${ scenario.title }`.trim()
            : scenario.title;
    }

    private nameOf(scenario: Test | Suite): string {
        return this.fullNameOf(scenario)
            .slice(this.featureNameFor(scenario).length)
            .trim();
    }
}
