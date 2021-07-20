interface BasicOptions {
    /**
   * Maximum time in milliseconds, defaults to 30 seconds, pass `0` to disable timeout. The default value can be changed by
   * using the
   * [browserContext.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browsercontextsetdefaulttimeouttimeout)
   * or [page.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-page#pagesetdefaulttimeouttimeout) methods.
   */
    timeout?: number;
}
