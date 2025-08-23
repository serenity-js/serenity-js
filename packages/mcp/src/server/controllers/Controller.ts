import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';

import type { ScreenplayExecutionContext } from '../context/index.js';
import type { InputSchema } from '../schema.js';

export interface Controller<ParameterSchema extends InputSchema> {
    execute(
        context: ScreenplayExecutionContext,
        parameters: z.infer<ParameterSchema>,
    ): Promise<CallToolResult>;
}
