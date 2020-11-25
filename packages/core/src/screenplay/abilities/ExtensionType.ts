import { Extension } from './Extension';

/**
 * @experimental
 */
export type ExtensionType<Subject, ET extends Extension<Subject> = Extension<Subject>> = new (...args: any[]) => ET
