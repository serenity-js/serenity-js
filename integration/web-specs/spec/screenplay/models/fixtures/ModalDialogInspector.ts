import { By, PageElement, Text } from '@serenity-js/web';

export class ModalDialogInspector {
    static trigger = () =>
        PageElement.located(By.id('trigger')).describedAs('the modal dialog trigger');

    static result = () =>
        Text.of(PageElement.located(By.id('result'))).describedAs('result');
}
