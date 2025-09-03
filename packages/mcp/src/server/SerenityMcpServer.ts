import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { ModuleLoader } from '@serenity-js/core/lib/io/index.js';

import type { ScreenplaySchematic } from './context/index.js';
import { ScreenplayExecutionContext } from './context/index.js';
import {
    type CapabilityController,
    ListCapabilitiesController,
    ProjectAnalyzeDependenciesController,
    ProjectAnalyzeRuntimeEnvironmentController,
    ProjectConfigurePackageJsonScriptsController,
    ProjectConfigurePlaywrightTestController,
    ProjectCreateExampleTestFileController,
    TestAutomationController
} from './controllers/index.js';
import type { ToolController } from './controllers/ToolController.js';
import type { PlaywrightBrowserConnection, SerenityModuleManager } from './integration/index.js';
import { McpDispatcher } from './McpDispatcher.js';
import type { InputSchema } from './schema.js';

export class SerenityMcpServer {

    private readonly dispatchers: McpDispatcher[] = [];

    constructor(
        private readonly schematics: Array<ScreenplaySchematic>,
        private readonly moduleLoader: ModuleLoader,
        private readonly browserConnection: PlaywrightBrowserConnection,
        private readonly moduleManager: SerenityModuleManager,
    ) {
    }

    async connect(transport: Transport): Promise<McpDispatcher> {
        const dispatcher = this.createDispatcher();

        this.dispatchers.push(dispatcher);

        await dispatcher.connect(transport);

        return dispatcher;
    }

    private createDispatcher(): McpDispatcher {

        const context = new ScreenplayExecutionContext(
            this.browserConnection,
            this.moduleLoader,
        );

        const projectControllers = [
            new ProjectAnalyzeRuntimeEnvironmentController(this.moduleManager),
            new ProjectAnalyzeDependenciesController(this.moduleManager),
            new ProjectConfigurePlaywrightTestController(),
            new ProjectConfigurePackageJsonScriptsController(),
            new ProjectCreateExampleTestFileController(),
        ];
        const testAutomationControllers = this.schematics.map(schematic => new TestAutomationController(schematic));

        const controllers = [
            ...projectControllers,
            ...testAutomationControllers,
        ];

        const capabilityDescriptors = controllers
            .filter(controllers => SerenityMcpServer.isCapabilityController(controllers))
            .map(controller => controller.capabilityDescriptor());

        return new McpDispatcher(
            [
                ...controllers,
                new ListCapabilitiesController(capabilityDescriptors),
            ],
            context,
        );
    }

    private static isCapabilityController<Input extends InputSchema>(controller: ToolController<Input>): controller is CapabilityController<Input> {
        return 'capabilityDescriptor' in controller
            && typeof controller.capabilityDescriptor === 'function';
    }

    registerProcessExitHandler(): void {
        /* eslint-disable unicorn/no-process-exit */
        let isExiting = false;
        const handleExit = async () => {
            if (isExiting) {
                return;
            }

            isExiting = true;
            setTimeout(() => process.exit(0), 15_000);
            await Promise.all(this.dispatchers.map(dispatcher => dispatcher.close()));

            process.exit(0);
        };
        /* eslint-enable unicorn/no-process-exit */

        process.stdin.on('close', handleExit);
        process.on('SIGINT', handleExit);
        process.on('SIGTERM', handleExit);
    }
}
