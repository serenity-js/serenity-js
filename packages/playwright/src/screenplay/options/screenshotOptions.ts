export interface ScreenshotOptions {
    /**
   * An object which specifies clipping of the resulting image. Should have the following fields:
   */
    clip?: {
    /**
     * x-coordinate of top-left corner of clip area
     */
        x: number;

        /**
     * y-coordinate of top-left corner of clip area
     */
        y: number;

        /**
     * width of clipping area
     */
        width: number;

        /**
     * height of clipping area
     */
        height: number;
    };

    /**
   * When true, takes a screenshot of the full scrollable page, instead of the currently visible viewport. Defaults to
   * `false`.
   */
    fullPage?: boolean;

    /**
   * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images.
   * Defaults to `false`.
   */
    omitBackground?: boolean;

    /**
   * The file path to save the image to. The screenshot type will be inferred from file extension. If `path` is a relative
   * path, then it is resolved relative to the current working directory. If no path is provided, the image won't be saved to
   * the disk.
   */
    path?: string;

    /**
   * The quality of the image, between 0-100. Not applicable to `png` images.
   */
    quality?: number;

    /**
   * Maximum time in milliseconds, defaults to 30 seconds, pass `0` to disable timeout. The default value can be changed by
   * using the
   * [browserContext.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browsercontextsetdefaulttimeouttimeout)
   * or [page.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-page#pagesetdefaulttimeouttimeout) methods.
   */
    timeout?: number;

    /**
   * Specify screenshot type, defaults to `png`.
   */
    type?: 'png' | 'jpeg';
}
