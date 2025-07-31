import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { EnvironmentVariables } from '../../src/io/EnvironmentVariables';
import { expect } from '../expect';

describe('EnvironmentVariables', () => {

    describe('isSet', () => {

        given([
            { name: 'EXISTING_VAR',     expected: true,     env: { EXISTING_VAR: 'value' } },
            { name: 'MISSING_VAR',      expected: false,    env: {} },
            { name: 'MISSING_VAR',      expected: false,    env: { MISSING_VAR: undefined } },
            { name: 'EMPTY_VAR',        expected: true,     env: { EMPTY_VAR: '' } },
            { name: 'lowercase_var',    expected: true,     env: { lowercase_var: 'lowercase_value' } },
            { name: 'LOWERCASE_VAR',    expected: false,    env: { lowercase_var: 'lowercase_value' } },
            { name: 'MixedCaseVar',     expected: true,     env: { MixedCaseVar: 'mixed_case_value' } },
            { name: 'MIXEDCASEVAR',     expected: false,    env: { MixedCaseVar: 'mixed_case_value' } },
            { name: 'NON_EXISTENT_VAR', expected: false,    env: {} },
        ]).it('detects if the variable with the exact name is set', ({ env, name, expected }) => {
            const environment = new EnvironmentVariables(env);

            const result = environment.isSet(name);

            expect(result).to.equal(expected);
        });
    });

    describe('find', () => {
        given([
            { name: 'EXISTING_VAR',     expected: 'value',  env: { EXISTING_VAR: 'value' } },
            { name: 'MISSING_VAR',      expected: undefined, env: {} },
            { name: 'EMPTY_VAR',        expected: '',       env: { EMPTY_VAR: '' } },
            { name: 'lowercase_var',    expected: 'lowercase_value', env: { lowercase_var: 'lowercase_value' } },
            { name: 'LOWERCASE_VAR',    expected: 'lowercase_value', env: { lowercase_var: 'lowercase_value' } },
            { name: 'MixedCaseVar',     expected: 'mixed_case_value', env: { MixedCaseVar: 'mixed_case_value' } },
            { name: 'MIXEDCASEVAR',     expected: undefined, env: { MixedCaseVar: 'mixed_case_value' } },
        ]).it('finds the variable by its name or upper/lower case variations', ({ env, name, expected }) => {
            const environment = new EnvironmentVariables(env);

            const result = environment.find(name);

            expect(result).to.equal(expected);
        });
    });

    describe('findFirst', () => {

        it('returns the first set variable from the list of candidate names', () => {

            const environment = new EnvironmentVariables({
                'npm_config_http_proxy': undefined,
                'http_proxy': undefined,
                'npm_config_proxy': undefined,
                'all_proxy': 'http://localhost:8080',
            });

            const result = environment.findFirst(
                'npm_config_http_proxy',
                'http_proxy',
                'npm_config_proxy',
                'all_proxy'
            );

            expect(result).to.equal('http://localhost:8080');
        });

        it('returns an empty value if none of the candidate variables are set', () => {

            const environment = new EnvironmentVariables({
                'npm_config_http_proxy': undefined,
                'http_proxy': undefined,
                'npm_config_proxy': undefined,
                'all_proxy': undefined,
            });

            const result = environment.findFirst(
                'npm_config_http_proxy',
                'http_proxy',
                'npm_config_proxy',
                'all_proxy'
            );

            expect(result).to.equal(undefined);
        });
    });
});
