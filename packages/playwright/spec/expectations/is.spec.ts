import { Ensure } from '@serenity-js/assertions';
import { Actor, actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { ElementHandle, Page } from 'playwright';
import { createSandbox, SinonStub } from 'sinon';

import { isClickable, isEnabled, isVisible } from '../../src/expectations/is';
import { BrowseTheWeb } from '../../src/screenplay/abilities';
import { by, Target } from '../../src/screenplay/questions/targets';
import { chai } from '../chai-extra';
import {
    browserTypeStub,
    elementHandleStub,
    pageStub,
} from '../stubs/playwright';

chai.should();

const { the } = Target;

describe('Ensure element is', () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;
    let page: Page;

    beforeEach(() => {
        browseTheWeb = BrowseTheWeb.using(browserTypeStub(sandbox));
        actor = actorCalled('Actor').whoCan(browseTheWeb);
        page = pageStub(sandbox);
        browseTheWeb.$ = sandbox.stub();
        (browseTheWeb as any).page = sandbox.stub().resolves(page);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
    });

    it('visible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor.attemptsTo(
            Ensure.that(the('visible element').located(by.id('selector')), isVisible())
        ); //.should.be.fulfilled;
    });

    it('not visible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(false);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor
      .attemptsTo(
          Ensure.that(the('hidden element').located(by.id('selector')), isVisible())
      )
      .should.be.rejectedWith('Expected the hidden element to be visible');
    });

    it('enabled', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor.attemptsTo(
            Ensure.that(the('enabled element').located(by.id('selector')), isEnabled())
        ).should.be.fulfilled;
    });

    it('not enabled', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (selectedElementHandle.isEnabled as SinonStub).resolves(false);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor
      .attemptsTo(
          Ensure.that(the('disabled element').located(by.id('selector')), isEnabled())
      )
      .should.be.rejectedWith('Expected the disabled element to be enabled');
    });

    it('enabled, but invisible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(false);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor
      .attemptsTo(
          Ensure.that(the('disabled element').located(by.id('selector')), isEnabled())
      )
      .should.be.rejectedWith('Expected the disabled element to be visible');
    });

    // it("disabled", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(true);
    //   (selectedElementHandle.isDisabled as SinonStub).resolves(true);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor.attemptsTo(
    //     Ensure.that(the("enabled element").located(by.id("selector")), is.disabled)
    //   ).should.be.fulfilled;
    // });

    // it("not disabled", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(true);
    //   (selectedElementHandle.isDisabled as SinonStub).resolves(false);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(the("enabled element").located(by.id("selector")), is.disabled)
    //     )
    //     .should.be.rejectedWith("Expected the enabled element to be disabled");
    // });

    // it("disabled, but invisible", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(false);
    //   (selectedElementHandle.isDisabled as SinonStub).resolves(false);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(the("enabled element").located(by.id("selector")), is.disabled)
    //     )
    //     .should.be.rejectedWith("Expected the enabled element to be visible");
    // });

    // it("editable", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(true);
    //   (selectedElementHandle.isEditable as SinonStub).resolves(true);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor.attemptsTo(
    //     Ensure.that(
    //       the("not editable element").located(by.id("selector")),
    //       is.editable
    //     )
    //   ).should.be.fulfilled;
    // });

    // it("not editable", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(true);
    //   (selectedElementHandle.isEditable as SinonStub).resolves(false);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(
    //         the("not editable element").located(by.id("selector")),
    //         is.editable
    //       )
    //     )
    //     .should.be.rejectedWith(
    //       "Expected the not editable element to be editable"
    //     );
    // });

    // it("editable, but invisible", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(false);
    //   (selectedElementHandle.isEditable as SinonStub).resolves(false);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(
    //         the("not editable element").located(by.id("selector")),
    //         is.editable
    //       )
    //     )
    //     .should.be.rejectedWith(
    //       "Expected the not editable element to be visible"
    //     );
    // });

    // it("checked", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(true);
    //   (selectedElementHandle.isChecked as SinonStub).resolves(true);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor.attemptsTo(
    //     Ensure.that(
    //       the("not editable element").located(by.id("selector")),
    //       is.checked
    //     )
    //   ).should.be.fulfilled;
    // });

    // it("not checked", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(true);
    //   (selectedElementHandle.isChecked as SinonStub).resolves(false);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(
    //         the("not editable element").located(by.id("selector")),
    //         is.checked
    //       )
    //     )
    //     .should.be.rejectedWith(
    //       "Expected the not editable element to be checked"
    //     );
    // });

    // it("checked, but invisible", async () => {
    //   const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
    //   (selectedElementHandle.isVisible as SinonStub).resolves(false);
    //   (selectedElementHandle.isChecked as SinonStub).resolves(true);
    //   (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(
    //         the("not editable element").located(by.id("selector")),
    //         is.checked
    //       )
    //     )
    //     .should.be.rejectedWith(
    //       "Expected the not editable element to be visible"
    //     );
    // });

    it('clickable', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor.attemptsTo(
            Ensure.that(
                the('not clickable element').located(by.id('selector')),
                isClickable()
            )
        ).should.be.fulfilled;
    });

    it('not clickable, because not enabled', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isEnabled as SinonStub).resolves(false);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor
      .attemptsTo(
          Ensure.that(
              the('not clickable element').located(by.id('selector')),
              isClickable()
          )
      )
      .should.be.rejectedWith(
          'Expected the not clickable element to be enabled'
      );
    });

    it('not clickable, because not visible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (selectedElementHandle.isVisible as SinonStub).resolves(false);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor
      .attemptsTo(
          Ensure.that(
              the('not clickable element').located(by.id('selector')),
              isClickable()
          )
      )
      .should.be.rejectedWith(
          'Expected the not clickable element to be visible'
      );
    });
});

