
/* c8 ignore start */
/**
 * Simulates HTML5 drag and drop events.
 *
 * This script is a workaround for Selenium WebDriver's inability to properly
 * trigger HTML5 drag events using the Actions API. It manually dispatches
 * the required drag events (dragstart, dragenter, dragover, drop, dragend)
 * to simulate a complete drag and drop operation.
 *
 * @param source - The element to drag
 * @param target - The element to drop onto
 */
export function dragAndDrop(source: HTMLElement, target: HTMLElement): void {

    function createDragEvent(type: string, dataTransfer: DataTransfer): DragEvent {
        return new DragEvent(type, {
            bubbles: true,
            cancelable: true,
            dataTransfer,
        });
    }

    function createDataTransfer(): DataTransfer {
        try {
            return new DataTransfer();
        }
        catch {
            // Fallback for older browsers
            const event = document.createEvent('CustomEvent') as any;
            event.initCustomEvent('', false, false, null);
            event.dataTransfer = {
                data: {} as Record<string, string>,
                setData(format: string, data: string) {
                    this.data[format] = data;
                },
                getData(format: string) {
                    return this.data[format];
                },
                clearData(format?: string) {
                    if (format) {
                        delete this.data[format];
                    } else {
                        this.data = {};
                    }
                },
                setDragImage() {
                    // no-op
                },
                dropEffect: 'none' as DataTransfer['dropEffect'],
                effectAllowed: 'all' as DataTransfer['effectAllowed'],
                files: [] as unknown as FileList,
                items: [] as unknown as DataTransferItemList,
                types: [] as string[],
            };
            return event.dataTransfer;
        }
    }

    // Create a DataTransfer object to share between events
    const dataTransfer = createDataTransfer();

    // Dispatch dragstart on source
    source.dispatchEvent(createDragEvent('dragstart', dataTransfer));

    // Dispatch dragenter on target
    target.dispatchEvent(createDragEvent('dragenter', dataTransfer));

    // Dispatch dragover on target (required for drop to work)
    const dragOverEvent = createDragEvent('dragover', dataTransfer);
    target.dispatchEvent(dragOverEvent);

    // Dispatch drop on target
    target.dispatchEvent(createDragEvent('drop', dataTransfer));

    // Dispatch dragend on source
    source.dispatchEvent(createDragEvent('dragend', dataTransfer));
}
/* c8 ignore stop */
