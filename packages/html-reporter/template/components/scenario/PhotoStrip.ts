import htm from 'htm';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import type { ReportActivity } from '../../../src/ReportData';
import { formatDuration } from '../../utils';

const html = htm.bind(h);

export interface PhotoStripProps {
    activities: ReportActivity[];
    scenarioStartedAt: string;
}

export function PhotoStrip({ activities, scenarioStartedAt }: PhotoStripProps): ReturnType<typeof html> | null {
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const openPhoto = (index: number) => {
        setLightboxIndex(index);
        const base = window.location.hash.replace(/&photo=\d+/, '');
        window.history.replaceState(null, '', index >= 0 ? base + '&photo=' + index : base);
    };

    useEffect(() => {
        const hash = window.location.hash;
        const photoMatch = hash.match(/&photo=(\d+)/);
        if (photoMatch) {
            const photoIndex = parseInt(photoMatch[1], 10);
            setTimeout(() => {
                setLightboxIndex(photoIndex);
                const element = document.getElementById('photo-' + photoIndex);
                if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            }, 300);
        }
    }, []);

    const photos: Array<{ path: string; name: string; wallClock: string | undefined; offsetMs: number }> = [];
    const scenarioStart = new Date(scenarioStartedAt).getTime();
    function collectPhotos(acts: ReportActivity[]) {
        for (const a of acts) {
            if (a.artifacts) {
                for (const art of a.artifacts) {
                    if (art.path && art.path.endsWith('.png')) {
                        const actStart = a.startedAt ? new Date(a.startedAt).getTime() : scenarioStart;
                        photos.push({ path: art.path, name: a.name, wallClock: a.startedAt, offsetMs: actStart - scenarioStart });
                    }
                }
            }
            if (a.children) collectPhotos(a.children);
        }
    }
    collectPhotos(activities);

    if (photos.length === 0) return null;

    return html`
      <div class="card mt-md">
        <div class="card-title">Screenshots (${photos.length})</div>
        <div class="photo-strip" id="photo-strip">
          ${photos.map((photo, index) => html`
            <div class="photo-strip-item" id=${'photo-' + index}>
              <img src=${photo.path} loading="lazy" alt=${photo.name} onClick=${() => openPhoto(index)} />
              <div class="photo-strip-caption">${photo.name}</div>
              <div class="photo-strip-time">${photo.wallClock ? new Date(photo.wallClock).toLocaleTimeString() : ''} · +${formatDuration(photo.offsetMs)}</div>
            </div>
          `)}
        </div>
      </div>
      ${lightboxIndex >= 0 && lightboxIndex < photos.length ? html`
        <div class="lightbox-overlay" onClick=${(e: Event) => { if ((e.target as HTMLElement).classList.contains('lightbox-overlay')) openPhoto(-1); }}
             onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Escape') openPhoto(-1); else if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) openPhoto(lightboxIndex + 1); else if (e.key === 'ArrowLeft' && lightboxIndex > 0) openPhoto(lightboxIndex - 1); }}
             tabIndex="0" ref=${(element: HTMLElement | null) => { if (element) element.focus(); }}>
          <div class="lightbox-content">
            <button class="lightbox-close" onClick=${() => openPhoto(-1)}>✕</button>
            ${lightboxIndex > 0 ? html`<button class="lightbox-nav lightbox-prev" onClick=${() => openPhoto(lightboxIndex - 1)}>‹</button>` : null}
            ${lightboxIndex < photos.length - 1 ? html`<button class="lightbox-nav lightbox-next" onClick=${() => openPhoto(lightboxIndex + 1)}>›</button>` : null}
            <img src=${photos[lightboxIndex].path} alt=${photos[lightboxIndex].name} />
            <div class="lightbox-caption">
              <div>${photos[lightboxIndex].name}</div>
              <div style="font-size:var(--font-xs);color:var(--text-secondary);font-family:var(--font-mono)">${photos[lightboxIndex].wallClock ? new Date(photos[lightboxIndex].wallClock).toLocaleTimeString() : ''} · +${formatDuration(photos[lightboxIndex].offsetMs)} · ${lightboxIndex + 1}/${photos.length}</div>
            </div>
          </div>
        </div>
      ` : null}
    `;
}
