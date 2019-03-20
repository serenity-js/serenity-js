import 'mocha';

import { Description, Name, ScenarioParameters } from '../../src/model';
import { expect } from '../expect';

describe('ScenarioParameters', () => {

    const
        name = new Name('set of examples'),
        desciption = new Description('description of the examples');

    /** @test {ScenarioParameters} */
    it('can be instantiated using a plain-old JavaScript object', () => {

        const parameters = { Dev: 'jan-molak' };
        const scenarioParameters = new ScenarioParameters(name, desciption, parameters);

        expect(scenarioParameters.values).to.deep.equal(parameters);
    });

    /** @test {ScenarioParameters} */
    it('can be serialised to JSON', () => {
        const parameters = { Dev: 'jan-molak' };
        const scenarioParameters = new ScenarioParameters(name, desciption, parameters);

        expect(scenarioParameters.toJSON()).to.deep.equal({
            name: name.toJSON(),
            description: desciption.toJSON(),
            values: parameters,
        });
    });

    /** @test {ScenarioParameters} */
    it('can be deserialised from JSON', () => {
        const parameters = { Dev: 'jan-molak' };

        expect(new ScenarioParameters(name, desciption, parameters))
            .to.equal(ScenarioParameters.fromJSON({
                name: name.toJSON(),
                description: desciption.toJSON(),
                values: parameters,
            }));
    });
});
