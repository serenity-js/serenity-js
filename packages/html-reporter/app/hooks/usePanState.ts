import type { Chart } from 'chart.js/auto';
import type { MutableRef } from 'preact/hooks';
import { useCallback, useState } from 'preact/hooks';

export interface PanState {
    canPanLeft: boolean;
    canPanRight: boolean;
    configurePan: (chart: Chart, historyLength: number, isMobile: boolean) => void;
}

export function usePanState(canvasRef: MutableRef<HTMLCanvasElement | null>): PanState {
    const [canPanLeft, setCanPanLeft] = useState(false);
    const [canPanRight, setCanPanRight] = useState(false);

    const configurePan = useCallback((chart: Chart, historyLength: number, isMobile: boolean) => {
        const hasPannableContent = historyLength > 5;

        if (isMobile && hasPannableContent && chart.options.plugins?.zoom) {
            const zoomConfig = chart.options.plugins.zoom as Record<string, unknown>;
            const panConfig = zoomConfig.pan as Record<string, unknown>;
            panConfig.onPanComplete = ({ chart: panChart }: { chart: Chart }) => {
                setCanPanLeft(panChart.scales.x.min > 0);
                setCanPanRight(panChart.scales.x.max < historyLength - 1);
            };
        }

        // Set initial fade state on mobile when there's pannable content
        if (isMobile && hasPannableContent) {
            setCanPanLeft(true);    // chart starts at rightmost, so older bars are to the left
            setCanPanRight(false);  // already at the right edge
        } else {
            setCanPanLeft(false);
            setCanPanRight(false);
        }

        // Override Hammer.js touch-action: none on mobile to allow vertical page scroll
        // Hammer sets 'none' when both pan and pinch are registered; we only need horizontal pan
        if (canvasRef.current && isMobile) {
            canvasRef.current.style.touchAction = 'pan-y';
        }
    }, [canvasRef]);

    return { canPanLeft, canPanRight, configurePan };
}
