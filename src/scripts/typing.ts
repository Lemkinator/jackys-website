// Typewriter effect for [data-typing] elements (see Banner.astro). Cycles
// type -> pause -> delete -> next string -> ... forever. A single-string
// element just types once and leaves the cursor blinking (nothing to cycle
// to). No-ops entirely under reduced motion, in which case the
// server-rendered title text is simply what's shown.
const DEFAULT_TYPE_SPEED = 55;
const DELETE_SPEED = 30;
const DEFAULT_PAUSE_AFTER_TYPE = 1800;
const PAUSE_AFTER_DELETE = 400;
const JITTER = 40; // +/- ms per char, keeps typing from reading as machine-perfect
const HESITATION_CHANCE = 0.18; // odds of a thinking-pause after finishing a word
const HESITATION_MIN = 120;
const HESITATION_MAX = 320;
const PAUSE_SPREAD = 0.3; // +/- fraction applied to the type/delete-cycle pauses

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(base: number): number {
  return Math.max(10, base + (Math.random() * 2 - 1) * JITTER);
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Wider proportional randomization for the long pauses between type/delete
// phases, so cycles don't all land on the same beat.
function humanizePause(base: number): number {
  return Math.max(50, base + (Math.random() * 2 - 1) * base * PAUSE_SPREAD);
}

// `Number(raw) || fallback` would treat an explicit override of 0 as
// missing. This only falls back when the attribute is absent or unparsable.
function numberOverride(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

async function typeString(el: HTMLElement, str: string, typeSpeed: number): Promise<void> {
  let typed = '';
  for (let i = 0; i < str.length; i++) {
    typed += str[i];
    el.textContent = typed;
    await sleep(jitter(typeSpeed));

    if (str[i] === ' ' && Math.random() < HESITATION_CHANCE) {
      await sleep(randomBetween(HESITATION_MIN, HESITATION_MAX));
    }
  }
}

async function deleteString(el: HTMLElement, str: string, deleteSpeed: number): Promise<void> {
  for (let i = str.length; i > 0; i--) {
    el.textContent = str.slice(0, i - 1);
    await sleep(jitter(deleteSpeed));
  }
}

export function initTyping(root: ParentNode = document): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.querySelectorAll<HTMLElement>('[data-typing]').forEach((el) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(el.dataset.typing ?? '[]');
    } catch {
      return;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) return;
    // Guards against duplicate concurrent loops on the same element: e.g. a
    // Vite HMR reload re-running this without a full page reload, which
    // otherwise stacks multiple loop()s that fight over the same classList
    // and leave the cursor reading as permanently solid.
    if (el.dataset.typingInit) return;
    el.dataset.typingInit = 'true';
    const strings: string[] = parsed;

    el.classList.add('is-typing');

    // Optional per-banner overrides, set via Banner's typeSpeed/pauseAfterType props.
    const typeSpeed = numberOverride(el.dataset.typeSpeed, DEFAULT_TYPE_SPEED);
    const pauseAfterType = numberOverride(el.dataset.pauseAfterType, DEFAULT_PAUSE_AFTER_TYPE);

    el.textContent = '';

    // Single string: types once, nothing to cycle to.
    if (strings.length === 1) {
      el.classList.add('is-active-typing');
      typeString(el, strings[0], typeSpeed).then(() => el.classList.remove('is-active-typing'));
      return;
    }

    async function loop(index: number): Promise<void> {
      const str = strings[index];
      el.classList.add('is-active-typing');
      await typeString(el, str, typeSpeed);
      el.classList.remove('is-active-typing');
      await sleep(humanizePause(pauseAfterType));
      el.classList.add('is-active-typing');
      await deleteString(el, str, DELETE_SPEED);
      el.classList.remove('is-active-typing');
      await sleep(humanizePause(PAUSE_AFTER_DELETE));
      loop((index + 1) % strings.length);
    }

    loop(0);
  });
}
