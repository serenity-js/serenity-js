import { Actor } from '@serenity-js/core/lib/screenplay';
import * as webdriver from 'selenium-webdriver';

import sinon = require('sinon');
import expect = require('../expect');

import { UsesAbilities } from '../../../core/lib/screenplay/actor';
import { Check } from '../../../core/src/screenplay/conditionals';
import { Question } from '../../../core/src/screenplay/question';
import { BrowseTheWeb, Click, Target } from '../../src/serenity-protractor/screenplay';
import { Enter } from '../../src/serenity-protractor/screenplay/interactions/enter';
import { fakeBrowserLocating } from '../api/serenity-protractor/screenplay/interactions/fake_browser';

describe('The conditional performable', () => {

    describe('when used with boolean argument', () => {
        const inputField = Target.the('Input field').located(webdriver.By.css('button#wahoo'));

        it('triggers tasks in the andIfSo() argument when the boolean condition is true', () => {
            const
                element = sinon.createStubInstance(webdriver.WebElement) as any,
                actor = Actor.named('Nick').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            element.click.returns(Promise.resolve());

            const promise = actor.attemptsTo(
                Check.whether(true)
                    .andIfSo(
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField))
                    .otherwise(
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField)),
            );

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Yay!').callCount(3);
            });

        });

        it('triggers tasks in the otherwise() argument when the boolean condition is false', () => {
            const
                element = sinon.createStubInstance(webdriver.WebElement) as any,
                actor = Actor.named('Nick').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            element.click.returns(Promise.resolve());

            const promise = actor.attemptsTo(
                Check.whether(false)
                    .andIfSo(
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField))
                    .otherwise(
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField)),
            );

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Noooo :-(').callCount(3);
            });

        });
    });
    describe('when used with question argument returning a boolean', () => {
        const inputField = Target.the('Input field').located(webdriver.By.css('button#wahoo'));

        class MyBooleanQuestion implements Question<boolean> {
            static withValue = (someValue: boolean) => new MyBooleanQuestion(someValue);
            answeredBy = (actor: UsesAbilities) => this.value;
            toString = () => 'My boolean question';

            constructor(private value: boolean) {
            }
        }

        it('triggers tasks in the andIfSo() argument when the question returns true', () => {
            const
                element = sinon.createStubInstance(webdriver.WebElement) as any,
                actor = Actor.named('Nick').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            element.click.returns(Promise.resolve());

            const promise = actor.attemptsTo(
                Check.whetherQuestionTrue(MyBooleanQuestion.withValue(true))
                    .andIfSo(
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField))
                    .otherwise(
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField)),
            );

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Yay!').callCount(3);
            });

        });

        it('triggers tasks in the otherwise() argument when the question returns false', () => {
            const
                element = sinon.createStubInstance(webdriver.WebElement) as any,
                actor = Actor.named('Nick').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            element.click.returns(Promise.resolve());

            const promise = actor.attemptsTo(
                Check.whetherQuestionTrue(MyBooleanQuestion.withValue(false))
                    .andIfSo(
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField))
                    .otherwise(
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField)),
            );

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Noooo :-(').callCount(3);
            });

        });
    });
    describe('when used with question argument returning a boolean promise', () => {
        const inputField = Target.the('Input field').located(webdriver.By.css('button#wahoo'));

        class MyBooleanPromiseQuestion implements Question<PromiseLike<boolean>> {
            static withValue = (someValue: boolean) => new MyBooleanPromiseQuestion(someValue);
            answeredBy = (actor: UsesAbilities) => Promise.resolve(this.value);
            toString = () => 'My boolean promise question';

            constructor(private value: boolean) {
            }
        }

        it('triggers tasks in the andIfSo() argument when the question returns a promise resolving a true value', () => {
            const
                element = sinon.createStubInstance(webdriver.WebElement) as any,
                actor = Actor.named('Nick').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            element.click.returns(Promise.resolve());

            const promise = actor.attemptsTo(
                Check.whetherPromiseTrue(MyBooleanPromiseQuestion.withValue(true))
                    .andIfSo(
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField))
                    .otherwise(
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField)),
            );

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Yay!').callCount(3);
            });

        });

        it('triggers tasks in the otherwise() argument when the question returns a promise resolving a false value', () => {
            const
                element = sinon.createStubInstance(webdriver.WebElement) as any,
                actor = Actor.named('Nick').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            element.click.returns(Promise.resolve());

            const promise = actor.attemptsTo(
                Check.whetherPromiseTrue(MyBooleanPromiseQuestion.withValue(false))
                    .andIfSo(
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField),
                        Enter.theValue('Yay!').into(inputField))
                    .otherwise(
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField),
                        Enter.theValue('Noooo :-(').into(inputField)),
            );

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Noooo :-(').callCount(3);
            });

        });
    });
});
