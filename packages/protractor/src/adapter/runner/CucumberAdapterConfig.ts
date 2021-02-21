/**
 * @public
 * @interface
 */
export interface CucumberAdapterConfig {
    /**
     * @desc
     *  Instruct Serenity/JS Cucumber Adapter to take over the stdout output of native Cucumber reporters to prevent them from clobbering the log
     *
     * @type {boolean}
     */
    useStandardOutput: boolean;

    /**
     * @desc
     *  Add `runnerId` to names of output files produced by native Cucumber.js formatters
     *
     * @type {boolean}
     */
    uniqueFormatterOutputs: boolean;
}
