/**
 * Used to configure the {@apilink ConsoleReporter}.
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
