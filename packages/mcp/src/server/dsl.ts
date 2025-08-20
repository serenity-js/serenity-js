import type { ScreenplaySchematic, ScreenplaySchematicConfiguration } from './context/index.js';
import { ScreenplaySchematics } from './context/index.js';
import type { InputSchema } from './schema.js';

export function defineSchematics<Input extends InputSchema = InputSchema>(
    defaults: Partial<ScreenplaySchematicConfiguration<Input>>,
): (...configuration: Array<Partial<ScreenplaySchematicConfiguration<Input>>>) => Array<ScreenplaySchematic<Input>> {
    const schematics = new ScreenplaySchematics<Input>(defaults);

    return (...configuration: Array<Partial<ScreenplaySchematicConfiguration<Input>>>) => {
        return configuration.map(config => schematics.create(config));
    };
}
