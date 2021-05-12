import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { Category, Name, ScenarioDetails } from '@serenity-js/core/lib/model';
import { Suite, Test } from 'mocha';

/**
 * @package
 */
export class MochaTestMapper {
    public detailsOf(test: Test): ScenarioDetails {

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

        return new ScenarioDetails(
            new Name(this.nameOf(test)),
            new Category(this.featureNameFor(test)),
            new FileSystemLocation(
                new Path(fileOf(test)),
            ),
        );
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
