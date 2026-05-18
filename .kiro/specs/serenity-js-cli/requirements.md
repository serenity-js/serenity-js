# Requirements Document

## Introduction

The `@serenity-js/cli` module provides a command-line interface for AI agents to interact with Serenity/JS in their workflows. It follows a client/daemon architecture where the CLI client communicates with a persistent daemon process that manages resources like browser connections, HTTP clients, and actor state. The daemon leverages the Screenplay Pattern's actor model, automatically discovering and configuring abilities from installed Serenity/JS modules.

## Glossary

- **CLI_Client**: The command-line interface executable (`sjs`) that AI agents invoke to perform actions
- **Daemon**: A persistent background process that manages the Stage, actors, abilities, and resources like browser connections
- **Stage**: The Serenity/JS Stage that manages actors and their lifecycle
- **Actor**: A Serenity/JS Actor equipped with abilities to perform activities
- **Ability**: A capability that enables an Actor to interact with a system (e.g., BrowseTheWebWithPlaywright, CallAnApi)
- **Activity**: An action performed by an Actor, either an Interaction (low-level) or Task (composed)
- **Module_CLI_API**: A JSON file (`cli-api.json`) shipped with each Serenity/JS module describing its CLI commands and their parameters
- **State_File**: A file on disk where the Daemon persists actor state and session information
- **Accessibility_Snapshot**: A structured representation of the accessibility tree of a web page

## Requirements

### Requirement 1: Daemon Lifecycle Management

**User Story:** As an AI agent, I want to start and stop a Serenity/JS daemon, so that I can manage browser and API resources across multiple CLI invocations.

#### Acceptance Criteria

1. WHEN the `sjs start` command is executed, THE CLI_Client SHALL start a new Daemon process in the background
2. WHEN the Daemon starts, THE Daemon SHALL emit a `TestRunStarts` event to mimic the regular Serenity/JS execution cycle
3. WHEN the Daemon starts, THE Daemon SHALL create a State_File containing the process ID and socket path
4. WHEN the `sjs start` command is executed and a Daemon is already running, THE CLI_Client SHALL return an error message indicating the Daemon is already active
5. WHEN the `sjs stop` command is executed, THE CLI_Client SHALL send a shutdown signal to the running Daemon
6. WHEN the Daemon receives a shutdown signal, THE Daemon SHALL emit a `TestRunFinishes` event
7. WHEN the Daemon receives a shutdown signal, THE Daemon SHALL await `stage.waitForNextCue()` to allow reporters to complete
8. WHEN the Daemon receives a shutdown signal, THE Daemon SHALL invoke the `discard()` method on all Discardable abilities
9. WHEN the Daemon completes shutdown, THE Daemon SHALL emit a `TestRunFinished` event
10. WHEN the Daemon completes shutdown, THE Daemon SHALL remove the State_File
11. IF the Daemon process terminates unexpectedly, THEN THE CLI_Client SHALL detect the stale State_File and allow starting a new Daemon

### Requirement 2: Project Analysis and Module Discovery

**User Story:** As an AI agent, I want the daemon to automatically detect installed Serenity/JS modules, so that I can use their capabilities without manual configuration.

#### Acceptance Criteria

1. WHEN the Daemon starts, THE Daemon SHALL scan the project's `node_modules` for installed `@serenity-js/*` packages
2. WHEN a Serenity/JS module is detected, THE Daemon SHALL look for a `cli-api.json` file in the module's root directory
3. WHEN a Module_CLI_API file is found, THE Daemon SHALL parse it to discover available CLI commands and their parameters
4. WHEN `@serenity-js/playwright` is detected, THE Daemon SHALL configure an Actor with the BrowseTheWebWithPlaywright ability
5. WHEN `@serenity-js/rest` is detected, THE Daemon SHALL configure an Actor with the CallAnApi ability
6. WHEN the Daemon starts, THE Daemon SHALL log the list of detected modules and configured abilities
7. IF no Serenity/JS modules are detected, THEN THE Daemon SHALL return an error suggesting the `sjs install` or `sjs init` command

