import { Question } from '@serenity-js/core';
import { logging } from 'selenium-webdriver';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

export class Browser {

    /**
     * @desc
     *  Creates a {@link Question} that reads the entries of the browser log
     *  so that they can be asserted on.
     *
     *  Please note that in order to ensure that the automated test has access to the browser log,
     *  Protractor needs to be configured with the desired logging level, as per the example below.
     *
     * @example <caption>Enabling Protractor browser logging</caption>
     * // protractor.conf.js
     * exports.config = {
     *   capabilities: {
     *     loggingPrefs: {
     *         // available options: OFF, SEVERE, WARNING, INFO, CONFIG, FINE, FINER, FINEST, ALL
     *         browser: 'SEVERE'
     *     },
     *   }
     * }
     *
     * @example <caption>Ensure the app didn't log anything to the console during the test</caption>
     * import { Actor, BrowseTheWeb, Browser } from '@serenity-js/core';
     * import { Ensure, property, equals } from '@serenity-js/assertions';
     *
     * actor.attemptsTo(
     *   Ensure.that(Browser.log(), property('length', equals(0))),
     * );
     *
     * @example <caption>Mark the test as "compromised" if the server responds with a 500 to any AJAX request during the test</caption>
     * import { Actor, BrowseTheWeb, Browser, TestCompromisedError } from '@serenity-js/core';
     * import { Ensure, property, equals, not, contrainAtLeastOneItemThat } from '@serenity-js/assertions'
     *
     * actor.attemptsTo(
     *   Ensure.that(Browser.log(),
     *     not(contrainAtLeastOneItemThat(
     *       property('message', includes('the server responded with a status of 500'))
     *     ))
     *   ).otherwiseFailWith(TestCompromisedError, 'The server is down'),
     * );
     *
     * @see https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities#loggingpreferences-json-object
     * @returns {Question<Promise<logging.Entry[]>>}
     */
    static log(): Question<Promise<logging.Entry[]>> {
        return Question.about<Promise<logging.Entry[]>>(`browser log`, actor =>
            promiseOf(BrowseTheWeb.as(actor).manage().logs().get('browser')));
    }
}
