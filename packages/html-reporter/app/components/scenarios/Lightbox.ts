import htm from 'htm';
import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { formatDuration } from '../../utils';
import type { PhotoEntry } from './collectPhotos';

const html = htm.bind(h);

export interface LightboxProps {
    photos: PhotoEntry[];
    currentIndex: number;
    onNavigate: (index: number) => void;
}

function handleLightboxKeyDown(e: KeyboardEvent, currentIndex: number, photosLength: number, onNavigate: (index: number) => void): void {
    if (e.key === 'Escape') {
        onNavigate(-1);
    } else if (e.key === 'ArrowRight' && currentIndex < photosLength - 1) {
        onNavigate(currentIndex + 1);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
    }
}

interface TouchEndOptions {
    touchStartX: number;
    touchStartY: number;
    currentIndex: number;
    photosLength: number;
    onNavigate: (index: number) => void;
}

function handleLightboxTouchEnd(e: TouchEvent, options: TouchEndOptions): void {
    const { touchStartX, touchStartY, currentIndex, photosLength, onNavigate } = options;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && currentIndex < photosLength - 1) {
            onNavigate(currentIndex + 1);
        } else if (dx > 0 && currentIndex > 0) {
            onNavigate(currentIndex - 1);
        }
    }
}

function handleOverlayClick(e: Event, onNavigate: (index: number) => void): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains('lightbox-overlay')) {
        onNavigate(-1);
    }
}

export function Lightbox({ photos, currentIndex, onNavigate }: LightboxProps): ReturnType<typeof html> | null {
    const overlayRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const isOpen = currentIndex >= 0 && currentIndex < photos.length;

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
        return undefined;
    }, [isOpen]);

    if (!isOpen) return null;

    const photo = photos[currentIndex];

    return html`
        <div class="lightbox-overlay"
             ref=${(element: HTMLElement | null) => { if (element) { (overlayRef as { current: HTMLElement | null }).current = element; element.focus(); } }}
             onClick=${(e: Event) => handleOverlayClick(e, onNavigate)}
             onKeyDown=${(e: KeyboardEvent) => handleLightboxKeyDown(e, currentIndex, photos.length, onNavigate)}
             onTouchStart=${(e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
             onTouchEnd=${(e: TouchEvent) => handleLightboxTouchEnd(e, { touchStartX: touchStartX.current, touchStartY: touchStartY.current, currentIndex, photosLength: photos.length, onNavigate })}
             tabIndex="0">
          <div class="lightbox-content">
            <button class="lightbox-close" onClick=${() => onNavigate(-1)} aria-label="Close lightbox">✕</button>
            ${currentIndex > 0 ? html`<button class="lightbox-nav lightbox-prev" onClick=${() => onNavigate(currentIndex - 1)} aria-label="Previous photo">‹</button>` : null}
            ${currentIndex < photos.length - 1 ? html`<button class="lightbox-nav lightbox-next" onClick=${() => onNavigate(currentIndex + 1)} aria-label="Next photo">›</button>` : null}
            <img src=${photo.path} alt=${photo.name} />
            ${photos.length > 1 ? html`
              <div class="lightbox-dots" aria-label="Photo position">
                ${photos.map((_, i) => html`<span class="lightbox-dot ${i === currentIndex ? 'active' : ''}" aria-label=${`Photo ${i + 1} of ${photos.length}`}></span>`)}
              </div>
            ` : null}
            <div class="lightbox-caption">
              <div>${photo.name}</div>
              <div style="font-size:var(--font-xs);color:var(--text-secondary);font-family:var(--font-mono)">${photo.wallClock ? new Date(photo.wallClock).toLocaleTimeString() : ''} · +${formatDuration(photo.offsetMs)} · ${currentIndex + 1}/${photos.length}</div>
            </div>
          </div>
          <div class="lightbox-bottom-bar">
            <span class="lightbox-bottom-caption">${photo.name}</span>
            <span class="lightbox-bottom-counter">${currentIndex + 1}/${photos.length}</span>
            <button class="lightbox-close-mobile" onClick=${() => onNavigate(-1)} aria-label="Close lightbox">✕</button>
          </div>
        </div>
    `;
}
