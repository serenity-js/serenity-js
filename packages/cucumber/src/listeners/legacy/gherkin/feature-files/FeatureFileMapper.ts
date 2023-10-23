import type * as messages from '@cucumber/messages';
import type { Path } from '@serenity-js/core/lib/io';
import { FileSystemLocation } from '@serenity-js/core/lib/io';
import type { Tag} from '@serenity-js/core/lib/model';
import { Description, Name, ScenarioParameters, Tags } from '@serenity-js/core/lib/model';

import { Background, Feature, Scenario, ScenarioOutline, Step } from '../model';
import { FeatureFileMap } from './FeatureFileMap';

/**
 * @private
 */
export class FeatureFileMapper {
    map(document: messages.GherkinDocument, path: Path): FeatureFileMap {
        const map = new FeatureFileMap();
        if (! (document && document.feature)) {
            return map;
        }

        // fixme: support multiple backgrounds
        let background: Background;

        document.feature.children.forEach((featureChild: messages.FeatureChild) => {

            if (this.isBackground(featureChild)) {
                background = new Background(
                    new FileSystemLocation(
                        path,
                        featureChild.background.location.line,
                        featureChild.background.location.column,
                    ),
                    new Name(featureChild.background.name),
                    featureChild.background.description && new Description(featureChild.background.description),
                    featureChild.background.steps.map(step => this.asStep(path, step)),
                );

                map.set(background).onLine(featureChild.background.location.line);
            }

            if (this.isScenario(featureChild)) {
                const scenario = new Scenario(
                    new FileSystemLocation(
                        path,
                        featureChild.scenario.location.line,
                        featureChild.scenario.location.column,
                    ),
                    new Name(featureChild.scenario.name),
                    featureChild.scenario.description && new Description(featureChild.scenario.description),
                    (background ? background.steps : []).concat(featureChild.scenario.steps.map(step => this.asStep(path, step))),
                    this.tagsFrom(...document.feature.tags, ...featureChild.scenario.tags),
                )

                map.set(scenario).onLine(featureChild.scenario.location.line);
            }

            if (this.isScenarioOutline(featureChild)) {
                const parameters: { [line: number]: ScenarioParameters } = {};

                // See https://github.com/cucumber/gherkin-javascript/blob/v5.1.0/lib/gherkin/pickles/compiler.js#L45
                featureChild.scenario.examples
                    .filter(e => e.tableHeader !== undefined)
                    .forEach(examples => {

                        const exampleSetName = new Name(examples.name);
                        const exampleSetDescription = new Description(examples.description || '');
                        const variableCells = examples.tableHeader.cells;

                        examples.tableBody.forEach(values => {
                            const valueCells = values.cells;
                            const steps = background ? [...background.steps] : [];

                            featureChild.scenario.steps.forEach(scenarioOutlineStep => {
                                const interpolatedStepText = this.interpolate(scenarioOutlineStep.text, variableCells, valueCells);
                                const interpolatedStepArgument = this.interpolateStepArgument(scenarioOutlineStep, variableCells, valueCells);

                                steps.push(new Step(
                                    new FileSystemLocation(
                                        path,
                                        scenarioOutlineStep.location.line,
                                        scenarioOutlineStep.location.column,
                                    ),
                                    new Name([
                                        scenarioOutlineStep.keyword,
                                        interpolatedStepText,
                                        interpolatedStepArgument,
                                    ].filter(_ => !!_).join('')),
                                ));
                            });

                            const scenarioParameters = variableCells
                                .map((cell, i) => ({ [cell.value]: valueCells[i].value }))
                                .reduce((acc, current) => {
                                    return {...acc, ...current};
                                }, {});

                            parameters[values.location.line] = new ScenarioParameters(
                                exampleSetName,
                                exampleSetDescription,
                                scenarioParameters,
                            );

                            map.set(new Scenario(
                                new FileSystemLocation(
                                    path,
                                    values.location.line,
                                    values.location.column,
                                ),
                                new Name(featureChild.scenario.name),
                                featureChild.scenario.description && new Description(featureChild.scenario.description),
                                steps,
                                this.tagsFrom(...document.feature.tags, ...featureChild.scenario.tags, ...examples.tags),
                                new FileSystemLocation(
                                    path,
                                    featureChild.scenario.location.line,
                                    featureChild.scenario.location.column,
                                ),
                            )).onLine(values.location.line);
                        });
                    })

                map.set(new ScenarioOutline(
                    new FileSystemLocation(
                        path,
                        featureChild.scenario.location.line,
                        featureChild.scenario.location.column,
                    ),
                    new Name(featureChild.scenario.name),
                    featureChild.scenario.description && new Description(featureChild.scenario.description),
                    (background ? background.steps : []).concat(featureChild.scenario.steps.map(step => this.asStep(path, step, [], []))),
                    parameters,
                )).onLine(featureChild.scenario.location.line);
            }
        });

        map.set(new Feature(
            new FileSystemLocation(
                path,
                document.feature.location.line,
                document.feature.location.column,
            ),
            new Name(document.feature.name),
            document.feature.description && new Description(document.feature.description),
            background,
        )).onLine(document.feature.location.line);

        return map;
    }

    private asStep(path: Path, step: messages.Step, variableCells: messages.TableCell[] = [], valueCells: messages.TableCell[] = []): Step {
        return new Step(
            new FileSystemLocation(
                path,
                step.location.line,
                step.location.column,
            ),
            new Name([
                step.keyword,
                step.text,
                this.interpolateStepArgument(step, variableCells, valueCells),
            ].filter(_ => !!_).join('')),
        );
    }

    private tagsFrom(...listsOfTags: messages.Tag[]): Tag[] {
        return listsOfTags.flatMap(tag => Tags.from(tag.name));
    }

    private interpolateStepArgument(step: messages.Step, variableCells: readonly messages.TableCell[], valueCells: readonly messages.TableCell[]): string {
        if (step.docString !== undefined) {
            return '\n' + this.interpolate(step.docString.content, variableCells, valueCells) ;
        }

        if (step.dataTable !== undefined) {
            return '\n' + this.interpolate(
                step.dataTable.rows
                    .map(row => `| ${ row.cells.map(cell => cell.value).join(' | ') } |`)
                    .join('\n'),
                variableCells,
                valueCells,
            );
        }

        return '';
    }

    // @see https://github.com/cucumber/gherkin-javascript/blob/v5.1.0/lib/gherkin/pickles/compiler.js#L115
    private interpolate(text: string, variableCells: readonly messages.TableCell[], valueCells: readonly messages.TableCell[]) {
        variableCells.forEach((variableCell, n) => {
            const valueCell = valueCells[n];
            const search = new RegExp('<' + variableCell.value + '>', 'g');
            // JS Specific - dollar sign needs to be escaped with another dollar sign
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
            const replacement = valueCell.value.replaceAll(new RegExp('\\$', 'g'), '$$$$');
            text = text.replace(search, replacement);
        });
        return text;
    }

    private isBackground<FC extends messages.FeatureChild>(featureChild?: FC): featureChild is FC & { background: messages.Background } {
        return featureChild.background !== undefined;
    }

    private isScenario<FC extends messages.FeatureChild>(featureChild?: FC): featureChild is FC & { scenario: messages.Scenario } {
        return featureChild.scenario !== undefined
            && featureChild.scenario.examples.length === 0;
    }

    private isScenarioOutline<FC extends messages.FeatureChild>(featureChild?: FC): featureChild is FC & { scenario: messages.Scenario } {
        return featureChild.scenario !== undefined
            && featureChild.scenario.examples.length > 0;
    }
}
