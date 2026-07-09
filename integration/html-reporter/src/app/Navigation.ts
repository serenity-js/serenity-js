import { equals, includes, not } from '@serenity-js/assertions';
import { Answerable, notes, Task, the, Wait } from '@serenity-js/core';
import { By, Click, Page, PageElement, PageElements, Text } from '@serenity-js/web';

export class Navigation {
    private static routeRegex = /^#\/([^?]+)/;

    private sidebar = PageElement.located(By.css('aside.sidebar'));
    private navItems = PageElements.located(By.css('.nav-item')).of(this.sidebar).describedAs('navigation items');

    private navItemCalled = (name: Answerable<string>) =>
        this.navItems
            .where(Text, includes(name))
            .first()
            .describedAs(the`"${ name }"`);

    private currentRouteName = () =>
        Page.current()
            .url()
            .hash
            .match(Navigation.routeRegex)?.[1]
            .describedAs('current route name');

    openView = (viewName: Answerable<string>) =>
        Task.where(the`#actor opens the ${ viewName } view`,
            // todo: open nav if needed on mobile
            notes().set('previousRouteName', this.currentRouteName()),
            Click.on(this.navItemCalled(viewName)),
            Wait.until(this.currentRouteName(), not(equals(notes().get('previousRouteName')))),
        )
}
