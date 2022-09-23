/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, matches } from '@serenity-js/assertions';
import { actorCalled, Check, d, Log, Question, Task } from '@serenity-js/core';
import { BrowseTheWeb, By, Click, DoubleClick, Enter, Key, Navigate, PageElement, Press, Value } from '@serenity-js/web';
import { given } from 'mocha-testdata';

describe('Press', () => {

    const InputBoxForm = {
        textField: PageElement.located(By.id('input-box')).describedAs('the text field'),
    };

    const CopyAndPasteBoxesForm = {
        source: PageElement.located(By.id('source')).describedAs('source text field'),
        destination: PageElement.located(By.id('destination')).describedAs('destination text field'),
    };

    const OS = () => Question.about('operating system', async actor => {
        const capabilities = await BrowseTheWeb.as(actor).browserCapabilities();
        return capabilities.platformName;
    });

    describe('single keys', () => {

        it('allows the actor to enter keys individually into a field', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/press/input_box.html'),

                Press.the('a').in(InputBoxForm.textField),
                Press.the('A').in(InputBoxForm.textField),

                Ensure.that(Value.of(InputBoxForm.textField), equals('aA')),
            ));
    });

    describe('key chords', function () {

        it('allows the actor to use modifier keys', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/press/input_box.html'),

                Enter.theValue('hello').into(InputBoxForm.textField),
                Press.the(Key.Shift, Key.ArrowLeft, Key.ArrowLeft, Key.ArrowLeft, Key.ArrowLeft).in(InputBoxForm.textField),
                Press.the(Key.Backspace).in(InputBoxForm.textField),
                Press.the('i').in(InputBoxForm.textField),

                Ensure.that(Value.of(InputBoxForm.textField), equals('hi')),
            ));

        it('allows the actor to use keyboard shortcuts outside the context of any specific input box', async () => {

            const Copy = () => Task.where(`#actor performs a "copy" operation`,
                Check.whether(OS(), matches(/^mac|darwin/i))
                    .andIfSo(Press.the(Key.Control, Key.Insert))
                    .otherwise(Press.the(Key.Control, 'c')),
            );

            const Paste = () => Task.where(`#actor performs a "paste" operation`,
                Check.whether(OS(), matches(/^mac|darwin/i))
                    .andIfSo(Press.the(Key.Shift, Key.Insert))
                    .otherwise(Press.the(Key.Control, 'v')),
            );

            await actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/press/copy_and_paste_boxes.html'),

                Enter.theValue('hi').into(CopyAndPasteBoxesForm.source),

                // todo: SelectAll
                Press.the(Key.Shift, Key.ArrowLeft, Key.ArrowLeft).in(CopyAndPasteBoxesForm.source),
                // Press.the(Key.Meta, 'a').in(CopyAndPasteBoxesForm.source),

                Log.the(OS()),

                Copy(),

                Click.on(CopyAndPasteBoxesForm.destination),

                Paste(),

                Ensure.that(Value.of(CopyAndPasteBoxesForm.destination), equals('hi')),
            );
        });

        it('allows the actor to use keyboard shortcuts in the context of a specific input box', async () => {

            const SelectValueOf = (field: Question<Promise<PageElement>>) =>
                Task.where(d `#actor selects the value of ${ field }`,
                    Click.on(field),
                    DoubleClick.on(field),
                );

            const CopyFrom = (field: Question<Promise<PageElement>>) =>
                Task.where(d `#actor performs a "copy" operation on ${ field }`,
                    SelectValueOf(field),
                    Check.whether(OS(), matches(/^mac|darwin/i))
                        .andIfSo(Press.the(Key.Control, Key.Insert).in(field))
                        .otherwise(Press.the(Key.Control, 'c').in(field)),
                );

            const PasteInto = (field: Question<Promise<PageElement>>) =>
                Task.where(d `#actor performs a "paste" operation on ${ field }`,
                    Check.whether(OS(), matches(/^mac|darwin/i))
                        .andIfSo(Press.the(Key.Shift, Key.Insert).in(field))
                        .otherwise(Press.the(Key.Control, 'v').in(field)),
                );

            const LoseFocus = () =>
                Task.where(`#actor makes sure their browser is not focused on any input box`,
                    Press.the(Key.Escape),
                );

            await actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/press/copy_and_paste_boxes.html'),

                Log.the(OS()),

                Enter.theValue('example').into(CopyAndPasteBoxesForm.source),
                LoseFocus(),

                CopyFrom(CopyAndPasteBoxesForm.source),

                PasteInto(CopyAndPasteBoxesForm.destination),

                Ensure.that(Value.of(CopyAndPasteBoxesForm.destination), equals('example')),
            );
        });
    });

    given([
        {
            description: 'single key, document context',
            interaction: Press.the('a'),
            expected: `#actor presses key a`,
        },
        {
            description: 'single key, element context',
            interaction: Press.the('a').in(InputBoxForm.textField),
            expected: `#actor presses key a in the text field`,
        },
        {
            description: 'sequence of keys, document context',
            interaction: Press.the('a', 'b', 'c'),
            expected: `#actor presses keys a, b, c`,
        },
        {
            description: 'sequence of keys, element context',
            interaction: Press.the('a', 'b', 'c').in(InputBoxForm.textField),
            expected: `#actor presses keys a, b, c in the text field`,
        },
        {
            description: 'keyboard shortcut, document context',
            interaction: Press.the(Key.Meta, 'a'),
            expected: `#actor presses keys Meta-a`,
        },
        {
            description: 'keyboard shortcut, element context',
            interaction: Press.the(Key.Meta, 'a').in(InputBoxForm.textField),
            expected: `#actor presses keys Meta-a in the text field`,
        },
        {
            description: 'complex shortcut, document context',
            interaction: Press.the(Key.Meta, Key.Alt, 'a'),
            expected: `#actor presses keys Meta-Alt-a`,
        },
        {
            description: 'complex shortcut, element context',
            interaction: Press.the(Key.Meta, Key.Alt, 'a').in(InputBoxForm.textField),
            expected: `#actor presses keys Meta-Alt-a in the text field`,
        },
    ]).
    it('provides a sensible description of the interaction being performed', ({ interaction, expected }) => {
        expect(interaction.toString()).to.equal(expected);
    });

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location', () => {
            const activity = Press.the('a');
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Press.spec.ts');
            expect(location.line).to.equal(181);
            expect(location.column).to.equal(36);
        });

        it('correctly detects its invocation location when custom errors are used', () => {
            const activity = Press.the('a').in(InputBoxForm.textField);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Press.spec.ts');
            expect(location.line).to.equal(190);
            expect(location.column).to.equal(47);
        });
    });
});
