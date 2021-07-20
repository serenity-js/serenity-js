import {
    Answerable,
    AnswersQuestions,
    Interaction,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../../screenplay/abilities';

export interface NavigateOptions {
    timeout?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface NavigateOptionsWithReferer extends NavigateOptions {
    referer?: string;
}

/**
 * @desc
 *  Allows the {@link @serenity-js/core/lib/screenplay/actor~Actor} to navigate to a specific destination,
 *  as well as back and forth in the browser history, or reload the current page.
 */
export class Navigate {
    /**
   * @desc
   *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
   *  navigate to a given URL.
   *
   *  The URL can be:
   *  - absolute, i.e. `https://example.org/search`
   *
   *  Relative URLs are not supported
   *
   * @example <caption>Navigate to an absolute URL (overrides baseUrl)</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { BrowseTheWeb, Navigate } from '@serenity-js/playwright';
   *
   *  actorCalled('Hannu')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Navigate.to('https://mycompany.org/login'),
   *      );
   *
   * @example <caption>Navigate to URL with timeout</caption>
   *  import { actorCalled, Duration } from '@serenity-js/core';
   *  import { BrowseTheWeb, Navigate } from '@serenity-js/playwright';
   *
   *  actorCalled('Hannu')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Navigate.to('https://example.com/search').withTimeout(Duration.ofSeconds(2)),
   *      );
   *
   * @param {Answerable<string>} url
   *  An absolute URL or path an {@link @serenity-js/core/lib/screenplay/actor~Actor} should navigate to
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction & { withTimeout: (duration: Answerable<Duration>) => Interaction }}
   *
   * @see {@link BrowseTheWeb}
   * @see {@link @serenity-js/core~Duration}
   */
    public static to(url: Answerable<string>): Interaction & {
        withOptions: (options: NavigateOptionsWithReferer) => Interaction;
    } {
        return new NavigateToUrl(url);
    }

    /**
   * @desc
   *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
   *  navigate back one page in the session history.
   *
   * @example <caption>Navigate to path relative to baseUrl</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { Ensure, endsWith } from '@serenity-js/assertions';
   *  import { BrowseTheWeb, Navigate } from '@serenity-js/playwright';
   *
   *  actorCalled('Hannu')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Navigate.to('https://example.com/first'),
   *          Navigate.to('https://example.com/second'),
   *
   *          Navigate.back(),
   *
   *          Ensure.that(Website.url(), endsWith('/first')),
   *      );
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   *
   * @see {@link BrowseTheWeb}
   * @see {@link @serenity-js/assertions~Ensure}
   * @see {@link @serenity-js/assertions/lib/expectations~endsWith}
   */
    public static back(): Interaction & {
        withOptions: (options: NavigateOptions) => Interaction;
    } {
        return new NavigateBack();
    }

    /**
   * @desc
   *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
   *  navigate forward one page in the session history.
   *
   * @example <caption>Navigate to path relative to baseUrl</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { Ensure, endsWith } from '@serenity-js/assertions';
   *  import { BrowseTheWeb, Navigate } from '@serenity-js/playwright';
   *
   *  actorCalled('Hannu')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Navigate.to('https://example.com/first'),
   *          Navigate.to('https://example.com/second'),
   *
   *          Navigate.back(),
   *          Navigate.forward(),
   *
   *          Ensure.that(Website.url(), endsWith('/second')),
   *      );
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   *
   * @see {@link BrowseTheWeb}
   * @see {@link @serenity-js/assertions~Ensure}
   * @see {@link @serenity-js/assertions/lib/expectations~endsWith}
   */
    static forward(): Interaction {
        return new NavigateForward();
    }

    /**
   * @desc
   *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
   *  reload the current page.
   *
   * @example <caption>Navigate to path relative to baseUrl</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { Ensure, endsWith } from '@serenity-js/assertions';
   *  import { Navigate, BrowseTheWeb, DeleteCookies } from '@serenity-js/playwright';
   *
   *  actorCalled('Hannu')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Navigate.to('https://example.com/login'),
   *          DeleteCookies.all(),
   *          Navigate.reloadPage(),
   *      );
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   *
   * @see {@link BrowseTheWeb}
   * @see {@link DeleteCookies}
   * @see {@link @serenity-js/assertions~Ensure}
   * @see {@link @serenity-js/assertions/lib/expectations~endsWith}
   */
    static reloadPage(): Interaction {
        return new ReloadPage();
    }
}

class NavigateToUrl implements Interaction {
    constructor(
        private readonly urlAnswerable: Answerable<string>,
        private readonly options?: NavigateOptionsWithReferer
    ) {}

    withOptions(options?: NavigateOptionsWithReferer): Interaction {
        return new NavigateToUrl(this.urlAnswerable, options);
    }

    public async performAs(
        actor: UsesAbilities & AnswersQuestions
    ): Promise<void> {
        const url = await actor.answer(this.urlAnswerable);
        await actor.abilityTo(BrowseTheWeb).open(url, this.options);
    }

    public toString(): string {
        return formatted`#actor navigates to ${this.urlAnswerable}`;
    }
}

class NavigateBack implements Interaction {
    constructor(private readonly options?: NavigateOptions) {}

    withOptions(options?: NavigateOptions): Interaction {
        return new NavigateBack(options);
    }

    public async performAs(
        actor: UsesAbilities & AnswersQuestions
    ): Promise<void> {
        await actor.abilityTo(BrowseTheWeb).navigate('back', this.options);
    }

    public toString(): string {
        return formatted`#actor navigates back`;
    }
}

class NavigateForward implements Interaction {
    constructor(private readonly options?: NavigateOptions) {}

    withOptions(options?: NavigateOptions): Interaction {
        return new NavigateForward(options);
    }

    public async performAs(
        actor: UsesAbilities & AnswersQuestions
    ): Promise<void> {
        await actor.abilityTo(BrowseTheWeb).navigate('forward', this.options);
    }

    public toString(): string {
        return formatted`#actor navigates forward`;
    }
}

class ReloadPage implements Interaction {
    constructor(private readonly options?: NavigateOptions) {}

    withOptions(options?: NavigateOptions): Interaction {
        return new ReloadPage(options);
    }

    public async performAs(
        actor: UsesAbilities & AnswersQuestions
    ): Promise<void> {
        await actor.abilityTo(BrowseTheWeb).navigate('reload', this.options);
    }

    public toString(): string {
        return formatted`#actor reloads page`;
    }
}
