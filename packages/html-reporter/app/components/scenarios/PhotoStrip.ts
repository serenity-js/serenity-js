import htm from 'htm';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import type { ReportActivity } from '../../../src/cli/ReportData.js';
import { useHashHistory } from '../../utils/index.js';
import { collectPhotos } from './collectPhotos.js';
import { Lightbox } from './Lightbox.js';
import { ThumbnailStrip } from './ThumbnailStrip.js';

const html = htm.bind(h);

export interface PhotoStripProps {
    activities: ReportActivity[];
    scenarioStartedAt: string;
}

export function PhotoStrip({ activities, scenarioStartedAt }: PhotoStripProps): ReturnType<typeof html> | null {
    const hashNav = useHashHistory();
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const photos = collectPhotos(activities, scenarioStartedAt);

    const openPhoto = (index: number) => {
        setLightboxIndex(index);
        if (index >= 0) {
            hashNav.setParam('photo', String(index));
        } else {
            hashNav.deleteParam('photo');
        }
    };

    useEffect(() => {
        const photoParameter = hashNav.getParam('photo');
        if (photoParameter) {
            const photoIndex = parseInt(photoParameter, 10);
            setTimeout(() => {
                setLightboxIndex(photoIndex);
                const element = document.getElementById('photo-' + photoIndex);
                if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            }, 300);
        }
    }, []);

    if (photos.length === 0) return null;

    return html`
      <${ThumbnailStrip} photos=${photos} onPhotoClick=${openPhoto} />
      <${Lightbox} photos=${photos} currentIndex=${lightboxIndex} onNavigate=${openPhoto} />
    `;
}
