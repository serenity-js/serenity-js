export function showToast(message: string): void {
    const existing = document.getElementById('serenity-toast');
    if (existing) existing.remove();
    const element = document.createElement('div');
    element.id = 'serenity-toast';
    element.textContent = message;
    element.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text-primary);color:var(--bg-surface);padding:8px 16px;border-radius:6px;font-size:13px;z-index:9999;opacity:0;transition:opacity 0.2s;pointer-events:none';
    document.body.appendChild(element);
    requestAnimationFrame(() => { element.style.opacity = '1'; });
    setTimeout(() => { element.style.opacity = '0'; setTimeout(() => element.remove(), 200); }, 2000);
}
