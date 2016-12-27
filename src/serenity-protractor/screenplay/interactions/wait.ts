import { Interaction, Performable, UsesAbilities } from '../../../serenity/screenplay';
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

export type TimeoutCondition<T> = (s: T, timeout: Duration) => Performable;
export type TargetTimeoutCondition = TimeoutCondition<Target>;

export class Wait {
    static for   = (duration: Duration): Interaction => new PassiveWait(duration);
    static upTo  = (timeout: Duration)  => new ActiveWait(timeout);
    static until<T> (somethingToWaitFor: T, condition: TimeoutCondition<T>) {
        return new ActiveWait().until(somethingToWaitFor, condition);
    }
}

export class ActiveWait {
    until<T> (somethingToWaitFor: T, condition: TimeoutCondition<T>): Performable {
        return condition(somethingToWaitFor, this.timeout);
    }

    constructor(private timeout: Duration = Duration.ofSeconds(1)) {
    }
}

export class Is {

    static visible(): TargetTimeoutCondition {
        return (target: Target, timeout: Duration) => new WaitUntil(target, new Visibility(), timeout);
    }

    static invisible(): TargetTimeoutCondition {
        return (target: Target, timeout: Duration) => new WaitUntil(target, new Invisibility(), timeout);
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

class Visibility implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.visibilityOf(thing);
    name  = () => 'visible';
}

class Invisibility implements Condition<ElementFinder> {
    check = (thing: ElementFinder): Function => protractor.ExpectedConditions.invisibilityOf(thing);
    name  = () => 'invisible';
}

class WaitUntil implements Interaction {

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).wait(
            this.condition.check(BrowseTheWeb.as(actor).locate(this.target)),
            this.timeout.toMillis(),
            `"${ this.target }" did not become ${ this.condition.name() } within ${this.timeout}`,
        );
    }

    constructor(private target: Target, private condition: Condition<ElementFinder>, private timeout: Duration) {
    }
}

/*
 [x] visibilityOf(elementFinder: ElementFinder): Function {
 [x] invisibilityOf(elementFinder: ElementFinder): Function {
 [ ] presenceOf(elementFinder: ElementFinder): Function {
 [ ] stalenessOf(elementFinder: ElementFinder): Function {
 [ ] elementToBeSelected(elementFinder: ElementFinder): Function {

 [ ] alertIsPresent(): Function {
 [ ] elementToBeClickable(elementFinder: ElementFinder): Function {
 [ ] textToBePresentInElement(elementFinder: ElementFinder, text: string): Function {
 [ ] textToBePresentInElementValue(elementFinder: ElementFinder, text: string): Function {
 [ ] titleContains(title: string): Function {
 [ ] titleIs(title: string): Function {
 [ ] urlContains(url: string): Function {
 [ ] urlIs(url: string): Function {
 */
