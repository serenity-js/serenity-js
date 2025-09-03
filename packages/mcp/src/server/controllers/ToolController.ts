import type { Tool } from '@modelcontextprotocol/sdk/types.js';

import type { InputSchema } from '../schema.js';
import type { Controller } from './Controller.js';

export interface ToolController<ParameterSchema extends InputSchema> extends Controller<ParameterSchema> {
    toolDescriptor(): Tool;
}
