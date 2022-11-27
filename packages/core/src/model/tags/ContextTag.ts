import { Tag } from './Tag';

/**
 * There are a couple of common use-cases for contexts: running the same test in different browsers,
 * and running the same test on different operating systems.
 * If you use the name of a browser (e.g. “chrome”, “firefox”, “safari”, “ie”),
 * the context will be represented in the reports as the icon of the respective browsers.
 * If you provide an operating system (e.g. “linux”, “windows”, “mac”, “android”, “iphone”),
 * a similar icon will be used. If you use any other term for your context,
 * it will appear in text form in the test results lists, so it is better to keep context names relatively short.
 *
 * :::warning
 * This tag is deprecated and will be removed in Serenity/JS 3.0.0. Use {@apilink BrowserTag} and {@apilink PlatformTag} instead.
 * :::
 *
 * @deprecated use {@link BrowserTag} and {@link PlatformTag} instead
 */
export class ContextTag extends Tag {
    static readonly Type = 'context';

    constructor(context: string) {
        super(context, ContextTag.Type);
    }
}
