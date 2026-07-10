import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

interface VideoPlayerProps {
    src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps): ReturnType<typeof html> {
    return html`
        <div class="card mt-md">
          <div class="card-title">Video Recording</div>
          <video controls preload="metadata" style="width:100%;border-radius:var(--radius-sm);margin-top:var(--space-sm)" key=${src}>
            <source src=${src} type="video/webm" />
          </video>
        </div>
    `;
}
