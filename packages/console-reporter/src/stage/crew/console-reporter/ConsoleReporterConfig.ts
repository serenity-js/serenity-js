/**
 * Used to configure the [`ConsoleReporter`](https://serenity-js.org/api/console-reporter/class/ConsoleReporter/).
 *
 * @group Stage
 */
export interface ConsoleReporterConfig {
    /**
     * Choose a colour theme optimised for light, dark, or monochromatic terminals.
     * Or, use 'auto' to automatically pick the most suitable one.
     */
    theme: 'light' | 'dark' | 'mono' | 'auto'
}