### Requirement 3: Module CLI API Schema

**User Story:** As a Serenity/JS module maintainer, I want to define CLI commands via a CLI API file, so that the CLI can auto-generate commands from my module's activities.

#### Acceptance Criteria

1. THE Module_CLI_API file SHALL be named `cli-api.json` and located in the module's package root
2. THE Module_CLI_API file SHALL define a JSON schema describing available commands, their parameters, and parameter types
3. THE CLI_Client SHALL follow the command pattern: `sjs <moduleName> <activityName> <activityParameters>`
4. THE moduleName SHALL be derived from the `@serenity-js/<moduleName>` package name (e.g., `cli`, `web`, `rest`)
5. WHEN the Module_CLI_API defines a command with enum parameters, THE CLI_Client SHALL validate input against the allowed values
6. WHEN the Module_CLI_API defines a command with required parameters, THE CLI_Client SHALL return an error if required parameters are missing
7. THE Module_CLI_API schema SHALL support string, number, boolean, and enum parameter types
8. THE Module_CLI_API schema SHALL support optional parameters with default values
9. THE `@serenity-js/cli` module SHALL include its own `cli-api.json` file defining built-in commands (start, stop, check-installation, check-updates, etc.)
10. THE CLI_Client SHALL use the same discovery mechanism for `@serenity-js/cli` commands as for other modules to ensure consistency

### Requirement 3.1: CLI API JSON Schema Definition

**User Story:** As a Serenity/JS module maintainer, I want a well-defined JSON schema for cli-api.json, so that I can correctly define CLI commands for my module.

#### Acceptance Criteria

1. THE cli-api.json schema SHALL require a `$schema` field pointing to the schema URL
2. THE cli-api.json schema SHALL require a `module` field containing the module name (e.g., "cli", "web", "rest")
3. THE cli-api.json schema SHALL require a `version` field for the CLI API version (semver format)
4. THE cli-api.json schema SHALL require a `commands` object containing command definitions
5. EACH command definition SHALL have a `description` field explaining the command's purpose
6. EACH command definition SHALL have a `task` field referencing the Task class that implements the command
7. EACH command definition MAY have a `parameters` object defining accepted parameters
8. EACH parameter definition SHALL specify a `type` field (one of: "string", "number", "boolean", "enum", "array")
9. EACH parameter definition MAY specify a `required` field (boolean, defaults to false)
10. EACH parameter definition MAY specify a `default` field for optional parameters
11. WHEN parameter type is "enum", THE parameter definition SHALL include a `values` array of allowed values
12. WHEN parameter type is "array", THE parameter definition SHALL include an `items` object defining the array element type
13. EACH command definition MAY have a `returns` object describing the response type
14. THE cli-api.json schema SHALL be published at `https://serenity-js.org/schemas/cli-api.json`
15. THE `@serenity-js/cli` module SHALL export a Zod schema for programmatic validation of cli-api.json files

### Requirement 4: Web Interaction Commands

**User Story:** As an AI agent, I want to execute web interactions via CLI commands, so that I can automate browser-based tasks.

#### Acceptance Criteria

1. WHEN the `sjs web navigate-to <url>` command is executed, THE Daemon SHALL instruct the Actor to navigate the browser to the specified URL
2. WHEN the `sjs web snapshot` command is executed, THE Daemon SHALL capture and return an Accessibility_Snapshot of the current page
3. WHEN the `sjs web click-on <ref>` command is executed, THE Daemon SHALL instruct the Actor to click on the element identified by the reference
4. WHEN a web command is executed and no browser ability is configured, THE CLI_Client SHALL return an error indicating the browser ability is not available
5. WHEN a web command succeeds, THE CLI_Client SHALL return a JSON response indicating success and any relevant data
6. IF a web command fails, THEN THE CLI_Client SHALL return a JSON response containing the error message and stack trace

### Requirement 5: REST API Commands

**User Story:** As an AI agent, I want to execute REST API calls via CLI commands, so that I can interact with HTTP services.

