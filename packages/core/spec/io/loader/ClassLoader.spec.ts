import { describe, it } from 'mocha';

import { ConfigurationError } from '../../../src/errors';
import { ClassDescriptionParser, ClassLoader, ModuleLoader } from '../../../src/io';
import { expect } from '../../expect';
import type { Example } from './examples/Example';
import type { ExampleNoArgument } from './examples/ExampleNoArgument';
import type { ExampleWithFactoryMethod } from './examples/ExampleWithFactoryMethod';

describe('ClassLoader', () => {

    let loader: ClassLoader;

    beforeEach(() => {
        loader = new ClassLoader(
            new ModuleLoader(__dirname),
            new ClassDescriptionParser(),
        );
    });

    describe('instantiate', () => {

        it('instantiates a class from a module providing a default export', () => {
            const example = loader.instantiate<Example>('./examples/module-with-default-no-arg-export.ts');
            expect(example.name).to.equal('module with default export');
        });

        it('instantiates a class from a module providing a named export', () => {
            const example = loader.instantiate<ExampleNoArgument>('./examples/module-with-named-export:ExampleNoArgument');
            expect(example.name).to.equal('example with no-arg constructor');
        });

        it('instantiates a class from a module providing a named export with a fromJSON factory method', () => {
            const example = loader.instantiate<ExampleWithFactoryMethod>([ './examples/module-with-factory-method:ExampleWithFactoryMethod', { name: 'custom name' } ]);
            expect(example.name).to.equal('custom name');
        });

        it('instantiates a class from a module providing a default export with a fromJSON factory method', () => {
            const example = loader.instantiate<ExampleWithFactoryMethod>(['./examples/module-with-default-export-and-factory-method', { name: 'custom name' } ]);
            expect(example.name).to.equal('custom name');
        });
    });

    describe('complains when the module', () => {

        it(`doesn't provide a default export`, () => {
            expect(() => {
                loader.instantiate('./examples/module-with-named-export')
            }).to.throw(ConfigurationError, `Module './examples/module-with-named-export' doesn't seem to export 'default'. Exported members include: 'ExampleNoArgument'`)
        });

        it(`doesn't provide the desired named export`, () => {
            expect(() => {
                loader.instantiate('./examples/module-with-named-export:InvalidType')
            }).to.throw(ConfigurationError, `Module './examples/module-with-named-export' doesn't seem to export 'InvalidType'. Exported members include: 'ExampleNoArgument'`)
        });

        it(`doesn't provide a default export with no no-arg constructor`, () => {
            expect(() => {
                loader.instantiate('./examples/module-with-default-export')
            }).to.throw(ConfigurationError, `Class 'default' exported by './examples/module-with-default-export' doesn't seem to offer a no-arg constructor`)
        });

        it(`doesn't provide a default export with no fromJSON method when a parameter is used`, () => {
            expect(() => {
                loader.instantiate(['./examples/module-with-default-export', { name: 'my example'} ]);
            }).to.throw(ConfigurationError, `Class 'default' exported by './examples/module-with-default-export' needs a static fromJSON() method that accepts {"name":"my example"}`);
        });

        it(`doesn't provide a named export with no no-arg constructor`, () => {
            expect(() => {
                loader.instantiate('./examples/Example:Example');
            }).to.throw(ConfigurationError, `Class 'Example' exported by './examples/Example' doesn't seem to offer a no-arg constructor`);
        });

        it(`doesn't provide a named export with no fromJSON method when a parameter is used`, () => {
            expect(() => {
                loader.instantiate(['./examples/Example:Example', { name: 'my named export example'} ]);
            }).to.throw(ConfigurationError, `Class 'Example' exported by './examples/Example' needs a static fromJSON() method that accepts {"name":"my named export example"}`);
        });
    });
});
