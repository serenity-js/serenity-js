import 'mocha';

import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { Description, Name, ScenarioParameters } from '@serenity-js/core/lib/model';
import Gherkin = require('gherkin'); // ts-node:disable-line:no-var-requires     No type definitions available

import { FeatureFileMap, FeatureFileMapper, FeatureFileParser } from '../../../src/gherkin';
import { Background, Feature, Scenario, ScenarioOutline, Step } from '../../../src/gherkin/model';

describe('FeatureFileMapper', () => {

    describe('when mapping names and descriptions', () => {

        it('maps a feature', parse('names_and_descriptions.feature', map => {
            expect(map.get(Feature).onLine(1)).to.equal(new Feature(
                new Name('Names and descriptions'),
                new Description('A multi-line\n\ndescription\nof a feature'),
            ));
        }));

        it('maps a scenario with a single-line description', parse('names_and_descriptions.feature', map => {
            const scenario = map.get(Scenario).onLine(8);

            expect(scenario.name).to.equal(new Name('The one with a description'));
            expect(scenario.description).to.equal(new Description('Description of a scenario'));
        }));

        it('maps a scenario with a multi-line description', parse('names_and_descriptions.feature', map => {
            const scenario = map.get(Scenario).onLine(14);

            expect(scenario.name).to.equal(new Name('The one with a multi-line description'));
            expect(scenario.description).to.equal(new Description('A multi-line\n\ndescription\nof a scenario'));
        }));
    });

    describe('when mapping scenarios with no steps', () => {

        it('maps a scenario even though it has no steps defined', parse('no_steps.feature', map => {
            const scenario = map.get(Scenario).onLine(3);

            expect(scenario.name).to.equal(new Name('The one with no steps'));
            expect(scenario.steps).have.lengthOf(0);
        }));
    });

    describe('when mapping scenarios with backgrounds', () => {

        it('maps the background with no name or description', parse('background_with_no_name_or_description.feature', map => {
            const firstBackground = map.get(Background).onLine(3);

            expect(firstBackground.name).to.equal(new Name(''));
            expect(firstBackground.description).to.equal(undefined);
            expect(firstBackground.steps).to.deep.equal([
                new Step('Given a prerequisite'),
            ]);
        }));

        it('maps the background with name and description', parse('backgrounds.feature', map => {
            const firstBackground = map.get(Background).onLine(3);

            expect(firstBackground.name).to.equal(new Name('The one that provides some context'));
            expect(firstBackground.description).to.equal(new Description('Once upon a time, there was a test suite.'));
            expect(firstBackground.steps).to.deep.equal([
                new Step('Given a prerequisite'),
            ]);
        }));

        it('associates the background with the feature', parse('backgrounds.feature', map => {
            const feature = map.get(Feature).onLine(1);

            expect(feature.background).to.equal(
                new Background(
                    new Name('The one that provides some context'),
                    new Description('Once upon a time, there was a test suite.'),
                    [
                        new Step('Given a prerequisite'),
                    ],
            ));
        }));

        it('associates the background steps with the scenarios', parse('backgrounds.feature', map => {
            const scenario = map.get(Scenario).onLine(9);

            expect(scenario.steps).to.deep.equal([
                new Step('Given a prerequisite'),
                new Step('Given some scenario step'),
            ]);
        }));
    });

    describe('when mapping scenario with special step arguments', () => {

        it('recognises DocString argument', parse('step_arguments.feature', map => {
            const scenario = map.get(Scenario).onLine(3);

            expect(scenario.steps).to.deep.equal([
                new Step('Given a step with DocString argument:\nA couple of\nlines of\ntext'),
            ]);
        }));

        it('recognises DataTable argument', parse('step_arguments.feature', map => {
            const scenario = map.get(Scenario).onLine(12);

            expect(scenario.steps).to.deep.equal([
                new Step('Given a step with a DataTable argument:\n| first name | last name |\n| Jan | Molak |'),
            ]);
        }));
    });

    describe('when mapping scenario outlines with one set of examples', () => {
        it('maps the scenario template', parse('scenario_outlines.feature', map => {
            const scenario = map.get(ScenarioOutline).onLine(3);

            expect(scenario).to.equal(new ScenarioOutline(
                new Name('The one with examples'),
                new Description('Description of the scenario with examples'),
                [
                    new Step('Given step with a <parameter>'),
                ],
                {
                    14: new ScenarioParameters(
                        new Name('Name of the example set'),
                        new Description('Description of the example set'),
                        { parameter: 'value one' },
                    ),
                    15: new ScenarioParameters(
                        new Name('Name of the example set'),
                        new Description('Description of the example set'),
                        { parameter: 'value two' },
                    ),
                },
            ));
        }));

        it('maps the interpolated scenario', parse('scenario_outlines.feature', map => {
            expect(map.get(Scenario).onLine(14)).to.equal(new Scenario(
                new Name('The one with examples'),
                new Description('Description of the scenario with examples'),
                [
                    new Step('Given step with a value one'),
                ],
            ));

            expect(map.get(Scenario).onLine(15)).to.equal(new Scenario(
                new Name('The one with examples'),
                new Description('Description of the scenario with examples'),
                [
                    new Step('Given step with a value two'),
                ],
            ));
        }));
    });

    describe('when mapping scenario outlines with multiple sets of examples', () => {
        it('recognises the different names and descriptions of example sets', parse('scenario_outlines.feature', map => {
            expect(map.get(ScenarioOutline).onLine(17)).to.equal(new ScenarioOutline(
                new Name('The one with more examples'),
                new Description('Description of the scenario with more examples'),
                [
                    new Step('Given step with a <parameter>'),
                ],
                {
                    28: new ScenarioParameters(
                        new Name('Name of the first set of examples'),
                        new Description('Description of the first set of examples'),
                        { parameter: 'value one' },
                    ),
                    29: new ScenarioParameters(
                        new Name('Name of the first set of examples'),
                        new Description('Description of the first set of examples'),
                        { parameter: 'value two' },
                    ),
                    36: new ScenarioParameters(
                        new Name('Name of the second set of examples'),
                        new Description('Description of the second set of examples'),
                        { parameter: 'value three' },
                    ),
                    37: new ScenarioParameters(
                        new Name('Name of the second set of examples'),
                        new Description('Description of the second set of examples'),
                        { parameter: 'value four' },
                    ),
                },
            ));
        }));
    });

    describe('when mapping scenario outlines with special step arguments', () => {
        it('recognises and interpolates DocString arguments', parse('scenario_outlines.feature', map => {
            const outline = map.get(ScenarioOutline).onLine(39);
            expect(outline.name).to.equal(new Name('The one with parametrised step argument (DocString)'));
            expect(outline.steps[0]).to.equal(new Step('Given step with a:\nParameter of <parameter>'));
            expect(outline.parameters[49]).to.equal(new ScenarioParameters(
                new Name(''),
                undefined,
                { parameter: 'value one' },
            ));

            const scenario = map.get(Scenario).onLine(49);
            expect(scenario.steps[0]).to.equal(new Step('Given step with a:\nParameter of value one'));
        }));

        it('recognises and interpolates DataTable arguments', parse('scenario_outlines.feature', map => {
            const outline = map.get(ScenarioOutline).onLine(51);
            expect(outline.name).to.equal(new Name('The one with parametrised step argument (DataTable)'));
            expect(outline.steps[0])
                .to.equal(new Step('Given the user logs in as <username> with the following credentials:\n| username | <username> |\n| password | <password> |'));
            expect(outline.parameters[60]).to.equal(new ScenarioParameters(
                new Name(''),
                undefined,
                { username: 'admin', password: 'P@ssw0rd1' },
            ));
            expect(outline.parameters[61]).to.equal(new ScenarioParameters(
                new Name(''),
                undefined,
                { username: 'editor', password: 'P@ssw0rd2' },
            ));

            expect(map.get(Scenario).onLine(60).steps[0])
                .to.equal(new Step('Given the user logs in as admin with the following credentials:\n| username | admin |\n| password | P@ssw0rd1 |'));

            expect(map.get(Scenario).onLine(61).steps[0])
                .to.equal(new Step('Given the user logs in as editor with the following credentials:\n| username | editor |\n| password | P@ssw0rd2 |'));
        }));
    });

    function parse(featureFileName: string, spec: (map: FeatureFileMap) => void) {
        const
            path = new Path(__dirname).join(new Path('fixtures')).join(new Path(featureFileName)),
            mapper = new FeatureFileMapper(),
            loader = new FeatureFileParser(new Gherkin.Parser());

        return () => loader.parse(path).then(document => mapper.map(document)).then(spec);
    }
});
