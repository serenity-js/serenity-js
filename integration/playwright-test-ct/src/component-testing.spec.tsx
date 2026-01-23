import { test as componentTest } from '@playwright/experimental-ct-react';
import { Ensure, equals } from '@serenity-js/assertions';
import { expect, useBase } from '@serenity-js/playwright-test';
import { Attribute, By, ByDeepCss, Click, Enter, PageElement, Text, Value } from '@serenity-js/web';

import UppercaseInput from './UppercaseInput';

const { it, describe } = useBase(componentTest).useFixtures<{ emailAddress: string }>({
    emailAddress: ({ actor }, use) => {
        use(`${ actor.name.toLowerCase() }@example.org`)
    }
})

describe('Serenity/JS', () => {

    it('works with native Playwright component tests', async ({ mount }) => {
        const nativeComponent = await mount(<UppercaseInput/>);

        const input = nativeComponent.locator('input');
        const output = nativeComponent.locator('.output');

        await expect(input).toHaveValue('');
        await input.fill('Hello');
        await expect(input).toHaveValue('Hello');
        await expect(output).toHaveText('HELLO');
    });

    it('works with custom fixtures', ({ emailAddress }) => {
        expect(emailAddress).toEqual('serena@example.org');
    });

    describe('PageElement', () => {

        it('recognises instantiation location', async ({ actor, mount }) => {
            const nativeComponent = await mount(<UppercaseInput/>);
            const component = PageElement.from(nativeComponent);

            const location = Click.on(component).instantiationLocation();

            expect(location.path.value).toMatch(/component-testing.spec.tsx$/);
            expect(location.line).toEqual(38);
            expect(location.column).toEqual(36);
        });

        it('can wrap a native component', async ({ actor, mount }) => {
            const nativeComponent = await mount(<UppercaseInput/>);

            const component = PageElement.from(nativeComponent);

            const selector = await actor.answer(component.locator.selector)
            expect(selector).toBeInstanceOf(ByDeepCss);
            expect((selector as ByDeepCss).value).toEqual('#root >> internal:control=component');
        });

        it('allows for chaining PageElements with wrapped native elements using .of()', async ({ actor, mount }) => {
            const nativeComponent = await mount(<UppercaseInput/>);

            const component = PageElement.from(nativeComponent);
            const input = PageElement.located(By.css('input')).of(component);

            const nativeInput = await actor.answer(input.nativeElement())
            expect((nativeInput as any)._selector).toEqual('#root >> internal:control=component >> css=input');
        });

        it('should find a parent element of a child element using .closestTo()', async ({ actor, mount }) => {
            const nativeComponent = await mount(<UppercaseInput/>);

            const component = PageElement.from(nativeComponent);
            const input = PageElement.located(By.css('input')).of(component);

            const container = PageElement.located(By.css('.example-input'));
            const output = PageElement.located(By.css('.output'));

            const outputElement = output.of(
                container.closestTo(input)
            );

            const nativeOutput = await actor.answer(outputElement.nativeElement());

            // expect((nativeOutput as any)._selector).toEqual('#root >> internal:control=component >> :light(input) >> _sjs_closest=.output');
            expect((nativeOutput as any)._selector).toEqual('#root >> internal:control=component >> css=input >> _sjs_closest=.example-input >> css=.output');

            await actor.attemptsTo(
                Ensure.that(Attribute.called('class').of(outputElement), equals('output')),
            );
        });

        it('enables interactions with native components', async ({ actor, mount }) => {
            const nativeComponent = await mount(<UppercaseInput/>);

            const component = PageElement.from(nativeComponent);
            const input = PageElement.located(By.css('input')).of(component);
            const output = PageElement.located(By.css('.output')).of(component);

            await actor.attemptsTo(
                Ensure.that(Value.of(input), equals('')),
                Enter.theValue('Hello').into(input),
                Ensure.that(Value.of(input), equals('Hello')),
                Ensure.that(Text.of(output), equals('HELLO')),
            );
        });
    });
});
