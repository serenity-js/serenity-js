import { Activity, Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

import { ElementFinder, protractor } from 'protractor';

export class Duration {
    static ofMillis  = (milliseconds: number) => new Duration(milliseconds);
    static ofSeconds = (seconds: number)      => Duration.ofMillis(seconds * 1000);

    toMillis = () => this.milliseconds;
    toString = () => `${ this.milliseconds }ms`;

    constructor(private milliseconds: number) {
    }
}

export type SuccessCondition<T> = (subject: T, timeout: Duration) => Activity;

export class Wait {
    static for   = (duration: Duration): Interaction => new PassiveWait(duration);
    static upTo  = (timeout: Duration) => new ActiveWait(timeout);
    static until<T>(somethingToWaitFor: T, condition: SuccessCondition<T>) {
        return new ActiveWait().until(somethingToWaitFor, condition);
    }
}

export class ActiveWait {
    private static Default_Timeout = Duration.ofSeconds(5);

    until<T>(somethingToWaitFor: T, condition: SuccessCondition<T>): Activity {
        return condition(somethingToWaitFor, this.timeout);
    }

    constructor(private timeout: Duration = ActiveWait.Default_Timeout) {
    }
}

export class Is {
    static visible    = () => Is.aTargetThat(new IsVisible());
    static invisible  = () => Is.aTargetThat(new IsInvisible());
    static present    = () => Is.aTargetThat(new IsPresent());
    static absent     = () => Is.aTargetThat(new Absent());
    static selected   = () => Is.aTargetThat(new IsSelected());
    static clickable  = () => Is.aTargetThat(new IsClickable());

    private static aTargetThat(condition: Condition<ElementFinder>): SuccessCondition<Target>{
        return (target: Target, timeout: Duration) => new WaitUntil(target, condition, timeout);
    }
}

// package-protected

class PassiveWait implements Interaction {
    performAs = (actor: UsesAbilities) => BrowseTheWeb.as(actor).sleep(this.duration.toMillis());

    constructor(private duration: Duration) {
    }
}

interface Condition<T> {
    check(thing: ElementFinder): Function;
    name(): string;
}

class IsVisible implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.visibilityOf(thing);
    name  = () => 'visible';
}

class IsInvisible implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.invisibilityOf(thing);
    name  = () => 'invisible';
}

class IsPresent implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.presenceOf(thing);
    name  = () => 'present';
}

class Absent implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.stalenessOf(thing);
    name  = () => 'absent';
}

class IsSelected implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.elementToBeSelected(thing);
    name  = () => 'selected';
}

class IsClickable implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.elementToBeClickable(thing);
    name  = () => 'clickable';
}

class WaitUntil implements Interaction {

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).wait(
            this.condition.check(BrowseTheWeb.as(actor).locate(this.target)),
            this.timeout.toMillis(),
            `${ this.uppercased(this.target) } did not become ${ this.condition.name() } within ${this.timeout}`,
        );
    }

    constructor(private target: Target, private condition: Condition<ElementFinder>, private timeout: Duration) {
    }

    private uppercased(target: Target) {
        const name = target.toString();
        return name[0].toUpperCase() + name.slice(1);
    }
}

/*
 [x] visibilityOf(elementFinder: ElementFinder): Function {
 [x] invisibilityOf(elementFinder: ElementFinder): Function {
 [x] presenceOf(elementFinder: ElementFinder): Function {
 [x] stalenessOf(elementFinder: ElementFinder): Function {
 [x] elementToBeSelected(elementFinder: ElementFinder): Function {
 [x] elementToBeClickable(elementFinder: ElementFinder): Function {

 [ ] alertIsPresent(): Function {
 [ ] textToBePresentInElement(elementFinder: ElementFinder, text: string): Function {
 [ ] textToBePresentInElementValue(elementFinder: ElementFinder, text: string): Function {
 [ ] titleContains(title: string): Function {
 [ ] titleIs(title: string): Function {
 [ ] urlContains(url: string): Function {
 [ ] urlIs(url: string): Function {
 */
