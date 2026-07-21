import { equals, includes, not } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Check, notes, Task, the, Wait } from '@serenity-js/core';
import { Attribute, By, Click, isVisible, Page, PageElement, PageElements, Text } from '@serenity-js/web';

export class Navigation {
    private static routeRegex = /^#\/([^?]+)/;

    private hamburgerMenu = PageElement.located(By.css('button[aria-label="Open menu"]')).describedAs('hamburger menu button');
    private sidebar = PageElement.located(By.css('aside.sidebar'));
    private navItems = PageElements.located(By.css('.nav-item')).of(this.sidebar).describedAs('navigation items');

    private summaryLinkElement = PageElement.located(By.css('link[rel="alternate"][type="application/json"]')).describedAs('summary.json link');

    summaryLink = (): QuestionAdapter<string> =>
        Attribute.called('href').of(this.summaryLinkElement).describedAs('summary.json href');

    summaryLinkTitle = (): QuestionAdapter<string> =>
        Attribute.called('title').of(this.summaryLinkElement).describedAs('summary.json link title');

    private navItemCalled = (name: Answerable<string>) =>
        this.navItems
            .where(Text, includes(name))
            .first()
            .describedAs(the`${name}`);

    private currentRouteName = () =>
        Page.current()
            .url()
            .hash
            .match(Navigation.routeRegex)?.[1]
            .describedAs('current route name');

    openView = (viewName: Answerable<string>): Task =>
        Task.where(the`#actor opens the ${viewName} view`,
            Check.whether(this.hamburgerMenu, isVisible())
                .andIfSo(Click.on(this.hamburgerMenu)),
            notes().set('previousRouteName', this.currentRouteName()),
            Click.on(this.navItemCalled(viewName)),
            Wait.until(this.currentRouteName(), not(equals(notes().get('previousRouteName')))),
        );

    selectTheme = (preference: string): Task =>
        Task.where(the`#actor selects the ${preference} theme`,
            Check.whether(this.hamburgerMenu, isVisible())
                .andIfSo(Click.on(this.hamburgerMenu)),
            Click.on(PageElement.located(By.css(`.theme-switch-option[title="${preference} theme"]`)).describedAs(`${preference} theme option`)),
        );
}