#### Acceptance Criteria

1. WHEN the `sjs rest send get <url>` command is executed, THE Daemon SHALL instruct the Actor to send an HTTP GET request to the specified URL
2. WHEN the `sjs rest send post <url> --data=<json>` command is executed, THE Daemon SHALL instruct the Actor to send an HTTP POST request with the provided JSON body
3. WHEN the `sjs rest send` command is executed with a request type, THE CLI_Client SHALL validate the request type against allowed values (get, post, put, delete, head, patch, options)
4. WHEN a REST command succeeds, THE CLI_Client SHALL return a JSON response containing the HTTP status code, headers, and response body
5. WHEN a REST command is executed and no API ability is configured, THE CLI_Client SHALL return an error indicating the API ability is not available
6. IF a REST command fails due to network error, THEN THE CLI_Client SHALL return a JSON response containing the error details

### Requirement 6: Client-Daemon Communication

**User Story:** As an AI agent, I want reliable communication between the CLI client and daemon, so that commands are executed correctly and responses are returned.

#### Acceptance Criteria

1. THE CLI_Client SHALL communicate with the Daemon via a Unix domain socket (or named pipe on Windows)
2. WHEN the CLI_Client sends a command, THE Daemon SHALL respond with a JSON-formatted result
3. WHEN the CLI_Client cannot connect to the Daemon, THE CLI_Client SHALL return an error indicating the Daemon is not running
4. THE Daemon SHALL process commands sequentially to ensure consistent state
5. WHEN a command execution exceeds a configurable timeout, THE CLI_Client SHALL return a timeout error
6. THE CLI_Client SHALL support a `--timeout` flag to override the default command timeout

### Requirement 7: State Persistence

**User Story:** As an AI agent, I want the daemon to persist state between commands, so that I can maintain context across multiple interactions.

#### Acceptance Criteria

1. THE Daemon SHALL persist the current Actor state to the State_File after each command execution
2. WHEN the Daemon restarts, THE Daemon SHALL restore Actor state from the State_File if it exists
3. THE State_File SHALL include the current page URL for web abilities
4. THE State_File SHALL include any cookies and session data for web abilities
5. WHEN the `sjs start --clean` flag is provided, THE Daemon SHALL ignore any existing State_File and start with fresh state
6. IF the State_File is corrupted, THEN THE Daemon SHALL log a warning and start with fresh state

### Requirement 8: Browser Resource Management via Installed Modules

**User Story:** As an AI agent, I want the daemon to delegate browser lifecycle management to the installed Serenity/JS web module, so that I can use whichever browser automation tool is available in the project.

#### Acceptance Criteria

1. WHEN `@serenity-js/playwright` is detected, THE Daemon SHALL delegate browser management to Playwright via the BrowseTheWebWithPlaywright ability
2. WHEN `@serenity-js/webdriverio` is detected, THE Daemon SHALL delegate browser management to WebdriverIO via the BrowseTheWebWithWebdriverIO ability
3. WHEN multiple web modules are detected, THE Daemon SHALL use the first detected module and log a warning about the conflict
4. THE Daemon SHALL delegate browser context reuse to the underlying web module's ability implementation
5. WHEN the Daemon stops, THE Daemon SHALL invoke the `discard()` method on the web ability, allowing the underlying module to clean up browser resources
6. THE Daemon SHALL pass browser configuration flags (`--headless`, `--browser`) to the underlying web module's ability
7. IF a browser crash is detected, THEN THE Daemon SHALL delegate recovery to the underlying web module's ability

### Requirement 9: CLI Output Format

**User Story:** As an AI agent, I want consistent JSON output from all CLI commands, so that I can parse responses programmatically.

#### Acceptance Criteria

1. THE CLI_Client SHALL output all responses in JSON format to stdout
2. WHEN a command succeeds, THE CLI_Client SHALL return a JSON object with `success: true` and a `data` field containing the result
3. WHEN a command fails, THE CLI_Client SHALL return a JSON object with `success: false` and an `error` field containing the error details
4. THE CLI_Client SHALL support a `--pretty` flag to format JSON output with indentation
5. THE CLI_Client SHALL write error messages to stderr only when not in JSON mode
6. WHEN the `--verbose` flag is provided, THE CLI_Client SHALL include additional diagnostic information in the response

