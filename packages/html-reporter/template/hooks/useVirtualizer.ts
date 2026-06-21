import { elementScroll, observeElementOffset, observeElementRect, Virtualizer } from '@tanstack/virtual-core';
import { useEffect, useRef, useState } from 'preact/hooks';
 
type VirtualizerOptions = any;
 
export function useVirtualizer(options: VirtualizerOptions): any {
    const [, rerender] = useState(0);
    const resolvedOptions = {
        ...options,
        observeElementRect,
        observeElementOffset,
        scrollToFn: elementScroll,
        onChange: () => {
            rerender(c => c + 1);
        },
    };

    const instanceRef = useRef<InstanceType<typeof Virtualizer> | null>(null);
    if (!instanceRef.current) {
        instanceRef.current = new Virtualizer(resolvedOptions);
    }
    instanceRef.current.setOptions(resolvedOptions);

    useEffect(() => {
        return instanceRef.current!._didMount();
    }, []);

    useEffect(() => {
        return instanceRef.current!._willUpdate();
    });

    return instanceRef.current;
}
