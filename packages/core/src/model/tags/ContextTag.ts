import { Tag } from './Tag';

/**
 * @desc There are a couple of common use-cases for contexts: running the same test in different browsers,
 * and running the same test on different operating systems.
 * If you use the name of a browser (e.g. “chrome”, “firefox”, “safari”, “ie”),
 * the context will be represented in the reports as the icon of the respective browsers.
 * If you provide an operating system (e.g. “linux”, “windows”, “mac”, “android”, “iphone”),
 * a similar icon will be used. If you use any other term for your context,
 * it will appear in text form in the test results lists, so it is better to keep context names relatively short.
 *
 * @access public
 * @deprecated
 */
export class ContextTag extends Tag {
    static readonly Type = 'context';

    constructor(context: string) {
        super(context, ContextTag.Type);
    }
}