### Requirement 10: Help and Discovery Commands

**User Story:** As an AI agent, I want to discover available commands and their usage, so that I can understand what actions are possible.

#### Acceptance Criteria

1. WHEN the `sjs --help` command is executed, THE CLI_Client SHALL display a list of all available command groups
2. WHEN the `sjs <group> --help` command is executed, THE CLI_Client SHALL display all commands available in that group
3. WHEN the `sjs status` command is executed, THE CLI_Client SHALL return the Daemon status, configured abilities, and current state summary
4. WHEN the `sjs list-modules` command is executed, THE CLI_Client SHALL return a list of detected Serenity/JS modules and their available commands
5. THE CLI_Client SHALL support `--version` flag to display the CLI version

### Requirement 11: Configuration File Support

**User Story:** As an AI agent, I want to configure the CLI via a configuration file, so that I can customize default behavior.

#### Acceptance Criteria

1. THE CLI_Client SHALL look for a `.sjsrc.json` configuration file in the project root
2. WHEN a configuration file is found, THE CLI_Client SHALL use its values as defaults for CLI flags
3. THE configuration file SHALL support specifying default browser type, headless mode, and timeout values
4. THE configuration file SHALL support specifying base URLs for REST API calls
5. WHEN both configuration file and CLI flags are provided, THE CLI_Client SHALL give precedence to CLI flags
6. IF the configuration file contains invalid JSON, THEN THE CLI_Client SHALL return an error with the parse location

### Requirement 12: Error Handling and Recovery

**User Story:** As an AI agent, I want clear error messages and recovery options, so that I can handle failures gracefully.

#### Acceptance Criteria

1. WHEN an error occurs, THE CLI_Client SHALL return a structured error response with error code, message, and suggested action
2. THE Daemon SHALL implement graceful degradation when optional abilities fail to initialize
3. WHEN a command fails due to element not found, THE CLI_Client SHALL include the selector used in the error response
4. WHEN a command fails due to timeout, THE CLI_Client SHALL include the timeout duration in the error response
5. THE CLI_Client SHALL support a `--retry` flag to automatically retry failed commands with exponential backoff
6. IF the Daemon crashes during command execution, THEN THE CLI_Client SHALL detect the failure and return an appropriate error

### Requirement 13: Installation Verification (Phase 1)

**User Story:** As a developer, I want to verify my Serenity/JS installation is correct and compatible, so that I can troubleshoot issues before running tests.

#### Acceptance Criteria

1. WHEN the `sjs check-installation` command is executed, THE CLI_Client SHALL verify the Node.js version is supported (^20 || ^22 || ^24)
2. WHEN the `sjs check-installation` command is executed, THE CLI_Client SHALL scan `node_modules` and list all detected `@serenity-js/*` packages with their versions
3. WHEN the `sjs check-installation` command is executed, THE CLI_Client SHALL fetch the module compatibility matrix from `https://serenity-js.org/presets/v3/module-manager.json`
4. WHEN Playwright is detected, THE CLI_Client SHALL verify the installed Playwright version is compatible with the installed `@serenity-js/playwright` version per the compatibility matrix
5. WHEN WebdriverIO is detected, THE CLI_Client SHALL verify the installed WebdriverIO version is compatible with the installed `@serenity-js/webdriverio` version per the compatibility matrix
6. WHEN incompatible versions are detected, THE CLI_Client SHALL return a JSON response listing the incompatibilities and suggested compatible versions
7. WHEN all checks pass, THE CLI_Client SHALL return a JSON response with `success: true` and a summary of the verified installation
8. THE `check-installation` command SHALL be implemented as a Task in `@serenity-js/cli` and exposed via `cli-api.json`

### Requirement 14: Update Checking (Phase 1)

