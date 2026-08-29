// Pairs with the is:inline snippet in BaseLayout.astro, which sets
// document.documentElement.dataset.theme before first paint (no flash).
// This module only handles what has to run after hydration: syncing the
// toggle's checked state, persisting a change, and re-following the OS
// setting for as long as the visitor hasn't made an explicit choice.
const STORAGE_KEY = 'theme';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode: the choice just won't survive a reload */
  }
  syncToggle();
  applyGiscusTheme(theme);
}

function syncToggle(): void {
  const checkbox = document.querySelector<HTMLInputElement>('.theme-switch__checkbox');
  if (checkbox) checkbox.checked = currentTheme() === 'dark';
}

// giscus has no built-in "transparent light" theme (only transparent_dark
// ships upstream), so light mode uses a custom CSS theme hosted at
// /giscus/transparent-light.css (see public/giscus/transparent-light.css)
// mirroring transparent_dark's own edits over the stock light theme. Keeps
// the comments box from showing as a separate boxed card in either theme.
function applyGiscusTheme(theme: Theme): void {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  if (!iframe?.contentWindow) return;
  const giscusTheme =
    theme === 'dark' ? 'transparent_dark' : new URL('/giscus/transparent-light.css', location.origin).href;
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme } } }, 'https://giscus.app');
}

export function initTheme(): void {
  syncToggle();

  const checkbox = document.querySelector<HTMLInputElement>('.theme-switch__checkbox');
  checkbox?.addEventListener('change', () => setTheme(checkbox.checked ? 'dark' : 'light'));

  // giscus's client.js loads async (and lazily) and may not have created the
  // iframe yet when the page first renders. Apply the current theme once it
  // shows up. The iframe itself then needs its own 'load' before giscus's
  // internal script is ready to receive postMessage, otherwise the message
  // is dropped and the embed stays on its static data-theme="light" until
  // the next toggle.
  new MutationObserver((_entries, observer) => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!iframe) return;
    iframe.addEventListener('load', () => applyGiscusTheme(currentTheme()));
    observer.disconnect();
  }).observe(document.body, { childList: true, subtree: true });

  // Only re-follow the OS setting while the visitor hasn't overridden it;
  // once they have, localStorage (read by the inline head script) wins.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode: treat as "no stored choice", same as normal */
    }
    if (stored) return;
    setTheme(e.matches ? 'dark' : 'light');
  });
}
