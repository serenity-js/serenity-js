import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { Ensure, isTrue } from '../../src';

describe('isTrue', () => {

  /** @test {isTrue} */
  it('allows for the actor flow to continue when the "actual" is true', () => {
    return expect(actorCalled('Astrid').attemptsTo(
      Ensure.that(true, isTrue()),
    )).to.be.fulfilled;
  });

  /** @test {isTrue} */
  it('breaks the actor flow when "actual" is not true"', () => {
    return expect(actorCalled('Astrid').attemptsTo(
      Ensure.that(false, isTrue()),
    )).to.be.rejectedWith(AssertionError, `Expected false to have value that is true`)
      .then((error: AssertionError) => {
        expect(error.expected).to.equal(2);
        expect(error.actual).to.equal(0);
      });
  });

  /** @test {isTrue} */
  it('contributes to a human-readable description', () => {
    expect(Ensure.that(true, isTrue()).toString())
      .to.equal(`#actor ensures that true does have value that is true`);
  });

});
