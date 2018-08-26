import { Description, Name, ScenarioParameters } from '@serenity-js/core/lib/model';

import { Background, Feature, Scenario, ScenarioOutline, Step } from '../model';
import * as nodes from '../nodes';
import { FeatureFileMap } from './FeatureFileMap';

export class Mapper {
    map(document: nodes.GherkinDocument): FeatureFileMap {

        const map = new FeatureFileMap();

        let background: Background;

        document.feature.children.forEach(scenarioDefinition => {
            switch (scenarioDefinition.type) {

                case 'Background':

                    background = new Background(
                        new Name(scenarioDefinition.name),
                        scenarioDefinition.description && new Description(scenarioDefinition.description),
                        scenarioDefinition.steps.map(step => this.asStep(step)),
                    );

                    map.set(background).onLine(scenarioDefinition.location.line);

                    break;

                case 'Scenario':

                    map.set(new Scenario(
                        new Name(scenarioDefinition.name),
                        scenarioDefinition.description && new Description(scenarioDefinition.description),
                        (background ? background.steps : []).concat(scenarioDefinition.steps.map(step => this.asStep(step))),
                    )).onLine(scenarioDefinition.location.line);

                    break;

                case 'ScenarioOutline':

                    const
                        outline = scenarioDefinition as nodes.ScenarioOutline,
                        parameters: { [line: number]: ScenarioParameters } = {};

                    // @see https://github.com/cucumber/gherkin-javascript/blob/v5.1.0/lib/gherkin/pickles/compiler.js#L45
                    outline.examples.filter(e => e.tableHeader !== undefined).forEach(examples => {

                        const
                            exampleSetName = new Name(examples.name),
                            exampleSetDescription = examples.description && new Description(examples.description),
                            variableCells = examples.tableHeader.cells;

                        examples.tableBody.forEach(values => {
                            const
                                valueCells = values.cells,
                                steps = background ? background.steps : [];

                            outline.steps.forEach(scenarioOutlineStep => {
                                const
                                    interpolatedStepText = this.interpolate(scenarioOutlineStep.text, variableCells, valueCells),
                                    interpolatedStepArgument = this.interpolateStepArgument(scenarioOutlineStep.argument, variableCells, valueCells);

                                steps.push(new Step([
                                    scenarioOutlineStep.keyword,
                                    interpolatedStepText,
                                    interpolatedStepArgument,
                                ].filter(_ => !!_).join('')));
                            });

                            const scenarioParameters = variableCells
                                .map((cell, i) => ({ [cell.value]: valueCells[i].value }))
                                .reduce((acc, current) => ({ ...acc, ...current }), {});

                            parameters[values.location.line] = new ScenarioParameters(
                                exampleSetName,
                                exampleSetDescription,
                                scenarioParameters,
                            );

                            map.set(new Scenario(
                                new Name(scenarioDefinition.name),
                                scenarioDefinition.description && new Description(scenarioDefinition.description),
                                steps,
                            )).onLine(values.location.line);
                        });
                    });

                    map.set(new ScenarioOutline(
                        new Name(scenarioDefinition.name),
                        scenarioDefinition.description && new Description(scenarioDefinition.description),
                        (background ? background.steps : []).concat(scenarioDefinition.steps.map(step => this.asStep(step, [], []))),
                        parameters,
                    )).onLine(scenarioDefinition.location.line);

                    break;
            }
        });

        map.set(new Feature(
            new Name(document.feature.name),
            document.feature.description && new Description(document.feature.description),
            background,
        )).onLine(document.feature.location.line);

        return map;
    }

    private asStep(step: nodes.Step, variableCells: nodes.TableCell[] = [], valueCells: nodes.TableCell[] = []): Step {
        return new Step([
            step.keyword,
            step.text,
            this.interpolateStepArgument(step.argument, variableCells, valueCells),
        ].filter(_ => !!_).join(''));
    }

    private interpolateStepArgument(argument: nodes.StepArgument, variableCells: nodes.TableCell[], valueCells: nodes.TableCell[]): string {
        switch (true) {
            case argument && argument.type === 'DocString':
                return '\n' + this.interpolate((argument as nodes.DocString).content, variableCells, valueCells) ;
            case argument && argument.type === 'DataTable':
                return '\n' + this.interpolate(
                    (argument as nodes.DataTable).rows
                        .map(row => `| ${ row.cells.map(cell => cell.value).join(' | ') } |`)
                        .join('\n'),
                    variableCells,
                    valueCells,
                );
            default:
                return '';
        }
    }

    // @see https://github.com/cucumber/gherkin-javascript/blob/v5.1.0/lib/gherkin/pickles/compiler.js#L115
    private interpolate(text: string, variableCells: nodes.TableCell[], valueCells: nodes.TableCell[]) {
        variableCells.forEach((variableCell, n) => {
            const valueCell = valueCells[n];
            const search = new RegExp('<' + variableCell.value + '>', 'g');
            // JS Specific - dollar sign needs to be escaped with another dollar sign
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
            const replacement = valueCell.value.replace(new RegExp('\\$', 'g'), '$$$$');
            text = text.replace(search, replacement);
        });
        return text;
    }
}
