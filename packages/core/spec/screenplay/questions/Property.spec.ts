/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled, Answerable, List, MetaQuestion, Property, Question } from '../../../src';
import { expect } from '../../expect';
import { isIdenticalTo } from '../../isIdenticalTo';

/** @test {Property} */
describe('Property', () => {

    const Peter = actorCalled('Peter');

    const p = <T>(value: T) =>
        Promise.resolve(value);

    const q = <T>(description: string, value: T) =>
        Question.about(description, actor => value);

    interface Credentials {
        username: string;
        token: string;
    }

    interface TestAccount {
        role: string;
        environments: string[];
        credentials: Credentials;
    }

    const adminAccount: TestAccount = {
        role: 'admin',
        environments: [ 'dev', 'sit', 'prod' ],
        credentials: {
            username: 'admin@example.com',
            token: 'some-token',
        }
    };

    const userAccount: TestAccount = {
        role: 'user',
        environments: [ 'dev', 'sit', 'prod' ],
        credentials: {
            username: 'user@example.com',
            token: 'some-token',
        }
    };

    const examples = [{
        description:    'TestAccount',
        answerable:     adminAccount,
    }, {
        description:    'Question<TestAccount>',
        answerable:     q('test account', adminAccount),
    }, {
        description:    'Promise<TestAccount>',
        answerable:     p(adminAccount),
    }, {
        description:    'Question<Promise<TestAccount>>',
        answerable:     q('test account', p(adminAccount)),
    }];

    /** @test {Property.of} */
    describe('when wrapping an Answerable<object>', () => {

        given(examples).
        it('retrieves a first-level property', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string>> = Property.of(answerable).role;

            return expect(question.answeredBy(Peter)).to.eventually.equal(adminAccount.role);
        });

        given(examples).
        it('retrieves an object', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<Credentials>> = Property.of(answerable).credentials;

            return expect(question.answeredBy(Peter)).to.eventually.deep.equal(adminAccount.credentials);
        });

        given(examples).
        it('retrieves a second-level property', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string>> = Property.of(answerable).credentials.username;

            return expect(question.answeredBy(Peter)).to.eventually.equal(adminAccount.credentials.username);
        });

        given(examples).
        it('retrieves an item from an array', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string>> = Property.of(answerable).environments[1];

            return expect(question.answeredBy(Peter)).to.eventually.equal('sit');
        });

        given(examples).
        it('retrieves an array', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string[]>> = Property.of(answerable).environments;

            return expect(question.answeredBy(Peter)).to.eventually.deep.equal([ 'dev', 'sit', 'prod' ]);
        });

        it(`provides a human-friendly description of the property it's wrapping`, () => {
            const question = q('test accounts', [ adminAccount, userAccount ]);

            const description = Property.of(question)[0].credentials.username.toString();

            expect(description).to.equal(`property '[0].credentials.username' of test accounts`);
        });

        describe('complains when the property', () => {

            it(`doesn't exist`, () => {
                const testAccountsWithMissingData: Question<TestAccount[]> = q('test accounts', [
                    {
                        role: '',
                        credentials: { },   // username and token missing
                        environments: []
                    } as unknown as TestAccount
                ]);

                const question: Question<Promise<string>> = Property.of(testAccountsWithMissingData)[0].credentials.username;

                return expect(question.answeredBy(Peter)).to.be.rejectedWith(Error, `property '[0].credentials.username' of test accounts doesn't exist`);
            });

            it(`path segment doesn't exist`, () => {
                const testAccountsWithMissingData: Question<TestAccount[]> = q('test accounts', [
                    {
                        role: '',
                        // missing credentials
                        environments: []
                    } as unknown as TestAccount
                ]);

                const question: Question<Promise<string>> = Property.of(testAccountsWithMissingData)[0].credentials.username;

                return expect(question.answeredBy(Peter)).to.be.rejectedWith(Error, `property '[0].credentials' of test accounts doesn't exist`);
            });
        });
    });

    /** @test {Property.at} */
    describe('when generating MetaQuestions', () => {

        given(examples).
        it('retrieves a first-level property', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string>> & MetaQuestion<Answerable<TestAccount>, Promise<string>> = Property.at<TestAccount>().role;

            return expect(question.of(answerable).answeredBy(Peter)).to.eventually.equal('admin');
        });

        given(examples).
        it('retrieves a second-level property', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string>> & MetaQuestion<Answerable<TestAccount>, Promise<string>> = Property.at<TestAccount>().credentials.username;

            return expect(question.of(answerable).answeredBy(Peter)).to.eventually.equal('admin@example.com');
        });

        given(examples).
        it('retrieves an item from an array', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string>> & MetaQuestion<Answerable<TestAccount>, Promise<string>> = Property.at<TestAccount>().environments[1];

            return expect(question.of(answerable).answeredBy(Peter)).to.eventually.equal('sit');
        });

        given(examples).
        it('retrieves an array', ({ answerable }: { answerable: Answerable<TestAccount> }) => {

            const question: Question<Promise<string[]>> & MetaQuestion<Answerable<TestAccount>, Promise<string[]>> = Property.at<TestAccount>().environments;

            return expect(question.of(answerable).answeredBy(Peter)).to.eventually.deep.equal([ 'dev', 'sit', 'prod' ]);
        });

        it(`provides a human-friendly description of the property it's wrapping`, () => {
            const question = q('test accounts', [ adminAccount, userAccount ]);

            const description = Property.at<TestAccount[]>()[0].credentials.username.of(question).toString();

            expect(description).to.equal(`property '[0].credentials.username' of test accounts`);
        });

        describe('complains when the property', () => {

            it(`doesn't exist`, () => {
                const testAccountsWithMissingData: Question<TestAccount[]> = q('test accounts', [
                    {
                        role: '',
                        credentials: { },   // username and token missing
                        environments: []
                    } as unknown as TestAccount
                ]);

                const question: Question<Promise<string>> & MetaQuestion<Answerable<TestAccount[]>, Promise<string>> = Property.at<TestAccount[]>()[0].credentials.username;

                return expect(question.of(testAccountsWithMissingData).answeredBy(Peter)).to.be.rejectedWith(Error, `property '[0].credentials.username' of test accounts doesn't exist`);
            });

            it(`path segment doesn't exist`, () => {
                const testAccountsWithMissingData: Question<TestAccount[]> = q('test accounts', [
                    {
                        role: '',
                        // missing credentials
                        environments: []
                    } as unknown as TestAccount
                ]);

                const question: Question<Promise<string>> & MetaQuestion<Answerable<TestAccount[]>, Promise<string>> = Property.at<TestAccount[]>()[0].credentials.username;

                return expect(question.of(testAccountsWithMissingData).answeredBy(Peter)).to.be.rejectedWith(Error, `property '[0].credentials' of test accounts doesn't exist`);
            });
        });
    });

    /**
     * @test {Property.of}
     * @test {Property.at}
     * @test {Property}
     * @test {List}
     */
    it('helps to filter lists of objects', () => {
        const accounts = q('test account', [ adminAccount, userAccount ]);

        const found = List.of(accounts)
            .where(Property.at<TestAccount>().role, isIdenticalTo('user'))
            .first()

        const username = Property.of(found).credentials.username;

        return expect(username.answeredBy(Peter)).to.eventually.equal('user@example.com');
    });
});
