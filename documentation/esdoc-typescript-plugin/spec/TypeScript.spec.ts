import { expect } from '@integration/testing-tools';
import { find } from './find';

describe('test/TypeScript.js:', () => {
    it('has type of method, without comment', () => {
        const doc = find('longname', 'examples/TypeScript.ts~TestTypeScriptClass#method1');

        expect(doc.params.length).to.equal(2);
        expect(doc.params[0].types).to.deep.equal(['number']);
        expect(doc.params[1].types).to.deep.equal(['Foo']);

        expect(doc.return.types).to.deep.equal(['string']);
    });

    it('has type of method, without tags', () => {
        const doc = find('longname', 'examples/TypeScript.ts~TestTypeScriptClass#method2');
        expect(doc.params.length).to.equal(2);
        expect(doc.params[0].types).to.deep.equal(['number']);
        expect(doc.params[1].types).to.deep.equal(['Foo']);

        expect(doc.return.types).to.deep.equal(['string']);
    });

    it('has type of method, without type', () => {
        const doc = find('longname', 'examples/TypeScript.ts~TestTypeScriptClass#method3');
        expect(doc.params.length).to.equal(2);
        expect(doc.params[0].types).to.deep.equal(['number']);
        expect(doc.params[1].types).to.deep.equal(['Foo']);

        expect(doc.return.types).to.deep.equal(['string']);
    });

    it('has type of getter, without comment', () => {
        const doc = find('longname', 'examples/TypeScript.ts~TestTypeScriptClass#getter1');
        expect(doc.type.types).to.deep.equal(['string']);
    });

    it('has type of setter, without comment', () => {
        const doc = find('longname', 'examples/TypeScript.ts~TestTypeScriptClass#setter1');
        expect(doc.type.types).to.deep.equal(['number']);
    });

    it('has type of member, without comment', () => {
        const doc = find('longname', 'examples/TypeScript.ts~TestTypeScriptClass#member1');
        expect(doc.type.types).to.deep.equal(['number']);
    });

    it('has type of function, without comment', () => {
        const doc = find('longname', 'examples/TypeScript.ts~testTypeScriptFunction');

        expect(doc.params.length).to.equal(2);
        expect(doc.params[0].types).to.deep.equal(['number']);
        expect(doc.params[1].types).to.deep.equal(['Foo']);

        expect(doc.return.types).to.deep.equal(['string']);
    });
});
