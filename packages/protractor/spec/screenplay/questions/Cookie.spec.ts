import { certificates, expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, Question, Transform } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import express = require('express');

import { protractor } from 'protractor';
import { BrowseTheWeb, DeleteCookies, Navigate } from '../../../src';
import { Cookie } from '../../../src/screenplay';

describe('Cookie', () => {

    // a tiny express server, setting response cookies
    const cookieCutterApp = express().
        get('/cookie', (req: express.Request, res: express.Response) => {
            res.cookie(req.query.name, req.query.value, {
                path:       '/cookie',
                domain:     req.query.domain,
                httpOnly:   !! req.query.httpOnly,
                secure:     !! req.query.secure,
                expires:    req.query.expires && new Date(req.query.expires),
            }).status(200).send();
        });

    function cookieCutterURLFor(path: string): Question<Promise<string>> {
        return Transform.the(LocalServer.url(), url => `${ url }${ path }`);
    }

    describe('over HTTP', () => {

        // Fun fact: Before Cookie Monster ate his first cookie, he believed his name was Sid. You're welcome.
        const Sid = Actor.named('Sid').whoCan(
            BrowseTheWeb.using(protractor.browser),
            ManageALocalServer.runningAHttpListener(cookieCutterApp),
        );

        beforeEach(() => Sid.attemptsTo(StartLocalServer.onRandomPort()));
        afterEach(() => Sid.attemptsTo(StopLocalServer.ifRunning()));
        afterEach(() => Sid.attemptsTo(DeleteCookies.all()));

        describe('when working with the value', () => {

            /** @test {Cookie} */
            /** @test {Cookie#valueOf} */
            it('allows the actor to retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.valueOf('favourite'), equals('chocolate-chip')),
            ));

            /** @test {Cookie} */
            /** @test {Cookie#valueOf} */
            it('returns an undefined when it can\'t retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.valueOf('not-so-favourite'), equals(undefined)),
            ));

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.valueOf('favourite').toString()).to.equal('the value of the "favourite" cookie');
            });
        });

        describe('when working with the path', () => {

            /** @test {Cookie} */
            /** @test {Cookie#valueOf} */
            it('allows the actor to retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.pathOf('favourite'), equals('/cookie')),
            ));

            /** @test {Cookie} */
            /** @test {Cookie#pathOf} */
            it('returns an undefined when it can\'t retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.pathOf('not-so-favourite'), equals(undefined)),
            ));

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.pathOf('favourite').toString()).to.equal('the path of the "favourite" cookie');
            });
        });

        describe('when working with the domain', () => {

            /** @test {Cookie} */
            /** @test {Cookie#valueOf} */
            it('allows the actor to retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.domainOf('favourite'), equals('127.0.0.1')),
            ));

            /** @test {Cookie} */
            /** @test {Cookie#domainOf} */
            it('returns an undefined when it can\'t retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.domainOf('not-so-favourite'), equals(undefined)),
            ));

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.domainOf('favourite').toString()).to.equal('the domain of the "favourite" cookie');
            });
        });

        describe('when working with http-only cookies', () => {

            /** @test {Cookie} */
            /** @test {Cookie#isHTTPOnly} */
            it('allows the actor to confirm that a cookie is http-only', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.isHTTPOnly('favourite'), equals(false)),

                Navigate.to(cookieCutterURLFor('/cookie?name=second_choice&value=shortbread&httpOnly=true')),
                Ensure.that(Cookie.isHTTPOnly('second_choice'), equals(true)),
            ));

            /** @test {Cookie} */
            /** @test {Cookie#isHTTPOnly} */
            it('returns an undefined when it can\'t retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.isHTTPOnly('not-so-favourite'), equals(undefined)),
            ));

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.isHTTPOnly('favourite').toString()).to.equal('the HTTP-only status of the "favourite" cookie');
            });
        });

        describe('when working with an expiry date', () => {

            function tomorrow(): Date {
                const now = new Date();
                const nextDay = new Date(now);
                nextDay.setDate(nextDay.getDate() + 1);

                return nextDay;
            }

            const expectedExpiryDate = tomorrow();

            /** @test {Cookie} */
            /** @test {Cookie#expiryDateOf} */
            it('allows the actor to retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor(`/cookie?name=expiring&value=chocolate-chip&expires=${ expectedExpiryDate.toISOString() }`)),
                Ensure.that(Transform.the(Cookie.expiryDateOf('expiring'), date => date.getDay()), equals(expectedExpiryDate.getDay())),
            ));

            /** @test {Cookie} */
            /** @test {Cookie#expiryDateOf} */
            it('returns an undefined when it can\'t retrieve it', () => Sid.attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.expiryDateOf('not-so-favourite'), equals(undefined)),
            ));

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.expiryDateOf('favourite').toString()).to.equal('the expiry date of the "favourite" cookie');
            });
        });

    });

    describe('when working with secure cookies', () => {

        const Sid = Actor.named('Secure Sid').whoCan(
            BrowseTheWeb.using(protractor.browser),
            ManageALocalServer.runningAHttpsListener(cookieCutterApp, {
                cert:               certificates.cert,
                key:                certificates.key,
                requestCert:        true,
                rejectUnauthorized: false,
            }),
        );

        beforeEach(() => Sid.attemptsTo(StartLocalServer.onRandomPort()));
        afterEach(() => Sid.attemptsTo(StopLocalServer.ifRunning()));
        afterEach(() => Sid.attemptsTo(DeleteCookies.all()));

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it('allows the actor to confirm that a cookie is not secure', () => Sid.attemptsTo(
            Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
            Ensure.that(Cookie.isSecure('favourite'), equals(false)),
        ));

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it('allows the actor to confirm that a cookie is secure', () => Sid.attemptsTo(
            Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip&secure=1')),
            Ensure.that(Cookie.isSecure('favourite'), equals(true)),
        ));

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it('returns an undefined when it can\'t retrieve it', () => Sid.attemptsTo(
            Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
            Ensure.that(Cookie.isSecure('not-so-favourite'), equals(undefined)),
        ));

        /** @test {Cookie} */
        it('provides a sensible description of the question being asked', () => {
            expect(Cookie.isSecure('favourite').toString()).to.equal('the "secure" status of the "favourite" cookie');
        });
    });
});
