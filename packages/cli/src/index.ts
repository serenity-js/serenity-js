/**
 * @serenity-js/cli provides a command-line interface for AI agents and developers
 * to interact with Serenity/JS, offering installation verification, update checking,
 * and dynamic command routing based on installed Serenity/JS modules.
 *
 * ## Installation
 *
 * ```sh
 * npm install @serenity-js/cli
 * ```
 *
 * ## Usage
 *
 * ```sh
 * # Check installation
 * sjs cli check-installation
 *
 * # Check for updates
 * sjs cli check-updates
 * ```
 *
 * @packageDocumentation
 */

export { bootstrap } from './bootstrap.js';
export * from './io/index.js';
export * from './model/index.js';
export * from './runtime/index.js';
export * from './schema/index.js';
export * from './screenplay/index.js';
