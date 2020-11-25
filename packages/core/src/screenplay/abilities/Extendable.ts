import { Extension } from './Extension';
import { ExtensionType } from './ExtensionType';

/**
 * @experimental
 */
export interface Extendable<Subject> {
    extendedWith(extension: Extension<Subject>): this;

    extension<E extends Extension<Subject>>(extensionType: ExtensionType<Subject, E>): E;
}
