import { Version } from '@serenity-js/core/lib/io';
import { CucumberConfig } from './CucumberConfig';

/**
 * @private
 */
export class CucumberOptions {
    constructor(private readonly config: CucumberConfig) {
    }

    asArgumentsForCucumber(version: Version): string[] {

        return Object.keys(this.config)
            .reduce(
                (acc, option: keyof CucumberConfig) =>
                    acc.concat(this.optionToValues(option, this.config[option], version)),

                // Cucumber ignores the first two arguments anyway, but let's add them for completeness
                //  https://github.com/cucumber/cucumber-js/blob/d74bc45ba98132bdd0af62e0e52d1fe9ff017006/src/cli/helpers.js#L15
                [ 'node', 'cucumber-js' ],
            );
    }

    private optionToValues<O extends keyof CucumberConfig>(option: O, value: CucumberConfig[O], version: Version): string[] {
        const cliOption = this.asCliOptionName(option);

        switch (true) {
            case typeof value === 'boolean':
                return listOf(this.flagToArg(cliOption, value as boolean));
            case cliOption === 'tags' && version.isAtLeast(new Version('2.0.0')):
                return this.valuesToArgs(cliOption, this.tagsToCucumberExpressions(listOf(value as string | string[])));
            case this.shouldBeIgnored(value):
                return [];
            case this.isObject(value):
                return this.valuesToArgs(cliOption, JSON.stringify(value, null, 0));
            default:
                return this.valuesToArgs(cliOption, listOf(value as string | string[]));
        }
    }

    private isObject(value: any): value is object {
        return typeof value === 'object'
            && Array.isArray(value) === false
            && Object.prototype.toString.call(value) === '[object Object]';
    }

    private shouldBeIgnored(value: any): boolean {
        return value === undefined
            || value === null
            || value === ''
            || value === [];
    }

    /**
     * @desc
     *  Converts camelCase option names to kebab-case.
     *
     * @param {string} option
     * @returns {string}
     *
     * @private
     */
    private asCliOptionName(option: string): string {
        return option
            .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
            .toLowerCase();
    }

    private tagsToCucumberExpressions(tags: string[]): string[] {
        return tags.filter(tag => !! tag.replace)
                .map(tag => tag.replace(/~/g, 'not '));
    }

    private flagToArg(option: string, value: boolean): string {
        const isNegated = (optionName: string) => optionName.startsWith('no-');

        switch (true) {
            case !! value:
                return `--${ option }`;
            case isNegated(option) && ! value:
                return `--${ option.replace(/^no-/, '') }`;
            default:
                return `--no-${ option }`;
        }
    }

    private valuesToArgs(option: string, values: string | string[]): string[] {
        return listOf(values)
            .map(value => [ `--${ option }`, value])
            .reduce((acc, tuple) => acc.concat(tuple), []);
    }
}

function listOf<T>(valueOrValues: T | T[]): T[] {
    return [].concat(valueOrValues);
}
