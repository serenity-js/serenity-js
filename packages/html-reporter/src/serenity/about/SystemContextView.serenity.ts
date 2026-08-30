import { equals } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

class ContextItem {
    static label = () => Text.of(PageElement.located(By.css('.context-label')));
    static value = () => Text.of(PageElement.located(By.css('.context-value')));

    static of = (rootElement: PageElement) =>
        Question.fromObject({
            label: ContextItem.label().of(rootElement),
            value: ContextItem.value().of(rootElement),
        }).describedAs('context item');
}

/**
 * Interaction object representing the **System Context** view in the HTML report.
 *
 * Shows runtime environment details captured during the test run: Node.js version,
 * operating system, test runner, CI provider information, browser versions, and
 * commit details. Each piece of information is displayed as a labelled context item.
 *
 * Uses the `ContextItem` MetaQuestion pattern internally to extract structured
 * label/value pairs from the rendered context items.
 *
 * ## Instantiation
 *
 * ```ts
 * import { SystemContextView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const systemContextView = new SystemContextView(
 *   PageElement.located(By.css('[data-testid="system-context"]')).describedAs('system context view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   systemContextView.open(),
 *   Ensure.that(systemContextView.nodeVersion(), includes('22')),
 *   Ensure.that(systemContextView.testRunner(), includes('Playwright')),
 *   Ensure.that(systemContextView.operatingSystem(), includes('Linux')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class SystemContextView<NET> extends InteractionObject<NET> {

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    private contextItemElements = () =>
        this.rootElement.elements(By.css('.context-item'))
            .describedAs('context items');

    private itemCalled = (name: string) =>
        this.contextItemElements()
            .where(ContextItem.label(), equals(name))
            .eachMappedTo(ContextItem)
            .first()
            .describedAs(`context item called ${ name }`);

    /**
     * The Node.js version used during the test run.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.nodeVersion(), includes('22.'))
     * ```
     */
    nodeVersion = (): QuestionAdapter<string> =>
        this.itemCalled('NODE.JS').value;

    /**
     * The project name from `package.json`.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.projectName(), equals('my-test-suite'))
     * ```
     */
    projectName = (): QuestionAdapter<string> =>
        this.itemCalled('PROJECT').value;

    /**
     * The package manager used (e.g. `'npm 10.2.0'`, `'pnpm 9.1.0'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.packageManager(), includes('pnpm'))
     * ```
     */
    packageManager = (): QuestionAdapter<string> =>
        this.itemCalled('PACKAGE MANAGER').value;

    /**
     * The test runner name and version (e.g. `'Playwright Test 1.44.0'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.testRunner(), includes('Playwright'))
     * ```
     */
    testRunner = (): QuestionAdapter<string> =>
        this.itemCalled('TEST RUNNER').value;

    /**
     * The operating system name and version.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.operatingSystem(), includes('Linux'))
     * ```
     */
    operatingSystem = (): QuestionAdapter<string> =>
        this.itemCalled('OPERATING SYSTEM').value;

    /**
     * The Serenity/JS framework version.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.serenityVersion(), includes('3.'))
     * ```
     */
    serenityVersion = (): QuestionAdapter<string> =>
        this.itemCalled('SERENITY/JS').value;

    /**
     * The CI provider name (e.g. `'GitHub Actions'`, `'Jenkins'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.ciProvider(), equals('GitHub Actions'))
     * ```
     */
    ciProvider = (): QuestionAdapter<string> =>
        this.itemCalled('PROVIDER').value;

    /**
     * The CI build number or ID.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.ciBuildNumber(), equals('42'))
     * ```
     */
    ciBuildNumber = (): QuestionAdapter<string> =>
        this.itemCalled('BUILD').value;

    /**
     * The git branch name from CI context.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.ciBranch(), equals('main'))
     * ```
     */
    ciBranch = (): QuestionAdapter<string> =>
        this.itemCalled('BRANCH').value;

    /**
     * The git commit SHA from CI context.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.ciCommit(), includes('abc1234'))
     * ```
     */
    ciCommit = (): QuestionAdapter<string> =>
        this.itemCalled('COMMIT').value;

    /**
     * The commit message text from CI context.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.commitMessage(), includes('fix: resolve timeout'))
     * ```
     */
    commitMessage = (): QuestionAdapter<string> =>
        this.rootElement.element(By.css('.context-commit-msg'))
            .text()
            .trim()
            .describedAs('commit message');

    /**
     * The version of a specific browser used during the test run.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.browser('CHROMIUM'), includes('126.'))
     * ```
     *
     * @param name
     *  The browser label as it appears in the context items (e.g. `'CHROMIUM'`, `'FIREFOX'`)
     */
    browser = (name: string): QuestionAdapter<string> =>
        this.itemCalled(name).value;

    /**
     * Navigates to the System Context view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   systemContextView.open(),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the System Context view',
            this.navigation.openView('System'),
        );

    /**
     * The full body text of the system context view.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(systemContextView.bodyText(), includes('NODE.JS'))
     * ```
     */
    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('system context view text');
}
