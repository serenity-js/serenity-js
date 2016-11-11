import { Target } from '../../../../src/serenity-protractor/screenplay';

import { by } from 'protractor';

export class DemoApp {
    static Header        = Target.the('header').located(by.css('header>h1'));
    static Item_Field    = Target.the('name field').located(by.model('item'));
    static Items         = Target.the('list of items').located(by.repeater('item in items'));
    static Submit_Button = Target.the('submit button').located(by.css('input[type="submit"]'));

    static Event_Trigger = Target.the('event-triggering button').located(by.id('event-tester-{0}'));

    static Destinations  = Target.the('destination selector').located(by.name('select'));
}
