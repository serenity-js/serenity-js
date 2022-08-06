/**
 * @group Integration
 */
export interface CucumberAdapterConfig {

    /**
     * Instruct Serenity/JS Cucumber Adapter to take over the `stdout` output
     * of native Cucumber reporters to prevent them from clobbering the log.
     */
    useStandardOutput: boolean;

    /**
     * Add `runnerId` to names of output files produced by native Cucumber.js formatters
     */
    uniqueFormatterOutputs: boolean;
}
