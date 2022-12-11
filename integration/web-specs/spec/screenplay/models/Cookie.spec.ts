import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, isFalse, isPresent, isTrue, not } from '@serenity-js/assertions';
import { actorCalled, Answerable, Duration, q, Question, Timestamp } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { By, Click, Cookie, CookieData, CookieMissingError, Navigate, PageElement, Text } from '@serenity-js/web';
import { given } from 'mocha-testdata';
import express = require('express');

describe('Cookie', () => {

    // a tiny express server, setting response cookies
    const cookieCutterApp = express().
        get('/cookie', (request: express.Request & { query: { [key: string]: string }}, response: express.Response) => {

            response.cookie(request.query.name, request.query.value, {
                path:       '/cookie',
                domain:     request.query.domain,
                httpOnly:   !! request.query.httpOnly,
                secure:     !! request.query.secure,
                expires:    request.query.expires && new Date(request.query.expires),
                // https://www.chromestatus.com/feature/5633521622188032
                // sameSite:   !! request.query.secure ? 'None' : undefined,
            }).status(200).send();
        });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function cookieCutterURLFor(path: Answerable<string>): Question<Promise<string>> {
        return q`${ LocalServer.url() }${ path }`;
    }

    before(() =>
        // Fun fact: Before Cookie Monster ate his first cookie, he believed his name was Sid. You're welcome.
        actorCalled('Sid')
            .whoCan(ManageALocalServer.runningAHttpListener(cookieCutterApp))
            .attemptsTo(StartLocalServer.onRandomPort())
    );

    afterEach(() =>
        actorCalled('Sid').attemptsTo(
            Cookie.deleteAll()
        )
    );

    after(() =>
        actorCalled('Sid').attemptsTo(
            StopLocalServer.ifRunning(),
        )
    );

    describe('when setting cookies', () => {

        const ShowCookies = {
            viewer:             Text.of(PageElement.located(By.id('viewer')).describedAs('cookie viewer')),
            showCookiesButton:  PageElement.located(By.css('button')).describedAs('show cookies button'),
        }

        it('allows the actor to add a new cookie', () =>
            actorCalled('Sid').attemptsTo(
                Navigate.to('/screenplay/models/cookie/show_cookies.html'),
                Ensure.that(ShowCookies.viewer, equals('No cookies found')),
                Ensure.that(Cookie.called('favourite'), not(isPresent())),

                Cookie.set({
                    name:  'favourite',
                    value: 'triple chocolate',
                }),

                Ensure.that(Cookie.called('favourite'), isPresent()),
                Click.on(ShowCookies.showCookiesButton),
                Ensure.that(ShowCookies.viewer, equals('favourite=triple chocolate')),
            )
        );

        given(
            { description: 'missing name',          data: { name: undefined, value: 'OK' },             expectedError: 'Cookie.set(cookieData.name) should be defined'                                                          },
            { description: 'missing value',         data: { name: 'OK', value: undefined },             expectedError: 'Cookie.set(cookieData.value) should be defined'                                                         },
            { description: 'invalid path',          data: { name: 'OK', value: 'OK', path: {} },        expectedError: 'Cookie.set(cookieData.path) should be a string'                                                         },
            { description: 'invalid domain',        data: { name: 'OK', value: 'OK', domain: {} },      expectedError: 'Cookie.set(cookieData.domain) should be a string'                                                       },
            { description: 'invalid secure',        data: { name: 'OK', value: 'OK', secure: {} },      expectedError: 'Cookie.set(cookieData.secure) should be a boolean value'                                                },
            { description: 'invalid httpOnly',      data: { name: 'OK', value: 'OK', httpOnly: {} },    expectedError: 'Cookie.set(cookieData.httpOnly) should be a boolean value'                                              },
            { description: 'non-Timestamp expiry',  data: { name: 'OK', value: 'OK', expiry: -1 },      expectedError: 'Cookie.set(cookieData.expiry) should be instance of Timestamp'                                          },
            { description: 'invalid sameSite',      data: { name: 'OK', value: 'OK', sameSite: {} },    expectedError: 'Cookie.set(cookieData.sameSite) should either be equal to Lax, be equal to Strict or be equal to None'  },
        ).
        it('complains if the cookie name is not set', ({ data, expectedError }) =>
            expect(actorCalled('Sid').attemptsTo(
                Navigate.to('/screenplay/models/cookie/show_cookies.html'),
                Cookie.set(data as unknown as CookieData),
            )).to.be.rejectedWith(Error, expectedError)
        );

        it('accepts answerables', () =>
            actorCalled('Sid').attemptsTo(
                Navigate.to('/screenplay/models/cookie/show_cookies.html'),

                Cookie.set(Question.about('cookie data', _actor => ({
                    name:  'favourite',
                    value: 'triple chocolate',
                }))),

                Ensure.that(Cookie.called('favourite'), isPresent()),
            )
        );

        it('accepts objects with answerable properties', () =>
            actorCalled('Sid').attemptsTo(
                Navigate.to('/screenplay/models/cookie/show_cookies.html'),

                Cookie.set({
                    name: Promise.resolve('favourite'),
                    value: Question.about('cookie value', _actor => 'triple chocolate'),

                }),

                Ensure.that(Cookie.called('favourite'), isPresent()),
            )
        );
    });

    describe('over HTTP', () => {

        describe('when working with cookies', () => {
            it('allows the actor to check if a given cookie is set', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.called('favourite'), isPresent()),
                )
            );

            it('allows the actor to confirm that a given cooke is not set', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.called('not-so-favourite'), not(isPresent())),
                )
            );

            it('allows the actor to remove a specific cookie', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.called('favourite'), isPresent()),
                    Cookie.called('favourite').delete(),
                    Ensure.that(Cookie.called('favourite'), not(isPresent())),
                )
            );
        });

        describe('when working with the value', () => {

            /** @test {Cookie} */
            /** @test {Cookie#value} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.called('favourite').value(), equals('chocolate-chip')),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#value} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').value(), equals(undefined)),  // eslint-disable-line unicorn/no-useless-undefined
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').value().toString()).to.equal('<<"favourite" cookie>>.value()');
            });
        });

        describe('when working with the path', () => {

            /** @test {Cookie} */
            /** @test {Cookie#path} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('favourite').path(), equals('/cookie')),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#path} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').path(), equals(undefined)),   // eslint-disable-line unicorn/no-useless-undefined
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').path().toString()).to.equal('<<"favourite" cookie>>.path()');
            });
        });

        describe('when working with the domain', () => {

            /** @test {Cookie} */
            /** @test {Cookie#domain} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('favourite').domain(), equals('127.0.0.1')),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#domain} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').domain(), equals(undefined)), // eslint-disable-line unicorn/no-useless-undefined
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').domain().toString()).to.equal('<<"favourite" cookie>>.domain()');
            });
        });

        describe('when working with http-only cookies', () => {

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it('allows the actor to confirm that a cookie is http-only', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('favourite').isHttpOnly(), isFalse()),

                    Navigate.to(cookieCutterURLFor('/cookie?name=second_choice&value=shortbread&httpOnly=true')),
                    Ensure.that(Cookie.called('second_choice').isHttpOnly(), isTrue()),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').isHttpOnly(), equals(undefined)), // eslint-disable-line unicorn/no-useless-undefined
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').isHttpOnly().toString()).to.equal('<<"favourite" cookie>>.isHttpOnly()');
            });
        });

        describe('when working with an expiry date', () => {

            // eslint-disable-next-line unicorn/consistent-function-scoping
            function tomorrow(): Timestamp {
                const now = new Timestamp();

                return now.plus(Duration.ofDays(1));
            }

            const expectedExpiryDate = tomorrow();

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=expiring&value=chocolate-chip&expires=${ expectedExpiryDate.toJSON() }`)),
                    Ensure.that(Cookie.called('expiring').expiry().value.getDay(), equals(expectedExpiryDate.value.getDay())),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').expiry(), equals(undefined)), // eslint-disable-line unicorn/no-useless-undefined
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').expiry().toString()).to.equal('<<"favourite" cookie>>.expiry()');
            });
        });
    });

    describe('when working with secure cookies', () => {

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it('allows the actor to confirm that a cookie is not secure', () =>
            actorCalled('Sid').attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.called('favourite').isSecure(), isFalse()),
            )
        );

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it('allows the actor to confirm that a cookie is secure', () =>
            actorCalled('Sid').attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip&secure=1')),
                Ensure.that(Cookie.called('favourite').isSecure(), isTrue()),
            )
        );

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it(`complains it the cookie doesn't exist`, () =>
            expect(actorCalled('Sid').attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.called('not-so-favourite').isSecure(), equals(undefined)),   // eslint-disable-line unicorn/no-useless-undefined
            )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
        );

        /** @test {Cookie} */
        it('provides a sensible description of the question being asked', () => {
            expect(Cookie.called('favourite').isSecure().toString()).to.equal('<<"favourite" cookie>>.isSecure()');
        });
    });
});
