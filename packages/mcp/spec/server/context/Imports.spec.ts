import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { Imports } from '../../../src/server/context/index.js';

describe('Imports', () => {

    describe('merging imports', () => {

        it('should remove duplicates in the result', () => {
            const imports = new Imports({})
                .merge({ 'module-a': ['functionA', 'functionB'] })
                .merge({ 'module-a': ['functionB', 'functionC'] })
                .merge({ 'module-b': ['functionD'] })
                .toJSON();

            const expected = {
                'module-a': ['functionA', 'functionB', 'functionC'],
                'module-b': ['functionD']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should make value imports win with type imports', () => {
            const imports = new Imports()
                .merge({ 'module-a': ['functionA', 'type ClassB'] })
                .merge({ 'module-a': ['ClassB', 'type ClassC'] })
                .merge({ 'module-b': ['ClassD'] })
                .toJSON();

            const expected = {
                'module-a': ['ClassB', 'type ClassC', 'functionA'],
                'module-b': ['ClassD']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should handle empty input array', () => {
            const imports = new Imports({}).toJSON();

            expect(imports).to.deep.equal({});
        });

        it('should handle empty import objects', () => {
            const imports = new Imports({ })
                .merge({})
                .merge({ 'module-a': ['functionA'] })
                .merge({})
                .toJSON();

            const expected = {
                'module-a': ['functionA']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should handle modules with empty import arrays', () => {
            const imports = new Imports()
                .merge({ 'module-a': [] })
                .merge({ 'module-b': ['functionB'] })
                .merge({ 'module-a': ['functionA'] })
                .toJSON();

            const expected = {
                'module-a': ['functionA'],
                'module-b': ['functionB']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should handle type imports with same name appearing after value imports', () => {
            const imports = new Imports({ 'module-a': ['ClassA'] })
                .merge({ 'module-a': ['type ClassA'] })
                .toJSON();

            const expected = {
                'module-a': ['ClassA']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should handle multiple type imports with the same name', () => {
            const imports = new Imports()
                .merge({ 'module-a': ['type ClassA'] })
                .merge({ 'module-a': ['type ClassA'] })
                .merge({ 'module-a': ['type ClassB'] })
                .toJSON();

            const expected = {
                'module-a': ['type ClassA', 'type ClassB']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should handle complex scenario with mixed imports', () => {
            const imports = new Imports()
                .merge({ 'module-a': ['functionA', 'type InterfaceB', 'ClassC'] })
                .merge({ 'module-b': ['type TypeD', 'functionE'] })
                .merge({ 'module-a': ['type ClassC', 'functionF'] })
                .merge({ 'module-b': ['TypeD', 'functionE'] })
                .merge({ 'module-c': ['default'] })
                .toJSON();

            const expected = {
                'module-a': ['ClassC', 'functionA', 'functionF', 'type InterfaceB'],
                'module-b': ['functionE', 'TypeD'],
                'module-c': ['default']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should preserve import order within modules', () => {
            const imports = new Imports()
                .merge({ 'module-a': ['functionA', 'functionB'] })
                .merge({ 'module-a': ['functionC'] })
                .toJSON();

            const expected = {
                'module-a': ['functionA', 'functionB', 'functionC']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should sort imports alphabetically within each module', () => {
            const imports = new Imports()
                .merge({ 'module-a': ['ClassB', 'type ClassA', 'ClassC'] })
                .merge({ 'module-b': ['functionZ', 'functionA', 'type InterfaceM'] })
                .toJSON();

            const expected = {
                'module-a': ['type ClassA', 'ClassB', 'ClassC'],
                'module-b': ['functionA', 'functionZ', 'type InterfaceM']
            };

            expect(imports).to.deep.equal(expected);
        });

        it('should export value imports, skipping any type imports', () => {
            const imports = new Imports()
                .merge({ 'module-a': ['functionA', 'type ClassB'] })
                .merge({ 'module-b': ['type ClassD'] })
                .merge({ 'module-c': ['ClassE'] })
                .withoutTypeImports()
                .toJSON();

            const expected = {
                'module-a': [ 'functionA' ],
                'module-c': [ 'ClassE' ],
            };

            expect(imports).to.deep.equal(expected);

        })
    });
});
