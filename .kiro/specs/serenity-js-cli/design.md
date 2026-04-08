# Design Document: @serenity-js/cli Module

## Overview

The `@serenity-js/cli` module provides a command-line interface for AI agents and developers to interact with Serenity/JS. This design document focuses on Phase 1 implementation, which includes the `check-installation` and `check-updates` commands.

Phase 1 establishes the foundational CLI architecture that will be extended in later phases to support the full client/daemon architecture for web and API automation.

### Goals

- Provide a consistent CLI entry point (`sjs`) for all Serenity/JS operations
- Enable AI agents to verify Serenity/JS installations programmatically
- Output all responses in JSON format for machine consumption
- Follow existing Serenity/JS patterns (Screenplay Pattern, package structure)
- Establish the `cli-api.json` discovery mechanism for future extensibility

### Non-Goals (Phase 1)

- Daemon lifecycle management (Phase 2+)
- Web interaction commands (Phase 2+)
- REST API commands (Phase 2+)
- Interactive setup wizard (Phase 2+)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Client (sjs)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Command   │  │   Output    │  │    Module Discovery     │  │
│  │   Router    │  │  Formatter  │  │    (cli-api.json)       │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                     │                 │
│  ┌──────┴────────────────┴─────────────────────┴─────────────┐  │
│  │                    Screenplay Layer                        │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │  │
│  │  │ CheckInstall   │  │ CheckUpdates   │  │ FetchModule  │ │  │
│  │  │ Task           │  │ Task           │  │ Manager      │ │  │
│  │  └────────────────┘  └────────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Resources                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  node_modules/  │  │ module-manager  │  │   package.json  │  │
│  │  @serenity-js/* │  │     .json       │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Package Structure

```
packages/cli/
├── src/
│   ├── index.ts                    # Public API exports
│   ├── cli/
│   │   ├── index.ts
│   │   ├── bootstrap.ts            # CLI entry point
│   │   ├── CommandRouter.ts        # Dynamic command routing based on cli-api.json discovery
│   │   ├── TaskRegistry.ts         # Maps task names to Task implementations
│   │   ├── io/
│   │   │   ├── index.ts
│   │   │   ├── JsonOutput.ts
│   │   │   └── formatError.ts
│   │   ├── model/
│   │   │   ├── index.ts
│   │   │   ├── CliResponse.ts
│   │   │   ├── InstallationReport.ts
│   │   │   ├── UpdateReport.ts
│   │   │   └── ModuleInfo.ts
│   │   ├── schema/
│   │   │   ├── index.ts
│   │   │   ├── CliApiSchema.ts     # Zod schema for cli-api.json validation
│   │   │   └── cli-api.schema.json # JSON Schema for cli-api.json
│   │   └── screenplay/
│   │       ├── index.ts
│   │       ├── abilities/
│   │       │   ├── index.ts
│   │       │   ├── UseNodeModules.ts
│   │       │   └── FetchRemoteResources.ts
│   │       ├── interactions/
│   │       │   ├── index.ts
│   │       │   └── OutputJson.ts
│   │       ├── questions/
│   │       │   ├── index.ts
│   │       │   ├── InstalledSerenityModules.ts
│   │       │   ├── NodeVersion.ts
│   │       │   ├── ModuleManagerConfig.ts
│   │       │   └── PackageManagerType.ts
│   │       └── tasks/
│   │           ├── index.ts
│   │           ├── CheckInstallation.ts
│   │           └── CheckUpdates.ts
├── spec/
│   ├── expect.ts
│   ├── cli/
│   │   ├── CommandRouter.spec.ts
│   │   ├── TaskRegistry.spec.ts
│   │   ├── schema/
│   │   │   └── CliApiSchema.spec.ts
│   │   ├── screenplay/
│   │   │   ├── abilities/
│   │   │   ├── questions/
│   │   │   └── tasks/
│   │   └── model/
├── cli-api.json                    # CLI API definition for @serenity-js/cli
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

## Components and Interfaces

### CLI Entry Point

The CLI uses `yargs` for command parsing with dynamic command generation based on discovered cli-api.json files:

```typescript
// src/cli/bootstrap.ts
import yargs from 'yargs';
import { CommandRouter } from './CommandRouter';

export async function bootstrap(argv: string[]): Promise<void> {
    const router = new CommandRouter();
    await router.discoverModules();
    
    const cli = yargs()
        .version(pkg.version)
        .usage('Usage: $0 <module> <command> [options]')
        .option('json', {
            type: 'boolean',
            default: true,
            describe: 'Output in JSON format',
        })
        .option('pretty', {
            type: 'boolean',
            default: false,
            describe: 'Pretty-print JSON output',
        })
        .alias('h', 'help')
        .help();
    
    // Dynamically register commands from discovered cli-api.json files
    router.registerCommands(cli);
    
    cli.parse(argv);
}
```

### CommandRouter

Discovers cli-api.json files and dynamically generates yargs commands:

```typescript
// src/cli/CommandRouter.ts
import type { Argv } from 'yargs';
import type { CliApi, Command } from './schema/CliApiSchema';
import { TaskRegistry } from './TaskRegistry';

export class CommandRouter {
    private modules: Map<string, CliApi> = new Map();
    private taskRegistry: TaskRegistry;

    constructor(taskRegistry: TaskRegistry = new TaskRegistry()) {
        this.taskRegistry = taskRegistry;
    }

    async discoverModules(): Promise<void> {
        // 1. Discover @serenity-js/cli's own cli-api.json
        // 2. Scan node_modules/@serenity-js/* for cli-api.json files
        // 3. Validate each against CliApiSchema
        // 4. Store in this.modules map
    }

    registerCommands(cli: Argv): void {
        for (const [moduleName, api] of this.modules) {
            cli.command(
                moduleName,
                `Commands from @serenity-js/${moduleName}`,
                (yargs) => this.registerModuleCommands(yargs, api),
            );
        }
    }

    private registerModuleCommands(yargs: Argv, api: CliApi): Argv {
        for (const [commandName, command] of Object.entries(api.commands)) {
            yargs.command(
                this.buildCommandSignature(commandName, command),
                command.description,
                (y) => this.buildCommandOptions(y, command),
                (args) => this.executeCommand(api.module, command, args),
            );
        }
        return yargs;
    }

    private buildCommandSignature(name: string, command: Command): string {
        // Build yargs command signature from command definition
        // e.g., "check-installation" or "send <method> <url>"
    }

    private buildCommandOptions(yargs: Argv, command: Command): Argv {
        // Add options from command.parameters
        if (command.parameters) {
            for (const [paramName, param] of Object.entries(command.parameters)) {
                yargs.option(paramName, {
                    type: this.mapParameterType(param.type),
                    describe: param.description,
                    required: param.required,
                    default: param.default,
                    choices: param.values,  // For enum types
                });
            }
        }
        return yargs;
    }

    private async executeCommand(
        moduleName: string,
        command: Command,
        args: Record<string, unknown>,
    ): Promise<void> {
        const TaskClass = this.taskRegistry.get(moduleName, command.task);
        const task = TaskClass.fromCliArgs(args);
        
        // Execute task via actor
        await actor.attemptsTo(task);
    }

    private mapParameterType(type: string): 'string' | 'number' | 'boolean' | 'array' {
        switch (type) {
            case 'number': return 'number';
            case 'boolean': return 'boolean';
            case 'array': return 'array';
            default: return 'string';
        }
    }
}
```

### TaskRegistry

Maps task names from cli-api.json to actual Task implementations:

```typescript
// src/cli/TaskRegistry.ts
import type { Task } from '@serenity-js/core';

type TaskFactory = (args: Record<string, unknown>) => Task;

export class TaskRegistry {
    private tasks: Map<string, TaskFactory> = new Map();

    register(moduleName: string, taskName: string, factory: TaskFactory): void {
        this.tasks.set(`${moduleName}:${taskName}`, factory);
    }

    get(moduleName: string, taskName: string): TaskFactory {
        const key = `${moduleName}:${taskName}`;
        const factory = this.tasks.get(key);
        if (!factory) {
            throw new Error(`Task not found: ${key}`);
        }
        return factory;
    }

    // Pre-register built-in CLI tasks
    registerBuiltInTasks(): void {
        this.register('cli', 'CheckInstallation', () => CheckInstallation.forProject());
        this.register('cli', 'CheckUpdates', () => CheckUpdates.forInstalledModules());
    }
}
```

### Abilities

#### UseNodeModules

Enables actors to scan and read from the project's `node_modules` directory:

```typescript
export class UseNodeModules extends Ability {
    static at(projectRoot: Path): UseNodeModules;
    
    listSerenityPackages(): Promise<ModuleInfo[]>;
    readPackageJson(moduleName: string): Promise<PackageJson>;
    moduleExists(moduleName: string): boolean;
}
```

#### FetchRemoteResources

Enables actors to fetch remote resources like `module-manager.json`:

```typescript
export class FetchRemoteResources extends Ability {
    static using(axiosInstance?: AxiosInstance): FetchRemoteResources;
    
    fetch<T>(url: string): Promise<T>;
}
```

### Questions

#### InstalledSerenityModules

Returns a list of installed `@serenity-js/*` packages with their versions:

```typescript
export const InstalledSerenityModules = (): QuestionAdapter<ModuleInfo[]> =>
    Question.about('installed Serenity/JS modules', async actor => {
        const nodeModules = UseNodeModules.as(actor);
        return nodeModules.listSerenityPackages();
    });
```

#### NodeVersion

Returns the current Node.js version:

```typescript
export const NodeVersion = (): QuestionAdapter<string> =>
    Question.about('Node.js version', () => process.version);
```

#### ModuleManagerConfig

Fetches and returns the module-manager.json configuration:

```typescript
export const ModuleManagerConfig = (): QuestionAdapter<ModuleManagerJson> =>
    Question.about('module manager configuration', async actor => {
        const resources = FetchRemoteResources.as(actor);
        return resources.fetch(MODULE_MANAGER_URL);
    });
```

#### PackageManagerType

Detects the project's package manager (npm, yarn, pnpm):

```typescript
export const PackageManagerType = (): QuestionAdapter<'npm' | 'yarn' | 'pnpm'> =>
    Question.about('package manager type', async actor => {
        const nodeModules = UseNodeModules.as(actor);
        // Detection logic based on lock files
    });
```

### Tasks

#### CheckInstallation

Verifies the Serenity/JS installation:

```typescript
export class CheckInstallation extends Task {
    static forProject(): CheckInstallation;
    
    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<void>;
}
```

#### CheckUpdates

Compares installed versions with latest available:

```typescript
export class CheckUpdates extends Task {
    static forInstalledModules(): CheckUpdates;
    
    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<void>;
}
```

### CLI API Schema (cli-api.json)

#### JSON Schema Definition

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://serenity-js.org/schemas/cli-api.json",
    "title": "Serenity/JS CLI API Schema",
    "description": "Schema for defining CLI commands in Serenity/JS modules",
    "type": "object",
    "required": ["$schema", "module", "version", "commands"],
    "properties": {
        "$schema": {
            "type": "string",
            "const": "https://serenity-js.org/schemas/cli-api.json"
        },
        "module": {
            "type": "string",
            "description": "Module name without @serenity-js/ prefix (e.g., 'cli', 'web', 'rest')"
        },
        "version": {
            "type": "string",
            "pattern": "^\\d+\\.\\d+\\.\\d+$",
            "description": "CLI API version in semver format"
        },
        "commands": {
            "type": "object",
            "additionalProperties": {
                "$ref": "#/definitions/command"
            }
        }
    },
    "definitions": {
        "command": {
            "type": "object",
            "required": ["description", "task"],
            "properties": {
                "description": {
                    "type": "string",
                    "description": "Human-readable description of the command"
                },
                "task": {
                    "type": "string",
                    "description": "Reference to the Task class implementing this command"
                },
                "parameters": {
                    "type": "object",
                    "additionalProperties": {
                        "$ref": "#/definitions/parameter"
                    }
                },
                "returns": {
                    "type": "object",
                    "properties": {
                        "type": { "type": "string" },
                        "description": { "type": "string" }
                    }
                }
            }
        },
        "parameter": {
            "type": "object",
            "required": ["type"],
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["string", "number", "boolean", "enum", "array"]
                },
                "description": { "type": "string" },
                "required": { "type": "boolean", "default": false },
                "default": {},
                "values": {
                    "type": "array",
                    "items": { "type": "string" },
                    "description": "Allowed values for enum type"
                },
                "items": {
                    "$ref": "#/definitions/parameter",
                    "description": "Element type for array type"
                }
            }
        }
    }
}
```

#### Zod Schema (TypeScript)

```typescript
// src/cli/schema/CliApiSchema.ts
import { z } from 'zod';

const ParameterTypeSchema = z.enum(['string', 'number', 'boolean', 'enum', 'array']);

const ParameterSchema: z.ZodType<Parameter> = z.lazy(() =>
    z.object({
        type: ParameterTypeSchema,
        description: z.string().optional(),
        required: z.boolean().default(false),
        default: z.unknown().optional(),
        values: z.array(z.string()).optional(),  // For enum type
        items: ParameterSchema.optional(),        // For array type
    }).refine(
        (data) => data.type !== 'enum' || (data.values && data.values.length > 0),
        { message: 'Enum parameters must have a non-empty values array' }
    ).refine(
        (data) => data.type !== 'array' || data.items !== undefined,
        { message: 'Array parameters must have an items definition' }
    )
);

const CommandSchema = z.object({
    description: z.string(),
    task: z.string(),
    parameters: z.record(ParameterSchema).optional(),
    returns: z.object({
        type: z.string(),
        description: z.string().optional(),
    }).optional(),
});

export const CliApiSchema = z.object({
    $schema: z.literal('https://serenity-js.org/schemas/cli-api.json'),
    module: z.string().regex(/^[a-z][a-z0-9-]*$/),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    commands: z.record(CommandSchema),
});

export type CliApi = z.infer<typeof CliApiSchema>;
export type Command = z.infer<typeof CommandSchema>;
export type Parameter = z.infer<typeof ParameterSchema>;
```

#### Example: @serenity-js/cli cli-api.json

```json
{
    "$schema": "https://serenity-js.org/schemas/cli-api.json",
    "module": "cli",
    "version": "1.0.0",
    "commands": {
        "check-installation": {
            "description": "Verifies Node.js version, lists detected modules, checks compatibility",
            "task": "CheckInstallation",
            "parameters": {},
            "returns": {
                "type": "InstallationReport",
                "description": "Report containing Node.js version, detected modules, and compatibility status"
            }
        },
        "check-updates": {
            "description": "Compares installed versions with latest from module-manager.json",
            "task": "CheckUpdates",
            "parameters": {},
            "returns": {
                "type": "UpdateReport",
                "description": "Report containing outdated modules and update commands"
            }
        },
        "start": {
            "description": "Starts the Serenity/JS daemon",
            "task": "StartDaemon",
            "parameters": {
                "clean": {
                    "type": "boolean",
                    "description": "Start with fresh state, ignoring existing state file",
                    "required": false,
                    "default": false
                },
                "headless": {
                    "type": "boolean",
                    "description": "Run browser in headless mode",
                    "required": false,
                    "default": true
                },
                "browser": {
                    "type": "enum",
                    "description": "Browser type to use",
                    "required": false,
                    "default": "chromium",
                    "values": ["chromium", "firefox", "webkit"]
                }
            },
            "returns": {
                "type": "DaemonStatus"
            }
        },
        "stop": {
            "description": "Stops the Serenity/JS daemon",
            "task": "StopDaemon",
            "parameters": {},
            "returns": {
                "type": "DaemonStatus"
            }
        }
    }
}
```

#### Example: @serenity-js/rest cli-api.json (Future)

```json
{
    "$schema": "https://serenity-js.org/schemas/cli-api.json",
    "module": "rest",
    "version": "1.0.0",
    "commands": {
        "send": {
            "description": "Sends an HTTP request",
            "task": "SendRequest",
            "parameters": {
                "method": {
                    "type": "enum",
                    "description": "HTTP method",
                    "required": true,
                    "values": ["get", "post", "put", "delete", "head", "patch", "options"]
                },
                "url": {
                    "type": "string",
                    "description": "Request URL",
                    "required": true
                },
                "data": {
                    "type": "string",
                    "description": "Request body (JSON string)",
                    "required": false
                },
                "headers": {
                    "type": "array",
                    "description": "Request headers in 'key:value' format",
                    "required": false,
                    "items": {
                        "type": "string"
                    }
                }
            },
            "returns": {
                "type": "HttpResponse",
                "description": "HTTP response with status, headers, and body"
            }
        }
    }
}
```

## Data Models

### ModuleInfo

```typescript
interface ModuleInfo {
    name: string;           // e.g., "@serenity-js/core"
    version: string;        // e.g., "3.42.0"
    path: string;           // Path to the module
}
```

### ModuleManagerJson

```typescript
interface ModuleManagerJson {
    serenityVersion: string;
    modules: {
        [moduleName: string]: {
            version: string;
            peerDependencies?: {
                [dependency: string]: string;
            };
        };
    };
    compatibility: {
        playwright?: {
            [serenityVersion: string]: string;  // Playwright version range
        };
        webdriverio?: {
            [serenityVersion: string]: string;  // WebdriverIO version range
        };
    };
}
```

### InstallationReport

```typescript
interface InstallationReport {
    nodeVersion: {
        current: string;
        supported: boolean;
        requiredRange: string;
    };
    modules: ModuleInfo[];
    compatibility: {
        status: 'compatible' | 'incompatible' | 'unknown';
        issues: CompatibilityIssue[];
    };
}

interface CompatibilityIssue {
    module: string;
    dependency: string;
    installedVersion: string;
    requiredRange: string;
    suggestion: string;
}
```

### UpdateReport

```typescript
interface UpdateReport {
    upToDate: boolean;
    updates: ModuleUpdate[];
    updateCommand?: string;
}

interface ModuleUpdate {
    module: string;
    currentVersion: string;
    latestVersion: string;
}
```

### CliResponse

```typescript
interface CliResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        suggestion?: string;
        stack?: string;
    };
}
```



## Design Invariants

*These are the key behaviors that must hold true for the CLI to function correctly. Each is validated through unit tests.*

### Invariant 1: Node.js Version Validation

The version validation function returns `supported: true` if and only if the version satisfies the semver range `^20 || ^22 || ^24`.

**Validates: Requirements 13.1**

### Invariant 2: Module Discovery Filtering

The module discovery function returns exactly those packages whose names match the pattern `@serenity-js/*`, each with their correct version from `package.json`.

**Validates: Requirements 13.2**

### Invariant 3: Compatibility Matrix Validation

The compatibility check returns `compatible` if and only if the installed peer dependency version satisfies the required range specified in the matrix for that module version.

**Validates: Requirements 13.4, 13.5**

### Invariant 4: Installation Report Completeness

The returned `InstallationReport` contains: (a) the Node.js version with supported status, (b) all detected Serenity/JS modules with versions, and (c) compatibility status with any issues listed when incompatible.

**Validates: Requirements 13.6, 13.7**

### Invariant 5: Version Comparison Correctness

The version comparison identifies the installed version as outdated if and only if the latest version is greater according to semver ordering.

**Validates: Requirements 14.2**

### Invariant 6: Update Report Completeness

The returned `UpdateReport` contains: (a) `upToDate: true` with empty updates array when all versions match latest, or (b) `upToDate: false` with each outdated module listing current and latest versions.

**Validates: Requirements 14.3, 14.5**

### Invariant 7: Package Manager Command Generation

The generated update command uses the correct syntax for the detected package manager (npm, yarn, pnpm) and includes all specified modules.

**Validates: Requirements 14.4**

### Invariant 8: JSON Output Validity

All CLI command output written to stdout is valid JSON that can be parsed without errors.

**Validates: Requirements 17.5**

## Error Handling

### Error Types

The CLI module defines the following error types extending `RuntimeError`:

```typescript
// Network-related errors
export class NetworkError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(NetworkError, message, cause);
    }
}

// Module discovery errors
export class ModuleDiscoveryError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ModuleDiscoveryError, message, cause);
    }
}

// Compatibility check errors
export class CompatibilityError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(CompatibilityError, message, cause);
    }
}
```

### Error Response Format

All errors are returned as JSON with the following structure:

```json
{
    "success": false,
    "error": {
        "code": "NETWORK_ERROR",
        "message": "Failed to fetch module-manager.json",
        "suggestion": "Check your internet connection and try again",
        "stack": "..."
    }
}
```

### Error Codes

| Code | Description | Suggestion |
|------|-------------|------------|
| `NETWORK_ERROR` | Failed to fetch remote resource | Check internet connection |
| `MODULE_DISCOVERY_ERROR` | Failed to scan node_modules | Verify node_modules exists and is readable |
| `COMPATIBILITY_ERROR` | Failed to parse compatibility matrix | Report issue to Serenity/JS team |
| `INVALID_NODE_VERSION` | Node.js version not supported | Upgrade to Node.js ^20, ^22, or ^24 |
| `NO_MODULES_FOUND` | No Serenity/JS modules detected | Run `npm install @serenity-js/core` |

### Graceful Degradation

- If `module-manager.json` cannot be fetched, the CLI reports installed modules without compatibility checking
- If a specific module's `package.json` cannot be read, it's skipped with a warning
- Network timeouts default to 30 seconds, configurable via `--timeout` flag

## Testing Strategy

### ATDD/TDD Process

The CLI module follows an Acceptance Test-Driven Development (ATDD) approach:

1. **Write a failing high-level acceptance test** (integration test) that describes the expected behavior from the user's perspective
2. **Make it pass** by implementing the feature using TDD for lower-level components
3. **TDD cycle for each component**: Write failing unit test → Implement → Refactor
4. **Refactor** the overall implementation while keeping all tests green

### Development Flow Example

For implementing `sjs cli check-installation`:

```
1. Write failing integration test (integration/cli/spec/check-installation.spec.ts)
   → Test: "sjs cli check-installation returns valid JSON with installation report"
   → Fails: Command not found

2. TDD: CommandRouter
   → Unit test: "discovers cli-api.json from @serenity-js/cli"
   → Unit test: "registers commands dynamically from cli-api.json"
   → Implement CommandRouter

3. TDD: TaskRegistry
   → Unit test: "registers and retrieves task factories"
   → Implement TaskRegistry

4. TDD: CheckInstallation Task
   → Unit test: "returns Node.js version with supported status"
   → Unit test: "lists installed Serenity/JS modules"
   → Unit test: "checks compatibility against module-manager.json"
   → Implement CheckInstallation

5. TDD: Supporting Questions (NodeVersion, InstalledSerenityModules, etc.)
   → Unit tests for each Question
   → Implement Questions

6. Integration test passes
   → Refactor as needed
```

### Unit Test Structure (packages/cli/spec/)

```
spec/
├── expect.ts                           # Chai configuration
├── cli/
│   ├── screenplay/
│   │   ├── abilities/
│   │   │   ├── UseNodeModules.spec.ts
│   │   │   └── FetchRemoteResources.spec.ts
│   │   ├── questions/
│   │   │   ├── InstalledSerenityModules.spec.ts
│   │   │   ├── NodeVersion.spec.ts
│   │   │   ├── ModuleManagerConfig.spec.ts
│   │   │   └── PackageManagerType.spec.ts
│   │   └── tasks/
│   │       ├── CheckInstallation.spec.ts
│   │       └── CheckUpdates.spec.ts
│   ├── model/
│   │   ├── CliResponse.spec.ts
│   │   ├── InstallationReport.spec.ts
│   │   └── UpdateReport.spec.ts
│   └── io/
│       └── JsonOutput.spec.ts
```

### Unit Test Examples

```typescript
// spec/cli/screenplay/questions/NodeVersion.spec.ts
import { describe, it } from 'mocha';
import { expect } from '../../../expect';
import { isNodeVersionSupported } from '../../../../src/cli/screenplay/questions/NodeVersion';

describe('NodeVersion', () => {

    describe('isNodeVersionSupported', () => {

        it('returns true for Node.js 20.x', () => {
            expect(isNodeVersionSupported('v20.0.0')).to.be.true;
            expect(isNodeVersionSupported('v20.15.1')).to.be.true;
        });

        it('returns true for Node.js 22.x', () => {
            expect(isNodeVersionSupported('v22.0.0')).to.be.true;
            expect(isNodeVersionSupported('v22.11.0')).to.be.true;
        });

        it('returns true for Node.js 24.x', () => {
            expect(isNodeVersionSupported('v24.0.0')).to.be.true;
        });

        it('returns false for unsupported versions', () => {
            expect(isNodeVersionSupported('v18.20.0')).to.be.false;
            expect(isNodeVersionSupported('v19.0.0')).to.be.false;
            expect(isNodeVersionSupported('v21.0.0')).to.be.false;
        });
    });
});
```

```typescript
// spec/cli/screenplay/questions/InstalledSerenityModules.spec.ts
import { describe, it, beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { expect } from '../../../expect';

describe('InstalledSerenityModules', () => {

    it('returns only @serenity-js/* packages', async () => {
        // Test with mock node_modules containing mixed packages
    });

    it('includes version from package.json', async () => {
        // Test version extraction
    });

    it('returns empty array when no Serenity/JS modules found', async () => {
        // Test empty case
    });
});
```

### Integration Test Structure (integration/cli/)

```
integration/cli/
├── package.json
├── tsconfig.json
├── spec/
│   ├── check-installation.spec.ts
│   ├── check-updates.spec.ts
│   └── json-output.spec.ts
└── fixtures/
    ├── project-with-all-modules/
    │   └── package.json
    ├── project-with-incompatible-versions/
    │   └── package.json
    └── project-with-no-modules/
        └── package.json
```

### Integration Test Example

```typescript
// integration/cli/spec/check-installation.spec.ts
import { describe, it } from 'mocha';
import { expect } from '@integration/testing-tools';
import { execSync } from 'child_process';
import * as path from 'path';

describe('sjs cli check-installation', () => {

    it('returns valid JSON with installation report', () => {
        const result = execSync('npx sjs cli check-installation', {
            cwd: path.join(__dirname, '../fixtures/project-with-all-modules'),
            encoding: 'utf-8',
        });

        const response = JSON.parse(result);
        
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('nodeVersion');
        expect(response.data).to.have.property('modules');
        expect(response.data).to.have.property('compatibility');
    });

    it('detects incompatible versions', () => {
        const result = execSync('npx sjs cli check-installation', {
            cwd: path.join(__dirname, '../fixtures/project-with-incompatible-versions'),
            encoding: 'utf-8',
        });

        const response = JSON.parse(result);
        
        expect(response.data.compatibility.status).to.equal('incompatible');
        expect(response.data.compatibility.issues).to.have.length.greaterThan(0);
    });
});
```

### Test Coverage Requirements

- Unit tests: >90% line coverage for `packages/cli/src/`
- Integration tests: All Phase 1 commands tested with various fixtures
