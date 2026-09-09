import { Ensure, equals } from '@serenity-js/assertions';
import { expect, useFixtures } from '@serenity-js/playwright-test';
import { Attribute, By, ByDeepCss, Click, Enter, PageElement, Text, Value } from '@serenity-js/web';

import { UppercaseInput } from './UppercaseInput.serenity';

const { it, describe } = useFixtures<{ emailAddress: string }>({
    emailAddress: ({ actor }, use) => {
        use(`${ actor.name.toLowerCase() }@example.org`)
    }
})

describe('Serenity/JS with Playwright Test CT', () => {

    it('works with native Playwright component tests', async ({ mount }) => {
        const nativeComponent = await mount('UppercaseInput/Default');

        const input = nativeComponent.locator('input');
        const output = nativeComponent.locator('.output');

        await expect(input).toHaveValue('');
        await input.fill('Hello');
        await expect(input).toHaveValue('Hello');
        await expect(output).toHaveText('HELLO');
    });

    it('passes props to the story via native mount', async ({ mount }) => {
        const nativeComponent = await mount('UppercaseInput/WithInitialValue', { initialValue: 'Hello' });

        const input = nativeComponent.locator('input');
        const output = nativeComponent.locator('.output');

        await expect(input).toHaveValue('Hello');
        await expect(output).toHaveText('HELLO');
    });

    it('works with custom fixtures', ({ emailAddress }) => {
        expect(emailAddress).toEqual('serena@example.org');
    });

    describe('PageElement', () => {

        it('recognises instantiation location', async ({ actor, mount }) => {
            const nativeComponent = await mount('UppercaseInput/Default');
            const component = PageElement.from(nativeComponent);

            const location = Click.on(component).instantiationLocation();

            expect(location.path.value).toMatch(/UppercaseInput.spec.ts$/);
            expect(location.line).toEqual(47);
            expect(location.column).toEqual(36);
        });

        it('can wrap a native component', async ({ actor, mount }) => {
            const nativeComponent = await mount('UppercaseInput/Default');

            const component = PageElement.from(nativeComponent);

            const selector = await actor.answer(component.locator.selector)
            expect(selector).toBeInstanceOf(ByDeepCss);
            expect((selector as ByDeepCss).value).toEqual('#root');
        });

        it('allows for chaining PageElements with wrapped native elements using .of()', async ({ actor, mount }) => {
            const nativeComponent = await mount('UppercaseInput/Default');

            const component = PageElement.from(nativeComponent);
            const input = PageElement.located(By.css('input')).of(component);

            const nativeInput = await actor.answer(input.nativeElement())
            expect((nativeInput as any)._selector).toEqual('#root >> css=input');
        });

        it('should find a parent element of a child element using .closestTo()', async ({ actor, mount }) => {
            const nativeComponent = await mount('UppercaseInput/Default');

            const component = PageElement.from(nativeComponent);
            const input = PageElement.located(By.css('input')).of(component);

            const container = PageElement.located(By.css('.example-input'));
            const output = PageElement.located(By.css('.output'));

            const outputElement = output.of(
                container.closestTo(input)
            );

            const nativeOutput = await actor.answer(outputElement.nativeElement());

            expect((nativeOutput as any)._selector).toEqual('#root >> css=input >> _sjs_closest=.example-input >> css=.output');

            await actor.attemptsTo(
                Ensure.that(Attribute.called('class').of(outputElement), equals('output')),
            );
        });

        it('enables interactions with native components', async ({ actor, mount }) => {
            const nativeComponent = await mount('UppercaseInput/Default');

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

    describe('story fixture', () => {

        it('returns the component root element, not the gallery container', async ({ story, actor }) => {
            const componentRoot = story('UppercaseInput/Default');

            await actor.attemptsTo(
                Ensure.that(Attribute.called('class').of(componentRoot), equals('example-input')),
            );
        });

        it('mounts a story and constructs an interaction object via .as(Constructor)', async ({ story, actor }) => {
            const input = story('UppercaseInput/Default').as(UppercaseInput);

            await actor.attemptsTo(
                Ensure.that(input.inputValue(), equals('')),
                Ensure.that(input.outputText(), equals('')),
            );
        });

        it('passes props to the story', async ({ story, actor }) => {
            const input = story('UppercaseInput/WithInitialValue', { initialValue: 'Hello' }).as(UppercaseInput);

            await actor.attemptsTo(
                Ensure.that(input.inputValue(), equals('Hello')),
                Ensure.that(input.outputText(), equals('HELLO')),
            );
        });

        it('supports Screenplay interactions on the interaction object', async ({ story, actor }) => {
            const input = story('UppercaseInput/Default').as(UppercaseInput);

            await actor.attemptsTo(
                input.enterText('world'),
                Ensure.that(input.inputValue(), equals('world')),
                Ensure.that(input.outputText(), equals('WORLD')),
            );
        });
    });
});
