import parser = require('@babel/parser');
import ts = require('typescript');
import { inspect } from 'util';

describe('experiments', () => {

    const options: parser.ParserOptions = {
        sourceType: 'module',
        plugins: [
            'classProperties',
            'typescript',
            'objectRestSpread',
        ],
    };

    describe('@babel/parser', () => {

        const print = (code: any) => console.debug('>>>', inspect(code, true, 10))

        it('recognises a TypeScript function', () => {
            // print(`export const myConst: number = 2;`);
            //
            print(parser.parse(`
                /**
                 * @desc
                 *  An awesome greeter function
                 *
                 * @param {string} name
                 * @returns {string}
                 */
                function greet(name: string): string {
                    return 'Hello ' + name + '!';
                }`,
                options,
            ));

            // print(`
            //     class Person {
            //       constructor(public readonly name: string) {
            //       }
            //     }
            // `);
        });

    });

});

/*
plugins:
    'estree' |
    'jsx' |
    'flow' |
    'flowComments' |
    'typescript' |
    'doExpressions' |
    'objectRestSpread' |
    'decorators' |
    'decorators-legacy' |
    'classProperties' |
    'classPrivateProperties' |
    'classPrivateMethods' |
    'exportDefaultFrom' |
    'exportNamespaceFrom' |
    'asyncGenerators' |
    'functionBind' |
    'functionSent' |
    'dynamicImport' |
    'numericSeparator' |
    'optionalChaining' |
    'importMeta' |
    'bigInt' |
    'optionalCatchBinding' |
    'throwExpressions' |
    'pipelineOperator' |
    'nullishCoalescingOperator'
 */
