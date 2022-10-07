import { d, QuestionAdapter, Task } from '@serenity-js/core';
import { By, ExecuteScript, PageElement, PageElements, Text } from '@serenity-js/web';

export class EventMonitor {
    private static monitorFor = (id: string) =>
        PageElement.located(By.id(`${ id }-monitor`))
            .describedAs(d`event monitor for ${ id }`);

    private static entriesFor = (id: string) =>
        PageElements.located(By.css(`li`))
            .of(EventMonitor.monitorFor(id))
            .describedAs('entries');

    static registerFor = (elementId: string, eventNames: string[]) =>
        Task.where(d`#actor registers event monitor for element with id ${ elementId }, events: ${ eventNames.join(',') }`,
            ExecuteScript.from(`/scripts/event-monitor.js?elementId=${ elementId }&events=${ eventNames.join(',') }`),
        )

    static eventsRecordedFor = (elementId: string): QuestionAdapter<object> =>
        Text.ofAll(EventMonitor.entriesFor(elementId)).map(serialised => JSON.parse(serialised) as object)
            .describedAs(d`events for ${ elementId }`)
}
