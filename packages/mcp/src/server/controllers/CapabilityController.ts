import type { CapabilityDescriptor, InputSchema } from '../schema.js';
import type { ToolController } from './ToolController.js';

export interface CapabilityController<ParameterSchema extends InputSchema> extends ToolController<ParameterSchema> {
    capabilityDescriptor(): CapabilityDescriptor;
}
