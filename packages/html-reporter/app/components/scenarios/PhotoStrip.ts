import htm from 'htm';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import type { ReportActivity } from '../../../src/cli/ReportData';
import { formatDuration, useHashHistory } from '../../utils';

const html = htm.bind(h);

export interface PhotoStripProps {
    activities: ReportActivity[];
    scenarioStartedAt: string;
}

export function PhotoStrip({ activities, scenarioStartedAt }: PhotoStripProps): ReturnType<typeof html> | null {
    const hashNav = useHashHistory();
    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const overlayRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const isOpen = lightboxIndex >= 0;

    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

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

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only trigger if horizontal swipe is dominant
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0 && lightboxIndex < photos.length - 1) {
                openPhoto(lightboxIndex + 1);
            } else if (dx > 0 && lightboxIndex > 0) {
                openPhoto(lightboxIndex - 1);
            }
        }
    };

    const handleOverlayClick = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('lightbox-overlay')) {
            openPhoto(-1);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') openPhoto(-1);
        else if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) openPhoto(lightboxIndex + 1);
        else if (e.key === 'ArrowLeft' && lightboxIndex > 0) openPhoto(lightboxIndex - 1);
    };

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
        <div class="lightbox-overlay"
             ref=${(element: HTMLElement | null) => { if (element) { (overlayRef as { current: HTMLElement | null }).current = element; element.focus(); } }}
             onClick=${handleOverlayClick}
             onKeyDown=${handleKeyDown}
             onTouchStart=${handleTouchStart}
             onTouchEnd=${handleTouchEnd}
             tabIndex="0">
          <div class="lightbox-content">
            <button class="lightbox-close" onClick=${() => openPhoto(-1)} aria-label="Close lightbox">✕</button>
            ${lightboxIndex > 0 ? html`<button class="lightbox-nav lightbox-prev" onClick=${() => openPhoto(lightboxIndex - 1)} aria-label="Previous photo">‹</button>` : null}
            ${lightboxIndex < photos.length - 1 ? html`<button class="lightbox-nav lightbox-next" onClick=${() => openPhoto(lightboxIndex + 1)} aria-label="Next photo">›</button>` : null}
            <img src=${photos[lightboxIndex].path} alt=${photos[lightboxIndex].name} />
            ${photos.length > 1 ? html`
              <div class="lightbox-dots" aria-label="Photo position">
                ${photos.map((_, i) => html`<span class="lightbox-dot ${i === lightboxIndex ? 'active' : ''}" aria-label=${`Photo ${i + 1} of ${photos.length}`}></span>`)}
              </div>
            ` : null}
            <div class="lightbox-caption">
              <div>${photos[lightboxIndex].name}</div>
              <div style="font-size:var(--font-xs);color:var(--text-secondary);font-family:var(--font-mono)">${photos[lightboxIndex].wallClock ? new Date(photos[lightboxIndex].wallClock).toLocaleTimeString() : ''} · +${formatDuration(photos[lightboxIndex].offsetMs)} · ${lightboxIndex + 1}/${photos.length}</div>
            </div>
          </div>
          <div class="lightbox-bottom-bar">
            <span class="lightbox-bottom-caption">${photos[lightboxIndex].name}</span>
            <span class="lightbox-bottom-counter">${lightboxIndex + 1}/${photos.length}</span>
            <button class="lightbox-close-mobile" onClick=${() => openPhoto(-1)} aria-label="Close lightbox">✕</button>
          </div>
        </div>
      ` : null}
    `;
}
