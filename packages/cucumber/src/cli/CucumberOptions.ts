import { Version } from '@serenity-js/core/lib/io';

import { CucumberConfig } from './CucumberConfig';

/**
 * @private
 */
export class CucumberOptions {
    constructor(private readonly config: CucumberConfig) {
    }

    isStrict(): boolean {
        return this.asBoolean('strict', true);
    }

    asArgumentsForCucumber(version: Version): string[] {

        return Object.keys(this.config)
            .reduce(
                (acc, option: keyof CucumberConfig) =>
                    isNotEmpty(this.config[option])
                        ? acc.concat(this.optionToValues(option, this.config[option], version))
                        : acc,

                // Cucumber ignores the first two arguments anyway, but let's add them for completeness
                //  https://github.com/cucumber/cucumber-js/blob/d74bc45ba98132bdd0af62e0e52d1fe9ff017006/src/cli/helpers.js#L15
                [ 'node', 'cucumber-js' ],
            )
            .concat(this.config.rerun ?? []);
    }

    private optionToValues<O extends keyof CucumberConfig>(option: O, value: CucumberConfig[O], version: Version): string[] {
        const cliOption = this.asCliOptionName(option);

        switch (true) {
            case cliOption === 'tags' && version.isAtLeast(new Version('2.0.0')) && value !== false:
                return this.valuesToArgs(cliOption, this.tagsToCucumberExpressions(listOf(value as string | string[])));
            case typeof value === 'boolean':
                return listOf(this.flagToArg(cliOption, value as boolean));
            case this.isObject(value):
                return this.valuesToArgs(cliOption, JSON.stringify(value, undefined, 0));
            default:
                return this.valuesToArgs(cliOption, listOf(value as string | string[]));
        }
    }

    private asBoolean<K extends keyof CucumberConfig>(key: K, defaultValue: boolean): boolean {
        if (typeof this.config[key] === 'boolean') {
            return this.config[key] as boolean;
        }

        if (typeof this.config[negated(key)] === 'boolean') {
            return ! this.config[negated(key)] as boolean;
        }

        return defaultValue;
    }

    private isObject(value: any): value is object { // eslint-disable-line @typescript-eslint/ban-types
        return typeof value === 'object'
            && Array.isArray(value) === false
            && Object.prototype.toString.call(value) === '[object Object]';
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
            .replace(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1-$2')
            .toLowerCase();
    }

    private tagsToCucumberExpressions(tags: string[]): string {
        return tags.filter(tag => !! tag.replace)
                .map(tag => tag.replace(/~/g, 'not '))
                .join(' and ');
    }

    private flagToArg(option: string, value: boolean): string {
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

function isNegated(optionName: string) {
    return optionName.startsWith('no-');
}

// this method will need to be smarter if it was to be public, i.e. to avoid double negatives like noStrict=false
function negated(name: string) {
    return 'no' + name.charAt(0).toUpperCase() + name.slice(1);
}

function isNotEmpty(value: any): boolean {
    return value !== undefined
        && value !== null
        && value !== ''
        && ! (Array.isArray(value) && value.length === 0);
}

function listOf<T>(valueOrValues: T | T[]): T[] {
    return [].concat(valueOrValues).filter(isNotEmpty);
}
