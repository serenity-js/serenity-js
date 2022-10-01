import { ClassDescription } from '../../config';
import { ConfigurationError } from '../../errors';
import { d } from '../format';
import { ClassDescriptionParser } from './ClassDescriptionParser';
import { ModuleLoader } from './ModuleLoader';

export class ClassLoader {
    constructor(
        private readonly loader: ModuleLoader,
        private readonly parser: ClassDescriptionParser,
    ) {
    }

    looksLoadable(description: unknown): description is ClassDescription {
        return this.parser.looksLikeClassDescription(description);
    }

    instantiate<T>(description: ClassDescription): T {
        const descriptor = this.parser.parse(description);

        const requiredModule    = this.loader.require(descriptor.moduleId);
        const requiredType      = requiredModule[descriptor.className];

        if (typeof requiredType !== 'function') {
            throw new ConfigurationError(d `Module ${ descriptor.moduleId } doesn't seem to export ${ descriptor.className }. Exported members include: ${ Object.keys(requiredModule).join(', ') }`)
        }

        if (descriptor.parameter) {
            if (typeof requiredType.fromJSON !== 'function') {
                throw new ConfigurationError(d `Class ${ descriptor.className } exported by ${ descriptor.moduleId } needs a static fromJSON() method that accepts ${ descriptor.parameter }`);
            }

            return requiredType.fromJSON(descriptor.parameter);
        }

        if (requiredType.length > 0) {
            throw new ConfigurationError(d`Class ${ descriptor.className } exported by ${ descriptor.moduleId } doesn't seem to offer a no-arg constructor`);
        }

        return new requiredType();
    }
}
