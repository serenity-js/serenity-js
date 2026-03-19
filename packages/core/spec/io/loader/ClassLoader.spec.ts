import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, it } from 'mocha';

import { ConfigurationError } from '../../../src/errors';
import { ClassDescriptionParser, ClassLoader, ModuleLoader, trimmed } from '../../../src/io';
import { expect } from '../../expect';
import type { Example } from './examples/Example';
import type { ExampleNoArgument } from './examples/ExampleNoArgument';
import type { ExampleWithFactoryMethod } from './examples/ExampleWithFactoryMethod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            const example = loader.instantiate<Example>('./examples/module-with-default-no-arg-export.cjs');
            expect(example.name).to.equal('module with default export');
        });

        it('instantiates a class from a module providing a named export', () => {
            const example = loader.instantiate<ExampleNoArgument>('./examples/module-with-named-export.cjs:ExampleNoArgument');
            expect(example.name).to.equal('example with no-arg constructor');
        });

        it(`instantiates a class from a module providing a named export with a single-argument constructor function`, () => {
            const example = loader.instantiate<Example>(['./examples/Example.cjs:Example', 'my example' ]);
            expect(example.name).to.equal('my example');
        });

        it('instantiates a class from a module providing a named export with a fromJSON factory method', () => {
            const example = loader.instantiate<ExampleWithFactoryMethod>([ './examples/module-with-factory-method.cjs:ExampleWithFactoryMethod', { name: 'custom name' } ]);
            expect(example.name).to.equal('custom name');
        });

        it('instantiates a class from a module providing a default export with a fromJSON factory method', () => {
            const example = loader.instantiate<ExampleWithFactoryMethod>(['./examples/module-with-default-export-and-factory-method.cjs', { name: 'custom name' } ]);
            expect(example.name).to.equal('custom name');
        });

        it(`instantiates a class from a module providing a default export with a constructor function`, () => {
            const example = loader.instantiate<Example>(['./examples/module-with-default-export.cjs', 'my example' ]);
            expect(example.name).to.equal('my example');
        });
    });

    describe('complains when the module', () => {

        it(`doesn't provide a default export`, () => {
            expect(() => {
                loader.instantiate('./examples/module-with-named-export.cjs')
            }).to.throw(ConfigurationError, `Module './examples/module-with-named-export.cjs' doesn't seem to export 'default'. Exported members include: 'ExampleNoArgument'`)
        });

        it(`doesn't provide the desired named export`, () => {
            expect(() => {
                loader.instantiate('./examples/module-with-named-export.cjs:InvalidType')
            }).to.throw(ConfigurationError, `Module './examples/module-with-named-export.cjs' doesn't seem to export 'InvalidType'. Exported members include: 'ExampleNoArgument'`)
        });

        it(`provides an export that produces an undefined`, () => {
            expect(() => {
                loader.instantiate('./examples/module-with-default-export-producing-undefined.cjs')
            }).to.throw(ConfigurationError, trimmed`
                | 'default' exported by './examples/module-with-default-export-producing-undefined.cjs' must be either:
                | - a constructor function accepting config
                | - a function accepting config`
            )
        });

        it(`provides an export that requires a parameter when no parameter is given`, () => {
            expect(() => {
                loader.instantiate('./examples/module-with-default-export-with-one-parameter.cjs')
            }).to.throw(ConfigurationError, `'default' exported by './examples/module-with-default-export-with-one-parameter.cjs' must be a parameterless function since no config parameter is specified`)
        });

        it(`provides an export that requires more than one parameter when only one parameter is given`, () => {
            expect(() => {
                loader.instantiate(['./examples/module-with-default-export-with-two-parameters.cjs', { name: 'my example' }])
            }).to.throw(ConfigurationError, `'default' exported by './examples/module-with-default-export-with-two-parameters.cjs' `+
                `must be a class with a static fromJSON(config) method or a function that accepts a single config parameter: {"name":"my example"}`
            )
        });
    });
});