**User Story:** As a developer, I want to check if newer versions of Serenity/JS modules are available, so that I can keep my installation up to date.

#### Acceptance Criteria

1. WHEN the `sjs check-updates` command is executed, THE CLI_Client SHALL fetch the latest version information from `https://serenity-js.org/presets/v3/module-manager.json`
2. WHEN the `sjs check-updates` command is executed, THE CLI_Client SHALL compare installed `@serenity-js/*` package versions with the latest available versions
3. WHEN updates are available, THE CLI_Client SHALL return a JSON response listing each outdated package with its current and latest version
4. WHEN updates are available, THE CLI_Client SHALL include the recommended update command for the detected package manager (npm, yarn, pnpm)
5. WHEN all packages are up to date, THE CLI_Client SHALL return a JSON response with `success: true` indicating no updates are needed
6. THE `check-updates` command SHALL be implemented as a Task in `@serenity-js/cli` and exposed via `cli-api.json`
7. IF the module-manager.json cannot be fetched, THEN THE CLI_Client SHALL return an error with network diagnostics

### Requirement 15: Module Installation (Phase 2)

**User Story:** As an AI agent, I want to install Serenity/JS modules when none are detected, so that I can set up automation capabilities in a new project.

#### Acceptance Criteria

1. WHEN the `sjs install <modules>` command is executed, THE CLI_Client SHALL install the specified Serenity/JS modules using the project's package manager
2. THE CLI_Client SHALL accept a comma-separated list of module names (e.g., `sjs install rest,playwright,serenity-bdd`)
3. THE CLI_Client SHALL detect the project's package manager (npm, yarn, pnpm) and use the appropriate install command
4. WHEN a module name is provided without the `@serenity-js/` prefix, THE CLI_Client SHALL automatically prepend it
5. WHEN the `sjs install` command is executed without arguments, THE CLI_Client SHALL launch an interactive wizard to guide module selection
6. THE interactive wizard SHALL present categories of modules (web automation, API testing, reporting) with descriptions
7. WHEN installation completes successfully, THE CLI_Client SHALL return a JSON response listing the installed modules
8. IF installation fails, THEN THE CLI_Client SHALL return a JSON response containing the error details and suggested remediation

### Requirement 16: Interactive Setup Wizard (Phase 2)

**User Story:** As an AI agent, I want an interactive setup wizard, so that I can configure the CLI for a new project without prior knowledge of available modules.

#### Acceptance Criteria

1. WHEN the `sjs init` command is executed, THE CLI_Client SHALL launch an interactive setup wizard
2. THE wizard SHALL prompt for the type of automation needed (web, API, or both)
3. WHEN web automation is selected, THE wizard SHALL prompt for the preferred browser automation tool (Playwright, WebdriverIO)
4. THE wizard SHALL prompt for optional reporting modules (serenity-bdd, console-reporter)
5. WHEN the wizard completes, THE CLI_Client SHALL install the selected modules and create a default `.sjsrc.json` configuration file
6. THE wizard SHALL support a `--yes` flag to accept all defaults without prompting
7. WHEN running in non-interactive mode (e.g., CI environment), THE CLI_Client SHALL skip the wizard and return an error suggesting the `sjs install` command


### Requirement 17: Integration Testing

**User Story:** As a Serenity/JS maintainer, I want integration tests for the CLI module, so that I can verify end-to-end behavior across different scenarios.

#### Acceptance Criteria

1. THE CLI module SHALL have integration tests located under `integration/cli/`
2. THE integration tests SHALL verify the `sjs check-installation` command against projects with various module configurations
3. THE integration tests SHALL verify the `sjs check-updates` command by mocking the module-manager.json endpoint
4. THE integration tests SHALL verify daemon lifecycle (start/stop) including proper event emission
5. THE integration tests SHALL verify CLI output format is valid JSON
6. THE integration tests SHALL follow the existing integration test patterns used in other `integration/*` modules
7. THE integration tests SHALL be runnable via `make INTEGRATION_SCOPE=cli integration-test`
