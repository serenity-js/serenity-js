// import "mocha";

// import { Actor, actorCalled, serenity } from '@serenity-js/core';
// import { TestRunFinishes } from '@serenity-js/core/lib/events';
// import chaiExclude from 'chai-exclude';
// import { ElementHandle, Page } from 'playwright';
// import { createSandbox, SinonStub } from 'sinon';

// import { BrowseTheWeb } from '../../../../src/screenplay/abilities';
// import { TargetElement } from '../../../../src/screenplay/questions/targets/TargetElement';
// import { TargetElements } from '../../../../src/screenplay/questions/targets/TargetElements';
// import { chai } from '../../../chai-extra';
// import {
//     browserTypeStub,
//     elementHandleStub,
//     pageStub,
// } from '../../../stubs/playwright';

// chai.use(chaiExclude);
// chai.should();

// const { expect } = chai;

// describe('TargetElements Question', () => {
//     const sandbox = createSandbox();
//     let browseTheWeb: BrowseTheWeb;
//     let actor: Actor;
//     let page: Page;

//     beforeEach(() => {
//         browseTheWeb = BrowseTheWeb.using(browserTypeStub(sandbox));
//         actor = actorCalled('Actor').whoCan(browseTheWeb);
//         page = pageStub(sandbox);
//         browseTheWeb.$ = sandbox.stub();
//         browseTheWeb.$$ = sandbox.stub();
//         (browseTheWeb as any).page = sandbox.stub().resolves(page);
//     });

//     afterEach(() => {
//         sandbox.restore();
//         serenity.announce(new TestRunFinishes());
//     });

//     it('elements are selected by passed selector', async () => {
//         const expectedElementHandles: ElementHandle[] = [
//             elementHandleStub(sandbox),
//             elementHandleStub(sandbox),
//         ];
//         (browseTheWeb.$$ as SinonStub).resolves(expectedElementHandles);

//         await actor.answer(TargetElements.at('selector'));

//         (browseTheWeb.$$ as SinonStub).should.have.been.calledWith('selector');
//     });

//     it('can be answered with elements', async () => {
//         const expectedElementHandles: ElementHandle[] = [
//             elementHandleStub(sandbox),
//             elementHandleStub(sandbox),
//         ];
//         (browseTheWeb.$$ as SinonStub).resolves(expectedElementHandles);

//         const actualElementHandles = await actor.answer(
//             TargetElements.at('selector')
//         );

//         expect(actualElementHandles)
//       .excluding('toString')
//       .excluding('isExisting')
//       .to.be.deep.equal(expectedElementHandles);
//     });

//     it('elements have isExisting() = true', async () => {
//         const expectedElementHandles: ElementHandle[] = [
//             elementHandleStub(sandbox),
//         ];
//         (browseTheWeb.$$ as SinonStub).resolves(expectedElementHandles);

//         const actualElementHandles = await actor.answer(
//             TargetElements.at('selector')
//         );

//         actualElementHandles[0].isExisting().should.be.true;
//     });

//     it('overrides description for the answer', async () => {
//         const expectedDescription = 'real description';
//         const expectedElementHandles: ElementHandle[] = [
//             elementHandleStub(sandbox),
//         ];
//         (browseTheWeb.$$ as SinonStub).resolves(expectedElementHandles);

//         const actualElementHandle = await actor.answer(
//             TargetElements.at('selector').as(expectedDescription)
//         );

//         expect(actualElementHandle.toString()).to.be.equal(
//             `${expectedDescription}`
//         );
//     });

//     it('can be a MetaQuestion to return child of a parent', async () => {
//         const expectedParent: ElementHandle = elementHandleStub(sandbox);
//         const expectedElementHandles: ElementHandle[] = [
//             elementHandleStub(sandbox),
//             elementHandleStub(sandbox),
//         ];
//         (browseTheWeb.$ as SinonStub).resolves(expectedParent);
//         (expectedParent.$$ as SinonStub).resolves(expectedElementHandles);

//         const actualElementHandle = await actor.answer(
//             TargetElements.at('children selector').of(
//                 TargetElement.at('parent selector')
//             )
//         );

//         expect(actualElementHandle)
//       .excluding('toString')
//       .excluding('isExisting')
//       .to.be.deep.equal(expectedElementHandles);
//     });

//     it('adds information about parent to the description', async () => {
//         const expectedParent: ElementHandle = elementHandleStub(sandbox);
//         const expectedElementHandles: ElementHandle[] = [
//             elementHandleStub(sandbox),
//             elementHandleStub(sandbox),
//         ];
//         (browseTheWeb.$ as SinonStub).resolves(expectedParent);
//         (expectedParent.$$ as SinonStub).resolves(expectedElementHandles);

//         const actualElementHandle = await actor.answer(
//             TargetElements.at('children selector')
//         .as('children')
//         .of(TargetElement.at('parent selector').as('parent'))
//         );

//         actualElementHandle.toString().should.be.equal('children of parent');
//     });

//     it('checks parents for existence', async () => {
//         const expectedParent: ElementHandle = null;
//         (browseTheWeb.$ as SinonStub).resolves(expectedParent);

//         await actor
//       .answer(
//           TargetElements.at('child selector').of(
//               TargetElement.at('parent selector').as('parent')
//           )
//       )
//       .should.be.rejectedWith('Expected parent to be attached');
//     });
// });
