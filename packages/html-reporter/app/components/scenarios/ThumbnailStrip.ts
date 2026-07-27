import htm from 'htm';
import { h } from 'preact';

import { useScrollFade } from '../../hooks/useScrollFade.js';
import { formatDuration } from '../../utils/index.js';
import type { PhotoEntry } from './collectPhotos.js';

const html = htm.bind(h);

export interface ThumbnailStripProps {
    photos: PhotoEntry[];
    onPhotoClick: (index: number) => void;
}

export function ThumbnailStrip({ photos, onPhotoClick }: ThumbnailStripProps): ReturnType<typeof html> {
    const { ref: stripRef, fadeClass: stripFadeClass } = useScrollFade<HTMLDivElement>();

    return html`
      <div class="card mt-md">
        <div class="card-title">Screenshots (${photos.length})</div>
        <div class="photo-strip${stripFadeClass}" id="photo-strip" ref=${stripRef}>
          ${photos.map((photo, index) => html`
            <div class="photo-strip-item" id=${'photo-' + index}>
              <img src=${photo.path} loading="lazy" alt=${photo.name} onClick=${() => onPhotoClick(index)} />
              <div class="photo-strip-caption">${photo.name}</div>
              <div class="photo-strip-time">${photo.wallClock ? new Date(photo.wallClock).toLocaleTimeString() : ''} · +${formatDuration(photo.offsetMs)}</div>
            </div>
          `)}
        </div>
      </div>
    `;
}