describe('Non existing element', () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;
    let page: Page;

    beforeEach(() => {
        browseTheWeb = BrowseTheWeb.using(browserTypeStub(sandbox));
        actor = actorCalled('Actor').whoCan(browseTheWeb);
        page = pageStub(sandbox);
        browseTheWeb.$ = sandbox.stub();
        (browseTheWeb as any).page = sandbox.stub().resolves(page);
        // eslint-disable-next-line unicorn/no-null
        (browseTheWeb.$ as SinonStub).resolves(null);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
    });

    it('is not visible', async () => {
        await actor
      .attemptsTo(
          Ensure.that(
              the('non exsting element').located(by.id('selector')),
              isVisible()
          )
      )
      .should.be.rejectedWith('Expected the non exsting element to be visible');
    });

    it('is not enabled', async () => {
        await actor
      .attemptsTo(
          Ensure.that(
              the('non exsting element').located(by.id('selector')),
              isEnabled()
          )
      )
      .should.be.rejectedWith('Expected the non exsting element to be visible');
    });

    // it("is not disabled", async () => {
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(
    //         the("non exsting element").located(by.id("selector")),
    //         is.disabled
    //       )
    //     )
    //     .should.be.rejectedWith("Expected the non exsting element to be visible");
    // });

    // it("is not editable", async () => {
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(
    //         the("non exsting element").located(by.id("selector")),
    //         is.editable
    //       )
    //     )
    //     .should.be.rejectedWith("Expected the non exsting element to be visible");
    // });

    // it("is not checked", async () => {
    //   await actor
    //     .attemptsTo(
    //       Ensure.that(
    //         the("non exsting element").located(by.id("selector")),
    //         is.checked
    //       )
    //     )
    //     .should.be.rejectedWith("Expected the non exsting element to be visible");
    // });

    it('is not clickable', async () => {
        await actor
      .attemptsTo(
          Ensure.that(
              the('non exsting element').located(by.id('selector')),
              isClickable()
          )
      )
      .should.be.rejectedWith('Expected the non exsting element to be visible');
    });
});
